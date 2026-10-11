# CallMateAI — Personal AI Call Assistant for Everyone

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black.svg)](https://docs.pmnd.rs/react-three-fiber)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)

> **"Every Call Matters. Every Connection Counts."**  
> A personal AI call assistant web application that helps people manage incoming calls, prioritize conversations, handle routine inquiries, and identify calls requiring immediate human handover.

---

## 🌟 Visual Reference Alignment

- **Primary Reference (Image 1)**:
  - Deep midnight navy (`#050811`, `#090e1a`) and cosmic aurora gradients
  - Adorable, futuristic 3D Robot mascot with pearl-white chassis, glowing headphones, neon blue visor eyes, and rotating holographic pedestal
  - Floating holographic incoming call cards, audio frequency visualizers, and speech bubbles
  - 6 compact glowing feature cards: AI Call Handling, Smart Prioritization, Caller Information, Important Call Alerts, Human Handover, Call History
  - 4-step "How It Works" workflow and live interactive scroll storytelling
  - Comprehensive dashboard preview with live metrics and weekly activity chart

- **Secondary Reference (Image 2)**:
  - Two-column **Sign-In page** (`/login`) with welcoming 3D robot, normalized email validation, and remember-me session persistence
  - Two-column **Registration page** (`/register`) with live password checklist and strict `@gmail.com` domain enforcement
  - High-clarity **Dashboard layout** (`/dashboard`) featuring dark sidebar, topbar search, notifications popover, 4 stat cards, recent calls, priority alerts, and Recharts analytics

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Install Dependencies
Dependencies are already installed in this directory. If running in a fresh clone:
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🔐 Demo Credentials

You can sign in immediately using the pre-seeded demo account:

| Field | Demo Credential |
| :--- | :--- |
| **Email** | `thanu@gmail.com` |
| **Password** | `CallMate@123` |

You can also click the **⚡ Auto-fill Demo** button on the `/login` page, or create your own custom demo account on the `/register` page.

---

## 📋 Form Validation Rules

### Email Validation
- Leading and trailing whitespace is automatically trimmed.
- The address is converted to lowercase before validation and storage.
- The domain **must strictly be `gmail.com`** (e.g., `thanu@gmail.com` is accepted; Yahoo, Outlook, and malformed subdomains like `user@gmail.com.co` are rejected).

### Password Validation
- At least 8 characters
- At least one lowercase letter (`[a-z]`)
- At least one uppercase letter (`[A-Z]`)
- At least one special character (`[!@#$%^&*...]`)
- Live checklist updates in real-time as you type
- Passwords must match exactly before the submission button is enabled

---

## 🛠️ Architecture & Technology Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v7 (Public and Protected route guards)
- **3D Graphics**: Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`)
- **Animation**: Framer Motion for scroll-triggered interactive storytelling
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Weekly Call Activity BarChart & Call Outcomes Donut)
- **Styling**: Tailwind CSS + Custom CSS tokens in `src/index.css` (Glassmorphism, Neon Glows)
- **Security / Storage**: Browser `localStorage` with versioned keys (`callmate_v1_...`), safe JSON parsing, and client-side SHA-256 password hashing

---

## 📁 Project Structure

```
CallMateAI/
├── public/
├── src/
│   ├── components/
│   │   ├── FeatureCard.jsx       # 6 compact glass cards (Image 1)
│   │   ├── Modal.jsx             # Accessible backdrop dialogs
│   │   ├── Navbar.jsx            # Desktop & responsive mobile navigation
│   │   ├── ProtectedRoute.jsx    # Session auth route guards
│   │   ├── Robot3D.jsx           # 3D R3F Robot mascot with fallback
│   │   ├── ScrollStory.jsx       # Scroll-triggered 5-step call story
│   │   ├── Sidebar.jsx           # Dark dashboard sidebar navigation
│   │   ├── StatCard.jsx          # 4 metric cards (Image 1 & 2)
│   │   ├── Toast.jsx             # Floating animated notifications
│   │   └── Topbar.jsx            # Search, notifications drawer & profile
│   ├── context/
│   │   └── AuthContext.jsx       # Session state, login, register, toasts
│   ├── data/
│   │   └── sampleData.js         # Universal sample calls, callers, alerts
│   ├── layouts/
│   │   └── DashboardLayout.jsx   # Master layout for all dashboard pages
│   ├── pages/
│   │   ├── CallCenter.jsx        # Simulated incoming calls & AI transcript
│   │   ├── CallerDirectory.jsx   # Searchable callers list & directives
│   │   ├── CallHistory.jsx       # Calls archive with full transcripts
│   │   ├── Dashboard.jsx         # Main overview with Recharts analytics
│   │   ├── Landing.jsx           # High-impact landing page (Image 1)
│   │   ├── Login.jsx             # 2-column sign-in page (Image 2)
│   │   ├── PriorityAlerts.jsx    # Urgent alerts with acknowledge/escalate
│   │   ├── Register.jsx          # Live checklist registration (Image 2)
│   │   └── Settings.jsx          # Preferences, themes & demo data reset
│   ├── utils/
│   │   ├── crypto.js             # SHA-256 client password hashing
│   │   ├── storage.js            # Versioned localStorage data manager
│   │   └── validation.js         # Strict gmail and password regex rules
│   ├── App.jsx                   # Central route tree
│   ├── index.css                 # Custom design tokens & animations
│   └── main.jsx                  # React DOM root entry
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## ⚠️ Demo-Only Notice & Limitations

This application is an **advanced frontend prototype**:
- **Simulated Telephone Calls**: Does not connect to real telecom networks (PSTN/VoIP). Incoming calls, durations, transcripts, and handovers are generated locally for simulation purposes.
- **Client-Side Storage**: User accounts, session tokens, and call records persist strictly in your browser's `localStorage`.
- **Google Sign-In**: Clicking the Google button displays a clear informational dialog explaining that production Google OAuth requires backend identity provider configuration.
- **Data Reset**: You can restore the original sample records at any time from **Settings &rarr; Reset Demo Data**.
