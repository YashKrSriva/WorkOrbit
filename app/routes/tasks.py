from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Task, TaskComment, Project, WorkspaceMembership, User, ActivityLog
from app.schemas import TaskCreate, TaskUpdate, TaskStatusUpdate, CommentCreate
from app.security.jwt import get_current_user_id

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("")
def list_tasks(
    workspaceId: str,
    projectId: Optional[str] = None,
    assigneeId: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    mem = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.workspace_id == workspaceId,
        WorkspaceMembership.user_id == user_id
    ).first()
    if not mem:
        raise HTTPException(status_code=403, detail="Access denied")

    q = db.query(Task).filter(Task.workspace_id == workspaceId)
    if projectId and projectId != "all":
        q = q.filter(Task.project_id == projectId)
    if assigneeId and assigneeId != "all":
        q = q.filter(Task.assignee_id == assigneeId)
    if status and status != "all":
        q = q.filter(Task.status.ilike(status))
    if priority and priority != "all":
        q = q.filter(Task.priority.ilike(priority))

    tasks = q.all()
    results = []
    for t in tasks:
        p = db.query(Project).filter(Project.id == t.project_id).first()
        assignee = db.query(User).filter(User.id == t.assignee_id).first() if t.assignee_id else None
        comments = db.query(TaskComment).filter(TaskComment.task_id == t.id).all()

        results.append({
            "id": t.id,
            "workspaceId": t.workspace_id,
            "projectId": t.project_id,
            "projectName": p.name if p else "Project",
            "projectColor": p.color if p else "#4F8CFF",
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "assigneeId": t.assignee_id,
            "assigneeName": assignee.name if assignee else "Unassigned",
            "assigneeAvatar": assignee.avatar_url if assignee else None,
            "dueDate": t.due_date,
            "tags": t.tags_csv.split(",") if t.tags_csv else [],
            "comments": [
                {
                    "id": c.id,
                    "authorId": c.author_id,
                    "authorName": c.author.name if c.author else "Member",
                    "authorAvatar": c.author.avatar_url if c.author else None,
                    "content": c.content,
                    "createdAt": c.created_at.isoformat()
                } for c in comments
            ],
            "createdAt": t.created_at.isoformat(),
            "updatedAt": t.updated_at.isoformat()
        })
    return results

@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    task = Task(
        workspace_id=task_in.workspace_id,
        project_id=task_in.project_id,
        title=task_in.title.strip(),
        description=task_in.description,
        status=task_in.status or "To Do",
        priority=task_in.priority or "Medium",
        assignee_id=task_in.assignee_id,
        creator_id=user_id,
        due_date=task_in.due_date,
        tags_csv=",".join(task_in.tags) if task_in.tags else ""
    )
    db.add(task)
    db.commit()

    return {
        "id": task.id,
        "workspaceId": task.workspace_id,
        "projectId": task.project_id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "assigneeId": task.assignee_id,
        "dueDate": task.due_date,
        "tags": task_in.tags or []
    }

@router.patch("/{task_id}/status")
def update_task_status(task_id: str, payload: TaskStatusUpdate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = payload.status
    db.commit()
    return {"id": task.id, "status": task.status}

@router.delete("/{task_id}")
def delete_task(task_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"success": True, "message": "Task deleted"}
