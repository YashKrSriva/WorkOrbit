import React, { useState } from 'react';
import { X, Plus, Orbit } from 'lucide-react';
import { Workspace } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface CreateWorkspaceModalProps {
  onClose: () => void;
  onWorkspaceCreated: (workspace: Workspace) => void;
}

const AVATAR_OPTIONS = ['🪐', '⚡', '🚀', '🔥', '💎', '🛡️', '🌐', '🧩', '🧪'];

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  onClose,
  onWorkspaceCreated
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('🪐');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Workspace name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createWorkspace({
        name: name.trim(),
        description: description.trim(),
        avatar
      });
      onWorkspaceCreated(created);
      showToast('Workspace created successfully', 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to create workspace', 'error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#151C2C] border border-[#1E283D] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#1E283D] flex items-center justify-between bg-[#101625]">
          <div className="flex items-center gap-2">
            <Orbit className="w-4 h-4 text-[#4F8CFF]" />
            <h2 className="text-sm font-semibold text-white">Create New Workspace</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#9AA8BD] hover:text-white p-1 rounded-lg hover:bg-[#1C2638] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-2">
              Workspace Icon
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    avatar === emoji
                      ? 'bg-[#1C2638] border-2 border-[#4F8CFF] scale-105'
                      : 'bg-[#0B0F19] border border-[#1E283D] hover:bg-[#1C2638]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Workspace Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Engineering"
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
              placeholder="Core team mission or organization summary..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF] resize-none"
            />
          </div>

          <div className="pt-3 border-t border-[#1E283D] flex items-center justify-end gap-2">
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
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
