from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import User, Workspace, WorkspaceMembership, Project, Task
from app.schemas import UserCreate, UserLogin, UserResponse
from app.security.hashing import verify_password, get_password_hash
from app.security.jwt import create_access_token, get_current_user_id

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    email_clean = user_in.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    new_user = User(
        name=user_in.name.strip(),
        email=email_clean,
        password_hash=get_password_hash(user_in.password),
        job_title=user_in.job_title,
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={user_in.name}&backgroundColor=4F8CFF"
    )
    db.add(new_user)
    db.flush()

    # Create default personal workspace
    first_name = user_in.name.split(" ")[0]
    workspace = Workspace(
        name=f"{first_name}'s Workspace",
        slug=f"{first_name.lower()}-orbit-{new_user.id[:6]}",
        description="Primary project workspace",
        avatar="🚀",
        owner_id=new_user.id
    )
    db.add(workspace)
    db.flush()

    # Add owner membership
    membership = WorkspaceMembership(
        workspace_id=workspace.id,
        user_id=new_user.id,
        role="Owner"
    )
    db.add(membership)
    db.commit()

    token = create_access_token(data={"sub": new_user.id})
    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "jobTitle": new_user.job_title,
            "avatarUrl": new_user.avatar_url
        },
        "currentWorkspace": {
            "id": workspace.id,
            "name": workspace.name,
            "slug": workspace.slug,
            "avatar": workspace.avatar
        }
    }

@router.post("/login")
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email.lower().strip()).first()
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": user.id})
    memberships = db.query(WorkspaceMembership).filter(WorkspaceMembership.user_id == user.id).all()
    workspace_ids = [m.workspace_id for m in memberships]
    workspaces = db.query(Workspace).filter(Workspace.id.in_(workspace_ids)).all() if workspace_ids else []

    current_workspace = workspaces[0] if workspaces else None

    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "jobTitle": user.job_title,
            "avatarUrl": user.avatar_url
        },
        "currentWorkspace": {
            "id": current_workspace.id,
            "name": current_workspace.name,
            "slug": current_workspace.slug,
            "avatar": current_workspace.avatar
        } if current_workspace else None,
        "workspaces": [
            {
                "id": w.id,
                "name": w.name,
                "slug": w.slug,
                "avatar": w.avatar,
                "description": w.description
            } for w in workspaces
        ]
    }

@router.get("/me")
def get_me(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    memberships = db.query(WorkspaceMembership).filter(WorkspaceMembership.user_id == user.id).all()
    workspace_ids = [m.workspace_id for m in memberships]
    workspaces = db.query(Workspace).filter(Workspace.id.in_(workspace_ids)).all() if workspace_ids else []

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "jobTitle": user.job_title,
            "avatarUrl": user.avatar_url
        },
        "workspaces": [
            {
                "id": w.id,
                "name": w.name,
                "slug": w.slug,
                "avatar": w.avatar,
                "description": w.description
            } for w in workspaces
        ]
    }
