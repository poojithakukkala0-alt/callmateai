"""Router for student records and profile retrieval."""

from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas import StudentRecord
from app.services import mock_db

router = APIRouter(prefix="/students", tags=["Students"])


@router.get(
    "",
    response_model=List[StudentRecord],
    summary="List authorized student records",
    description="Returns list of all authorized student profiles in the database."
)
def list_students():
    """Retrieve all student profiles."""
    records = mock_db.list_students()
    return records


@router.get(
    "/{student_id}",
    response_model=StudentRecord,
    summary="Retrieve single student profile",
    description="Fetches full profile, attendance, remarks, fee status, and emergency contacts for a student."
)
def get_student(student_id: int):
    """Retrieve single student record."""
    student = mock_db.get_student(student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} not found."
        )
    return student
