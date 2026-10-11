"""Router for emergency alerts and incident acknowledgement."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas import EmergencyRecord
from app.services.emergency_service import emergency_service

router = APIRouter(prefix="/emergencies", tags=["Emergencies"])


@router.get(
    "",
    response_model=List[EmergencyRecord],
    summary="List emergency alerts",
    description="List emergency alerts for counselor dashboard polling. Defaults to returning 'open' emergencies."
)
def list_emergencies(
    status_filter: Optional[str] = Query(
        default="open",
        alias="status",
        description="Filter incidents by status: 'open', 'acknowledged', 'resolved', or 'all'"
    )
):
    """Retrieve emergency records for monitoring and polling."""
    if status_filter and status_filter.lower() == "all":
        return emergency_service.list_all_emergencies()
    return emergency_service.list_all_emergencies(status_filter=status_filter)


@router.get(
    "/{emergency_id}",
    response_model=EmergencyRecord,
    summary="Get single emergency incident",
    description="Retrieve details of an emergency record by ID."
)
def get_emergency(emergency_id: int):
    """Retrieve emergency record by ID."""
    record = emergency_service.get_emergency(emergency_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency record #{emergency_id} not found."
        )
    return record


@router.post(
    "/{emergency_id}/acknowledge",
    response_model=EmergencyRecord,
    summary="Acknowledge emergency alert",
    description="Counselor acknowledges an emergency alert, transitioning status from 'open' to 'acknowledged'."
)
def acknowledge_emergency(emergency_id: int):
    """Mark an emergency incident as acknowledged."""
    record = emergency_service.acknowledge_emergency(emergency_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency record #{emergency_id} not found."
        )
    return record


@router.post(
    "/{emergency_id}/resolve",
    response_model=EmergencyRecord,
    summary="Resolve emergency alert",
    description="Mark an emergency incident as resolved once counselor confirms safety."
)
def resolve_emergency(emergency_id: int):
    """Mark an emergency incident as resolved."""
    record = emergency_service.resolve_emergency(emergency_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency record #{emergency_id} not found."
        )
    return record
