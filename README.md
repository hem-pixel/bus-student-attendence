# 🚌 Bus Students Tracker — Phase 1: Foundation & Infrastructure

A real-time college bus tracking and student attendance management system with Role-Based Access Control (RBAC).

---

## 🏗️ Architecture Overview

```
bus attend/
├── database/
│   └── schema.sql                        # PostgreSQL / Supabase Schema (9 Tables, Indexes, Constraints)
├── bus-students-tracker-backend/         # Express.js REST API with JWT Authentication & RBAC
│   ├── src/
│   │   ├── config/database.js           # Supabase & PG client configuration
│   │   ├── controllers/                 # auth, admin, incharge, student controllers
│   │   ├── middleware/                  # auth.js (JWT verify), roleCheck.js (RBAC)
│   │   ├── routes/                      # /api/auth, /api/admin, /api/incharge, /api/student
│   │   ├── app.js                       # Express app configuration & middleware
│   │   └── server.js                    # Server startup on port 5000
│   ├── .env.example
│   └── package.json
└── bus-students-tracker-frontend/        # Modern React 19 Frontend with Glassmorphism Dark UI
    ├── src/
    │   ├── components/
    │   │   ├── admin/BusManager.jsx     # Fleet management & institutional metrics
    │   │   ├── incharge/AttendanceScanner.jsx # Live student attendance marker
    │   │   ├── student/BusLiveTracker.jsx # Real-time student telemetry view
    │   │   └── common/Navbar.jsx, ProtectedRoute.jsx
    │   ├── pages/LoginPage.jsx, DashboardPage.jsx
    │   ├── services/api.js, supabase.js
    │   └── styles/index.css             # Glassmorphic dark design system
    ├── .env.example
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Database Setup (Supabase / PostgreSQL)
1. Open your **Supabase Dashboard** or local PostgreSQL instance.
2. Navigate to the **SQL Editor**.
3. Copy and run the entire SQL script from [`database/schema.sql`](./database/schema.sql).
4. Verify the 9 tables are created:
   - `users`, `students`, `buses`, `drivers`, `bus_incharges`, `attendance`, `bus_locations`, `bus_stops`, `bus_alerts`.

### 2. Backend Setup
```bash
cd bus-students-tracker-backend
# Copy sample env
copy .env.example .env
# Start the backend server
npm run dev
# Server will run at: http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 3. Frontend Setup
```bash
cd bus-students-tracker-frontend
# Copy sample env
copy .env.example .env
# Start the frontend dev server
npm start
# App will open at: http://localhost:3000
```

---

## 👥 Default Personas for Phase 1 Demo

The login interface includes an interactive 1-click persona switcher:

| Role | Email | Password | Section Unlocked |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@college.edu` | `InitialPassword123!` | Fleet Metrics, Institutional Bus Table |
| **BUS_INCHARGE** | `incharge@college.edu` | `Incharge123!` | Assigned Bus Details, Quick Attendance Marker |
| **STUDENT** | `student@college.edu` | `Student123!` | Student Profile, Live Bus Arrival Telemetry |

---

## 🔒 Security & Middleware
- **JWT Authentication:** Tokens signed with expiration and verified on protected endpoints.
- **RBAC:** `roleCheck(['ADMIN'])`, `roleCheck(['ADMIN', 'BUS_INCHARGE'])`, `roleCheck(['STUDENT'])` enforced on API routes and protected on frontend navigation via `ProtectedRoute`.
