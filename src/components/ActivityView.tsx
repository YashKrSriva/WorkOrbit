import React, { useState, useEffect } from 'react';
import {
  Activity as ActivityIcon,
  CheckCircle2,
  FolderGit2,
  MessageSquare,
  UserPlus,
  RefreshCw,
  Search
} from 'lucide-react';
import { ActivityLog } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface ActivityViewProps {
  workspaceId: string;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ workspaceId }) => {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await api.getActivities(workspaceId);
      setActivities(data);
    } catch (err: any) {
      showToast('Failed to load audit logs', 'error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [workspaceId]);

  const filtered = activities.filter(a => {
    if (filterType !== 'all' && a.entityType !== filterType) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Workspace Activity & Audit Logs</span>
            <span className="text-xs font-mono font-normal text-[#9AA8BD] px-2 py-0.5 rounded bg-[#151C2C] border border-[#1E283D]">
              {activities.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8BD] mt-0.5">
            Cryptographically timestamped action trail for compliance and team transparency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#151C2C] border border-[#1E283D] text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
          >
            <option value="all">All Actions</option>
            <option value="task">Tasks</option>
            <option value="project">Projects</option>
            <option value="member">Members</option>
            <option value="invitation">Invitations</option>
            <option value="workspace">Workspace</option>
          </select>

          <button
            onClick={fetchActivities}
            className="p-2 rounded-lg bg-[#151C2C] hover:bg-[#1C2638] border border-[#1E283D] text-[#9AA8BD] hover:text-white transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl bg-[#151C2C] border border-[#1E283D] p-5">
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#9AA8BD]">
              No activity logs recorded matching this filter.
            </div>
          ) : (
            filtered.map((act, index) => (
              <div key={act.id} className="flex items-start gap-3.5 group">
                <img
                  src={act.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={act.userName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-[#1E283D]"
                />

                <div className="flex-1 min-w-0 bg-[#0B0F19]/40 group-hover:bg-[#1C2638]/50 p-3 rounded-lg border border-[#1E283D]/60 transition-colors">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-white">{act.userName}</span>{' '}
                      <span className="text-[#9AA8BD]">{act.action}</span>{' '}
                      <span className="font-medium text-[#4F8CFF]">"{act.entityName}"</span>
                    </div>

                    <span className="text-[10px] text-[#6B7A94] shrink-0 font-mono">
                      {new Date(act.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[10px] text-[#6B7A94]">
                    <span className="uppercase tracking-wider font-semibold text-[#8B5CF6]">
                      {act.entityType}
                    </span>
                    <span>·</span>
                    <span>Action ID: {act.id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
