from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Body, HTTPException, status, Depends
from app.schemas import (
    AgentMessage,
    CallCreate,
    CallSessionResponse,
    ForwardRequest,
    HandoverRequest,
)
from app.services import ai_service, mock_db
from app.services.call_service import call_service
from app.services.emergency_service import emergency_service
from database import get_database # 👈 Ensure correct PyMongo database dependency import!
import crud

router = APIRouter(prefix="/calls", tags=["Calls"])

# Expose simulated call sessions for direct telemetry and router reference
SIMULATED_CALLS = mock_db.CALL_SESSIONS


@router.post(
    "",
    response_model=CallSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a simulated parent call"
)
def create_call(payload: CallCreate, db = Depends(get_database)):
    """Start simulated incoming call and persist document in MongoDB Atlas."""
    try:
        session = call_service.start_call(
            student_id=payload.student_id,
            counselor_id=payload.counselor_id
        )

        # 💾 FORCE INSERT COMPACT CALL DOC INTO ATLAS IMMEDIATELY:
        try:
            # Query student data directly from Atlas database session
            student_data = db["students"].find_one({"student_id": int(payload.student_id)}) or {}
            
            parent_phone = "+91 9800000000"
            parents = student_data.get("parents", [])
            if parents and len(parents) > 0:
                parent_phone = parents[0].get("phone", parent_phone)

            # Document mapping matching seeded structures
            call_doc = {
                "call_id": int(session["call_id"]),
                "student_id": int(payload.student_id),
                "counselor_id": int(payload.counselor_id),
                "parent_phone": parent_phone,
                "status": "incoming",
                "started_at": datetime.now(timezone.utc).isoformat(),
                "messages": [],
                "risk_level": "Low",
                "summary": "Call in progress"
            }
            
            # Direct cluster insertion!
            db["calls"].insert_one(call_doc)
            print(f"🎉 MongoDB Cloud Success: Seeded call session #{session['call_id']}")
        except Exception as e:
            print(f"❌ MongoDB Cloud Failure: Failed to write session to 'calls' collection: {e}")

        return session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post(
    "/{call_id}/message",
    response_model=CallSessionResponse,
    summary="Process speech/text message from parent or caller"
)
async def send_message(call_id: int, payload: AgentMessage, db = Depends(get_database)):
    """
    Evaluates message using Stage 4 AI service and logs dual-escalation alerts to MongoDB Atlas.
    """
    # 1. Fetch current session status from memory or MongoDB Atlas
    session = mock_db.get_call_session(call_id)
    call = db["calls"].find_one({"call_id": int(call_id)})

    if not session and not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call session #{call_id} not found."
        )

    current_status = (session or {}).get("status") or (call or {}).get("status", "incoming")

    # 2. Lifecycle validation
    if current_status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Call session is already completed."
        )

    # 3. Retrieve student and counselor context
    student_id = (session or {}).get("student_id") or (call or {}).get("student_id", 1001)
    counselor_id = (session or {}).get("counselor_id") or (call or {}).get("counselor_id", 1)

    student_data = db["students"].find_one({"student_id": int(student_id)}) or {}
    counselor_data = db["counselors"].find_one({"counselor_id": int(counselor_id)}) or {}

    student_context = {
        "student_id": student_id,
        "name": student_data.get("name") or "Student",
        "section": student_data.get("section", "General"),
        "attendance_pct": student_data.get("attendance_pct", "96%"),
        "current_status": student_data.get("current_status", "In Class"),
        "remarks": student_data.get("remarks", "Satisfactory performance."),
        "fee_status": student_data.get("fee_status", "Paid"),
        "counselor_name": counselor_data.get("name", "Dr. Lakshmi Prasad"),
        "counselor_id": counselor_id
    }

    # 4. Process through Stage 4 AI Pipeline (Gemini Core)
    ai_result = await ai_service.process_parent_message(payload.message, student_context)

    # 5. Dual Escalation Dispatch
    is_emergency = ai_result.get("emergency_flag", False) or ai_result.get("alert_type") == "emergency"
    new_status = "handover requested" if (ai_result.get("requires_handover") or is_emergency) else current_status

    # Record alert in MongoDB Atlas if an escalation condition was met
    if ai_result.get("alert_type"):
        try:
            db["counselor_alerts"].insert_one({
                "call_id": int(call_id),
                "alert_type": ai_result["alert_type"],
                "priority": ai_result["priority"],
                "message": f"Parent query: '{payload.message}' regarding {student_context['name']}",
                "counselor_id": int(counselor_id),
                "status": "open",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            print(f"🎉 Alert logged for counselor: {ai_result['alert_type']}")
        except Exception as e:
            print(f"Warning: Could not persist alert to MongoDB Atlas: {e}")

    if is_emergency:
        emergency_service.trigger_emergency_incident(
            call_id=call_id,
            student_id=student_id,
            student_name=student_context["name"],
            message=payload.message,
            detected_keywords=ai_result.get("detected_keywords", ["emergency"])
        )

    # 6. Update local session state
    if session:
        mock_db.update_call_session(call_id, {
            "status": new_status,
            "emergency_flag": is_emergency
        })
        mock_db.append_call_message(call_id, "parent", payload.message, is_emergency)
        mock_db.append_call_message(call_id, "ai_agent", ai_result["reply"], is_emergency)

    # 💾 ATOMIC REAL-TIME TRANSCRIPT LOGGING TO MONGODB ATLAS:
    try:
        sender_label = "Counselor" if payload.message.startswith("[COUNSELOR_DIRECT]") else "Caller"
        cleaned_message = payload.message.replace("[COUNSELOR_DIRECT] ", "")

        # Set Status, Emergency parameters, and push messages in parallel
        db["calls"].update_one(
            {"call_id": int(call_id)},
            {
                "$set": {"status": new_status, "emergency_flag": is_emergency},
                "$push": {
                    "messages": {
                        "$each": [
                            {"sender": sender_label, "text": cleaned_message},
                            {"sender": "AI", "text": ai_result["reply"]}
                        ]
                    }
                }
            }
        )
        print(f"🎉 Live Transcript persisted in Atlas calls for ID: #{call_id}")
    except Exception as e:
        print(f"[MongoDB Error] Failed logging messages to database: {e}")

    latest_session = mock_db.get_call_session(call_id) or {}
    messages = latest_session.get("messages", [])

    return {
        "call_id": call_id,
        "student_id": student_id,
        "student_name": student_context["name"],
        "counselor_id": counselor_id,
        "status": new_status,
        "emergency_flag": is_emergency,
        "messages": messages,
        "reply": ai_result["reply"],
        "intent": ai_result.get("intent")
    }


@router.post(
    "/{call_id}/complete",
    response_model=CallSessionResponse,
    summary="Complete and archive call session"
)
def complete_call(call_id: int, payload: Optional[Dict[str, Any]] = Body(None), db = Depends(get_database)):
    """End and archive call session with MongoDB Atlas persistence."""
    try:
        session = call_service.complete_call(call_id)

        summary = None
        risk_level = None
        if payload and isinstance(payload, dict):
            summary = payload.get("summary")
            risk_level = payload.get("risk_level")

        if not risk_level:
            risk_level = "High" if session.get("emergency_flag") else "Low"
        if not summary:
            msg_count = len(session.get("messages", []))
            handover_status = "Emergency handover" if session.get("emergency_flag") else "Standard inquiry"
            summary = f"{handover_status} concluded with {msg_count} message exchanges."

        # 💾 FORCE UPDATE FINAL STATS DIRECTLY IN MONGODB ATLAS:
        try:
            db["calls"].update_one(
                {"call_id": int(call_id)},
                {"$set": {
                    "status": "completed",
                    "ended_at": datetime.now(timezone.utc).isoformat(),
                    "summary": summary,
                    "risk_level": risk_level
                }}
            )
            print(f"🎉 MongoDB success: Completed and archived Call #{call_id}")
        except Exception as e:
            print(f"[MongoDB Error] Failed to persist call completion: {e}")

        return session
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e).strip("'")
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Add other standard read routes mapping as needed
@router.get("", response_model=List[CallSessionResponse])
def list_calls():
    return call_service.list_all_sessions()


@router.get("/{call_id}", response_model=CallSessionResponse)
def get_call(call_id: int):
    session = call_service.get_session(call_id)
    if not session:
        raise HTTPException(status_code=404, detail="Not Found")
    return session


@router.post("/{call_id}/forward", response_model=CallSessionResponse)
def forward_call(call_id: int, payload: ForwardRequest = ForwardRequest(target="ai_agent")):
    return call_service.forward_call_to_agent(call_id, target=payload.target)


@router.post("/{call_id}/handover", response_model=CallSessionResponse)
def accept_handover(call_id: int, payload: Optional[HandoverRequest] = None):
    reason = payload.reason if payload else "Counselor accepted emergency takeover directly."
    return call_service.accept_handover(call_id=call_id, reason=reason)
