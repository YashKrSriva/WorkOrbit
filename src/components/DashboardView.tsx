import React from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Flame,
  Calendar,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { DashboardStats, WorkspaceRole } from '../types';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigate: (tab: ActiveTab, filterParams?: any) => void;
  onOpenCreateProject: () => void;
  onOpenCreateTask: () => void;
  userRole: WorkspaceRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loading,
  onRefresh,
  onNavigate,
  onOpenCreateProject,
  onOpenCreateTask,
  userRole
}) => {
  if (loading && !stats) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-[#151C2C] rounded-lg w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[#151C2C] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-[#151C2C] rounded-xl lg:col-span-2" />
          <div className="h-80 bg-[#151C2C] rounded-xl" />
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    openTasks: 0,
    overdueTasks: 0,
    myOpenTasks: 0,
    overallCompletion: 0
  };

  const statusCounts = stats?.statusCounts || { 'To Do': 0, 'In Progress': 0, 'In Review': 0, 'Done': 0 };
  const priorityCounts = stats?.priorityCounts || { Urgent: 0, High: 0, Medium: 0, Low: 0 };
  const upcomingDeadlines = stats?.upcomingDeadlines || [];
  const recentActivity = stats?.recentActivity || [];
  const projectProgress = stats?.projectProgressList || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Workspace Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8BD] mt-0.5">
            Real-time telemetry, sprint velocity, and critical path items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-[#151C2C] hover:bg-[#1C2638] border border-[#1E283D] text-[#9AA8BD] hover:text-white transition-colors"
            title="Refresh dashboard stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {(userRole === 'Owner' || userRole === 'Admin') && (
            <button
              onClick={onOpenCreateProject}
              className="px-3 py-2 rounded-lg bg-[#151C2C] hover:bg-[#1C2638] border border-[#1E283D] text-xs font-medium text-white transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#4F8CFF]" />
              <span>New Project</span>
            </button>
          )}

          <button
            onClick={onOpenCreateTask}
            className="px-3.5 py-2 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total & Active Projects */}
        <div
          onClick={() => onNavigate('projects')}
          className="p-4 rounded-xl bg-[#151C2C] border border-[#1E283D] hover:border-[#4F8CFF]/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9AA8BD] font-medium">Projects</span>
            <FolderGit2 className="w-4 h-4 text-[#4F8CFF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{metrics.totalProjects}</span>
            <span className="text-xs text-[#34D399]">({metrics.activeProjects} active)</span>
          </div>
          <div className="mt-2 text-[11px] text-[#9AA8BD] flex items-center gap-1 group-hover:text-[#4F8CFF] transition-colors">
            <span>View all projects</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Open Tasks */}
        <div
          onClick={() => onNavigate('kanban')}
          className="p-4 rounded-xl bg-[#151C2C] border border-[#1E283D] hover:border-[#8B5CF6]/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9AA8BD] font-medium">Open Tasks</span>
            <Clock className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{metrics.openTasks}</span>
            <span className="text-xs text-[#9AA8BD]">/ {metrics.totalTasks} total</span>
          </div>
          <div className="mt-2 text-[11px] text-[#9AA8BD] flex items-center gap-1 group-hover:text-[#8B5CF6] transition-colors">
            <span>Open Kanban board</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Assigned to Me */}
        <div
          onClick={() => onNavigate('mytasks')}
          className="p-4 rounded-xl bg-[#151C2C] border border-[#1E283D] hover:border-[#34D399]/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9AA8BD] font-medium">My Assigned</span>
            <UserCheck className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{metrics.myOpenTasks}</span>
            <span className="text-xs text-[#9AA8BD]">pending tasks</span>
          </div>
          <div className="mt-2 text-[11px] text-[#9AA8BD] flex items-center gap-1 group-hover:text-[#34D399] transition-colors">
            <span>Filter my tasks</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Overdue Items */}
        <div
          onClick={() => onNavigate('kanban', { overdueOnly: true })}
          className={`p-4 rounded-xl bg-[#151C2C] border transition-all cursor-pointer group ${
            metrics.overdueTasks > 0 ? 'border-[#F87171]/40 hover:border-[#F87171]' : 'border-[#1E283D] hover:border-[#FBBF24]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9AA8BD] font-medium">Overdue</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.overdueTasks > 0 ? 'text-[#F87171]' : 'text-[#34D399]'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${metrics.overdueTasks > 0 ? 'text-[#F87171]' : 'text-white'}`}>
              {metrics.overdueTasks}
            </span>
            <span className="text-xs text-[#9AA8BD]">need immediate action</span>
          </div>
          <div className="mt-2 text-[11px] text-[#9AA8BD] flex items-center gap-1 group-hover:text-[#F87171] transition-colors">
            <span>Review overdue items</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main Grid: Project Progress & Status / Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Project Completion Meters */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#151C2C] border border-[#1E283D] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Project Velocity & Progress</h2>
              <p className="text-xs text-[#9AA8BD]">Calculated directly from real task completion states</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#9AA8BD]">
              <span>Avg:</span>
              <span className="text-[#34D399] font-bold">{metrics.overallCompletion}%</span>
            </div>
          </div>

          <div className="space-y-4 mt-2">
            {projectProgress.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#9AA8BD]">
                No active projects found. Create one to begin tracking sprint metrics.
              </div>
            ) : (
              projectProgress.map(p => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('kanban', { projectId: p.id })}
                  className="p-3 rounded-lg bg-[#0B0F19]/50 hover:bg-[#1C2638] border border-[#1E283D]/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#4F8CFF' }} />
                      <span className="font-medium text-white group-hover:text-[#4F8CFF] transition-colors">{p.name}</span>
                      <span className="text-[10px] text-[#9AA8BD]">({p.status})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-[#9AA8BD]">{p.completedTasks}/{p.totalTasks} tasks</span>
                      <span className="text-white font-semibold">{p.progress}%</span>
                    </div>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-2 rounded-full bg-[#151C2C] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${p.progress}%`,
                        backgroundColor: p.progress === 100 ? '#34D399' : p.color || '#4F8CFF'
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Status & Priority Distributions */}
        <div className="p-5 rounded-xl bg-[#151C2C] border border-[#1E283D] space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Task Distribution</h2>
            <p className="text-xs text-[#9AA8BD]">Current pipeline breakdown</p>
          </div>

          {/* Workflow Status Breakdown */}
          <div className="space-y-2">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7A94]">
              Workflow Columns
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'To Do', count: statusCounts['To Do'], color: '#9AA8BD' },
                { label: 'In Progress', count: statusCounts['In Progress'], color: '#4F8CFF' },
                { label: 'In Review', count: statusCounts['In Review'], color: '#8B5CF6' },
                { label: 'Done', count: statusCounts['Done'], color: '#34D399' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#0B0F19]/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#F3F6FC]">{item.label}</span>
                  </div>
                  <span className="font-mono text-white font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Levels */}
          <div className="space-y-2 pt-2 border-t border-[#1E283D]/60">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#6B7A94]">
              Priority Breakdown
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-[#0B0F19]/40 flex items-center justify-between">
                <span className="text-[#F87171] font-medium">Urgent</span>
                <span className="font-mono text-white">{priorityCounts.Urgent}</span>
              </div>
              <div className="p-2 rounded bg-[#0B0F19]/40 flex items-center justify-between">
                <span className="text-[#FBBF24] font-medium">High</span>
                <span className="font-mono text-white">{priorityCounts.High}</span>
              </div>
              <div className="p-2 rounded bg-[#0B0F19]/40 flex items-center justify-between">
                <span className="text-[#4F8CFF] font-medium">Medium</span>
                <span className="font-mono text-white">{priorityCounts.Medium}</span>
              </div>
              <div className="p-2 rounded bg-[#0B0F19]/40 flex items-center justify-between">
                <span className="text-[#9AA8BD] font-medium">Low</span>
                <span className="font-mono text-white">{priorityCounts.Low}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Deadlines & Recent Workspace Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="p-5 rounded-xl bg-[#151C2C] border border-[#1E283D] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4F8CFF]" />
              <h2 className="text-sm font-semibold text-white">Upcoming Deadlines</h2>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs text-[#4F8CFF] hover:underline"
            >
              Full Calendar
            </button>
          </div>

          <div className="space-y-2 mt-2">
            {upcomingDeadlines.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9AA8BD]">
                No upcoming deadlines in the next 7 days.
              </div>
            ) : (
              upcomingDeadlines.map(t => (
                <div
                  key={t.id}
                  onClick={() => onNavigate('kanban', { taskId: t.id })}
                  className="p-2.5 rounded-lg bg-[#0B0F19]/50 hover:bg-[#1C2638] border border-[#1E283D]/60 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="text-xs font-medium text-white truncate">{t.title}</div>
                    <div className="flex items-center gap-2 text-[11px] text-[#9AA8BD] mt-0.5">
                      <span className="truncate">{t.projectName}</span>
                      <span>·</span>
                      <span className="text-[#FBBF24]">Due {t.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        t.priority === 'Urgent'
                          ? 'bg-[#F87171]/20 text-[#F87171]'
                          : t.priority === 'High'
                          ? 'bg-[#FBBF24]/20 text-[#FBBF24]'
                          : 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
                      }`}
                    >
                      {t.priority}
                    </span>
                    {t.assigneeAvatar ? (
                      <img
                        src={t.assigneeAvatar}
                        alt={t.assigneeName}
                        className="w-5 h-5 rounded-full object-cover"
                        title={t.assigneeName}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#1C2638] text-[9px] flex items-center justify-center text-[#9AA8BD]">
                        ?
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Workspace Activity Stream */}
        <div className="p-5 rounded-xl bg-[#151C2C] border border-[#1E283D] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
              <h2 className="text-sm font-semibold text-white">Live Activity Stream</h2>
            </div>
            <button
              onClick={() => onNavigate('activity')}
              className="text-xs text-[#8B5CF6] hover:underline"
            >
              View All Logs
            </button>
          </div>

          <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9AA8BD]">
                No workspace activities recorded yet.
              </div>
            ) : (
              recentActivity.map(act => (
                <div key={act.id} className="p-2.5 rounded-lg bg-[#0B0F19]/40 flex items-start gap-3 text-xs">
                  <img
                    src={act.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={act.userName}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F3F6FC]">
                      <span className="font-semibold text-white">{act.userName}</span>{' '}
                      <span className="text-[#9AA8BD]">{act.action}</span>{' '}
                      <span className="font-medium text-[#4F8CFF] truncate">"{act.entityName}"</span>
                    </div>
                    <div className="text-[10px] text-[#6B7A94] mt-0.5">
                      {new Date(act.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
