import React, { useState } from 'react';
import { X, FolderGit2 } from 'lucide-react';
import { Project, ProjectStatus, PriorityLevel } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface CreateProjectModalProps {
  workspaceId: string;
  projectToEdit?: Project | null;
  onClose: () => void;
  onProjectSaved: (project: Project) => void;
}

const COLOR_OPTIONS = [
  '#4F8CFF', // Electric blue
  '#8B5CF6', // Violet
  '#34D399', // Emerald
  '#FBBF24', // Amber
  '#F87171', // Coral / Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  workspaceId,
  projectToEdit,
  onClose,
  onProjectSaved
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState(projectToEdit ? projectToEdit.name : '');
  const [description, setDescription] = useState(projectToEdit ? projectToEdit.description : '');
  const [status, setStatus] = useState<ProjectStatus>(projectToEdit ? projectToEdit.status : 'Active');
  const [priority, setPriority] = useState<PriorityLevel>(projectToEdit ? projectToEdit.priority : 'Medium');
  const [startDate, setStartDate] = useState<string>(
    projectToEdit ? projectToEdit.startDate : new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    projectToEdit
      ? projectToEdit.dueDate
      : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [color, setColor] = useState<string>(projectToEdit ? projectToEdit.color : '#4F8CFF');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Project name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (projectToEdit) {
        const updated = await api.updateProject(projectToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          status,
          priority,
          startDate,
          dueDate,
          color
        });
        onProjectSaved(updated);
        showToast('Project updated successfully', 'success');
      } else {
        const created = await api.createProject({
          workspaceId,
          name: name.trim(),
          description: description.trim(),
          status,
          priority,
          startDate,
          dueDate,
          color
        });
        onProjectSaved(created);
        showToast('Project created successfully', 'success');
      }
      onClose();
    } catch (err: any) {
      showToast('Failed to save project', 'error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#151C2C] border border-[#1E283D] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#1E283D] flex items-center justify-between bg-[#101625]">
          <h2 className="text-sm font-semibold text-white">
            {projectToEdit ? 'Edit Project Details' : 'Create New Project'}
          </h2>
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
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Core API Observability"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Primary milestone goals, architecture, or cross-team scope..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
              />
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
          </div>

          {/* Color theme picker */}
          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              {isSubmitting ? 'Saving...' : projectToEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
