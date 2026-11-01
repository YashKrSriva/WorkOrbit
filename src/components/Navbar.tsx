import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Plus,
  Settings,
  LogOut,
  User as UserIcon,
  Check,
  CheckCheck,
  Orbit,
  Users,
  ShieldAlert,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { User, Workspace, NotificationItem, WorkspaceRole } from '../types';
import { api } from '../api';
import { useToast } from './Toast';

interface NavbarProps {
  user: User;
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  onSelectWorkspace: (ws: Workspace) => void;
  onOpenCreateWorkspace: () => void;
  onOpenWorkspaceSettings: () => void;
  onOpenProfile: () => void;
  onOpenCommandPalette: () => void;
  onOpenDevInspector: () => void;
  onLogout: () => void;
  onQuickSwitchUser: (email: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentWorkspace,
  workspaces,
  onSelectWorkspace,
  onOpenCreateWorkspace,
  onOpenWorkspaceSettings,
  onOpenProfile,
  onOpenCommandPalette,
  onOpenDevInspector,
  onLogout,
  onQuickSwitchUser
}) => {
  const { showToast } = useToast();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const wsRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Determine current user's role in this workspace
  const currentMember = currentWorkspace?.members.find(m => m.userId === user.id);
  const userRole: WorkspaceRole = currentMember ? currentMember.role : 'Member';

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [user.id, currentWorkspace?.id]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wsRef.current && !wsRef.current.contains(event.target as Node)) {
        setShowWorkspaceMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleSwitcher(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleClearAllNotifs = async () => {
    try {
      await api.clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
      showToast('Notifications cleared', 'info');
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-14 border-b border-[#1E283D] bg-[#101625]/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Brand & Workspace Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 mr-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#4F8CFF]/20 text-white font-bold">
            <Orbit className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-white text-base leading-none flex items-center gap-1.5">
              WorkOrbit
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#9AA8BD] font-medium leading-none mt-1">
              Enterprise Hub
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-[#1E283D]" />

        {/* Workspace Dropdown */}
        <div className="relative" ref={wsRef}>
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#151C2C] hover:bg-[#1C2638] border border-[#1E283D] text-sm text-[#F3F6FC] transition-colors group"
          >
            <span className="text-base leading-none">{currentWorkspace?.avatar || '🪐'}</span>
            <span className="font-medium text-xs sm:text-sm max-w-[140px] truncate">
              {currentWorkspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#9AA8BD] group-hover:text-white transition-transform" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#151C2C] border border-[#1E283D] shadow-2xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9AA8BD]">
                Workspaces ({workspaces.length})
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace(ws);
                      setShowWorkspaceMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#1C2638] transition-colors ${
                      ws.id === currentWorkspace?.id ? 'text-[#4F8CFF] font-medium bg-[#1C2638]/50' : 'text-[#F3F6FC]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{ws.avatar}</span>
                      <div className="truncate">
                        <div className="truncate text-xs font-medium">{ws.name}</div>
                        <div className="text-[10px] text-[#9AA8BD]">{ws.members.length} members</div>
                      </div>
                    </div>
                    {ws.id === currentWorkspace?.id && <Check className="w-4 h-4 text-[#4F8CFF] shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="h-px bg-[#1E283D] my-1" />

              <button
                onClick={() => {
                  setShowWorkspaceMenu(false);
                  onOpenCreateWorkspace();
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-xs text-[#9AA8BD] hover:text-white hover:bg-[#1C2638] transition-colors"
              >
                <Plus className="w-4 h-4 text-[#4F8CFF]" />
                <span>Create New Workspace</span>
              </button>

              <button
                onClick={() => {
                  setShowWorkspaceMenu(false);
                  onOpenWorkspaceSettings();
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-xs text-[#9AA8BD] hover:text-white hover:bg-[#1C2638] transition-colors"
              >
                <Settings className="w-4 h-4 text-[#9AA8BD]" />
                <span>Workspace Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Quick Search Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#0B0F19] hover:bg-[#151C2C] border border-[#1E283D] text-[#9AA8BD] hover:text-[#F3F6FC] transition-all text-xs group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 group-hover:text-[#4F8CFF] transition-colors" />
            <span>Search projects, tasks, members...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-[#151C2C] border border-[#1E283D] text-[10px] text-[#9AA8BD] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-2">
        {/* Quick Role Tester Switcher (Crucial for RBAC testing!) */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#151C2C] hover:bg-[#1C2638] border border-[#1E283D] text-xs transition-colors"
            title="Switch demo user or test RBAC permissions"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="text-[#9AA8BD]">Role:</span>
            <span className="font-medium text-[#F3F6FC]">{userRole}</span>
            <ChevronDown className="w-3 h-3 text-[#9AA8BD]" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#151C2C] border border-[#1E283D] shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="px-2 py-1 text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider">
                Switch Test Persona (RBAC)
              </div>
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => {
                    onQuickSwitchUser('alex@workorbit.io');
                    setShowRoleSwitcher(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between hover:bg-[#1C2638] transition-colors ${
                    user.email === 'alex@workorbit.io' ? 'bg-[#1C2638] text-[#4F8CFF]' : 'text-[#F3F6FC]'
                  }`}
                >
                  <div>
                    <div className="font-medium">Alex Mercer</div>
                    <div className="text-[10px] text-[#9AA8BD]">Workspace Owner (Full Control)</div>
                  </div>
                  {user.email === 'alex@workorbit.io' && <Check className="w-4 h-4 text-[#4F8CFF]" />}
                </button>

                <button
                  onClick={() => {
                    onQuickSwitchUser('elena@workorbit.io');
                    setShowRoleSwitcher(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between hover:bg-[#1C2638] transition-colors ${
                    user.email === 'elena@workorbit.io' ? 'bg-[#1C2638] text-[#4F8CFF]' : 'text-[#F3F6FC]'
                  }`}
                >
                  <div>
                    <div className="font-medium">Elena Rostova</div>
                    <div className="text-[10px] text-[#9AA8BD]">Workspace Admin (Manage Projects)</div>
                  </div>
                  {user.email === 'elena@workorbit.io' && <Check className="w-4 h-4 text-[#4F8CFF]" />}
                </button>

                <button
                  onClick={() => {
                    onQuickSwitchUser('jordan@workorbit.io');
                    setShowRoleSwitcher(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center justify-between hover:bg-[#1C2638] transition-colors ${
                    user.email === 'jordan@workorbit.io' ? 'bg-[#1C2638] text-[#4F8CFF]' : 'text-[#F3F6FC]'
                  }`}
                >
                  <div>
                    <div className="font-medium">Jordan Chen</div>
                    <div className="text-[10px] text-[#9AA8BD]">Workspace Member (Assigned Tasks)</div>
                  </div>
                  {user.email === 'jordan@workorbit.io' && <Check className="w-4 h-4 text-[#4F8CFF]" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-[#9AA8BD] hover:text-[#F3F6FC] hover:bg-[#151C2C] border border-transparent hover:border-[#1E283D] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4F8CFF] ring-2 ring-[#101625]" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#151C2C] border border-[#1E283D] shadow-2xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E283D]">
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4F8CFF]/20 text-[#4F8CFF] font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAllNotifs}
                    className="text-[11px] text-[#9AA8BD] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Clear all</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#1E283D]/50 mt-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-[#9AA8BD] text-xs">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`py-2.5 px-1.5 flex items-start gap-2.5 transition-colors ${
                        !n.read ? 'bg-[#1C2638]/40 rounded-lg' : ''
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#4F8CFF]" />
                      <div className="flex-1">
                        <div className="font-medium text-white text-xs">{n.title}</div>
                        <div className="text-[#9AA8BD] text-[11px] mt-0.5 leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-[#6B7A94] mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {!n.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="text-[#9AA8BD] hover:text-[#34D399] p-1 rounded"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dev Inspector Trigger */}
        <button
          onClick={onOpenDevInspector}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#151C2C] hover:bg-[#1C2638] border border-[#1E283D] text-xs text-[#9AA8BD] hover:text-white transition-colors"
          title="Inspect API health & Local DB store"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#34D399]" />
          <span>System DB</span>
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-[#151C2C] border border-transparent hover:border-[#1E283D] transition-colors"
          >
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#4F8CFF]/30"
            />
            <span className="hidden xl:inline text-xs font-medium text-[#F3F6FC] max-w-[100px] truncate">
              {user.name}
            </span>
            <ChevronDown className="w-3 h-3 text-[#9AA8BD]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#151C2C] border border-[#1E283D] shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="px-2 py-2 border-b border-[#1E283D]">
                <div className="font-semibold text-white truncate">{user.name}</div>
                <div className="text-[11px] text-[#9AA8BD] truncate">{user.email}</div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#34D399]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                  <span>{user.jobTitle || 'Team Member'}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left px-2 py-1.5 flex items-center gap-2 text-[#9AA8BD] hover:text-white hover:bg-[#1C2638] rounded-md transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Profile & Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenWorkspaceSettings();
                  }}
                  className="w-full text-left px-2 py-1.5 flex items-center gap-2 text-[#9AA8BD] hover:text-white hover:bg-[#1C2638] rounded-md transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Workspace Settings</span>
                </button>
              </div>

              <div className="h-px bg-[#1E283D] my-1" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-2 py-1.5 flex items-center gap-2 text-[#F87171] hover:bg-[#F87171]/10 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
