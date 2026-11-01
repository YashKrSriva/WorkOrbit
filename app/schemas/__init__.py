from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    job_title: Optional[str] = "Team Member"
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Workspace Schemas -----------------
class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    avatar: Optional[str] = "🪐"

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    avatar: Optional[str] = None

class WorkspaceMemberResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    job_title: Optional[str] = None
    joined_at: datetime

class WorkspaceResponse(WorkspaceBase):
    id: str
    slug: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Project Schemas -----------------
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = None
    status: Optional[str] = "Active"
    priority: Optional[str] = "Medium"
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    color: Optional[str] = "#4F8CFF"

class ProjectCreate(ProjectBase):
    workspace_id: str

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    color: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    workspace_id: str
    owner_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    progress: Optional[int] = 0
    total_tasks: Optional[int] = 0
    completed_tasks: Optional[int] = 0

    class Config:
        from_attributes = True

# ----------------- Task Schemas -----------------
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = "To Do"
    priority: Optional[str] = "Medium"
    assignee_id: Optional[str] = None
    due_date: Optional[str] = None
    tags: Optional[List[str]] = []

class TaskCreate(TaskBase):
    workspace_id: str
    project_id: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[str] = None
    due_date: Optional[str] = None
    tags: Optional[List[str]] = None

class TaskStatusUpdate(BaseModel):
    status: str

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)

class CommentResponse(BaseModel):
    id: str
    task_id: str
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class TaskResponse(TaskBase):
    id: str
    workspace_id: str
    project_id: str
    project_name: Optional[str] = None
    project_color: Optional[str] = None
    assignee_name: Optional[str] = None
    assignee_avatar: Optional[str] = None
    creator_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True

# ----------------- Invitation Schemas -----------------
class InvitationCreate(BaseModel):
    workspace_id: str
    email: Optional[EmailStr] = None
    role: Optional[str] = "Member"

class InvitationResponse(BaseModel):
    id: str
    workspace_id: str
    workspace_name: str
    email: str
    role: str
    token: str
    status: str
    invited_by: Optional[str] = None
    invited_by_name: Optional[str] = None
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class AcceptInvitationRequest(BaseModel):
    token: str
