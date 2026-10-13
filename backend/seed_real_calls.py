import os
import random
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from dotenv import load_dotenv

# Load Atlas environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "callmate_db")

if not MONGO_URI:
    print("❌ ERROR: MONGO_URI not found in backend/.env file!")
    exit(1)

# Connect to cloud database cluster
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
calls_col = db["calls"]
students_col = db["students"]

print(f"Connecting to MongoDB Atlas cloud database: {DB_NAME}...")

# Clean old mock data first to avoid duplicate IDs during the run
print("Cleaning old mock calls to ensure a fresh, consistent seed...")
calls_col.delete_many({"call_id": {"$gte": 9100, "$lte": 9125}})

# Fetch real students to map accurate data
existing_students = list(students_col.find({}, {"student_id": 1, "name": 1, "counselor_id": 1, "parents": 1}))

if not existing_students:
    print("❌ ERROR: No student records found. Please run python seed.py first!")
    exit(1)

# Simulated conversation turns matching actual parent inquiries
sample_scenarios = [
    {
        "risk_level": "Low",
        "status": "completed",
        "tag": "ai_handled",
        "summary": "Parent verified student attendance. AI confirmed 96% and stated student is in good standing.",
        "turns": [
            {"sender": "AI", "text": "Hello! This is CallMateAI, assistant for counselor. How can I assist you today?"},
            {"sender": "Caller", "text": "Aarav ki attendance percentage kavali sir?"},
            {"sender": "AI", "text": "Aarav has an official attendance of 96%. He has been attending lectures regularly."}
        ]
    },
    {
        "risk_level": "Low",
        "status": "completed",
        "tag": "ai_handled",
        "summary": "Parent verified tuition fees status. AI verified Term 2 dues are fully paid.",
        "turns": [
            {"sender": "AI", "text": "Hello! This is CallMateAI. How can I assist you?"},
            {"sender": "Caller", "text": "Term 2 tuition fees payment status check cheyyandi."},
            {"sender": "AI", "text": "Official records show that the Term 2 college tuition fee has been cleared successfully."}
        ]
    },
    {
        "risk_level": "Medium",
        "status": "completed",
        "tag": "ai_handled",
        "summary": "Parent requested live classroom check. AI logged a Blue Task Note for the counselor.",
        "turns": [
            {"sender": "AI", "text": "Hello! This is CallMateAI, assistant for counselor. How can I assist you?"},
            {"sender": "Caller", "text": "Pooja class lo kurchunda check cheyava?"},
            {"sender": "AI", "text": "I cannot physically verify real-time classroom presence. I have logged an inquiry note for the counselor."}
        ]
    },
    {
        "risk_level": "High",
        "status": "handover",
        "tag": "handover",
        "summary": "Emergency handover: Accident outside campus reported. Counselor approved leave.",
        "turns": [
            {"sender": "AI", "text": "Hello! This is CallMateAI. How can I assist you today?"},
            {"sender": "Caller", "text": "Pooja had an accident outside and she is in the hospital!"},
            {"sender": "AI", "text": "🚨 EMERGENCY ALERT: I have requested an immediate handover to the counselor."},
            {"sender": "Counselor", "text": "Hello, please do not worry about attendance. I am officially granting a medical leave."}
        ]
    }
]

# Generate 20 calls
calls_to_insert = []
base_time = datetime.now(timezone.utc)

for i in range(1, 21):
    call_id = 9100 + i
    student_record = existing_students[(i - 1) % len(existing_students)]
    
    student_id = student_record.get("student_id")
    counselor_id = student_record.get("counselor_id", 1)
    
    parent_list = student_record.get("parents") or [{}]
    parent_phone = parent_list[0].get("phone", f"+91 98450 {10000 + i}")
    
    scenario = sample_scenarios[(i - 1) % len(sample_scenarios)]
    
    # Stagger timestamps across past 48 hours
    call_start = base_time - timedelta(hours=i * 2, minutes=random.randint(1, 59))
    call_end = call_start + timedelta(minutes=random.randint(2, 8))
    
    call_doc = {
        "call_id": call_id,
        "student_id": student_id,
        "counselor_id": counselor_id,
        "parent_phone": parent_phone,
        "status": scenario["status"],
        "tag": scenario["tag"],
        "started_at": call_start.isoformat(),
        "ended_at": call_end.isoformat(),
        "risk_level": scenario["risk_level"],
        "summary": scenario["summary"],
        "messages": scenario["turns"]
    }
    calls_to_insert.append(call_doc)

# Save to cloud Atlas calls collection
result = calls_col.insert_many(calls_to_insert)
print(f"✅ SUCCESS: Seeding complete! Inserted {len(result.inserted_ids)} call documents into MongoDB Atlas.")
print(f"Total Call records now in cloud database: {calls_col.count_documents({})}")
