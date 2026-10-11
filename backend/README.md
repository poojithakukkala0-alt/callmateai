# CallMateAI Backend Engine (Stage 2)
### Counselor Support & Emergency Routing System

CallMateAI is an intelligent telephony and AI assistance backend designed for educational institutions. When parents call during busy school hours, calls can be forwarded to CallMateAI to provide grounded, real-time student updates (attendance, academic remarks, fee status). If a parent mentions a critical emergency, CallMateAI detects emergency trigger keywords, automatically shifts the call into an emergency handover state, creates an urgent incident record, and alerts counselors for immediate takeover.

---

## 🏗️ Architecture & Call State Machine

The call lifecycle enforces a strict state machine:

```text
       [Parent Calls]
             │
             ▼
       ┌───────────┐
       │ incoming  │  (Call created; assigned to counselor)
       └─────┬─────┘
             │ Counselor forwards to CallMateAI
             ▼
       ┌───────────┐
       │   agent   │  (AI Agent converses with parent; answers queries)
       └─────┬─────┘
             │
      Emergency Keyword Detected?
             ├───────────────┐
             │ YES           │ NO
             ▼               ▼
 ┌──────────────────────┐  (Remains in 'agent' status)
 │  handover requested  │
 └──────────┬───────────┘
            │ Counselor accepts takeover
            ▼
 ┌──────────────────────┐
 │ counselor connected  │  (Human counselor connected with parent)
 └──────────┬───────────┘
            │ Call concluded
            ▼
       ┌───────────┐
       │ completed │  (Archived; immutable session)
       └───────────┘
```

### Emergency Detection Keywords:
Messages are scanned case-insensitively for:
`['accident', 'missing', 'hospital', 'injured', 'hurt', 'danger', 'bleeding', 'collapsed']`

- **When triggered**:
  1. Call session status transitions to `'handover requested'`.
  2. `emergency_flag` is set to `True`.
  3. A new emergency incident is logged in `EMERGENCIES_DB`.
  4. An urgent takeover alert notification is returned to the parent.
- **Normal queries**:
  - Matched against student records (`attendance`, `remarks`, `fee_status`, `emergency_contact`).
  - Returns a polite, factual answer strictly grounded in the database.

---

## 📁 Directory Structure

```text
callmateai-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI entrypoint, CORS & health checks
│   ├── schemas.py                  # Pydantic v2 data models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── mock_db.py              # Thread-safe in-memory store
│   │   ├── call_service.py         # Call lifecycle, state machine & grounded AI responses
│   │   └── emergency_service.py    # Emergency keyword detection & alert management
│   └── routers/
│       ├── __init__.py
│       ├── calls.py                # Call routing, forwarding, messaging & handover
│       ├── students.py             # Authorized student profiles
│       └── emergencies.py          # Emergency alerts for counselor polling
├── requirements.txt                # Dependencies (FastAPI, Uvicorn, Pydantic, python-dotenv)
├── .env.example                    # Environment variable template
└── README.md                       # Documentation & verification guide
```

---

## 🚀 Setup & Execution

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13)
- `pip` or virtual environment

### 2. Installation
Navigate to the project directory:
```bash
cd callmateai-backend
```

Create and activate a virtual environment (optional but recommended):
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### 3. Running the Server
Start the Uvicorn development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Once running, access:
- **Interactive Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check Endpoint**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🔌 API Reference

### Health & Root
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root service banner and documentation links |
| `GET` | `/api/health` | Service health status, session count, and emergency count |

### Calls (`/api/calls`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/calls` | Start incoming call session (`status`: `incoming`) |
| `GET` | `/api/calls` | List all call sessions |
| `GET` | `/api/calls/{call_id}` | Retrieve specific call session details |
| `POST` | `/api/calls/{call_id}/forward` | Counselor forwards call to CallMateAI (`status` -> `agent`) |
| `POST` | `/api/calls/{call_id}/message` | Send parent message; checks emergencies or queries records |
| `POST` | `/api/calls/{call_id}/handover` | Counselor accepts emergency handover (`status` -> `counselor connected`) |
| `POST` | `/api/calls/{call_id}/complete` | End and archive call session (`status` -> `completed`) |

### Students (`/api/students`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | List all authorized student profiles |
| `GET` | `/api/students/{student_id}` | Retrieve profile for student ID (e.g., `101`, `102`, `103`) |

### Emergencies (`/api/emergencies`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/emergencies` | List active emergency alerts (defaults to `open` status for counselor dashboard polling) |
| `GET` | `/api/emergencies/{emergency_id}` | Retrieve emergency incident details |
| `POST` | `/api/emergencies/{emergency_id}/acknowledge` | Counselor acknowledges emergency alert (`open` -> `acknowledged`) |
| `POST` | `/api/emergencies/{emergency_id}/resolve` | Counselor resolves emergency incident (`acknowledged` -> `resolved`) |

---

## 🧪 End-to-End Testing & Verification with `curl`

Below is an end-to-end walk-through testing every state transition and emergency escalation:

### 1. Health Check
```bash
curl -X GET http://localhost:8000/api/health
```

### 2. Verify Student Records
```bash
curl -X GET http://localhost:8000/api/students/101
```

### 3. Initiate Incoming Call (State: `incoming`)
```bash
curl -X POST http://localhost:8000/api/calls \
  -H "Content-Type: application/json" \
  -d '{"student_id": 101, "counselor_id": 1}'
```
*Response: `call_id: 1, status: "incoming"`*

### 4. Counselor Forwards Call to AI Agent (State: `agent`)
```bash
curl -X POST http://localhost:8000/api/calls/1/forward \
  -H "Content-Type: application/json" \
  -d '{"target": "ai_agent"}'
```
*Response: `call_id: 1, status: "agent"`*

### 5. Parent Inquires About Attendance (Normal Query)
```bash
curl -X POST http://localhost:8000/api/calls/1/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Can you tell me Aarav'\''s attendance and recent teacher remarks?"}'
```
*Response: Grounded factual response quoting 96% attendance and science club remarks.*

### 6. Parent Reports Emergency Incident (Triggers Emergency Escalation)
```bash
curl -X POST http://localhost:8000/api/calls/1/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Please help! There has been an accident outside and Aarav is hurt and bleeding!"}'
```
*Response: `status: "handover requested"`, `emergency_flag: true`, urgent notification returned.*

### 7. Counselor Dashboard Polls Emergencies
```bash
curl -X GET http://localhost:8000/api/emergencies?status=open
```
*Response: Contains incident #1 linked to Call #1 and Student #101.*

### 8. Counselor Acknowledges Emergency
```bash
curl -X POST http://localhost:8000/api/emergencies/1/acknowledge
```
*Response: Emergency #1 status changed to `"acknowledged"`.*

### 9. Counselor Connects to Call (Handover Acceptance)
```bash
curl -X POST http://localhost:8000/api/calls/1/handover \
  -H "Content-Type: application/json" \
  -d '{"reason": "Dr. Lakshmi Prasad joining call immediately with first aid team."}'
```
*Response: `status: "counselor connected"`*

### 10. Conclude and Archive Call (State: `completed`)
```bash
curl -X POST http://localhost:8000/api/calls/1/complete
```
*Response: `status: "completed"`*

---

## 🚀 Stage 3: Scaled Database Layer (MongoDB Atlas Cloud Integration)

Stage 3 replaces legacy flat models with a production-grade **MongoDB Atlas** NoSQL cloud database architecture, modeling 5 academic counselors, 250 students (50 per counselor), embedded parent profiles, call logging, and a **Dual Escalation Engine**.

### 1. Database Collections & Schemas

| Collection | Schema Highlights | Indexes |
| :--- | :--- | :--- |
| `counselors` | `counselor_id` (int, 1-5), `name`, `email`, `phone`, `section`, `department`, `availability` | `counselor_id` (unique), `email` (unique) |
| `students` | `student_id` (1001-1250), `student_code` ('241FA04001'-'241FA04250'), `name`, `section`, `counselor_id`, `attendance_pct` (65%-98%), `current_status`, `remarks`, embedded `parents` | `student_id` (unique), `student_code` (unique), `counselor_id`, `parents.phone` (multikey) |
| `calls` | `call_id` (unique), `student_id`, `counselor_id`, `parent_phone`, `status`, `started_at`, `messages` | `call_id` (unique), `student_id`, `counselor_id` |
| `counselor_alerts` | `id` (ObjectId), `call_id`, `alert_type`, `priority`, `message`, `counselor_id`, `status`, `created_at` | Compound `('counselor_id', 1), ('status', 1)`, `call_id` |

### 2. Embedded Parent Profile Schema (No Junction Tables)
```json
{
  "parents": [
    {
      "parent_id": 10011,
      "name": "Anand Sharma",
      "relationship": "Father",
      "phone": "+91 9811000001",
      "verified": true
    },
    {
      "parent_id": 10012,
      "name": "Sunitha Sharma",
      "relationship": "Mother",
      "phone": "+91 9811000002",
      "verified": true
    }
  ]
}
```

### 3. Dual-Escalation Engine Specification
- 🚨 **Type 1 (Emergency)**: Parent reports accident, injury, missing student -> `alert_type="emergency"`, `priority="urgent"`, `status="new"`. Counselor dashboard triggers flashing red banner + alarm.
- 📋 **Type 2 (Live Physical Classroom Inquiry)**: Parent asks about real-time physical presence ("Is my child in 1st period class right now?", "Tell my son to call me") which exceeds AI database boundaries -> AI politely explains boundaries and routes a task note -> `alert_type="live_inquiry"`, `priority="normal"`, `status="new"`. Counselor dashboard displays informational blue badge.

### 4. Running the Database Seeder & Verification Suite
```bash
# 1. Seed 5 counselors and 250 students with embedded parent profiles
python seed.py

# 2. Run the automated verification test suite
python test_database.py
# Or via pytest:
python -m pytest test_database.py -v
```

