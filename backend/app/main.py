import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add backend directory to Python sys.path so 'app' is always resolvable
CURRENT_DIR = Path(__file__).resolve().parent.parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from app.routers import calls, students, emergencies
from app.services import mock_db
# Instantiate FastAPI application
app = FastAPI(
    title="CallMateAI Backend Engine",
    description=(
        "Stage 2 Counselor Support & Emergency Routing System. "
        "Provides simulated call lifecycle management, grounded student record inquiry, "
        "and critical keyword emergency escalation."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register modular routers (support both /api prefixed endpoints and root endpoints)
app.include_router(calls.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(emergencies.router, prefix="/api")
app.include_router(calls.router)
app.include_router(students.router)
app.include_router(emergencies.router)


@app.get("/", tags=["System"])
def root():
    return {
        "status": "online",
        "service": "CallMateAI Backend Engine",
        "version": "1.0.0",
        "docs_url": "/docs"
    }


@app.get("/api/health", tags=["System"])
def health():
    total_calls = len(calls.SIMULATED_CALLS) if hasattr(calls, "SIMULATED_CALLS") else len(mock_db.CALL_SESSIONS)
    open_emergencies = len(mock_db.list_emergencies(status_filter="open"))
    return {
        "status": "healthy",
        "service": "CallMateAI Backend Engine",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "metrics": {
            "total_call_sessions": total_calls,
            "open_emergencies": open_emergencies,
            "registered_students": len(mock_db.STUDENTS_DB),
            "registered_counselors": len(mock_db.COUNSELORS_DB)
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
