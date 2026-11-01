import {
  User,
  Workspace,
  Project,
  Task,
  WorkspaceInvitation,
  ActivityLog,
  NotificationItem,
  DashboardStats,
  TaskComment
} from './types';

const TOKEN_KEY = 'workorbit_auth_token';
const WORKSPACE_KEY = 'workorbit_active_ws';

class ApiClient {
  private token: string | null = null;
  private activeWorkspaceId: string | null = null;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
    this.activeWorkspaceId = localStorage.getItem(WORKSPACE_KEY);
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setActiveWorkspaceId(id: string | null) {
    this.activeWorkspaceId = id;
    if (id) {
      localStorage.setItem(WORKSPACE_KEY, id);
    } else {
      localStorage.removeItem(WORKSPACE_KEY);
    }
  }

  getActiveWorkspaceId(): string | null {
    return this.activeWorkspaceId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `Request failed (${res.status})`;
      try {
        const errorData = await res.json();
        if (errorData.error) errorMsg = errorData.error;
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return res.json() as Promise<T>;
  }

  // Health
  async checkHealth() {
    return this.request<{ status: string; app: string; version: string }>('/api/health');
  }

  // Auth
  async signup(data: { name: string; email: string; password: string; jobTitle?: string }) {
    const res = await this.request<{ token: string; user: User; currentWorkspace: Workspace }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    this.setActiveWorkspaceId(res.currentWorkspace.id);
    return res;
  }

  async login(email: string, password: string) {
    const res = await this.request<{
      token: string;
      user: User;
      currentWorkspace: Workspace | null;
      workspaces: Workspace[];
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    if (res.currentWorkspace) {
      this.setActiveWorkspaceId(res.currentWorkspace.id);
    }
    return res;
  }

  async getMe() {
    return this.request<{ user: User; workspaces: Workspace[] }>('/api/auth/me');
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore logout network errors
    } finally {
      this.setToken(null);
      this.setActiveWorkspaceId(null);
    }
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string; debugToken?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Workspaces
  async getWorkspaces() {
    return this.request<Workspace[]>('/api/workspaces');
  }

  async getWorkspaceDetails(id: string) {
    return this.request<Workspace>(`/api/workspaces/${id}`);
  }

  async createWorkspace(data: { name: string; description?: string; avatar?: string }) {
    return this.request<Workspace>('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkspace(id: string, data: Partial<Workspace>) {
    return this.request<Workspace>(`/api/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkspace(id: string) {
    return this.request<{ success: boolean; message: string }>(`/api/workspaces/${id}`, {
      method: 'DELETE',
    });
  }

  async updateMemberRole(workspaceId: string, userId: string, role: string) {
    return this.request<{ success: boolean; member: any }>(`/api/workspaces/${workspaceId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async removeMember(workspaceId: string, userId: string) {
    return this.request<{ success: boolean; message: string }>(`/api/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Invitations
  async getInvitations(workspaceId: string) {
    return this.request<WorkspaceInvitation[]>(`/api/invitations?workspaceId=${encodeURIComponent(workspaceId)}`);
  }

  async createInvitation(workspaceId: string, email?: string, role: string = 'Member') {
    return this.request<WorkspaceInvitation>('/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, email, role }),
    });
  }

  async revokeInvitation(invitationId: string) {
    return this.request<{ success: boolean; invitation: WorkspaceInvitation }>(`/api/invitations/${invitationId}/revoke`, {
      method: 'POST',
    });
  }

  async validateInvitation(token: string) {
    return this.request<{ invitation: WorkspaceInvitation; workspace: Partial<Workspace> }>(`/api/invitations/validate/${token}`);
  }

  async acceptInvitation(token: string) {
    return this.request<{ success: boolean; workspace: Workspace }>('/api/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Projects
  async getProjects(workspaceId: string, params: Record<string, string> = {}) {
    const q = new URLSearchParams({ workspaceId, ...params });
    return this.request<Project[]>(`/api/projects?${q.toString()}`);
  }

  async createProject(data: Partial<Project> & { workspaceId: string; name: string }) {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<Project>) {
    return this.request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request<{ success: boolean; message: string }>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getTasks(workspaceId: string, params: Record<string, string> = {}) {
    const q = new URLSearchParams({ workspaceId, ...params });
    return this.request<Task[]>(`/api/tasks?${q.toString()}`);
  }

  async createTask(data: Partial<Task> & { workspaceId: string; projectId: string; title: string }) {
    return this.request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTaskStatus(id: string, status: string) {
    return this.request<Task>(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateTask(id: string, data: Partial<Task>) {
    return this.request<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request<{ success: boolean; message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async addComment(taskId: string, content: string) {
    return this.request<TaskComment>(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Dashboard Stats
  async getDashboardStats(workspaceId: string) {
    return this.request<DashboardStats>(`/api/dashboard/stats?workspaceId=${encodeURIComponent(workspaceId)}`);
  }

  // Notifications
  async getNotifications() {
    return this.request<NotificationItem[]>('/api/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<NotificationItem>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async clearNotifications() {
    return this.request<{ success: boolean }>('/api/notifications/clear-all', {
      method: 'POST',
    });
  }

  // Activity
  async getActivities(workspaceId: string) {
    return this.request<ActivityLog[]>(`/api/activity?workspaceId=${encodeURIComponent(workspaceId)}`);
  }

  // Profile
  async updateProfile(data: { name?: string; jobTitle?: string; avatarUrl?: string }) {
    return this.request<User>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dev
  async resetDevData() {
    return this.request<{ success: boolean; message: string }>('/api/dev/reset-data', {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
