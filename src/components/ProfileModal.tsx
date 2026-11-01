import React, { useState } from 'react';
import { X, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import { User } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUserUpdated: (user: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onClose,
  onUserUpdated
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState(user.name);
  const [jobTitle, setJobTitle] = useState(user.jobTitle || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        jobTitle: jobTitle.trim(),
        avatarUrl: avatarUrl.trim()
      });
      onUserUpdated(updated);
      showToast('Profile updated', 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to update profile', 'error', err.message);
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
            <UserIcon className="w-4 h-4 text-[#4F8CFF]" />
            <h2 className="text-sm font-semibold text-white">Profile & Preferences</h2>
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
          <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0B0F19] border border-[#1E283D]">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#4F8CFF]"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{name}</div>
              <div className="text-[11px] text-[#9AA8BD] truncate">{user.email}</div>
              <div className="text-[10px] text-[#34D399] mt-0.5 font-medium">Session Active</div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Job Title / Discipline
            </label>
            <input
              type="text"
              placeholder="e.g. Staff Infrastructure Engineer"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
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
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
