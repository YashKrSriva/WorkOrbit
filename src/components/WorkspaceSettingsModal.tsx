import React, { useState } from 'react';
import { X, Settings, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Workspace, WorkspaceRole } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface WorkspaceSettingsModalProps {
  workspace: Workspace | null;
  userRole: WorkspaceRole;
  onClose: () => void;
  onWorkspaceUpdated: (updated: Workspace) => void;
  onWorkspaceDeleted: (workspaceId: string) => void;
}

const AVATAR_OPTIONS = ['🪐', '⚡', '🚀', '🔥', '💎', '🛡️', '🌐', '🧩', '🧪'];

export const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  workspace,
  userRole,
  onClose,
  onWorkspaceUpdated,
  onWorkspaceDeleted
}) => {
  const { showToast } = useToast();
  if (!workspace) return null;

  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');
  const [avatar, setAvatar] = useState(workspace.avatar || '🪐');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = userRole === 'Owner';
  const canEdit = userRole === 'Owner' || userRole === 'Admin';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      showToast('Only Owners and Admins can update settings', 'error');
      return;
    }
    if (!name.trim()) {
      showToast('Workspace name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await api.updateWorkspace(workspace.id, {
        name: name.trim(),
        description: description.trim(),
        avatar
      });
      onWorkspaceUpdated(updated);
      showToast('Workspace settings saved', 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to update workspace', 'error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) {
      showToast('Only the Workspace Owner can delete the workspace', 'error');
      return;
    }
    if (confirmName !== workspace.name) {
      showToast('Workspace name does not match confirmation', 'error');
      return;
    }

    try {
      await api.deleteWorkspace(workspace.id);
      showToast('Workspace deleted permanently', 'info');
      onWorkspaceDeleted(workspace.id);
      onClose();
    } catch (err: any) {
      showToast('Failed to delete workspace', 'error', err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#151C2C] border border-[#1E283D] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#1E283D] flex items-center justify-between bg-[#101625]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#4F8CFF]" />
            <h2 className="text-sm font-semibold text-white">Workspace Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#9AA8BD] hover:text-white p-1 rounded-lg hover:bg-[#1C2638] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-2">
              Workspace Icon
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  type="button"
                  key={emoji}
                  disabled={!canEdit}
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
              disabled={!canEdit}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF] disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Slug Identifier
            </label>
            <input
              type="text"
              disabled
              value={workspace.slug}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19]/50 border border-[#1E283D] text-[#9AA8BD] font-mono cursor-not-allowed"
            />
            <span className="text-[10px] text-[#6B7A94] mt-1 block">
              Permanent immutable identifier used in URL routing and invitation tokens.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              disabled={!canEdit}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF] disabled:opacity-50 resize-none"
            />
          </div>

          {canEdit && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}

          {/* Danger Zone: Delete Workspace */}
          {isOwner && (
            <div className="pt-5 border-t border-[#F87171]/20 mt-6 space-y-3">
              <div className="flex items-center gap-2 text-[#F87171] font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Danger Zone</span>
              </div>
              <p className="text-[11px] text-[#9AA8BD]">
                Deleting this workspace will permanently destroy all its projects, tasks, comments, and member associations.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/30 text-xs font-semibold text-[#F87171] transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Workspace</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 space-y-3">
                  <p className="text-xs text-[#F3F6FC]">
                    Type <strong className="text-white font-mono">{workspace.name}</strong> to confirm:
                  </p>
                  <input
                    type="text"
                    value={confirmName}
                    onChange={e => setConfirmName(e.target.value)}
                    placeholder="Enter workspace name"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-[#F87171]/50 text-white focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={confirmName !== workspace.name}
                      onClick={handleDelete}
                      className="px-3 py-1.5 rounded-lg bg-[#F87171] hover:bg-[#F87171]/90 text-white font-semibold disabled:opacity-40 transition-colors"
                    >
                      Permanently Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#1C2638] text-[#9AA8BD] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
