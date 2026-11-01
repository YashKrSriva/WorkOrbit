import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Activity,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Server,
  FileJson,
  Layers
} from 'lucide-react';
import { api } from '../api';
import { useToast } from './Toast';

interface DevInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDataSuccess: () => void;
}

export const DevInspectorModal: React.FC<DevInspectorModalProps> = ({
  isOpen,
  onClose,
  onResetDataSuccess
}) => {
  const { showToast } = useToast();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [resetting, setResetting] = useState(false);

  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await api.checkHealth();
      setHealthStatus(data);
    } catch (err: any) {
      setHealthStatus({ status: 'error', error: err.message });
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResetData = async () => {
    if (!confirm('Reset local database to initial test seed data?')) return;
    setResetting(true);
    try {
      const res = await api.resetDevData();
      showToast('Database reset to initial demo state', 'success');
      onResetDataSuccess();
      onClose();
    } catch (err: any) {
      showToast('Failed to reset data', 'error', err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#151C2C] border border-[#1E283D] shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#1E283D] flex items-center justify-between bg-[#101625]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#34D399]" />
            <h2 className="text-sm font-semibold text-white">System Diagnostics & Database Engine</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#9AA8BD] hover:text-white p-1 rounded-lg hover:bg-[#1C2638] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Health Status */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1E283D] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-[#4F8CFF]" />
                <span>Backend Health Check (/api/health)</span>
              </span>
              <button
                onClick={checkHealth}
                className="text-[#4F8CFF] hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingHealth ? 'animate-spin' : ''}`} />
                <span>Ping</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-[#151C2C] text-[#34D399] font-mono text-[11px] overflow-x-auto border border-[#1E283D]">
              {JSON.stringify(healthStatus || { status: 'pinging...' }, null, 2)}
            </pre>
          </div>

          {/* Architecture Information */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#6B7A94] uppercase tracking-wider block">
              Architectural Specifications
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-[#0B0F19]/60 border border-[#1E283D]">
                <div className="text-[10px] text-[#9AA8BD]">API Standard</div>
                <div className="font-semibold text-white mt-0.5">RESTful JSON (FastAPI spec)</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0B0F19]/60 border border-[#1E283D]">
                <div className="text-[10px] text-[#9AA8BD]">Storage Persistence</div>
                <div className="font-semibold text-white mt-0.5">File-backed DB (Data folder)</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0B0F19]/60 border border-[#1E283D]">
                <div className="text-[10px] text-[#9AA8BD]">Session Auth</div>
                <div className="font-semibold text-white mt-0.5">Bearer Token + SHA-256</div>
              </div>
              <div className="p-3 rounded-lg bg-[#0B0F19]/60 border border-[#1E283D]">
                <div className="text-[10px] text-[#9AA8BD]">Role Enforcement</div>
                <div className="font-semibold text-white mt-0.5">Server-side RBAC Matrix</div>
              </div>
            </div>
          </div>

          {/* Reset Database */}
          <div className="p-4 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/30 space-y-2">
            <div className="flex items-center gap-2 text-[#FBBF24] font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Reset Database to Pristine Seed State</span>
            </div>
            <p className="text-[11px] text-[#9AA8BD] leading-relaxed">
              Resets all users, sample projects, Kanban tasks, comments, and invitations back to the default demo seed state.
            </p>
            <button
              onClick={handleResetData}
              disabled={resetting}
              className="px-3.5 py-1.5 rounded-lg bg-[#FBBF24] hover:bg-[#FBBF24]/90 text-black font-semibold transition-colors disabled:opacity-50"
            >
              {resetting ? 'Resetting...' : 'Reset Database Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
