import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { TasksView } from './components/TasksView';
import { MembersView } from './components/MembersView';
import { InvitationsView } from './components/InvitationsView';
import { CalendarView } from './components/CalendarView';
import { ActivityView } from './components/ActivityView';
import { AuthView } from './components/AuthView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { WorkspaceSettingsModal } from './components/WorkspaceSettingsModal';
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal';
import { ProfileModal } from './components/ProfileModal';
import { CommandPalette } from './components/CommandPalette';
import { DevInspectorModal } from './components/DevInspectorModal';

import {
  User,
  Workspace,
  Project,
  Task,
  WorkspaceMemberDetailed,
  DashboardStats,
  TaskStatus,
  WorkspaceRole
} from './types';
import { api } from './api';

function MainApp() {
  const { showToast } = useToast();

  // Core App State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [membersDetailed, setMembersDetailed] = useState<WorkspaceMemberDetailed[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals state
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [createTaskDefaultStatus, setCreateTaskDefaultStatus] = useState<TaskStatus>('To Do');
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showDevInspector, setShowDevInspector] = useState(false);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check existing session on startup
  useEffect(() => {
    async function initAuth() {
      const token = api.getToken();
      if (!token) {
        setAppLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        setCurrentUser(res.user);
        setWorkspaces(res.workspaces);

        const savedWsId = api.getActiveWorkspaceId();
        const activeWs = res.workspaces.find(w => w.id === savedWsId) || res.workspaces[0] || null;
        setCurrentWorkspace(activeWs);
        if (activeWs) {
          api.setActiveWorkspaceId(activeWs.id);
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err);
        api.setToken(null);
        setCurrentUser(null);
      } finally {
        setAppLoading(false);
      }
    }

    initAuth();
  }, []);

  // Load workspace data when active workspace changes
  const loadWorkspaceData = useCallback(async () => {
    if (!currentWorkspace) return;
    setDataLoading(true);

    try {
      const [wsDetails, prjList, tskList, stats] = await Promise.all([
        api.getWorkspaceDetails(currentWorkspace.id),
        api.getProjects(currentWorkspace.id),
        api.getTasks(currentWorkspace.id),
        api.getDashboardStats(currentWorkspace.id)
      ]);

      if (wsDetails.membersDetailed) {
        setMembersDetailed(wsDetails.membersDetailed);
      }
      setProjects(prjList);
      setTasks(tskList);
      setDashboardStats(stats);
    } catch (err: any) {
      showToast('Error loading workspace data', 'error', err.message);
    } finally {
      setDataLoading(false);
    }
  }, [currentWorkspace?.id, showToast]);

  useEffect(() => {
    if (currentWorkspace) {
      loadWorkspaceData();
    }
  }, [currentWorkspace?.id, loadWorkspaceData]);

  // Auth Handlers
  const handleAuthSuccess = (user: User, activeWs: Workspace | null, wsList: Workspace[]) => {
    setCurrentUser(user);
    setWorkspaces(wsList);
    setCurrentWorkspace(activeWs);
    if (activeWs) {
      api.setActiveWorkspaceId(activeWs.id);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setCurrentWorkspace(null);
    setWorkspaces([]);
    setProjects([]);
    setTasks([]);
    showToast('Signed out of WorkOrbit', 'info');
  };

  const handleQuickSwitchUser = async (email: string) => {
    try {
      const res = await api.login(email, 'password123');
      setCurrentUser(res.user);
      setWorkspaces(res.workspaces);
      if (res.currentWorkspace) {
        setCurrentWorkspace(res.currentWorkspace);
        api.setActiveWorkspaceId(res.currentWorkspace.id);
      }
      showToast(`Switched persona to ${res.user.name}`, 'success');
    } catch (err: any) {
      showToast('Quick switch failed', 'error', err.message);
    }
  };

  // Workspace Switch Handlers
  const handleSelectWorkspace = (ws: Workspace) => {
    setCurrentWorkspace(ws);
    api.setActiveWorkspaceId(ws.id);
    setSelectedProjectId('all');
    showToast(`Switched to workspace: ${ws.name}`, 'info');
  };

  const handleWorkspaceCreated = (ws: Workspace) => {
    setWorkspaces(prev => [ws, ...prev]);
    setCurrentWorkspace(ws);
    api.setActiveWorkspaceId(ws.id);
  };

  const handleWorkspaceUpdated = (updated: Workspace) => {
    setWorkspaces(prev => prev.map(w => w.id === updated.id ? updated : w));
    setCurrentWorkspace(updated);
  };

  const handleWorkspaceDeleted = (deletedId: string) => {
    const remaining = workspaces.filter(w => w.id !== deletedId);
    setWorkspaces(remaining);
    const nextWs = remaining[0] || null;
    setCurrentWorkspace(nextWs);
    if (nextWs) {
      api.setActiveWorkspaceId(nextWs.id);
    } else {
      api.setActiveWorkspaceId(null);
    }
  };

  // Task Handlers
  const handleTaskStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await api.updateTaskStatus(taskId, newStatus);
      // Re-fetch dashboard stats quietly to keep velocity and progress bar in sync
      if (currentWorkspace) {
        api.getDashboardStats(currentWorkspace.id).then(setDashboardStats).catch(() => {});
        api.getProjects(currentWorkspace.id).then(setProjects).catch(() => {});
      }
    } catch (err: any) {
      // Revert on failure
      setTasks(previousTasks);
      throw err;
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    loadWorkspaceData();
  };

  const handleTaskUpdated = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    loadWorkspaceData();
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setActiveTaskDetail(null);
      showToast('Task deleted', 'info');
      loadWorkspaceData();
    } catch (err: any) {
      showToast('Failed to delete task', 'error', err.message);
    }
  };

  // Project Handlers
  const handleProjectSaved = (saved: Project) => {
    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setProjectToEdit(null);
    loadWorkspaceData();
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await api.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.projectId !== projectId));
      if (selectedProjectId === projectId) {
        setSelectedProjectId('all');
      }
      showToast('Project deleted', 'info');
      loadWorkspaceData();
    } catch (err: any) {
      showToast('Failed to delete project', 'error', err.message);
    }
  };

  const handleArchiveProject = async (project: Project, archive: boolean) => {
    try {
      const updated = await api.updateProject(project.id, {
        status: archive ? 'Archived' : 'Active'
      });
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast(`Project ${archive ? 'archived' : 'restored'}`, 'info');
    } catch (err: any) {
      showToast('Failed to change archive state', 'error', err.message);
    }
  };

  // Determine current user role
  const currentMember = currentWorkspace?.members.find(m => m.userId === currentUser?.id);
  const userRole: WorkspaceRole = currentMember ? currentMember.role : 'Member';

  // Splash Loading
  if (appLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#4F8CFF]/30 animate-pulse">
            <span className="font-bold text-lg">W</span>
          </div>
          <span className="text-xs text-[#9AA8BD] tracking-wider uppercase font-mono">
            Booting WorkOrbit...
          </span>
        </div>
      </div>
    );
  }

  // Not Logged In
  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F3F6FC] flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenCreateWorkspace={() => setShowCreateWorkspace(true)}
        onOpenWorkspaceSettings={() => setShowWorkspaceSettings(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onOpenDevInspector={() => setShowDevInspector(true)}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentWorkspace={currentWorkspace}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={id => {
            setSelectedProjectId(id);
            setActiveTab('kanban');
          }}
          onOpenCreateProject={() => {
            setProjectToEdit(null);
            setShowCreateProjectModal(true);
          }}
          userRole={userRole}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto bg-[#0B0F19]">
          {activeTab === 'overview' && (
            <DashboardView
              stats={dashboardStats}
              loading={dataLoading}
              onRefresh={loadWorkspaceData}
              onNavigate={(tab, params) => {
                setActiveTab(tab);
                if (params?.projectId) setSelectedProjectId(params.projectId);
              }}
              onOpenCreateProject={() => {
                setProjectToEdit(null);
                setShowCreateProjectModal(true);
              }}
              onOpenCreateTask={() => {
                setCreateTaskDefaultStatus('To Do');
                setShowCreateTaskModal(true);
              }}
              userRole={userRole}
            />
          )}

          {activeTab === 'mytasks' && (
            <TasksView
              tasks={tasks}
              projects={projects}
              members={membersDetailed}
              currentUserId={currentUser.id}
              userRole={userRole}
              loading={dataLoading}
              isMyTasksOnly={true}
              selectedProjectId="all"
              onSelectProject={() => {}}
              onOpenCreateTask={status => {
                setCreateTaskDefaultStatus(status || 'To Do');
                setShowCreateTaskModal(true);
              }}
              onSelectTask={setActiveTaskDetail}
              onUpdateTaskStatus={handleTaskStatusUpdate}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              loading={dataLoading}
              userRole={userRole}
              members={membersDetailed}
              onOpenCreateProject={() => {
                setProjectToEdit(null);
                setShowCreateProjectModal(true);
              }}
              onEditProject={p => {
                setProjectToEdit(p);
                setShowCreateProjectModal(true);
              }}
              onDeleteProject={handleDeleteProject}
              onArchiveProject={handleArchiveProject}
              onSelectProject={id => {
                setSelectedProjectId(id);
                setActiveTab('kanban');
              }}
            />
          )}

          {activeTab === 'kanban' && (
            <TasksView
              tasks={tasks}
              projects={projects}
              members={membersDetailed}
              currentUserId={currentUser.id}
              userRole={userRole}
              loading={dataLoading}
              isMyTasksOnly={false}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onOpenCreateTask={status => {
                setCreateTaskDefaultStatus(status || 'To Do');
                setShowCreateTaskModal(true);
              }}
              onSelectTask={setActiveTaskDetail}
              onUpdateTaskStatus={handleTaskStatusUpdate}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              projects={projects}
              onSelectTask={setActiveTaskDetail}
              onOpenCreateTask={status => {
                setCreateTaskDefaultStatus(status || 'To Do');
                setShowCreateTaskModal(true);
              }}
            />
          )}

          {activeTab === 'activity' && currentWorkspace && (
            <ActivityView workspaceId={currentWorkspace.id} />
          )}

          {activeTab === 'members' && currentWorkspace && (
            <MembersView
              workspaceId={currentWorkspace.id}
              members={membersDetailed}
              currentUserId={currentUser.id}
              userRole={userRole}
              onRefreshMembers={loadWorkspaceData}
              onOpenInviteModal={() => setActiveTab('invitations')}
            />
          )}

          {activeTab === 'invitations' && currentWorkspace && (
            <InvitationsView
              workspaceId={currentWorkspace.id}
              workspaceName={currentWorkspace.name}
              userRole={userRole}
            />
          )}

          {activeTab === 'settings' && currentWorkspace && (
            <div className="p-6 max-w-xl mx-auto">
              <WorkspaceSettingsModal
                workspace={currentWorkspace}
                userRole={userRole}
                onClose={() => setActiveTab('overview')}
                onWorkspaceUpdated={handleWorkspaceUpdated}
                onWorkspaceDeleted={handleWorkspaceDeleted}
              />
            </div>
          )}

          {activeTab === 'dev' && (
            <div className="p-6 max-w-xl mx-auto">
              <DevInspectorModal
                isOpen={true}
                onClose={() => setActiveTab('overview')}
                onResetDataSuccess={loadWorkspaceData}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      {showCreateTaskModal && currentWorkspace && (
        <CreateTaskModal
          workspaceId={currentWorkspace.id}
          projects={projects}
          members={membersDetailed}
          defaultStatus={createTaskDefaultStatus}
          defaultProjectId={selectedProjectId}
          onClose={() => setShowCreateTaskModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {showCreateProjectModal && currentWorkspace && (
        <CreateProjectModal
          workspaceId={currentWorkspace.id}
          projectToEdit={projectToEdit}
          onClose={() => {
            setShowCreateProjectModal(false);
            setProjectToEdit(null);
          }}
          onProjectSaved={handleProjectSaved}
        />
      )}

      {activeTaskDetail && (
        <TaskDetailModal
          task={activeTaskDetail}
          projects={projects}
          members={membersDetailed}
          onClose={() => setActiveTaskDetail(null)}
          onUpdateTask={handleTaskUpdated}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {showWorkspaceSettings && currentWorkspace && (
        <WorkspaceSettingsModal
          workspace={currentWorkspace}
          userRole={userRole}
          onClose={() => setShowWorkspaceSettings(false)}
          onWorkspaceUpdated={handleWorkspaceUpdated}
          onWorkspaceDeleted={handleWorkspaceDeleted}
        />
      )}

      {showCreateWorkspace && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateWorkspace(false)}
          onWorkspaceCreated={handleWorkspaceCreated}
        />
      )}

      {showProfileModal && currentUser && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUserUpdated={u => setCurrentUser(u)}
        />
      )}

      {showCommandPalette && (
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          projects={projects}
          tasks={tasks}
          members={membersDetailed}
          onSelectTab={setActiveTab}
          onSelectProject={id => {
            setSelectedProjectId(id);
            setActiveTab('kanban');
          }}
          onSelectTask={setActiveTaskDetail}
        />
      )}

      {showDevInspector && (
        <DevInspectorModal
          isOpen={showDevInspector}
          onClose={() => setShowDevInspector(false)}
          onResetDataSuccess={loadWorkspaceData}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
