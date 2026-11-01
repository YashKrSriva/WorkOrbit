import React, { useState, useMemo } from 'react';
import {
  Kanban,
  List as ListIcon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Calendar,
  MessageSquare,
  User as UserIcon,
  ChevronDown,
  ArrowUpDown,
  Tag,
  Check
} from 'lucide-react';
import { Task, Project, WorkspaceMemberDetailed, TaskStatus, PriorityLevel, WorkspaceRole } from '../types';
import { useToast } from './Toast';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  members: WorkspaceMemberDetailed[];
  currentUserId: string;
  userRole: WorkspaceRole;
  loading: boolean;
  isMyTasksOnly?: boolean;
  selectedProjectId: string | 'all';
  onSelectProject: (id: string | 'all') => void;
  onOpenCreateTask: (defaultStatus?: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'To Do', title: 'To Do', color: '#9AA8BD' },
  { id: 'In Progress', title: 'In Progress', color: '#4F8CFF' },
  { id: 'In Review', title: 'In Review', color: '#8B5CF6' },
  { id: 'Done', title: 'Done', color: '#34D399' }
];

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  projects,
  members,
  currentUserId,
  userRole,
  loading,
  isMyTasksOnly = false,
  selectedProjectId,
  onSelectProject,
  onOpenCreateTask,
  onSelectTask,
  onUpdateTaskStatus,
  onDeleteTask
}) => {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // My Tasks view enforcement
      if (isMyTasksOnly && t.assigneeId !== currentUserId) {
        return false;
      }
      // Project filter
      if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) {
        return false;
      }
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Priority
      if (priorityFilter !== 'all' && t.priority.toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }
      // Assignee
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned' && t.assigneeId !== null) return false;
        if (assigneeFilter !== 'unassigned' && t.assigneeId !== assigneeFilter) return false;
      }
      // Overdue
      if (overdueOnly && (t.dueDate >= today || t.status === 'Done')) {
        return false;
      }
      return true;
    });
  }, [tasks, isMyTasksOnly, currentUserId, selectedProjectId, searchQuery, priorityFilter, assigneeFilter, overdueOnly, today]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    setDraggingTaskId(null);

    if (!taskId) return;

    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask || targetTask.status === columnId) return;

    try {
      await onUpdateTaskStatus(taskId, columnId);
      showToast(`Task moved to ${columnId}`, 'success');
    } catch (err: any) {
      showToast('Failed to update task status', 'error', err.message);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-3.5rem)]">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{isMyTasksOnly ? 'My Assigned Tasks' : 'Task & Workflow Board'}</span>
            <span className="text-xs font-mono font-normal text-[#9AA8BD] px-2 py-0.5 rounded bg-[#151C2C] border border-[#1E283D]">
              {filteredTasks.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8BD] mt-0.5">
            {isMyTasksOnly
              ? 'Focus view for tasks specifically delegated to you.'
              : 'Interactive Kanban pipeline with drag-and-drop state persistence.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch View Mode: Board vs List */}
          <div className="flex items-center p-1 rounded-lg bg-[#151C2C] border border-[#1E283D]">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors ${
                viewMode === 'board'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1C2638] text-white shadow-sm'
                  : 'text-[#9AA8BD] hover:text-white'
              }`}
              title="Linear List View"
            >
              <ListIcon className="w-3.5 h-3.5 text-[#4F8CFF]" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={() => onOpenCreateTask()}
            className="px-3.5 py-2 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#151C2C] border border-[#1E283D] shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#9AA8BD] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title, description, or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-xs text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Selector */}
          {!isMyTasksOnly && (
            <select
              value={selectedProjectId}
              onChange={e => onSelectProject(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-xs text-[#F3F6FC] focus:outline-none focus:border-[#4F8CFF]"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          {/* Assignee Selector */}
          {!isMyTasksOnly && (
            <select
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-xs text-[#F3F6FC] focus:outline-none focus:border-[#4F8CFF]"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {members.map(m => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          {/* Priority */}
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

          {/* Overdue Toggle */}
          <button
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              overdueOnly
                ? 'bg-[#F87171]/20 border-[#F87171] text-[#F87171]'
                : 'bg-[#0B0F19] border-[#1E283D] text-[#9AA8BD] hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Overdue Only</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="grid grid-cols-4 gap-4 h-full animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[#151C2C] rounded-xl h-96" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center rounded-xl bg-[#151C2C] border border-[#1E283D] p-8 text-center">
            <Kanban className="w-12 h-12 text-[#4F8CFF]/40 mb-3" />
            <h3 className="text-sm font-semibold text-white">No tasks found</h3>
            <p className="text-xs text-[#9AA8BD] mt-1 max-w-sm">
              {searchQuery || priorityFilter !== 'all' || assigneeFilter !== 'all' || overdueOnly
                ? 'No tasks matched your active filter query.'
                : 'Get started by creating your first task in this workspace.'}
            </p>
            <button
              onClick={() => onOpenCreateTask()}
              className="mt-4 px-3.5 py-2 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-medium text-white inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        ) : viewMode === 'board' ? (
          /* Kanban Board View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full overflow-x-auto pb-2">
            {COLUMNS.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.id);
              const isOver = dragOverColumn === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={e => handleDragOver(e, col.id)}
                  onDragLeave={e => handleDragLeave(e, col.id)}
                  onDrop={e => handleDrop(e, col.id)}
                  className={`flex flex-col h-full rounded-xl bg-[#151C2C]/70 border transition-all ${
                    isOver
                      ? 'border-[#4F8CFF] bg-[#1C2638]/90 ring-1 ring-[#4F8CFF]'
                      : 'border-[#1E283D]'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-[#1E283D]/70 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="font-semibold text-white text-xs">{col.title}</span>
                      <span className="text-[11px] font-mono text-[#9AA8BD] px-1.5 py-0.2 rounded bg-[#0B0F19]">
                        {colTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenCreateTask(col.id)}
                      className="text-[#9AA8BD] hover:text-white p-1 rounded hover:bg-[#1C2638] transition-colors"
                      title={`Add task to ${col.title}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Cards container */}
                  <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                    {colTasks.map(task => {
                      const isOverdue = task.dueDate < today && task.status !== 'Done';
                      const isDragging = draggingTaskId === task.id;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={e => handleDragStart(e, task.id)}
                          onClick={() => onSelectTask(task)}
                          className={`p-3.5 rounded-lg bg-[#101625] border border-[#1E283D] hover:border-[#4F8CFF]/50 cursor-grab active:cursor-grabbing transition-all select-none group ${
                            isDragging ? 'opacity-40 scale-95' : ''
                          }`}
                        >
                          {/* Project Tag & Priority */}
                          <div className="flex items-center justify-between text-[10px] mb-2">
                            <span
                              className="font-medium truncate max-w-[140px] px-1.5 py-0.5 rounded bg-[#0B0F19] text-[#9AA8BD]"
                              style={{ borderLeft: `2px solid ${task.projectColor || '#4F8CFF'}` }}
                            >
                              {task.projectName}
                            </span>

                            <span
                              className={`px-1.5 py-0.5 rounded font-medium ${
                                task.priority === 'Urgent'
                                  ? 'bg-[#F87171]/20 text-[#F87171]'
                                  : task.priority === 'High'
                                  ? 'bg-[#FBBF24]/20 text-[#FBBF24]'
                                  : 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-xs font-semibold text-white group-hover:text-[#4F8CFF] transition-colors line-clamp-2">
                            {task.title}
                          </h4>

                          {/* Description preview */}
                          {task.description && (
                            <p className="text-[11px] text-[#9AA8BD] mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Card Footer: Due date, comments, assignee */}
                          <div className="mt-3 pt-2.5 border-t border-[#1E283D]/50 flex items-center justify-between text-[10px] text-[#9AA8BD]">
                            <div className="flex items-center gap-2">
                              {/* Due Date */}
                              <div className={`flex items-center gap-1 ${isOverdue ? 'text-[#F87171] font-medium' : ''}`}>
                                <Calendar className="w-3 h-3" />
                                <span>{task.dueDate}</span>
                              </div>

                              {/* Comments count */}
                              {task.comments?.length > 0 && (
                                <div className="flex items-center gap-1 text-[#6B7A94]">
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{task.comments.length}</span>
                                </div>
                              )}
                            </div>

                            {/* Assignee Avatar */}
                            {task.assigneeAvatar ? (
                              <img
                                src={task.assigneeAvatar}
                                alt={task.assigneeName || ''}
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-[#1E283D]"
                                title={task.assigneeName || 'Assigned'}
                              />
                            ) : (
                              <div
                                className="w-5 h-5 rounded-full bg-[#1C2638] text-[9px] flex items-center justify-center text-[#9AA8BD]"
                                title="Unassigned"
                              >
                                ?
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Linear List View */
          <div className="rounded-xl bg-[#151C2C] border border-[#1E283D] overflow-hidden flex flex-col h-full">
            <div className="overflow-y-auto divide-y divide-[#1E283D]/60 flex-1">
              {filteredTasks.map(task => {
                const isOverdue = task.dueDate < today && task.status !== 'Done';

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3.5 hover:bg-[#1C2638] flex items-center justify-between gap-4 cursor-pointer transition-colors group text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Status circle button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          const nextStatus: TaskStatus =
                            task.status === 'Done' ? 'To Do' : task.status === 'To Do' ? 'In Progress' : 'Done';
                          onUpdateTaskStatus(task.id, nextStatus);
                        }}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                          task.status === 'Done'
                            ? 'bg-[#34D399] border-[#34D399] text-[#0B0F19]'
                            : 'border-[#9AA8BD] hover:border-[#4F8CFF]'
                        }`}
                      >
                        {task.status === 'Done' && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      {/* Project indicator */}
                      <span
                        className="w-1.5 h-5 rounded-full shrink-0"
                        style={{ backgroundColor: task.projectColor || '#4F8CFF' }}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-white group-hover:text-[#4F8CFF] truncate ${
                            task.status === 'Done' ? 'line-through text-[#6B7A94]' : ''
                          }`}>
                            {task.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#9AA8BD] flex items-center gap-2 mt-0.5">
                          <span>{task.projectName}</span>
                          {task.description && (
                            <>
                              <span>·</span>
                              <span className="truncate max-w-xs">{task.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-xs">
                      {/* Priority */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          task.priority === 'Urgent'
                            ? 'bg-[#F87171]/20 text-[#F87171]'
                            : task.priority === 'High'
                            ? 'bg-[#FBBF24]/20 text-[#FBBF24]'
                            : 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Status */}
                      <span className="text-[11px] text-[#9AA8BD] w-20 text-center px-1.5 py-0.5 rounded bg-[#0B0F19]">
                        {task.status}
                      </span>

                      {/* Due Date */}
                      <span className={`text-[11px] w-24 text-right ${isOverdue ? 'text-[#F87171] font-semibold' : 'text-[#9AA8BD]'}`}>
                        {task.dueDate}
                      </span>

                      {/* Assignee Avatar */}
                      <div className="w-6 h-6 shrink-0">
                        {task.assigneeAvatar ? (
                          <img
                            src={task.assigneeAvatar}
                            alt={task.assigneeName || ''}
                            className="w-6 h-6 rounded-full object-cover"
                            title={task.assigneeName || 'Assigned'}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#1C2638] text-[10px] flex items-center justify-center text-[#9AA8BD]">
                            ?
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
