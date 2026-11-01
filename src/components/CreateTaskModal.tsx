import React, { useState } from 'react';
import { X, Plus, Calendar, Tag, User as UserIcon } from 'lucide-react';
import { Project, WorkspaceMemberDetailed, TaskStatus, PriorityLevel } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface CreateTaskModalProps {
  workspaceId: string;
  projects: Project[];
  members: WorkspaceMemberDetailed[];
  defaultStatus?: TaskStatus;
  defaultProjectId?: string;
  onClose: () => void;
  onTaskCreated: (newTask: any) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  workspaceId,
  projects,
  members,
  defaultStatus = 'To Do',
  defaultProjectId,
  onClose,
  onTaskCreated
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>(
    defaultProjectId && defaultProjectId !== 'all' ? defaultProjectId : projects[0]?.id || ''
  );
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [tagInput, setTagInput] = useState('frontend, core');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }
    if (!projectId) {
      showToast('Please select a project', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      const created = await api.createTask({
        workspaceId,
        projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate,
        tags
      });

      const targetProject = projects.find(p => p.id === projectId);
      const targetAssignee = assigneeId ? members.find(m => m.userId === assigneeId) : null;

      const hydrated = {
        ...created,
        projectName: targetProject?.name || 'Project',
        projectColor: targetProject?.color || '#4F8CFF',
        assigneeName: targetAssignee?.name || 'Unassigned',
        assigneeAvatar: targetAssignee?.avatarUrl || null,
        comments: []
      };

      onTaskCreated(hydrated);
      showToast('Task created successfully', 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to create task', 'error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#151C2C] border border-[#1E283D] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#1E283D] flex items-center justify-between bg-[#101625]">
          <h2 className="text-sm font-semibold text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-[#9AA8BD] hover:text-white p-1 rounded-lg hover:bg-[#1C2638] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement WebSocket rate-limiting"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Project *
              </label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Workflow Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Provide context, acceptance criteria, or links..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF] resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. backend, infra, security"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#1E283D] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#1C2638] hover:bg-[#25334D] text-xs font-medium text-[#F3F6FC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
