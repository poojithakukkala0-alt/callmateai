"""CallMateAI Stage 3 - MongoDB Database Connection and Index Management.

This module manages the connection lifecycle for MongoDB (supporting both local instances
and MongoDB Atlas Cloud clusters) with connection pooling and automated index provisioning.
"""

import os
from pathlib import Path
from typing import Any, Dict, Optional
from dotenv import load_dotenv
from pymongo import ASCENDING, MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Locate and load .env file from the current directory or workspace root
env_file = Path(__file__).resolve().parent / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

# Configuration settings with production-safe fallbacks
MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")
DB_NAME: str = os.getenv("DB_NAME", "callmate_db")

# Singleton client and database instances
_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def get_client() -> MongoClient:
    """Initialize or return the cached PyMongo client with connection pooling.

    Returns:
        MongoClient: Configured PyMongo client instance.
    """
    global _client
    if _client is None:
        _client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
            maxPoolSize=50,
            minPoolSize=5,
            retryWrites=True,
            appname="CallMateAI",
        )
    return _client


def get_database(name: Optional[str] = None) -> Database:
    """Return the designated MongoDB database instance.

    Args:
        name: Optional override for database name (defaults to DB_NAME).

    Returns:
        Database: PyMongo Database instance.
    """
    global _db
    client = get_client()
    target_name = name or DB_NAME
    if _db is None or _db.name != target_name:
        _db = client[target_name]
    return _db


def ping_database(db: Optional[Database] = None) -> bool:
    """Ping the MongoDB server to verify cluster connectivity.

    Args:
        db: Optional Database instance.

    Returns:
        bool: True if connection is alive.

    Raises:
        ConnectionFailure: If the server cannot be reached within timeout.
    """
    client = get_client()
    try:
        client.admin.command("ping")
        return True
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise ConnectionFailure(
            f"Failed to connect to MongoDB at '{MONGO_URI}': {exc}"
        ) from exc


def init_indexes(db: Optional[Database] = None) -> Dict[str, Any]:
    """Create essential unique, single-field, and compound indexes across all 4 collections.

    Indexes Created:
    - counselors:
        * Unique index on 'counselor_id'
        * Unique index on 'email'
    - students:
        * Unique index on 'student_id'
        * Unique index on 'student_code'
        * Index on 'counselor_id' (for dashboard filtering)
        * Index on 'parents.phone' (for instantaneous incoming caller ID lookup)
    - calls:
        * Unique index on 'call_id'
        * Index on 'student_id'
        * Index on 'counselor_id'
    - counselor_alerts:
        * Compound index on ('counselor_id', 1) and ('status', 1)
        * Index on 'call_id'

    Args:
        db: Optional Database instance.

    Returns:
        Dict[str, Any]: Summary of created index names per collection.
    """
    if db is None:
        db = get_database()

    # 1. Counselors collection indexes
    c_idx1 = db.counselors.create_index([("counselor_id", ASCENDING)], unique=True, name="idx_counselors_id_unique")
    c_idx2 = db.counselors.create_index([("email", ASCENDING)], unique=True, name="idx_counselors_email_unique")

    # 2. Students collection indexes
    s_idx1 = db.students.create_index([("student_id", ASCENDING)], unique=True, name="idx_students_id_unique")
    s_idx2 = db.students.create_index([("student_code", ASCENDING)], unique=True, name="idx_students_code_unique")
    s_idx3 = db.students.create_index([("counselor_id", ASCENDING)], name="idx_students_counselor_id")
    s_idx4 = db.students.create_index([("parents.phone", ASCENDING)], name="idx_students_parents_phone")

    # 3. Calls collection indexes
    cl_idx1 = db.calls.create_index([("call_id", ASCENDING)], unique=True, name="idx_calls_id_unique")
    cl_idx2 = db.calls.create_index([("student_id", ASCENDING)], name="idx_calls_student_id")
    cl_idx3 = db.calls.create_index([("counselor_id", ASCENDING)], name="idx_calls_counselor_id")

    # 4. Counselor alerts collection indexes
    ca_idx1 = db.counselor_alerts.create_index(
        [("counselor_id", ASCENDING), ("status", ASCENDING)],
        name="idx_counselor_alerts_counselor_status"
    )
    ca_idx2 = db.counselor_alerts.create_index([("call_id", ASCENDING)], name="idx_counselor_alerts_call_id")

    return {
        "counselors": [c_idx1, c_idx2],
        "students": [s_idx1, s_idx2, s_idx3, s_idx4],
        "calls": [cl_idx1, cl_idx2, cl_idx3],
        "counselor_alerts": [ca_idx1, ca_idx2]
    }


def close_connection() -> None:
    """Close the active MongoClient pool connection."""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None


if __name__ == "__main__":
    print(f"Connecting to MongoDB at: {MONGO_URI} (Database: {DB_NAME})")
    database = get_database()
    ping_database(database)
    print("MongoDB connection successful!")
    created_indexes = init_indexes(database)
    print(f"Indexes created successfully: {created_indexes}")
