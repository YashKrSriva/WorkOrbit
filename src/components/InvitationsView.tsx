import React, { useState, useEffect } from 'react';
import {
  Mail,
  Copy,
  Check,
  UserPlus,
  Clock,
  Shield,
  Ban,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { WorkspaceInvitation, WorkspaceRole } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface InvitationsViewProps {
  workspaceId: string;
  workspaceName: string;
  userRole: WorkspaceRole;
}

export const InvitationsView: React.FC<InvitationsViewProps> = ({
  workspaceId,
  workspaceName,
  userRole
}) => {
  const { showToast } = useToast();
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<WorkspaceRole>('Member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canInvite = userRole === 'Owner' || userRole === 'Admin';

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const data = await api.getInvitations(workspaceId);
      setInvitations(data);
    } catch (err: any) {
      showToast('Failed to load invitations', 'error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [workspaceId]);

  const handleCreateInvitation = async (isLinkOnly = false) => {
    if (!isLinkOnly && !emailInput.trim()) {
      showToast('Please enter an invitee email', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newInv = await api.createInvitation(
        workspaceId,
        isLinkOnly ? undefined : emailInput.trim(),
        roleInput
      );
      setInvitations(prev => [newInv, ...prev]);
      setEmailInput('');
      showToast(
        isLinkOnly ? 'Shareable invitation link generated' : `Invitation sent to ${newInv.email}`,
        'success'
      );
    } catch (err: any) {
      showToast('Failed to generate invitation', 'error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.revokeInvitation(id);
      setInvitations(prev => prev.map(i => i.id === id ? { ...i, status: 'Revoked' } : i));
      showToast('Invitation revoked', 'info');
    } catch (err: any) {
      showToast('Failed to revoke invitation', 'error', err.message);
    }
  };

  const handleCopyLink = (token: string, id: string) => {
    const inviteUrl = `${window.location.origin}?inviteToken=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(id);
    showToast('Invitation link copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Workspace Invitations</span>
            <span className="text-xs font-mono font-normal text-[#9AA8BD] px-2 py-0.5 rounded bg-[#151C2C] border border-[#1E283D]">
              {invitations.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8BD] mt-0.5">
            Issue single-use cryptographic tokens via direct email or shareable join links.
          </p>
        </div>

        <button
          onClick={fetchInvitations}
          className="p-2 rounded-lg bg-[#151C2C] hover:bg-[#1C2638] border border-[#1E283D] text-[#9AA8BD] hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Invitation Generator Panel (Owner & Admin only) */}
      {canInvite && (
        <div className="p-5 rounded-xl bg-[#151C2C] border border-[#1E283D] space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#4F8CFF]" />
              <span>Invite New Teammate</span>
            </h2>
            <p className="text-xs text-[#9AA8BD] mt-0.5">
              Send an invite to their inbox or generate an instant one-click onboarding link.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="flex-1 relative">
              <Mail className="w-3.5 h-3.5 text-[#9AA8BD] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="colleague@company.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-xs text-white placeholder-[#6B7A94] focus:outline-none focus:border-[#4F8CFF]"
              />
            </div>

            <div className="w-full sm:w-36">
              <select
                value={roleInput}
                onChange={e => setRoleInput(e.target.value as WorkspaceRole)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#1E283D] text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <button
              onClick={() => handleCreateInvitation(false)}
              disabled={isSubmitting || !emailInput.trim()}
              className="px-4 py-2 rounded-lg bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-xs font-semibold text-white shadow-lg shadow-[#4F8CFF]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>

            <button
              onClick={() => handleCreateInvitation(true)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#1C2638] hover:bg-[#25334D] border border-[#1E283D] text-xs font-semibold text-[#F3F6FC] transition-colors flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Create Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Invitations List */}
      <div className="rounded-xl bg-[#151C2C] border border-[#1E283D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#9AA8BD]">
            <thead className="bg-[#101625] text-[11px] font-semibold uppercase tracking-wider text-[#6B7A94] border-b border-[#1E283D]">
              <tr>
                <th className="px-5 py-3">Recipient / Token</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Invited By</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E283D]/60">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#9AA8BD]">
                    No invitations generated yet.
                  </td>
                </tr>
              ) : (
                invitations.map(inv => {
                  const isPending = inv.status === 'Pending';
                  const isCopied = copiedId === inv.id;

                  return (
                    <tr key={inv.id} className="hover:bg-[#1C2638]/50 transition-colors">
                      {/* Recipient */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-white">{inv.email}</div>
                        <div className="text-[10px] font-mono text-[#6B7A94] mt-0.5 truncate max-w-xs">
                          {inv.token}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            inv.role === 'Admin'
                              ? 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
                              : 'bg-[#9AA8BD]/20 text-[#9AA8BD]'
                          }`}
                        >
                          {inv.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            inv.status === 'Accepted'
                              ? 'bg-[#34D399]/20 text-[#34D399]'
                              : inv.status === 'Pending'
                              ? 'bg-[#FBBF24]/20 text-[#FBBF24]'
                              : 'bg-[#F87171]/20 text-[#F87171]'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>

                      {/* Invited By */}
                      <td className="px-5 py-3.5 text-[#F3F6FC]">{inv.invitedByName}</td>

                      {/* Expires */}
                      <td className="px-5 py-3.5 text-[11px]">
                        {new Date(inv.expiresAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleCopyLink(inv.token, inv.id)}
                              className="px-2.5 py-1 rounded bg-[#0B0F19] hover:bg-[#1C2638] border border-[#1E283D] text-[11px] text-white inline-flex items-center gap-1 transition-colors"
                              title="Copy join link"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3 text-[#4F8CFF]" />}
                              <span>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>

                            {canInvite && (
                              <button
                                onClick={() => handleRevoke(inv.id)}
                                className="px-2.5 py-1 rounded bg-[#F87171]/10 hover:bg-[#F87171]/20 text-[11px] text-[#F87171] inline-flex items-center gap-1 transition-colors"
                                title="Revoke invitation"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Revoke</span>
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
