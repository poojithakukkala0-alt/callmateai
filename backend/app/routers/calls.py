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
from app.services import mock_db
from app.services.call_service import call_service

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
    description="Evaluates caller message for emergency keywords. If detected, triggers emergency escalation and requests handover. Otherwise returns grounded answers."
)
def send_message(call_id: int, payload: AgentMessage):
    """Process caller message and evaluate student info or emergency."""
    try:
        updated_session, agent_reply, is_emergency, incident = call_service.process_caller_message(
            call_id=call_id,
            message_text=payload.message
        )
        return updated_session
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
