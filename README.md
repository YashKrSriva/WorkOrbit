# WorkOrbit — Project & Team Collaboration Platform

WorkOrbit is a modern full-stack project and team collaboration platform designed to help teams organize workspaces, manage projects, track tasks, and collaborate efficiently.

It combines a clean dark interface with project management workflows inspired by modern productivity platforms.

> **Project Status:** Active Development

---

## 🚀 Key Features

- **Workspace Management:** Create and manage multiple workspaces.
- **Project Management:** Organize projects within workspaces.
- **Task Management:** Create, assign, and track tasks.
- **Kanban Boards:** Manage tasks through different workflow statuses.
- **Team Collaboration:** Invite and manage team members.
- **Role-Based Access Control (RBAC):** Different permissions for Owners, Admins, and Members.
- **Invitation Management:** Invite team members through email or links.
- **Dashboard Analytics:** Monitor project progress and task completion.
- **Authentication:** JWT-based authentication in the Python backend.
- **Persistent Storage:** JSON-based disk persistence in the live AI Studio application.

---

## 🛠️ Technology Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS

### Backend — Live Application
- Node.js
- Express.js
- REST APIs

### Backend — Python Implementation
- Python
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- Uvicorn

### Database & Testing
- Relational Database (Python backend configuration)
- JSON-based persistent storage (Live application)
- Pytest

---

## 🏗️ System Architecture

WorkOrbit currently supports two execution targets.

### 1. Live Full-Stack Web Application

The live application runs in the AI Studio environment on port `3000`.

**Technology:**
- React 19
- TypeScript
- Tailwind CSS
- Node.js / Express

**API Route Groups:**

| API Endpoint | Function |
|---|---|
| `/api/auth/*` | Authentication |
| `/api/workspaces/*` | Workspace Management |
| `/api/projects/*` | Project Management |
| `/api/tasks/*` | Task Management |
| `/api/invitations/*` | Team Invitations |
| `/api/dashboard/*` | Dashboard Data |

Data is persisted using JSON storage at:

`/data/workorbit-db.json`

### 2. Python Backend Implementation

A separate backend implementation is available in the `/app` directory.

**Technology:**
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- JWT Authentication
- Pytest

The backend uses relational models, database migrations, and authentication mechanisms.

> Note: The Node.js/Express application and Python FastAPI backend are separate execution targets. They should not be assumed to run as one integrated backend without additional configuration.

---

## 🔐 Role-Based Access Control (RBAC)

WorkOrbit supports three workspace roles:

| Permission | Owner | Admin | Member |
|---|:---:|:---:|:---:|
| Delete Workspace | ✅ | ❌ | ❌ |
| Edit Workspace Settings | ✅ | ✅ | ❌ |
| Invite Members | ✅ | ✅ | ❌ |
| Transfer Ownership | ✅ | ❌ | ❌ |
| Change Member Roles | ✅ | ✅* | ❌ |
| Create / Edit Projects | ✅ | ✅ | ❌ |
| Create & Move Tasks | ✅ | ✅ | ✅ |
| Comment on Tasks | ✅ | ✅ | ✅ |

*Admins can change Member roles according to the project permission model.*

---

## 💻 Getting Started

### Prerequisites

For the Python backend:

- Python
- Windows PowerShell (commands below)
- Git

For the Node.js application:

- Node.js
- npm

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the project directory:

```bash
cd WorkOrbit
```

### 2. Create a Python Virtual Environment

```powershell
python -m venv .venv
```

Activate it:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

.\.venv\Scripts\Activate.ps1
```

### 3. Install Python Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Configure Environment Variables

If `.env.example` is available:

```powershell
Copy-Item .env.example .env
```

Update the `.env` file with your local configuration.

Never upload actual API keys, passwords, or secrets to GitHub.

### 5. Run Database Migrations

```powershell
alembic upgrade head
```

### 6. Start the FastAPI Backend

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API documentation will be available at:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

---

## 🌐 Running the Node.js / React Application

The live application is documented as running in the AI Studio environment on port `3000`.

For local development, inspect the frontend `package.json` first.

Install dependencies:

```bash
npm install
```

Check available scripts:

```bash
npm run
```

Run the appropriate development script listed in `package.json`.

The exact local startup command and environment configuration depend on the repository setup.

---

## 🧪 Automated Testing

The Python backend includes a Pytest test suite.

Run tests using:

```powershell
pytest tests/ -v
```

### Documented Test Coverage

- User Signup and Token Generation
- Duplicate Email Rejection
- Invalid Password Rejection
- Workspace Isolation
- Membership Permissions
- Project Creation
- Task Progress Recalculation
- Kanban Status Updates
- API Health Check

Example API endpoints:

```http
PATCH /api/tasks/{id}/status
GET /api/health
```

> Run the test suite locally to verify the current test results.

---

## 👥 Demo Accounts

The project description includes a one-click demo account switcher with three workspace personas:

| User | Role |
|---|---|
| Alex Mercer | Workspace Owner |
| Elena Rostova | Workspace Admin |
| Jordan Chen | Workspace Member |

These accounts are intended for local development and demonstration only.

Do not use demo credentials in production or publish reusable passwords in a public repository.

---

## 🔒 Security Considerations

- Keep environment variables and API keys private.
- Never commit `.env` files.
- Use strong JWT signing secrets.
- Validate user permissions on the backend.
- Protect sensitive workspace and project data.
- Use HTTPS in production deployments.
- Do not use development credentials in production.

---

## 📁 Project Structure

The documented Python backend structure:

```text
WorkOrbit/
│
├── app/
│   └── Python FastAPI Backend
│
├── tests/
│   └── Automated Tests
│
├── requirements.txt
├── .env.example
├── alembic.ini
├── README.md
└── .gitignore
```

The complete frontend and backend folder structure may contain additional directories depending on the checked-in implementation.

---

## 🚀 Future Improvements

- Enhanced Dashboard Analytics
- Advanced Task Management
- Real-Time Team Collaboration
- Improved Notification System
- Extended API Documentation
- Cloud Deployment
- Additional Automated Tests
- Mobile-Friendly Experience

---

## 📌 Project Status

**WorkOrbit is currently under active development.**

The project focuses on building a practical collaboration platform with workspace management, project tracking, team permissions, and task management capabilities.

---

## 👨‍💻 Author

**Yash Kumar Srivastava**

BCA (IBM) Student | Aspiring AI/ML Developer

- GitHub: https://github.com/YashKrSriva
- LinkedIn: https://www.linkedin.com/in/yash-kumar-srivastava-b77897311

---

## 📄 License

No open-source license has been specified yet.

A LICENSE file should be added before granting others permission to use, modify, or distribute this project.
