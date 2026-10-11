"""In-memory database store for CallMateAI Stage 2 Backend.

Provides thread-safe in-memory collections for:
- Students (STUDENTS_DB)
- Counselors (COUNSELORS_DB)
- Call Sessions (CALL_SESSIONS)
- Emergency Records (EMERGENCIES_DB)
"""

import threading
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


# Thread safety lock for concurrent requests
DB_LOCK = threading.RLock()

# Initial Student dataset
INITIAL_STUDENTS: Dict[int, Dict[str, Any]] = {
    101: {
        "id": 101,
        "name": "Aarav Sharma",
        "class": "10th - Sec A",
        "parent_name": "Rajesh Sharma",
        "parent_phone": "+91 98450 11223",
        "attendance": "96% (Present in school today)",
        "remarks": "Exceptional aptitude in Mathematics and Computer Science. Consistent participation and respectful behavior.",
        "fee_status": "Paid - Term 2 Cleared",
        "emergency_contact": "+91 98450 11223 (Father)"
    },
    102: {
        "id": 102,
        "name": "Ananya Iyer",
        "class": "10th - Sec A",
        "parent_name": "Meenakshi Iyer",
        "parent_phone": "+91 98450 44556",
        "attendance": "88% (Present today)",
        "remarks": "Strong performance in Literature and History. Advised weekly revisions for Chemistry numerical lab work.",
        "fee_status": "Pending - Term 2 Due Date: Oct 25, 2026",
        "emergency_contact": "+91 98450 44556 (Mother)"
    },
    103: {
        "id": 103,
        "name": "Rohan Varma",
        "class": "10th - Sec B",
        "parent_name": "Vikram Varma",
        "parent_phone": "+91 98450 77889",
        "attendance": "91% (Present today)",
        "remarks": "Consistent performer. Active in extracurricular athletics; represented school in Basketball championship.",
        "fee_status": "Paid - Full Academic Year Cleared",
        "emergency_contact": "+91 98450 77889 (Father)"
    },
    104: {
        "id": 104,
        "name": "Diya Patel",
        "class": "10th - Sec A",
        "parent_name": "Sanjay Patel",
        "parent_phone": "+91 98450 99001",
        "attendance": "94% (Present today)",
        "remarks": "Diligent student with excellent leadership skills in science club projects.",
        "fee_status": "Paid - Term 2 Cleared",
        "emergency_contact": "+91 98450 99001 (Father)"
    }
}

# Initial Counselors dataset
INITIAL_COUNSELORS: Dict[int, Dict[str, Any]] = {
    1: {
        "id": 1,
        "name": "Dr. Lakshmi Prasad",
        "assigned_class": "10th - Sec A",
        "status": "In Class (Busy)",
        "department": "Senior Academic & Student Guidance",
        "phone": "+91 98765 12001"
    },
    2: {
        "id": 2,
        "name": "Prof. Rajesh Menon",
        "assigned_class": "10th - Sec B",
        "status": "Available",
        "department": "Student Welfare & Counseling",
        "phone": "+91 98765 12002"
    }
}

# Global live database structures
STUDENTS_DB: Dict[int, Dict[str, Any]] = dict(INITIAL_STUDENTS)
COUNSELORS_DB: Dict[int, Dict[str, Any]] = dict(INITIAL_COUNSELORS)
CALL_SESSIONS: Dict[int, Dict[str, Any]] = {}
EMERGENCIES_DB: List[Dict[str, Any]] = []

# ID Counters
_call_id_counter: int = 1
_emergency_id_counter: int = 1


def get_current_iso_timestamp() -> str:
    """Return formatted ISO timestamp with UTC indicator."""
    return datetime.now(timezone.utc).isoformat()


def reset_mock_db() -> None:
    """Reset the mock database to initial state. Useful for automated test isolation."""
    global STUDENTS_DB, COUNSELORS_DB, CALL_SESSIONS, EMERGENCIES_DB, _call_id_counter, _emergency_id_counter
    with DB_LOCK:
        STUDENTS_DB = {k: dict(v) for k, v in INITIAL_STUDENTS.items()}
        COUNSELORS_DB = {k: dict(v) for k, v in INITIAL_COUNSELORS.items()}
        CALL_SESSIONS = {}
        EMERGENCIES_DB = []
        _call_id_counter = 1
        _emergency_id_counter = 1


def get_student(student_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve student dictionary by ID."""
    with DB_LOCK:
        student = STUDENTS_DB.get(student_id)
        return dict(student) if student else None


def list_students() -> List[Dict[str, Any]]:
    """Return list of all registered student records."""
    with DB_LOCK:
        return [dict(s) for s in STUDENTS_DB.values()]


def get_counselor(counselor_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve counselor dictionary by ID."""
    with DB_LOCK:
        counselor = COUNSELORS_DB.get(counselor_id)
        return dict(counselor) if counselor else None


def list_counselors() -> List[Dict[str, Any]]:
    """Return list of all counselors."""
    with DB_LOCK:
        return [dict(c) for c in COUNSELORS_DB.values()]


def create_call_session(student_id: int, counselor_id: int) -> Dict[str, Any]:
    """Create a new call session initialized to 'incoming' status."""
    global _call_id_counter
    with DB_LOCK:
        student = STUDENTS_DB.get(student_id)
        student_name = student["name"] if student else f"Student #{student_id}"
        call_id = _call_id_counter
        _call_id_counter += 1

        timestamp = get_current_iso_timestamp()
        session: Dict[str, Any] = {
            "call_id": call_id,
            "student_id": student_id,
            "student_name": student_name,
            "counselor_id": counselor_id,
            "status": "incoming",
            "emergency_flag": False,
            "messages": [
                {
                    "sender": "system",
                    "text": f"Parent initiated incoming call for {student_name} to Counselor #{counselor_id}.",
                    "timestamp": timestamp,
                    "is_emergency": False
                }
            ],
            "created_at": timestamp,
            "updated_at": timestamp
        }
        CALL_SESSIONS[call_id] = session
        return dict(session)


def get_call_session(call_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve a call session by call_id."""
    with DB_LOCK:
        session = CALL_SESSIONS.get(call_id)
        if session is None:
            return None
        # Return a deep-like copy to prevent outside race mutations
        return {
            **session,
            "messages": [dict(m) for m in session.get("messages", [])]
        }


def update_call_session(call_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update fields on a call session in a thread-safe manner."""
    with DB_LOCK:
        if call_id not in CALL_SESSIONS:
            return None
        session = CALL_SESSIONS[call_id]
        session.update(updates)
        session["updated_at"] = get_current_iso_timestamp()
        return {
            **session,
            "messages": [dict(m) for m in session.get("messages", [])]
        }


def append_call_message(
    call_id: int,
    sender: str,
    text: str,
    is_emergency: bool = False
) -> Optional[Dict[str, Any]]:
    """Append a conversational entry to the call session message history."""
    with DB_LOCK:
        if call_id not in CALL_SESSIONS:
            return None
        session = CALL_SESSIONS[call_id]
        entry = {
            "sender": sender,
            "text": text,
            "timestamp": get_current_iso_timestamp(),
            "is_emergency": is_emergency
        }
        session.setdefault("messages", []).append(entry)
        session["updated_at"] = get_current_iso_timestamp()
        return {
            **session,
            "messages": [dict(m) for m in session.get("messages", [])]
        }


def create_emergency_incident(
    call_id: int,
    student_id: int,
    student_name: str,
    reason: str
) -> Dict[str, Any]:
    """Create a new emergency incident and store it in EMERGENCIES_DB."""
    global _emergency_id_counter
    with DB_LOCK:
        incident_id = _emergency_id_counter
        _emergency_id_counter += 1

        record: Dict[str, Any] = {
            "id": incident_id,
            "call_id": call_id,
            "student_id": student_id,
            "student_name": student_name,
            "reason": reason,
            "status": "open",
            "timestamp": get_current_iso_timestamp()
        }
        EMERGENCIES_DB.append(record)
        return dict(record)


def list_emergencies(status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """List emergencies, optionally filtered by status ('open', 'acknowledged', 'resolved')."""
    with DB_LOCK:
        if status_filter:
            return [dict(e) for e in EMERGENCIES_DB if e["status"] == status_filter]
        return [dict(e) for e in EMERGENCIES_DB]


def get_emergency_by_id(emergency_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve an emergency incident by ID."""
    with DB_LOCK:
        for incident in EMERGENCIES_DB:
            if incident["id"] == emergency_id:
                return dict(incident)
        return None


def update_emergency_status(
    emergency_id: int,
    new_status: str
) -> Optional[Dict[str, Any]]:
    """Update status of an emergency record (e.g., 'acknowledged', 'resolved')."""
    with DB_LOCK:
        for incident in EMERGENCIES_DB:
            if incident["id"] == emergency_id:
                incident["status"] = new_status
                incident["updated_at"] = get_current_iso_timestamp()
                return dict(incident)
        return None
