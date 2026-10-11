"""Call session management, state machine transitions, and query answering service."""

from typing import Any, Dict, List, Optional, Tuple
from app.services import mock_db
from app.services.emergency_service import emergency_service


class CallService:
    """Orchestrates CallMateAI call state machine and student query grounding."""

    VALID_STATUSES = [
        "incoming",
        "agent",
        "handover requested",
        "counselor connected",
        "completed"
    ]

    @staticmethod
    def start_call(student_id: int, counselor_id: int) -> Dict[str, Any]:
        """
        Initiate a simulated call from parent. Sets initial status to 'incoming'.
        Validates student and counselor existence.
        """
        student = mock_db.get_student(student_id)
        if not student:
            raise ValueError(f"Student with ID {student_id} not found in student records.")

        counselor = mock_db.get_counselor(counselor_id)
        if not counselor:
            raise ValueError(f"Counselor with ID {counselor_id} not found.")

        session = mock_db.create_call_session(
            student_id=student_id,
            counselor_id=counselor_id
        )
        return session

    @staticmethod
    def forward_call_to_agent(call_id: int, target: str = "ai_agent") -> Dict[str, Any]:
        """
        Counselor forwards incoming call to CallMateAI.
        Transitions state: 'incoming' -> 'agent'.
        """
        session = mock_db.get_call_session(call_id)
        if not session:
            raise KeyError(f"Call session #{call_id} not found.")

        current_status = session.get("status")
        if current_status != "incoming":
            raise ValueError(
                f"Cannot forward call in '{current_status}' status. "
                "Only 'incoming' calls can be forwarded to the AI agent."
            )

        if target != "ai_agent":
            raise ValueError(f"Invalid target '{target}'. Target must be 'ai_agent'.")

        counselor = mock_db.get_counselor(session["counselor_id"])
        counselor_name = counselor["name"] if counselor else f"Counselor #{session['counselor_id']}"

        # Transition status to 'agent'
        mock_db.update_call_session(call_id, {"status": "agent"})
        updated_session = mock_db.append_call_message(
            call_id=call_id,
            sender="system",
            text=f"{counselor_name} forwarded call to CallMateAI agent.",
            is_emergency=False
        )
        return updated_session or session

    @staticmethod
    def process_caller_message(call_id: int, message_text: str) -> Tuple[Dict[str, Any], str, bool, Optional[Dict[str, Any]]]:
        """
        Process speech/text from caller:
        1. Checks state validity.
        2. Evaluates emergency keywords.
        3. If emergency triggered:
           - Updates status to 'handover requested'
           - Sets emergency_flag = True
           - Creates incident in EMERGENCIES_DB
           - Returns urgent takeover notification
        4. If normal query:
           - Queries STUDENTS_DB for matching context
           - Returns polite, factual answer grounded in record
        """
        session = mock_db.get_call_session(call_id)
        if not session:
            raise KeyError(f"Call session #{call_id} not found.")

        status = session.get("status")
        if status == "completed":
            raise ValueError("Call session is already completed. No further messages can be processed.")

        if status == "incoming":
            raise ValueError(
                "Call is still in 'incoming' status. "
                "Counselor must forward the call to CallMateAI ('agent') before messages can be processed."
            )

        student = mock_db.get_student(session["student_id"])
        student_name = student["name"] if student else session["student_name"]
        counselor = mock_db.get_counselor(session["counselor_id"])
        counselor_name = counselor["name"] if counselor else f"Counselor #{session['counselor_id']}"

        # 1. Emergency detection
        is_emergency, detected_keywords = emergency_service.detect_emergency(message_text)

        if is_emergency:
            # 1. Update session status to 'handover requested'
            # (unless counselor is already connected, in which case counselor is already on line)
            new_status = "handover requested" if status != "counselor connected" else "counselor connected"
            mock_db.update_call_session(call_id, {
                "status": new_status,
                "emergency_flag": True
            })

            # 2. Append parent message
            mock_db.append_call_message(
                call_id=call_id,
                sender="parent",
                text=message_text,
                is_emergency=True
            )

            # 3. Create incident record in EMERGENCIES_DB
            incident = emergency_service.trigger_emergency_incident(
                call_id=call_id,
                student_id=session["student_id"],
                student_name=student_name,
                message=message_text,
                detected_keywords=detected_keywords
            )

            # 4. Return urgent takeover response to caller
            agent_reply = (
                f"🚨 EMERGENCY ALERT: An urgent situation has been detected regarding {student_name} "
                f"(Keywords: {', '.join(detected_keywords)}). "
                f"I have flagged this incident and immediately requested an emergency handover to "
                f"{counselor_name} and the crisis response team. "
                f"Please stay on the line; an authorized counselor is being connected right now."
            )

            mock_db.append_call_message(
                call_id=call_id,
                sender="ai_agent",
                text=agent_reply,
                is_emergency=True
            )

            updated_session = mock_db.get_call_session(call_id)
            return updated_session or session, agent_reply, True, incident

        else:
            # Normal conversational or informational query grounded in STUDENTS_DB
            # Append parent message
            mock_db.append_call_message(
                call_id=call_id,
                sender="parent",
                text=message_text,
                is_emergency=False
            )

            agent_reply = CallService._generate_grounded_response(
                student=student,
                counselor_name=counselor_name,
                caller_message=message_text
            )

            mock_db.append_call_message(
                call_id=call_id,
                sender="ai_agent" if status != "counselor connected" else "counselor",
                text=agent_reply,
                is_emergency=False
            )

            updated_session = mock_db.get_call_session(call_id)
            return updated_session or session, agent_reply, False, None

    @staticmethod
    def _generate_grounded_response(
        student: Optional[Dict[str, Any]],
        counselor_name: str,
        caller_message: str
    ) -> str:
        """Formulate a polite, factual response strictly grounded in student records."""
        if not student:
            return (
                f"Greetings from CallMateAI on behalf of {counselor_name}. "
                "I am currently unable to locate this student record. "
                "Please hold while I check with the administrative office."
            )

        msg_lower = caller_message.lower()
        name = student["name"]

        # Check for attendance intent
        if any(w in msg_lower for w in ["attendance", "present", "absent", "attend", "leave"]):
            return (
                f"Regarding {name}'s attendance: The official school record reflects "
                f"{student['attendance']}. Class: {student['class']}."
            )

        # Check for remarks / academic performance intent
        if any(w in msg_lower for w in [
            "remark", "remarks", "performance", "grade", "grades",
            "marks", "score", "progress", "behavior", "study", "studies",
            "feedback", "teacher", "math", "physics", "science"
        ]):
            return (
                f"According to teacher remarks for {name} ({student['class']}): "
                f"\"{student['remarks']}\""
            )

        # Check for fee intent
        if any(w in msg_lower for w in ["fee", "fees", "due", "dues", "payment", "paid", "bill", "balance"]):
            return (
                f"Fee record for {name}: {student['fee_status']}. "
                "For payment receipts or queries, the accounts department can be reached during school hours."
            )

        # Check for contact / emergency contact intent
        if any(w in msg_lower for w in ["contact", "phone", "number", "emergency contact", "address"]):
            return (
                f"Registered contact details on file for {name}: "
                f"Parent: {student['parent_name']} ({student['parent_phone']}), "
                f"Emergency Contact: {student['emergency_contact']}."
            )

        # Default polite overview grounded strictly in the student record
        return (
            f"Hello! I am CallMateAI assisting {counselor_name}. "
            f"I have {name}'s record for {student['class']}. "
            f"Current attendance is {student['attendance']}, and latest teacher feedback notes: "
            f"\"{student['remarks']}\". "
            "How can I assist you further regarding attendance, performance, or fee status?"
        )

    @staticmethod
    def accept_handover(call_id: int, reason: str = "Counselor accepted emergency handover") -> Dict[str, Any]:
        """
        Counselor accepts the emergency takeover.
        Transitions state to 'counselor connected'.
        """
        session = mock_db.get_call_session(call_id)
        if not session:
            raise KeyError(f"Call session #{call_id} not found.")

        current_status = session.get("status")
        if current_status == "completed":
            raise ValueError("Cannot perform handover on a completed call session.")

        if current_status == "incoming":
            raise ValueError(
                "Call is in 'incoming' status. Handover is only applicable once call is active or requested."
            )

        if current_status not in ["handover requested", "agent"]:
            raise ValueError(
                f"Invalid handover transition from '{current_status}'. "
                "Expected status 'handover requested' or 'agent'."
            )

        counselor = mock_db.get_counselor(session["counselor_id"])
        counselor_name = counselor["name"] if counselor else f"Counselor #{session['counselor_id']}"

        mock_db.update_call_session(call_id, {"status": "counselor connected"})
        updated_session = mock_db.append_call_message(
            call_id=call_id,
            sender="system",
            text=f"{counselor_name} accepted call handover. Reason: {reason}",
            is_emergency=session.get("emergency_flag", False)
        )
        return updated_session or session

    @staticmethod
    def complete_call(call_id: int) -> Dict[str, Any]:
        """
        End and archive the call session.
        Transitions state to 'completed'.
        """
        session = mock_db.get_call_session(call_id)
        if not session:
            raise KeyError(f"Call session #{call_id} not found.")

        current_status = session.get("status")
        if current_status == "completed":
            return session

        mock_db.update_call_session(call_id, {"status": "completed"})
        updated_session = mock_db.append_call_message(
            call_id=call_id,
            sender="system",
            text="Call session completed and archived.",
            is_emergency=False
        )
        return updated_session or session

    @staticmethod
    def get_session(call_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve single call session by ID."""
        return mock_db.get_call_session(call_id)

    @staticmethod
    def list_all_sessions() -> List[Dict[str, Any]]:
        """List all tracked call sessions."""
        with mock_db.DB_LOCK:
            return [dict(s) for s in mock_db.CALL_SESSIONS.values()]


call_service = CallService()
