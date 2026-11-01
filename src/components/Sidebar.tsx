import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  Kanban,
  Calendar,
  Activity,
  Users,
  Mail,
  Settings,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database,
  Plus
} from 'lucide-react';
import { Project, Workspace, WorkspaceRole } from '../types';

export type ActiveTab =
  | 'overview'
  | 'mytasks'
  | 'projects'
  | 'kanban'
  | 'calendar'
  | 'activity'
  | 'members'
  | 'invitations'
  | 'settings'
  | 'dev';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentWorkspace: Workspace | null;
  projects: Project[];
  selectedProjectId: string | 'all';
  onSelectProject: (projectId: string | 'all') => void;
  onOpenCreateProject: () => void;
  userRole: WorkspaceRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentWorkspace,
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenCreateProject,
  userRole,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`border-r border-[#1E283D] bg-[#101625] flex flex-col justify-between transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Nav Items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
        {/* Main Section */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider uppercase text-[#6B7A94]">
              Main
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
              }`}
              title="Overview"
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'overview' ? 'text-[#4F8CFF]' : ''}`} />
              {!collapsed && <span>Overview</span>}
            </button>

            <button
              onClick={() => onSelectTab('mytasks')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'mytasks'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
              }`}
              title="My Tasks"
            >
              <CheckSquare className={`w-4 h-4 shrink-0 ${activeTab === 'mytasks' ? 'text-[#4F8CFF]' : ''}`} />
              {!collapsed && <span>My Tasks</span>}
            </button>

            <button
              onClick={() => {
                onSelectTab('projects');
                onSelectProject('all');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
              }`}
              title="Projects"
            >
              <FolderGit2 className={`w-4 h-4 shrink-0 ${activeTab === 'projects' ? 'text-[#4F8CFF]' : ''}`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Projects</span>
                  <span className="text-[10px] text-[#6B7A94] bg-[#151C2C] px-1.5 py-0.2 rounded font-mono">
                    {projects.length}
                  </span>
                </div>
              )}
            </button>

            <button
              onClick={() => onSelectTab('kanban')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'kanban'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
              }`}
              title="Kanban Board"
            >
              <Kanban className={`w-4 h-4 shrink-0 ${activeTab === 'kanban' ? 'text-[#8B5CF6]' : ''}`} />
              {!collapsed && <span>Kanban Board</span>}
            </button>

            <button
              onClick={() => onSelectTab('calendar')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
              }`}
              title="Calendar & Deadlines"
            >
              <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'calendar' ? 'text-[#34D399]' : ''}`} />
              {!collapsed && <span>Calendar</span>}
            </button>

            <button
              onClick={() => onSelectTab('activity')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
              }`}
              title="Activity Stream"
            >
              <Activity className={`w-4 h-4 shrink-0 ${activeTab === 'activity' ? 'text-[#FBBF24]' : ''}`} />
              {!collapsed && <span>Activity</span>}
            </button>
          </div>
        </div>

        {/* Project Shortcuts (when expanded) */}
        {!collapsed && projects.length > 0 && (
          <div>
            <div className="px-3 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-[#6B7A94]">
              <span>Active Projects</span>
              {(userRole === 'Owner' || userRole === 'Admin') && (
                <button
                  onClick={onOpenCreateProject}
                  className="hover:text-white transition-colors"
                  title="New project"
                >
                  <Plus className="w-3.5 h-3.5 text-[#4F8CFF]" />
                </button>
              )}
            </div>
            <div className="space-y-0.5 mt-1 max-h-40 overflow-y-auto">
              {projects.slice(0, 5).map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectTab('kanban');
                    onSelectProject(p.id);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs flex items-center gap-2.5 truncate transition-colors ${
                    activeTab === 'kanban' && selectedProjectId === p.id
                      ? 'bg-[#1C2638] text-white font-medium'
                      : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color || '#4F8CFF' }}
                  />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Workspace Management */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider uppercase text-[#6B7A94]">
              Workspace
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectTab('members')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'members'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
              }`}
              title="Team Members"
            >
              <Users className={`w-4 h-4 shrink-0 ${activeTab === 'members' ? 'text-[#4F8CFF]' : ''}`} />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>Team Members</span>
                  <span className="text-[10px] text-[#6B7A94] bg-[#151C2C] px-1.5 py-0.2 rounded font-mono">
                    {currentWorkspace?.members.length || 1}
                  </span>
                </div>
              )}
            </button>

            <button
              onClick={() => onSelectTab('invitations')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'invitations'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
              }`}
              title="Invitations"
            >
              <Mail className={`w-4 h-4 shrink-0 ${activeTab === 'invitations' ? 'text-[#4F8CFF]' : ''}`} />
              {!collapsed && <span>Invitations</span>}
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
              }`}
              title="Workspace Settings"
            >
              <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-[#4F8CFF]' : ''}`} />
              {!collapsed && <span>Settings</span>}
            </button>
          </div>
        </div>

        {/* Developer & System */}
        <div>
          {!collapsed && (
            <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider uppercase text-[#6B7A94]">
              System
            </div>
          )}
          <div className="space-y-0.5">
            <button
              onClick={() => onSelectTab('dev')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'dev'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-[#151C2C]'
              }`}
              title="Developer DB & System Health"
            >
              <Database className={`w-4 h-4 shrink-0 ${activeTab === 'dev' ? 'text-[#34D399]' : ''}`} />
              {!collapsed && <span>Database & Health</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Collapse Toggle at Bottom */}
      <div className="p-3 border-t border-[#1E283D] flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-[11px] text-[#9AA8BD] font-mono">SQLite / REST OK</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#9AA8BD] hover:text-white hover:bg-[#1C2638] transition-colors ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
