"""Emergency detection and management service for CallMateAI."""

import re
from typing import Any, Dict, List, Optional, Tuple
from app.services import mock_db


# Strict list of emergency trigger keywords defined by specification
EMERGENCY_KEYWORDS: List[str] = [
    "accident",
    "missing",
    "hospital",
    "injured",
    "hurt",
    "danger",
    "bleeding",
    "collapsed"
]

# Regex pattern built with word boundaries for exact token matching
_KEYWORD_REGEX = re.compile(
    r"\b(" + "|".join(re.escape(k) for k in EMERGENCY_KEYWORDS) + r")\b",
    re.IGNORECASE
)


class EmergencyService:
    """Service handling emergency detection rules and incident lifecycle."""

    @staticmethod
    def detect_emergency(message: str) -> Tuple[bool, List[str]]:
        """
        Inspect message for urgent emergency keywords.
        Returns (is_emergency, list_of_detected_keywords).
        """
        if not message:
            return False, []

        matches = _KEYWORD_REGEX.findall(message)
        if matches:
            # Normalize detected keywords to lower-case unique list
            unique_keywords = sorted(list({m.lower() for m in matches}))
            return True, unique_keywords

        return False, []

    @staticmethod
    def trigger_emergency_incident(
        call_id: int,
        student_id: int,
        student_name: str,
        message: str,
        detected_keywords: List[str]
    ) -> Dict[str, Any]:
        """
        Create and record an incident in EMERGENCIES_DB.
        """
        reason = (
            f"Urgent keywords [{', '.join(detected_keywords)}] detected in message: "
            f"\"{message.strip()}\""
        )
        return mock_db.create_emergency_incident(
            call_id=call_id,
            student_id=student_id,
            student_name=student_name,
            reason=reason
        )

    @staticmethod
    def get_open_emergencies() -> List[Dict[str, Any]]:
        """List all emergencies currently marked 'open'."""
        return mock_db.list_emergencies(status_filter="open")

    @staticmethod
    def list_all_emergencies(status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """List emergencies with optional status filter."""
        return mock_db.list_emergencies(status_filter=status_filter)

    @staticmethod
    def get_emergency(emergency_id: int) -> Optional[Dict[str, Any]]:
        """Fetch single emergency incident."""
        return mock_db.get_emergency_by_id(emergency_id)

    @staticmethod
    def acknowledge_emergency(emergency_id: int) -> Optional[Dict[str, Any]]:
        """Transition emergency status to 'acknowledged'."""
        record = mock_db.get_emergency_by_id(emergency_id)
        if not record:
            return None
        return mock_db.update_emergency_status(emergency_id, "acknowledged")

    @staticmethod
    def resolve_emergency(emergency_id: int) -> Optional[Dict[str, Any]]:
        """Transition emergency status to 'resolved'."""
        record = mock_db.get_emergency_by_id(emergency_id)
        if not record:
            return None
        return mock_db.update_emergency_status(emergency_id, "resolved")


emergency_service = EmergencyService()
