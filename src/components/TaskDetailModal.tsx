import React, { useState } from 'react';
import {
  X,
  Calendar,
  User as UserIcon,
  Tag,
  Clock,
  Trash2,
  Send,
  MessageSquare,
  AlertTriangle,
  FolderGit2
} from 'lucide-react';
import { Task, Project, WorkspaceMemberDetailed, TaskStatus, PriorityLevel, TaskComment } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface TaskDetailModalProps {
  task: Task | null;
  projects: Project[];
  members: WorkspaceMemberDetailed[];
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  projects,
  members,
  onClose,
  onUpdateTask,
  onDeleteTask
}) => {
  const { showToast } = useToast();
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<PriorityLevel>(task.priority);
  const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId || '');
  const [projectId, setProjectId] = useState<string>(task.projectId);
  const [dueDate, setDueDate] = useState<string>(task.dueDate);
  const [comments, setComments] = useState<TaskComment[]>(task.comments || []);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await api.updateTask(task.id, {
        title,
        description,
        status,
        priority,
        assigneeId: assigneeId || null,
        projectId,
        dueDate,
      });

      // Hydrate project & assignee for parent state
      const targetProject = projects.find(p => p.id === projectId);
      const targetAssignee = assigneeId ? members.find(m => m.userId === assigneeId) : null;

      const fullyHydrated: Task = {
        ...updated,
        projectName: targetProject?.name || 'Project',
        projectColor: targetProject?.color || '#4F8CFF',
        assigneeName: targetAssignee?.name || 'Unassigned',
        assigneeAvatar: targetAssignee?.avatarUrl || null,
        comments
      };

      onUpdateTask(fullyHydrated);
      showToast('Task updated successfully', 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to save task', 'error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const newComment = await api.addComment(task.id, commentText.trim());
      setComments(prev => [...prev, newComment]);
      setCommentText('');
      showToast('Comment added', 'success');
    } catch (err: any) {
      showToast('Failed to add comment', 'error', err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-[#151C2C] border border-[#1E283D] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#1E283D] flex items-center justify-between bg-[#101625]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#9AA8BD] px-2 py-0.5 rounded bg-[#0B0F19] border border-[#1E283D]">
              {task.id}
            </span>
            <span className="text-xs text-[#9AA8BD]">Task Details</span>
          </div>

          <button
            onClick={onClose}
            className="text-[#9AA8BD] hover:text-white p-1 rounded-lg hover:bg-[#1C2638] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-sm font-semibold text-white focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>

          {/* Grid: Project, Status, Priority, Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1.5">
                Associated Project
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

            {/* Status */}
            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1.5">
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

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1.5">
                Priority Level
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

            {/* Assignee */}
            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1.5">
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

          {/* Due Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full sm:w-1/2 px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1.5">
              Description & Specifications
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details, reproduction steps, or acceptance criteria..."
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF] leading-relaxed resize-none"
            />
          </div>

          {/* Comments Section */}
          <div className="pt-4 border-t border-[#1E283D] space-y-3">
            <div className="flex items-center gap-2 font-semibold text-white">
              <MessageSquare className="w-4 h-4 text-[#4F8CFF]" />
              <span>Comments ({comments.length})</span>
            </div>

            {/* Existing comments */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="p-3 text-center text-[#9AA8BD] bg-[#0B0F19]/40 rounded-lg">
                  No comments yet. Start the conversation below.
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="p-3 rounded-lg bg-[#0B0F19] border border-[#1E283D]/60 flex items-start gap-3">
                    <img
                      src={c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={c.authorName}
                      className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white">{c.authorName}</span>
                        <span className="text-[#6B7A94]">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#F3F6FC] mt-1 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-3 py-2 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white font-medium disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-[#1E283D] flex items-center justify-between bg-[#101625]">
          <div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-[#F87171] hover:text-[#F87171]/80 hover:bg-[#F87171]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#F87171] font-medium">Confirm delete?</span>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="px-2.5 py-1 rounded bg-[#F87171] hover:bg-[#F87171]/90 text-white text-xs font-semibold"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 rounded bg-[#1C2638] text-[#9AA8BD] hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-[#1C2638] hover:bg-[#25334D] text-xs font-medium text-[#F3F6FC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
