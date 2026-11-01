import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Workspace, WorkspaceMembership, User, ActivityLog
from app.schemas import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse, WorkspaceMemberResponse
from app.security.jwt import get_current_user_id

router = APIRouter(prefix="/api/workspaces", tags=["Workspaces"])

def get_user_workspace_membership(workspace_id: str, user_id: str, db: Session) -> WorkspaceMembership:
    membership = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.workspace_id == workspace_id,
        WorkspaceMembership.user_id == user_id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Access denied to this workspace")
    return membership

@router.get("")
def list_workspaces(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    memberships = db.query(WorkspaceMembership).filter(WorkspaceMembership.user_id == user_id).all()
    ws_ids = [m.workspace_id for m in memberships]
    workspaces = db.query(Workspace).filter(Workspace.id.in_(ws_ids)).all() if ws_ids else []
    return [
        {
            "id": w.id,
            "name": w.name,
            "slug": w.slug,
            "avatar": w.avatar,
            "description": w.description,
            "ownerId": w.owner_id
        } for w in workspaces
    ]

@router.post("", status_code=status.HTTP_201_CREATED)
def create_workspace(ws_in: WorkspaceCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    slug = f"{ws_in.name.lower().replace(' ', '-')}-{str(uuid.uuid4())[:6]}"
    workspace = Workspace(
        name=ws_in.name.strip(),
        slug=slug,
        description=ws_in.description,
        avatar=ws_in.avatar or "🪐",
        owner_id=user_id
    )
    db.add(workspace)
    db.flush()

    membership = WorkspaceMembership(
        workspace_id=workspace.id,
        user_id=user_id,
        role="Owner"
    )
    db.add(membership)

    user = db.query(User).filter(User.id == user_id).first()
    act = ActivityLog(
        workspace_id=workspace.id,
        user_id=user_id,
        user_name=user.name if user else "User",
        user_avatar=user.avatar_url if user else None,
        action="created workspace",
        entity_type="workspace",
        entity_name=workspace.name
    )
    db.add(act)
    db.commit()

    return {
        "id": workspace.id,
        "name": workspace.name,
        "slug": workspace.slug,
        "avatar": workspace.avatar,
        "description": workspace.description,
        "ownerId": workspace.owner_id
    }

@router.get("/{workspace_id}")
def get_workspace_details(workspace_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    get_user_workspace_membership(workspace_id, user_id, db)
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    memberships = db.query(WorkspaceMembership).filter(WorkspaceMembership.workspace_id == workspace_id).all()
    members_detailed = []
    for m in memberships:
        u = db.query(User).filter(User.id == m.user_id).first()
        if u:
            members_detailed.append({
                "userId": u.id,
                "name": u.name,
                "email": u.email,
                "avatarUrl": u.avatar_url,
                "jobTitle": u.job_title,
                "role": m.role,
                "joinedAt": m.joined_at.isoformat()
            })

    return {
        "id": ws.id,
        "name": ws.name,
        "slug": ws.slug,
        "description": ws.description,
        "avatar": ws.avatar,
        "ownerId": ws.owner_id,
        "membersDetailed": members_detailed
    }

@router.delete("/{workspace_id}")
def delete_workspace(workspace_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if ws.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the Workspace Owner can delete the workspace")

    db.delete(ws)
    db.commit()
    return {"success": True, "message": "Workspace deleted permanently"}
