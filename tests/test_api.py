import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

# Use in-memory SQLite database for isolated test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_signup_and_duplicate_rejection():
    # 1. Successful Signup
    res = client.post("/api/auth/signup", json={
        "name": "Sarah Connor",
        "email": "sarah@cyberdyne.io",
        "password": "securepassword123",
        "job_title": "Security Lead"
    })
    assert res.status_code == 201
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == "sarah@cyberdyne.io"
    assert "currentWorkspace" in data

    # 2. Duplicate Email Rejection
    dup_res = client.post("/api/auth/signup", json={
        "name": "Sarah Duplicate",
        "email": "sarah@cyberdyne.io",
        "password": "differentpass123"
    })
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]

def test_login_success_and_invalid_credentials():
    # Signup first
    client.post("/api/auth/signup", json={
        "name": "Alex Mercer",
        "email": "alex@orbit.io",
        "password": "validpassword123"
    })

    # Successful login
    login_res = client.post("/api/auth/login", json={
        "email": "alex@orbit.io",
        "password": "validpassword123"
    })
    assert login_res.status_code == 200
    assert "token" in login_res.json()

    # Invalid password rejection
    bad_login = client.post("/api/auth/login", json={
        "email": "alex@orbit.io",
        "password": "wrongpassword"
    })
    assert bad_login.status_code == 401

def test_workspace_and_project_lifecycle():
    # 1. Signup user
    auth = client.post("/api/auth/signup", json={
        "name": "Elena Rostova",
        "email": "elena@orbit.io",
        "password": "password123"
    }).json()
    token = auth["token"]
    ws_id = auth["currentWorkspace"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create project
    proj_res = client.post("/api/projects", headers=headers, json={
        "workspace_id": ws_id,
        "name": "Kafka Stream Pipeline",
        "description": "Sub-50ms message delivery",
        "status": "Active",
        "priority": "High"
    })
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    # 3. Create task
    task_res = client.post("/api/tasks", headers=headers, json={
        "workspace_id": ws_id,
        "project_id": proj_id,
        "title": "Benchmark Redis partitioner",
        "status": "To Do",
        "priority": "Urgent"
    })
    assert task_res.status_code == 201
    task_id = task_res.json()["id"]

    # 4. Update task status (Kanban move)
    patch_res = client.patch(f"/api/tasks/{task_id}/status", headers=headers, json={
        "status": "Done"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Done"

    # 5. Verify project progress recalculation
    list_res = client.get(f"/api/projects?workspaceId={ws_id}", headers=headers)
    assert list_res.status_code == 200
    projects = list_res.json()
    assert len(projects) == 1
    assert projects[0]["completedTasks"] == 1
    assert projects[0]["progress"] == 100
