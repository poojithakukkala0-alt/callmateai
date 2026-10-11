"""Router for call session lifecycle, forwarding, messaging, and handovers."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
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
import crud

router = APIRouter(prefix="/calls", tags=["Calls"])

# Expose simulated call sessions for direct telemetry and router reference
SIMULATED_CALLS = mock_db.CALL_SESSIONS


@router.post(
    "",
    response_model=CallSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a simulated parent call",
    description="Initiates an incoming parent call associated with a student and assigned counselor. State starts as 'incoming'."
)
def create_call(payload: CallCreate):
    """Start simulated incoming call."""
    try:
        session = call_service.start_call(
            student_id=payload.student_id,
            counselor_id=payload.counselor_id
        )
        return session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get(
    "",
    response_model=List[CallSessionResponse],
    summary="List all call sessions",
    description="Returns all active and archived call sessions."
)
def list_calls():
    """Retrieve all tracked call sessions."""
    return call_service.list_all_sessions()


@router.get(
    "/{call_id}",
    response_model=CallSessionResponse,
    summary="Get call session details",
    description="Fetches current status, messages, and flags for a specific call session."
)
def get_call(call_id: int):
    """Get single call session."""
    session = call_service.get_session(call_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call session #{call_id} not found."
        )
    return session


@router.post(
    "/{call_id}/forward",
    response_model=CallSessionResponse,
    summary="Forward call to CallMateAI",
    description="Counselor forwards the incoming call to the AI agent. Transitions state from 'incoming' to 'agent'."
)
def forward_call(call_id: int, payload: ForwardRequest = ForwardRequest(target="ai_agent")):
    """Forward call to CallMateAI."""
    try:
        session = call_service.forward_call_to_agent(call_id, target=payload.target)
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


@router.post(
    "/{call_id}/message",
    response_model=CallSessionResponse,
    summary="Process speech/text message from parent or caller",
    description="Evaluates caller message through Stage 4 AI service (Gemini + fast-path safety gate) and logs dual-escalation alerts."
)
async def send_message(call_id: int, payload: AgentMessage):
    """
    Evaluates message using Stage 4 AI service and logs dual-escalation alerts to MongoDB Atlas.
    """
    # 1. Check call session existence in memory or database
    session = mock_db.get_call_session(call_id)
    call = crud.get_call_by_id(call_id) if hasattr(crud, "get_call_by_id") else None

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
            detail="Call session is already completed. No further messages can be processed."
        )

    if current_status == "incoming":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Call is still in 'incoming' status. Counselor must forward the call to CallMateAI ('agent') before messages can be processed."
        )

    # 3. Retrieve student and counselor context
    student_id = (session or {}).get("student_id") or (call or {}).get("student_id", 1001)
    counselor_id = (session or {}).get("counselor_id") or (call or {}).get("counselor_id", 1)

    student_data = crud.get_student(student_id) or mock_db.get_student(student_id) or {}
    counselor_data = crud.get_counselor(counselor_id) or mock_db.get_counselor(counselor_id) or {}

    student_context = {
        "student_id": student_id,
        "name": student_data.get("name") or (session or {}).get("student_name", f"Student #{student_id}"),
        "section": student_data.get("section", student_data.get("class", "General")),
        "attendance_pct": student_data.get("attendance_pct", student_data.get("attendance", "96%")),
        "current_status": student_data.get("current_status", "In Class"),
        "remarks": student_data.get("remarks", "Consistent academic performance."),
        "fee_status": student_data.get("fee_status", "Paid - Term 2 Cleared."),
        "counselor_name": counselor_data.get("name", "Dr. Lakshmi Prasad"),
        "counselor_id": counselor_id
    }

    # 4. Process through Stage 4 AI Pipeline (fast-path rules + Gemini 2.5 Flash)
    ai_result = await ai_service.process_parent_message(payload.message, student_context)

    # 5. Dual Escalation Dispatch
    is_emergency = ai_result.get("emergency_flag", False) or ai_result.get("alert_type") == "emergency"
    new_status = "handover requested" if (ai_result.get("requires_handover") or is_emergency) else current_status

    # Record alert in MongoDB Atlas if an escalation condition was met
    if ai_result.get("alert_type"):
        try:
            crud.create_counselor_alert(
                call_id=call_id,
                alert_type=ai_result["alert_type"],
                priority=ai_result["priority"],
                message=f"Parent query: '{payload.message}' regarding {student_context['name']}",
                counselor_id=counselor_id
            )
        except Exception as e:
            # Non-blocking log if Atlas connection unavailable
            print(f"Warning: Could not persist alert to MongoDB Atlas: {e}")

    # If emergency, also register in emergency_service for dashboard polling
    if is_emergency:
        emergency_service.trigger_emergency_incident(
            call_id=call_id,
            student_id=student_id,
            student_name=student_context["name"],
            message=payload.message,
            detected_keywords=ai_result.get("detected_keywords", ["emergency"])
        )

    # 6. Update session state
    if session:
        mock_db.update_call_session(call_id, {
            "status": new_status,
            "emergency_flag": is_emergency
        })
        mock_db.append_call_message(
            call_id=call_id,
            sender="parent",
            text=payload.message,
            is_emergency=is_emergency
        )
        mock_db.append_call_message(
            call_id=call_id,
            sender="ai_agent",
            text=ai_result["reply"],
            is_emergency=is_emergency
        )

    try:
        if new_status != current_status:
            crud.update_call_status(call_id, new_status)
        crud.add_call_message(call_id, "caller", payload.message)
        crud.add_call_message(call_id, "ai", ai_result["reply"])
    except Exception:
        pass

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
    "/{call_id}/handover",
    response_model=CallSessionResponse,
    summary="Accept emergency handover",
    description="Counselor accepts the takeover request. Transitions state to 'counselor connected'."
)
def accept_handover(call_id: int, payload: Optional[HandoverRequest] = None):
    """Counselor accepts the emergency takeover."""
    reason = payload.reason if payload else "Counselor accepted emergency takeover directly."
    try:
        session = call_service.accept_handover(call_id=call_id, reason=reason)
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


@router.post(
    "/{call_id}/complete",
    response_model=CallSessionResponse,
    summary="Complete and archive call session",
    description="Ends the call and marks status as 'completed'. No further messages can be processed after completion."
)
def complete_call(call_id: int):
    """End and archive call session."""
    try:
        session = call_service.complete_call(call_id)
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
