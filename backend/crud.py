"""CallMateAI Stage 3 - CRUD & Query Layer (MongoDB Atlas / PyMongo).

Provides clean data access functions for:
- Student lookups and in-memory counselor joins
- Incoming Caller ID phone number identification
- Counselor profile and section retrieval
- Call session creation, status transitions, and transcript logging
- Dual-escalation alert engine (Urgent Emergency & Normal Live Inquiry)
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
from bson import ObjectId
from pymongo.database import Database

from database import get_database


def _get_db(db: Optional[Database] = None) -> Database:
    """Helper to return active or provided database instance."""
    return db if db is not None else get_database()


def _format_iso_now() -> str:
    """Return formatted ISO timestamp with UTC indicator."""
    return datetime.now(timezone.utc).isoformat()


# =====================================================================
# Counselor Queries
# =====================================================================

def get_counselor(counselor_id: int, db: Optional[Database] = None) -> Optional[Dict[str, Any]]:
    """Retrieve counselor status, contact details, and section assignment.

    Args:
        counselor_id: Unique integer identifier for the counselor.
        db: Optional Database instance.

    Returns:
        Optional[Dict[str, Any]]: Counselor document without '_id', or None if not found.
    """
    database = _get_db(db)
    doc = database.counselors.find_one({"counselor_id": counselor_id}, {"_id": 0})
    return doc


def list_all_counselors(db: Optional[Database] = None) -> List[Dict[str, Any]]:
    """Return all configured academic counselors.

    Args:
        db: Optional Database instance.

    Returns:
        List[Dict[str, Any]]: List of counselor documents sorted by counselor_id.
    """
    database = _get_db(db)
    cursor = database.counselors.find({}, {"_id": 0}).sort("counselor_id", 1)
    return list(cursor)


# =====================================================================
# Student Queries
# =====================================================================

def get_student(student_id: int, db: Optional[Database] = None) -> Optional[Dict[str, Any]]:
    """Query student by ID, join assigned counselor in-memory, and strip '_id'.

    Args:
        student_id: Unique integer identifier (e.g. 1001-1250).
        db: Optional Database instance.

    Returns:
        Optional[Dict[str, Any]]: Student record enriched with 'counselor' info, or None.
    """
    database = _get_db(db)
    student = database.students.find_one({"student_id": student_id}, {"_id": 0})
    if not student:
        return None

    # In-memory join of counselor details
    counselor_id = student.get("counselor_id")
    if counselor_id is not None:
        counselor = database.counselors.find_one({"counselor_id": counselor_id}, {"_id": 0})
        student["counselor"] = counselor
    else:
        student["counselor"] = None

    return student


def get_student_by_parent_phone(phone: str, db: Optional[Database] = None) -> Optional[Dict[str, Any]]:
    """Find student record linked to an incoming parent phone number.

    Used for instantaneous automated Caller ID identification when a parent rings in.

    Args:
        phone: Incoming phone number string (e.g. '+91 9811000001' or '9811000001').
        db: Optional Database instance.

    Returns:
        Optional[Dict[str, Any]]: Student record with assigned counselor info, or None.
    """
    database = _get_db(db)
    clean_phone = phone.strip()

    # Query using multikey index on parents.phone
    query: Dict[str, Any] = {"parents.phone": clean_phone}

    student = database.students.find_one(query, {"_id": 0})

    # If not found directly, also attempt flexible matching (e.g. without spaces or with '+91 ' prefix)
    if not student:
        digits_only = "".join(filter(str.isdigit, clean_phone))
        if len(digits_only) >= 10:
            last_10 = digits_only[-10:]
            # Match regex ending with the 10 digits
            student = database.students.find_one(
                {"parents.phone": {"$regex": f"{last_10}$"}},
                {"_id": 0}
            )

    if not student:
        return None

    # In-memory join of counselor details
    counselor_id = student.get("counselor_id")
    if counselor_id is not None:
        counselor = database.counselors.find_one({"counselor_id": counselor_id}, {"_id": 0})
        student["counselor"] = counselor
    else:
        student["counselor"] = None

    return student


def list_students_by_counselor(counselor_id: int, db: Optional[Database] = None) -> List[Dict[str, Any]]:
    """Return all assigned students (typically 50) for a given counselor dashboard.

    Args:
        counselor_id: Counselor ID integer (1 to 5).
        db: Optional Database instance.

    Returns:
        List[Dict[str, Any]]: Student documents stripped of '_id' and ordered by student_id.
    """
    database = _get_db(db)
    cursor = database.students.find({"counselor_id": counselor_id}, {"_id": 0}).sort("student_id", 1)
    return list(cursor)


# =====================================================================
# Call Lifecycle & History Queries
# =====================================================================

def create_call(
    call_id: int,
    student_id: int,
    counselor_id: int,
    parent_phone: str,
    db: Optional[Database] = None
) -> Dict[str, Any]:
    """Initialize a call document with 'incoming' status.

    Args:
        call_id: Unique integer call identifier.
        student_id: ID of the student associated with the call.
        counselor_id: ID of the counselor assigned to the student's section.
        parent_phone: Phone number of the dialing parent.
        db: Optional Database instance.

    Returns:
        Dict[str, Any]: The created call document without '_id'.
    """
    database = _get_db(db)
    doc = {
        "call_id": call_id,
        "student_id": student_id,
        "counselor_id": counselor_id,
        "parent_phone": parent_phone,
        "status": "incoming",
        "started_at": _format_iso_now(),
        "messages": [],
    }
    database.calls.insert_one(doc)
    doc.pop("_id", None)
    return doc


def get_call(call_id: int, db: Optional[Database] = None) -> Optional[Dict[str, Any]]:
    """Retrieve call document by call_id.

    Args:
        call_id: Unique integer call identifier.
        db: Optional Database instance.

    Returns:
        Optional[Dict[str, Any]]: Call document without '_id', or None if not found.
    """
    database = _get_db(db)
    return database.calls.find_one({"call_id": call_id}, {"_id": 0})


get_call_by_id = get_call


def update_call_status(
    call_id: int,
    status: str,
    db: Optional[Database] = None
) -> Optional[Dict[str, Any]]:
    """Transition call state ('incoming' -> 'agent' -> 'handover' / 'handover requested' -> 'completed' -> 'failed').

    Args:
        call_id: Unique integer call identifier.
        status: Target status string.
        db: Optional Database instance.

    Returns:
        Optional[Dict[str, Any]]: Updated call document without '_id'.

    Raises:
        ValueError: If status is not one of the permitted literals.
    """
    valid_statuses = {
        "incoming",
        "agent",
        "handover",
        "handover requested",
        "counselor connected",
        "completed",
        "failed"
    }
    if status not in valid_statuses:
        raise ValueError(
            f"Invalid call status '{status}'. Must be one of {sorted(valid_statuses)}"
        )

    database = _get_db(db)
    database.calls.update_one(
        {"call_id": call_id},
        {"$set": {"status": status}}
    )
    return database.calls.find_one({"call_id": call_id}, {"_id": 0})


def add_call_message(
    call_id: int,
    sender: str,
    text: str,
    db: Optional[Database] = None
) -> Dict[str, Any]:
    """Append a message to the call transcript.

    Args:
        call_id: Unique integer call identifier.
        sender: Sender identifier (e.g. 'parent', 'agent', 'counselor').
        text: Utterance or message content.
        db: Optional Database instance.

    Returns:
        Dict[str, Any]: The appended message object.
    """
    database = _get_db(db)
    message_entry = {
        "sender": sender,
        "text": text,
        "timestamp": _format_iso_now(),
    }
    database.calls.update_one(
        {"call_id": call_id},
        {"$push": {"messages": message_entry}}
    )
    return message_entry


def complete_call(
    call_id: int,
    summary: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Optional[Database] = None
) -> Optional[Dict[str, Any]]:
    """Transition call state to 'completed', record 'ended_at' timestamp, and update summary/risk_level.

    Args:
        call_id: Unique integer call identifier.
        summary: Optional summary of the concluded call session.
        risk_level: Optional risk level assessment ('Low', 'Medium', 'High').
        db: Optional Database instance.

    Returns:
        Optional[Dict[str, Any]]: Updated call document without '_id'.
    """
    database = _get_db(db)
    update_fields: Dict[str, Any] = {
        "status": "completed",
        "ended_at": _format_iso_now(),
    }
    if summary is not None:
        update_fields["summary"] = summary
    if risk_level is not None:
        update_fields["risk_level"] = risk_level

    database.calls.update_one(
        {"call_id": call_id},
        {"$set": update_fields},
        upsert=True
    )
    return database.calls.find_one({"call_id": call_id}, {"_id": 0})


# =====================================================================
# Counselor Dual-Escalation Alerts Engine
# =====================================================================

def create_counselor_alert(
    call_id: int,
    alert_type: str,
    priority: str,
    message: str,
    counselor_id: int,
    db: Optional[Database] = None
) -> Dict[str, Any]:
    """Dispatch a dual-escalation alert for a counselor dashboard.

    Dual-Escalation Engine Types:
    - 🚨 Type 1 (Emergency): parent reports accident, missing child, injury
        -> alert_type='emergency', priority='urgent', status='new'
        -> Triggers flashing red banner + alarm on dashboard.
    - 📋 Type 2 (Live Physical Classroom Inquiry): parent asks about real-time presence
        ("Is my child in 1st period class right now?", "Tell my son to call me")
        -> alert_type='live_inquiry', priority='normal', status='new'
        -> Triggers informational blue badge on dashboard.
    - 🔄 Type 3 (General Handover): counselor intervention requested
        -> alert_type='general_handover', priority='high' or 'normal', status='new'

    Args:
        call_id: Associated call session ID.
        alert_type: Literal['emergency', 'live_inquiry', 'general_handover'].
        priority: Literal['normal', 'high', 'urgent'].
        message: Detailed escalation description.
        counselor_id: Assigned counselor recipient ID.
        db: Optional Database instance.

    Returns:
        Dict[str, Any]: Created alert document with string 'id' field.
    """
    valid_types = {"emergency", "live_inquiry", "general_handover"}
    valid_priorities = {"normal", "high", "urgent"}

    if alert_type not in valid_types:
        raise ValueError(f"Invalid alert_type '{alert_type}'. Must be one of {sorted(valid_types)}")
    if priority not in valid_priorities:
        raise ValueError(f"Invalid priority '{priority}'. Must be one of {sorted(valid_priorities)}")

    database = _get_db(db)
    doc = {
        "call_id": call_id,
        "alert_type": alert_type,
        "priority": priority,
        "message": message,
        "counselor_id": counselor_id,
        "status": "new",
        "created_at": _format_iso_now(),
    }
    result = database.counselor_alerts.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc


def list_counselor_alerts(
    counselor_id: int,
    include_resolved: bool = False,
    db: Optional[Database] = None
) -> List[Dict[str, Any]]:
    """Query counselor alerts sorted by creation timestamp descending.

    Args:
        counselor_id: Assigned counselor identifier.
        include_resolved: If False (default), returns only active ('new', 'acknowledged') alerts.
        db: Optional Database instance.

    Returns:
        List[Dict[str, Any]]: List of alert dictionaries with string 'id'.
    """
    database = _get_db(db)
    filter_query: Dict[str, Any] = {"counselor_id": counselor_id}

    if not include_resolved:
        filter_query["status"] = {"$in": ["new", "acknowledged"]}

    cursor = database.counselor_alerts.find(filter_query).sort("created_at", -1)
    alerts: List[Dict[str, Any]] = []

    for alert in cursor:
        alert_id = str(alert.pop("_id"))
        alert["id"] = alert_id
        alerts.append(alert)

    return alerts


def update_counselor_alert_status(
    alert_id: Union[str, ObjectId],
    status: str,
    db: Optional[Database] = None
) -> Optional[Dict[str, Any]]:
    """Update alert status ('acknowledged', 'resolved').

    Args:
        alert_id: ObjectId or hex string of the alert.
        status: Target status ('new', 'acknowledged', 'resolved').
        db: Optional Database instance.

    Returns:
        Optional[Dict[str, Any]]: Updated alert document with string 'id'.
    """
    valid_statuses = {"new", "acknowledged", "resolved"}
    if status not in valid_statuses:
        raise ValueError(f"Invalid status '{status}'. Must be one of {sorted(valid_statuses)}")

    database = _get_db(db)
    obj_id = ObjectId(alert_id) if isinstance(alert_id, str) else alert_id
    database.counselor_alerts.update_one(
        {"_id": obj_id},
        {"$set": {"status": status}}
    )
    doc = database.counselor_alerts.find_one({"_id": obj_id})
    if doc:
        doc["id"] = str(doc.pop("_id"))
    return doc
