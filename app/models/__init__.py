import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    ForeignKey,
    Integer,
    Boolean,
    Enum as SQLEnum,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    job_title = Column(String(100), nullable=True, default="Team Member")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    memberships = relationship("WorkspaceMembership", back_populates="user", cascade="all, delete-orphan")
    owned_workspaces = relationship("Workspace", back_populates="owner")
    assigned_tasks = relationship("Task", foreign_keys="Task.assignee_id", back_populates="assignee")
    comments = relationship("TaskComment", back_populates="author")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    slug = Column(String(120), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    avatar = Column(String(20), default="🪐")
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_workspaces")
    memberships = relationship("WorkspaceMembership", back_populates="workspace", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="workspace", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="workspace", cascade="all, delete-orphan")
    invitations = relationship("WorkspaceInvitation", back_populates="workspace", cascade="all, delete-orphan")
    activities = relationship("ActivityLog", back_populates="workspace", cascade="all, delete-orphan")


class WorkspaceMembership(Base):
    __tablename__ = "workspace_memberships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), default="Member", nullable=False) # Owner, Admin, Member
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (UniqueConstraint("workspace_id", "user_id", name="uq_workspace_user"),)

    workspace = relationship("Workspace", back_populates="memberships")
    user = relationship("User", back_populates="memberships")


class WorkspaceInvitation(Base):
    __tablename__ = "workspace_invitations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False)
    role = Column(String(20), default="Member", nullable=False)
    token = Column(String(128), unique=True, index=True, nullable=False)
    status = Column(String(20), default="Pending", nullable=False) # Pending, Accepted, Expired, Revoked
    invited_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="invitations")
    invited_by = relationship("User", foreign_keys=[invited_by_id])


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="Active", nullable=False) # Planning, Active, On Hold, Completed, Archived
    priority = Column(String(20), default="Medium", nullable=False) # Low, Medium, High, Urgent
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    start_date = Column(String(20), nullable=True)
    due_date = Column(String(20), nullable=True)
    color = Column(String(20), default="#4F8CFF")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="projects")
    owner = relationship("User", foreign_keys=[owner_id])
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="To Do", nullable=False) # To Do, In Progress, In Review, Done
    priority = Column(String(20), default="Medium", nullable=False) # Low, Medium, High, Urgent
    assignee_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    creator_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    due_date = Column(String(20), nullable=True)
    tags_csv = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_tasks")
    creator = relationship("User", foreign_keys=[creator_id])
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")


class TaskComment(Base):
    __tablename__ = "task_comments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    task = relationship("Task", back_populates="comments")
    author = relationship("User", back_populates="comments")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False, nullable=False)
    notification_type = Column(String(30), default="assignment", nullable=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(100), nullable=False)
    user_avatar = Column(String(500), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(30), nullable=False)
    entity_name = Column(String(200), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="activities")
