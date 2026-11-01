from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Project, Task, WorkspaceMembership, User, ActivityLog
from app.schemas import ProjectCreate, ProjectUpdate
from app.security.jwt import get_current_user_id

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("")
def list_projects(
    workspaceId: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    mem = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.workspace_id == workspaceId,
        WorkspaceMembership.user_id == user_id
    ).first()
    if not mem:
        raise HTTPException(status_code=403, detail="Access denied")

    q = db.query(Project).filter(Project.workspace_id == workspaceId)
    if status and status != "all":
        q = q.filter(Project.status.ilike(status))
    if priority and priority != "all":
        q = q.filter(Project.priority.ilike(priority))

    projects = q.all()
    results = []
    for p in projects:
        tasks = db.query(Task).filter(Task.project_id == p.id).all()
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.status == "Done"])
        progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
        owner = db.query(User).filter(User.id == p.owner_id).first() if p.owner_id else None

        results.append({
            "id": p.id,
            "workspaceId": p.workspace_id,
            "name": p.name,
            "description": p.description,
            "status": p.status,
            "priority": p.priority,
            "startDate": p.start_date,
            "dueDate": p.due_date,
            "color": p.color,
            "ownerId": p.owner_id,
            "ownerName": owner.name if owner else "Unassigned",
            "ownerAvatar": owner.avatar_url if owner else None,
            "totalTasks": total_tasks,
            "completedTasks": completed_tasks,
            "progress": progress,
            "updatedAt": p.updated_at.isoformat()
        })

    return results

@router.post("", status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    mem = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.workspace_id == project_in.workspace_id,
        WorkspaceMembership.user_id == user_id
    ).first()
    if not mem:
        raise HTTPException(status_code=403, detail="Access denied")

    project = Project(
        workspace_id=project_in.workspace_id,
        name=project_in.name.strip(),
        description=project_in.description,
        status=project_in.status or "Active",
        priority=project_in.priority or "Medium",
        start_date=project_in.start_date,
        due_date=project_in.due_date,
        color=project_in.color or "#4F8CFF",
        owner_id=user_id
    )
    db.add(project)
    db.commit()

    return {
        "id": project.id,
        "workspaceId": project.workspace_id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "priority": project.priority,
        "startDate": project.start_date,
        "dueDate": project.due_date,
        "color": project.color,
        "ownerId": project.owner_id
    }
