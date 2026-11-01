import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Calendar,
  CheckCircle2,
  Archive,
  RefreshCcw,
  Trash2,
  Edit,
  ExternalLink,
  Users
} from 'lucide-react';
import { Project, WorkspaceRole, ProjectStatus, PriorityLevel, WorkspaceMemberDetailed } from '../types';
import { useToast } from './Toast';

interface ProjectsViewProps {
  projects: Project[];
  loading: boolean;
  userRole: WorkspaceRole;
  members: WorkspaceMemberDetailed[];
  onOpenCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onArchiveProject: (project: Project, archive: boolean) => void;
  onSelectProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  loading,
  userRole,
  members,
  onOpenCreateProject,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onSelectProject
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'dueDate' | 'progress'>('updated');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const canManage = userRole === 'Owner' || userRole === 'Admin';

  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
          if (!matches) return false;
        }
        if (statusFilter !== 'all' && p.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
        if (priorityFilter !== 'all' && p.priority.toLowerCase() !== priorityFilter.toLowerCase()) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'dueDate') return a.dueDate.localeCompare(b.dueDate);
        if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [projects, searchQuery, statusFilter, priorityFilter, sortBy]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Projects</span>
            <span className="text-xs font-mono font-normal text-[#9AA8BD] px-2 py-0.5 rounded bg-[#151C2C] border border-[#1E283D]">
              {projects.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8BD] mt-0.5">
            Manage long-term initiatives, milestones, and cross-functional teams.
          </p>
        </div>

        {canManage && (
          <button
            onClick={onOpenCreateProject}
            className="px-3.5 py-2 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#151C2C] border border-[#1E283D]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-[#9AA8BD] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-xs text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-xs text-[#F3F6FC] focus:outline-none focus:border-[#4F8CFF]"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-xs text-[#F3F6FC] focus:outline-none focus:border-[#4F8CFF]"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-xs text-[#F3F6FC] focus:outline-none focus:border-[#4F8CFF]"
          >
            <option value="updated">Recently Updated</option>
            <option value="name">Name (A-Z)</option>
            <option value="dueDate">Due Date</option>
            <option value="progress">Highest Progress</option>
          </select>
        </div>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-[#151C2C] rounded-xl" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center rounded-xl bg-[#151C2C] border border-[#1E283D] p-8">
          <FolderGit2 className="w-10 h-10 text-[#4F8CFF]/50 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No projects found</h3>
          <p className="text-xs text-[#9AA8BD] mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'No projects matched your active filters. Try resetting search or filter criteria.'
              : 'Create your first project to organize sprint tasks, milestones, and deliverables.'}
          </p>
          {canManage && (
            <button
              onClick={onOpenCreateProject}
              className="mt-4 px-3 py-1.5 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-medium text-white inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(project => {
            const progress = project.progress || 0;
            const isMenuOpen = activeMenuId === project.id;

            return (
              <div
                key={project.id}
                className="rounded-xl bg-[#151C2C] border border-[#1E283D] hover:border-[#4F8CFF]/40 transition-all p-5 flex flex-col justify-between group relative"
              >
                <div>
                  {/* Card Header: Color indicator & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: project.color || '#4F8CFF' }}
                      />
                      <h3
                        onClick={() => onSelectProject(project.id)}
                        className="font-semibold text-white text-sm hover:text-[#4F8CFF] cursor-pointer transition-colors truncate"
                      >
                        {project.name}
                      </h3>
                    </div>

                    {/* Action Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(isMenuOpen ? null : project.id)}
                        className="text-[#9AA8BD] hover:text-white p-1 rounded-md hover:bg-[#1C2638] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[#1C2638] border border-[#1E283D] shadow-2xl py-1 z-30 text-xs animate-in fade-in slide-in-from-top-1">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectProject(project.id);
                            }}
                            className="w-full text-left px-3 py-2 flex items-center gap-2 text-[#F3F6FC] hover:bg-[#151C2C]"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#4F8CFF]" />
                            <span>Open Tasks</span>
                          </button>

                          {canManage && (
                            <>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onEditProject(project);
                                }}
                                className="w-full text-left px-3 py-2 flex items-center gap-2 text-[#F3F6FC] hover:bg-[#151C2C]"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#9AA8BD]" />
                                <span>Edit Details</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onArchiveProject(project, project.status !== 'Archived');
                                }}
                                className="w-full text-left px-3 py-2 flex items-center gap-2 text-[#F3F6FC] hover:bg-[#151C2C]"
                              >
                                {project.status === 'Archived' ? (
                                  <>
                                    <RefreshCcw className="w-3.5 h-3.5 text-[#34D399]" />
                                    <span>Restore Project</span>
                                  </>
                                ) : (
                                  <>
                                    <Archive className="w-3.5 h-3.5 text-[#FBBF24]" />
                                    <span>Archive Project</span>
                                  </>
                                )}
                              </button>

                              <div className="h-px bg-[#1E283D] my-1" />

                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDeleteProject(project.id);
                                }}
                                className="w-full text-left px-3 py-2 flex items-center gap-2 text-[#F87171] hover:bg-[#F87171]/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Project</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#9AA8BD] mt-2 line-clamp-2 leading-relaxed min-h-[34px]">
                    {project.description || 'No project description provided.'}
                  </p>

                  {/* Badges: Status and Priority */}
                  <div className="flex items-center gap-2 mt-4 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-[#0B0F19] text-[#9AA8BD] font-medium border border-[#1E283D]">
                      {project.status}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-medium ${
                        project.priority === 'Urgent'
                          ? 'bg-[#F87171]/15 text-[#F87171]'
                          : project.priority === 'High'
                          ? 'bg-[#FBBF24]/15 text-[#FBBF24]'
                          : 'bg-[#4F8CFF]/15 text-[#4F8CFF]'
                      }`}
                    >
                      {project.priority}
                    </span>
                  </div>
                </div>

                {/* Progress bar and Footer */}
                <div className="mt-5 pt-4 border-t border-[#1E283D]/60 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-[#9AA8BD]">Task Progress</span>
                      <span className="font-mono text-white font-medium">
                        {project.completedTasks || 0}/{project.totalTasks || 0} ({progress}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#0B0F19] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: progress === 100 ? '#34D399' : project.color || '#4F8CFF'
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#9AA8BD] pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#6B7A94]" />
                      <span>Due {project.dueDate}</span>
                    </div>

                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="text-[#4F8CFF] hover:text-[#4F8CFF]/80 font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Board</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
