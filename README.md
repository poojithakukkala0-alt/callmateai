# CallMateAI — Unified Application Monorepo

Welcome to the **CallMateAI** unified monorepo repository. This repository organizes the full-stack architecture into dedicated sub-projects for the FastAPI backend engine and the React + Vite frontend application.

---

## 📁 Repository Structure

```
callmateai/
├── backend/                     # FastAPI, PyMongo, MongoDB Atlas Backend Engine
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint with CORS (http://localhost:5173)
│   │   ├── schemas.py           # Pydantic data models & request/response contracts
│   │   ├── routers/
│   │   │   ├── calls.py         # Call lifecycle, agent forwarding, transcripts
│   │   │   ├── emergencies.py   # Incident triage & counselor alert actions
│   │   │   └── students.py      # Student profile & attendance queries
│   │   └── services/            # Call lifecycle & keyword emergency detection
│   ├── .env                     # MongoDB Atlas / local connection URI
│   ├── .env.example             # Template for MongoDB Atlas deployment
│   ├── crud.py                  # PyMongo data access layer & dual-escalation alerts
│   ├── database.py              # PyMongo connection pooling & index provisioning
│   ├── seed.py                  # Seeder: 5 counselors & 250 students (embedded parents)
│   ├── requirements.txt         # Python dependencies (FastAPI, PyMongo, Uvicorn, etc.)
│   ├── test_database.py         # Stage 3 database & dual-alert test suite
│   └── verify_backend.py        # Stage 2 call state machine & emergency verification
│
├── frontend/                    # Modern React 18, Vite, Tailwind CSS Web Application
│   ├── src/
│   │   ├── api.js               # Unified API client using VITE_API_BASE_URL
│   │   ├── App.jsx              # React Router client routes & navigation tree
│   │   ├── main.jsx             # React DOM entrypoint
│   │   ├── components/          # Reusable UI components & dialogs
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── layouts/             # DashboardLayout with sidebar & header
│   │   ├── pages/               # Dashboard, CallCenter, PriorityAlerts, Directory
│   │   └── utils/               # Storage, crypto, and form validation utilities
│   ├── .env.development         # VITE_API_BASE_URL="http://127.0.0.1:8000"
│   ├── index.html               # Single-page application entrypoint
│   ├── package.json             # NPM dependencies & scripts
│   ├── tailwind.config.js       # Tailwind CSS styling tokens
│   └── vite.config.js           # Vite dev server configuration (Port 5173)
│
└── README.md                    # Root project guide & execution instructions
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python**: 3.10+ (tested on Python 3.13)
- **Node.js**: 18+ (with `npm`)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster.

---

### 2. Backend Setup & Startup

#### Step 2.1: Open terminal in `callmateai/backend`
```bash
cd callmateai/backend
```

#### Step 2.2: Configure Environment Variables
Copy `.env.example` to `.env` (or configure with your MongoDB Atlas connection string):
```bash
# In callmateai/backend/.env:
MONGO_URI="mongodb://127.0.0.1:27017/"
# Or for MongoDB Atlas Cloud:
# MONGO_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority&appName=CallMateAI"
DB_NAME="callmate_db"
```

#### Step 2.3: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 2.4: Seed the 5 Counselors & 250 Students
```bash
python seed.py
```

#### Step 2.5: Verify Database & Backend Architecture
```bash
# Verify MongoDB Atlas Stage 3 Database & Dual-Alerts:
python test_database.py

# Verify FastAPI call lifecycle & emergency keyword routing:
python verify_backend.py
```

#### Step 2.6: Launch the FastAPI Backend Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Endpoint**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### 3. Frontend Setup & Startup

#### Step 3.1: Open terminal in `callmateai/frontend`
```bash
cd callmateai/frontend
```

#### Step 3.2: Verify Local Development Environment
Ensure `.env.development` exists:
```bash
# callmateai/frontend/.env.development
VITE_API_BASE_URL="http://127.0.0.1:8000"
```

#### Step 3.3: Install Frontend Dependencies
```bash
npm install
```

#### Step 3.4: Start Vite Development Server
```bash
npm run dev
```
- **Frontend Web UI**: [http://localhost:5173](http://localhost:5173)

---

## 🔄 Cross-Origin Resource Sharing (CORS) & Networking

The backend in `app/main.py` explicitly whitelists the Vite development origins:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

The frontend module `src/api.js` automatically routes all API requests (telephony calls, student lookups, emergency triage, and counselor alert management) to `http://127.0.0.1:8000`.

---

## 🧪 Automated Verification Suite

Run all verification tests from the backend directory:
```bash
cd callmateai/backend
python test_database.py
python verify_backend.py
```
Expected output:
- `🎉 ALL 250 STUDENTS & 5 COUNSELORS VERIFIED ON MONGODB ATLAS!`
- `ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ✅`
