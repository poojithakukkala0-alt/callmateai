"""Pydantic v2 data models for CallMateAI."""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class CallCreate(BaseModel):
    """Payload to initiate a parent-counselor call session."""
    student_id: int = Field(..., description="ID of the student associated with the call")
    counselor_id: int = Field(..., description="ID of the counselor being called")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "student_id": 101,
                "counselor_id": 1
            }
        }
    )


class ForwardRequest(BaseModel):
    """Payload for counselor forwarding call to CallMateAI agent."""
    target: Literal["ai_agent"] = Field(
        default="ai_agent",
        description="Target routing destination. Must be 'ai_agent'"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "target": "ai_agent"
            }
        }
    )


class HandoverRequest(BaseModel):
    """Payload for counselor taking over the call session."""
    reason: str = Field(
        ...,
        min_length=1,
        description="Reason or notes regarding counselor takeover"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "reason": "Counselor available to handle urgent inquiry directly."
            }
        }
    )


class AgentMessage(BaseModel):
    """Payload containing speech or text message from parent/counselor."""
    message: str = Field(
        ...,
        min_length=1,
        description="Raw transcribed voice or typed text message from the caller"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "message": "Can you check Aarav's attendance and remarks today?"
            }
        }
    )


class CallMessageItem(BaseModel):
    """Structured representation of a conversational turn."""
    sender: Literal["parent", "ai_agent", "counselor", "system"]
    text: str
    timestamp: str
    is_emergency: bool = False


class EmergencyRecord(BaseModel):
    """Record representing a detected critical incident."""
    id: int = Field(..., description="Unique emergency incident ID")
    call_id: int = Field(..., description="Call session ID where emergency occurred")
    student_id: int = Field(..., description="ID of the student involved")
    student_name: str = Field(..., description="Name of the student involved")
    reason: str = Field(..., description="Extracted emergency explanation / trigger")
    status: Literal["open", "acknowledged", "resolved"] = Field(
        default="open",
        description="Current workflow status of the emergency record"
    )
    timestamp: str = Field(..., description="ISO 8601 creation timestamp")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": 1,
                "call_id": 1,
                "student_id": 101,
                "student_name": "Aarav Sharma",
                "reason": "Accident or injury keyword detected in message: 'He met with an accident near the gate'",
                "status": "open",
                "timestamp": "2026-10-11T15:30:00Z"
            }
        }
    )


class CallSessionResponse(BaseModel):
    """Full state snapshot of a call session."""
    call_id: int = Field(..., description="Unique call session ID")
    student_id: int = Field(..., description="ID of student linked to call")
    student_name: str = Field(..., description="Full name of student")
    counselor_id: int = Field(..., description="Assigned counselor ID")
    status: Literal[
        "incoming",
        "agent",
        "handover requested",
        "counselor connected",
        "completed"
    ] = Field(..., description="Current stage in call lifecycle state machine")
    emergency_flag: bool = Field(
        default=False,
        description="True if an emergency has been detected during the session"
    )
    messages: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Chronological log of messages and events"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "call_id": 1,
                "student_id": 101,
                "student_name": "Aarav Sharma",
                "counselor_id": 1,
                "status": "incoming",
                "emergency_flag": False,
                "messages": [
                    {
                        "sender": "system",
                        "text": "Call initiated by parent.",
                        "timestamp": "2026-10-11T15:30:00Z"
                    }
                ]
            }
        }
    )


class StudentRecord(BaseModel):
    """Student profile from database."""
    id: int
    name: str
    class_name: str = Field(..., alias="class")
    parent_name: str
    parent_phone: str
    attendance: str
    remarks: str
    fee_status: str
    emergency_contact: str

    model_config = ConfigDict(populate_by_name=True)


class CounselorRecord(BaseModel):
    """Counselor profile from database."""
    id: int
    name: str
    assigned_class: str
    status: str


class ProcessMessageResponse(BaseModel):
    """Response returned when an agent processes a message."""
    call_id: int
    status: str
    emergency_flag: bool
    agent_reply: str
    matched_intent: str
    emergency_incident: Optional[EmergencyRecord] = None
