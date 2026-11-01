export type WorkspaceRole = 'Owner' | 'Admin' | 'Member';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  jobTitle: string;
  createdAt: string;
}

export interface WorkspaceMemberDetailed {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
  jobTitle: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar: string;
  ownerId: string;
  members: { userId: string; role: WorkspaceRole; joinedAt: string }[];
  membersDetailed?: WorkspaceMemberDetailed[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Archived';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  ownerId: string;
  ownerName?: string;
  ownerAvatar?: string;
  memberIds: string[];
  startDate: string;
  dueDate: string;
  color: string;
  totalTasks?: number;
  completedTasks?: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string;
  projectName?: string;
  projectColor?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  assigneeId: string | null;
  assigneeName?: string;
  assigneeAvatar?: string | null;
  creatorId: string;
  dueDate: string;
  tags: string[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  status: 'Pending' | 'Accepted' | 'Expired' | 'Revoked';
  invitedBy: string;
  invitedByName: string;
  expiresAt: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  entityType: 'project' | 'task' | 'member' | 'workspace' | 'invitation';
  entityName: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  workspaceId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'assignment' | 'invitation' | 'status_change' | 'comment';
  link?: string;
  createdAt: string;
}

export interface DashboardStats {
  metrics: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    openTasks: number;
    overdueTasks: number;
    myOpenTasks: number;
    overallCompletion: number;
  };
  statusCounts: {
    'To Do': number;
    'In Progress': number;
    'In Review': number;
    'Done': number;
  };
  priorityCounts: {
    Urgent: number;
    High: number;
    Medium: number;
    Low: number;
  };
  upcomingDeadlines: {
    id: string;
    title: string;
    dueDate: string;
    priority: PriorityLevel;
    status: TaskStatus;
    projectName: string;
    projectColor: string;
    assigneeName: string;
    assigneeAvatar: string | null;
  }[];
  recentActivity: ActivityLog[];
  projectProgressList: {
    id: string;
    name: string;
    color: string;
    status: ProjectStatus;
    priority: PriorityLevel;
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }[];
}
