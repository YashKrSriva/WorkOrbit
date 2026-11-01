# WorkOrbit — Modern Full-Stack Project & Team Collaboration Platform

WorkOrbit is a modern, high-performance SaaS collaboration platform combining the velocity of Linear, the organizational depth of Asana, and a clean dark theme.

---

## 🚀 Live Interactive Applet & Technology Architecture

WorkOrbit supports dual execution targets:
1. **Live Full-Stack Web Platform (Node.js/Express + React 19 + TypeScript + Tailwind CSS)**:
   - Runs live on port 3000 in AI Studio with real HTTP REST APIs (`/api/auth/*`, `/api/workspaces/*`, `/api/projects/*`, `/api/tasks/*`, `/api/invitations/*`, `/api/dashboard/*`).
   - Disk-persisted storage (`/data/workorbit-db.json`) preserving all workspaces, sprint boards, and team members across reloads.
2. **Production Python Backend (FastAPI + SQLAlchemy + Alembic + Pydantic + Pytest)**:
   - Located in the `/app` directory with normalized relational models, Alembic migrations, and JWT bearer authentication.

---

## 🛠️ Windows PowerShell Local Development Setup

Follow these exact steps to run the Python FastAPI backend with your virtual environment located at `D:\Interstellar\WorkOrbitVenv`:

### 1. Initialize & Activate the Virtual Environment
Open **Windows PowerShell** as Administrator or standard user:

```powershell
# Navigate to the project directory
cd D:\Interstellar\WorkOrbit

# Create virtual environment if not already created
python -m venv D:\Interstellar\WorkOrbitVenv

# Set PowerShell execution policy for this session (if required)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Activate the virtual environment
D:\Interstellar\WorkOrbitVenv\Scripts\Activate.ps1
```

### 2. Install Python Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Initialize Environment Variables
```powershell
Copy-Item .env.example .env
```

### 4. Run Database Migrations
```powershell
alembic upgrade head
```

### 5. Launch the FastAPI Uvicorn Server
```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

---

## 🧪 Running Automated Tests

Run the test suite with `pytest`:

```powershell
pytest tests/ -v
```

Tests verify:
- ✅ Successful user signup and token generation
- ✅ Duplicate email rejection
- ✅ Invalid password rejection
- ✅ Workspace isolation and membership permissions
- ✅ Project creation and real-time task progress recalculation
- ✅ Kanban status updates (`PATCH /api/tasks/{id}/status`)
- ✅ Service health check (`GET /api/health`)

---

## 🔑 Default Test Accounts (RBAC Personas)

Use the built-in 1-click switcher or credentials:
- **Alex Mercer (Workspace Owner)**: `alex@workorbit.io` / `password123`
- **Elena Rostova (Workspace Admin)**: `elena@workorbit.io` / `password123`
- **Jordan Chen (Workspace Member)**: `jordan@workorbit.io` / `password123`

---

## 📋 Role-Based Access Control (RBAC) Matrix

| Permission | Owner | Admin | Member |
|---|---|---|---|
| Delete Workspace | ✅ Yes | ❌ No | ❌ No |
| Edit Workspace Settings | ✅ Yes | ✅ Yes | ❌ No |
| Invite Members (Email / Link) | ✅ Yes | ✅ Yes | ❌ No |
| Transfer Ownership | ✅ Yes | ❌ No | ❌ No |
| Change Member Roles | ✅ Yes | ✅ Yes (Members only) | ❌ No |
| Create / Edit Projects | ✅ Yes | ✅ Yes | ❌ No |
| Create & Move Tasks | ✅ Yes | ✅ Yes | ✅ Yes |
| Comment on Tasks | ✅ Yes | ✅ Yes | ✅ Yes |
