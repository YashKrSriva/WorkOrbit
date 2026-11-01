import React, { useState } from 'react';
import {
  Users,
  Shield,
  Trash2,
  UserPlus,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { WorkspaceMemberDetailed, WorkspaceRole } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface MembersViewProps {
  workspaceId: string;
  members: WorkspaceMemberDetailed[];
  currentUserId: string;
  userRole: WorkspaceRole;
  onRefreshMembers: () => void;
  onOpenInviteModal: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  workspaceId,
  members,
  currentUserId,
  userRole,
  onRefreshMembers,
  onOpenInviteModal
}) => {
  const { showToast } = useToast();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMemberDetailed | null>(null);

  const canManage = userRole === 'Owner' || userRole === 'Admin';
  const isOwner = userRole === 'Owner';

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    setUpdatingUserId(targetUserId);
    try {
      await api.updateMemberRole(workspaceId, targetUserId, newRole);
      showToast('Member role updated', 'success');
      onRefreshMembers();
    } catch (err: any) {
      showToast('Failed to update role', 'error', err.message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await api.removeMember(workspaceId, memberToRemove.userId);
      showToast(`${memberToRemove.name} removed from workspace`, 'info');
      setMemberToRemove(null);
      onRefreshMembers();
    } catch (err: any) {
      showToast('Failed to remove member', 'error', err.message);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Team Members</span>
            <span className="text-xs font-mono font-normal text-[#9AA8BD] px-2 py-0.5 rounded bg-[#151C2C] border border-[#1E283D]">
              {members.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8BD] mt-0.5">
            Manage workspace roles, privileges, and collaborator permissions.
          </p>
        </div>

        {canManage && (
          <button
            onClick={onOpenInviteModal}
            className="px-3.5 py-2 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Teammate</span>
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="rounded-xl bg-[#151C2C] border border-[#1E283D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#9AA8BD]">
            <thead className="bg-[#101625] text-[11px] font-semibold uppercase tracking-wider text-[#6B7A94] border-b border-[#1E283D]">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Job Title</th>
                <th className="px-5 py-3">Joined</th>
                {canManage && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E283D]/60">
              {members.map(member => {
                const isSelf = member.userId === currentUserId;
                const isMemberOwner = member.role === 'Owner';

                return (
                  <tr key={member.userId} className="hover:bg-[#1C2638]/50 transition-colors">
                    {/* Member Profile */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#1E283D]"
                        />
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#4F8CFF]/20 text-[#4F8CFF] font-medium">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#9AA8BD]">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      {isOwner && !isMemberOwner ? (
                        <select
                          disabled={updatingUserId === member.userId}
                          value={member.role}
                          onChange={e => handleRoleChange(member.userId, e.target.value)}
                          className="px-2 py-1 rounded bg-[#0B0F19] border border-[#1E283D] text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                          <option value="Owner">Transfer Owner</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                            member.role === 'Owner'
                              ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                              : member.role === 'Admin'
                              ? 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
                              : 'bg-[#9AA8BD]/20 text-[#9AA8BD]'
                          }`}
                        >
                          {member.role === 'Owner' && <ShieldAlert className="w-3 h-3" />}
                          {member.role === 'Admin' && <Shield className="w-3 h-3" />}
                          <span>{member.role}</span>
                        </span>
                      )}
                    </td>

                    {/* Job Title */}
                    <td className="px-5 py-3.5 text-[#F3F6FC]">{member.jobTitle || 'Team Member'}</td>

                    {/* Joined Date */}
                    <td className="px-5 py-3.5 text-[11px]">
                      {new Date(member.joinedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    {canManage && (
                      <td className="px-5 py-3.5 text-right">
                        {!isMemberOwner && !isSelf && (
                          <button
                            onClick={() => setMemberToRemove(member)}
                            className="p-1.5 rounded-lg text-[#9AA8BD] hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
                            title="Remove member from workspace"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      {memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#151C2C] border border-[#1E283D] p-5 shadow-2xl space-y-4 text-xs">
            <div className="w-10 h-10 rounded-full bg-[#F87171]/15 text-[#F87171] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Remove {memberToRemove.name}?</h3>
              <p className="text-xs text-[#9AA8BD] mt-1 leading-relaxed">
                This will revoke their access to all projects, tasks, and private assets in this workspace.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMemberToRemove(null)}
                className="px-3 py-1.5 rounded-lg bg-[#1C2638] text-[#F3F6FC] hover:bg-[#25334D] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                className="px-3.5 py-1.5 rounded-lg bg-[#F87171] hover:bg-[#F87171]/90 text-white font-semibold transition-colors"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
