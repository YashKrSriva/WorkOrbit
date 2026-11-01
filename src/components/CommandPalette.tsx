import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FolderGit2,
  CheckSquare,
  Users,
  LayoutDashboard,
  Calendar,
  X,
  ArrowRight
} from 'lucide-react';
import { Project, Task, WorkspaceMemberDetailed } from '../types';
import { ActiveTab } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  tasks: Task[];
  members: WorkspaceMemberDetailed[];
  onSelectTab: (tab: ActiveTab) => void;
  onSelectProject: (projectId: string) => void;
  onSelectTask: (task: Task) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  projects,
  tasks,
  members,
  onSelectTab,
  onSelectProject,
  onSelectTask
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keydown listener for Cmd+K / Ctrl+K & Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // toggle or open handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedProjects = projects.filter(
    p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );

  const matchedTasks = tasks.filter(
    t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
  );

  const matchedMembers = members.filter(
    m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-[#151C2C] border border-[#1E283D] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#1E283D] flex items-center gap-3 bg-[#101625]">
          <Search className="w-4 h-4 text-[#4F8CFF] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search anything in this workspace..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-[#6B7A94] focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[#0B0F19] border border-[#1E283D] text-[10px] text-[#9AA8BD] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-4 text-xs divide-y divide-[#1E283D]/40">
          {/* Quick Nav commands when query is empty or matches */}
          {(!query || 'overview kanban calendar projects members'.includes(q)) && (
            <div className="space-y-1 pt-1 first:pt-0">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-[#6B7A94] tracking-wider">
                Quick Navigation
              </div>
              <button
                onClick={() => {
                  onSelectTab('overview');
                  onClose();
                }}
                className="w-full px-3 py-2 rounded-lg hover:bg-[#1C2638] text-left flex items-center justify-between text-[#F3F6FC] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-[#4F8CFF]" />
                  <span>Go to Dashboard Overview</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#6B7A94]" />
              </button>

              <button
                onClick={() => {
                  onSelectTab('kanban');
                  onClose();
                }}
                className="w-full px-3 py-2 rounded-lg hover:bg-[#1C2638] text-left flex items-center justify-between text-[#F3F6FC] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Go to Kanban Workflow Board</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#6B7A94]" />
              </button>

              <button
                onClick={() => {
                  onSelectTab('calendar');
                  onClose();
                }}
                className="w-full px-3 py-2 rounded-lg hover:bg-[#1C2638] text-left flex items-center justify-between text-[#F3F6FC] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#34D399]" />
                  <span>Go to Calendar & Deadlines</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#6B7A94]" />
              </button>
            </div>
          )}

          {/* Matched Projects */}
          {matchedProjects.length > 0 && (
            <div className="space-y-1 pt-2">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-[#6B7A94] tracking-wider">
                Projects ({matchedProjects.length})
              </div>
              {matchedProjects.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    onSelectTab('kanban');
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-[#1C2638] text-left flex items-center justify-between text-[#F3F6FC] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color || '#4F8CFF' }} />
                    <div className="truncate">
                      <div className="font-semibold text-white group-hover:text-[#4F8CFF] truncate">{p.name}</div>
                      <div className="text-[11px] text-[#9AA8BD] truncate">{p.description}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#9AA8BD] shrink-0">{p.status}</span>
                </button>
              ))}
            </div>
          )}

          {/* Matched Tasks */}
          {matchedTasks.length > 0 && (
            <div className="space-y-1 pt-2">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-[#6B7A94] tracking-wider">
                Tasks ({matchedTasks.length})
              </div>
              {matchedTasks.slice(0, 6).map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectTask(t);
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-[#1C2638] text-left flex items-center justify-between text-[#F3F6FC] transition-colors group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-white group-hover:text-[#4F8CFF] truncate">{t.title}</div>
                    <div className="text-[11px] text-[#9AA8BD] flex items-center gap-2 mt-0.5">
                      <span>{t.projectName}</span>
                      <span>·</span>
                      <span>{t.status}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                      t.priority === 'Urgent'
                        ? 'bg-[#F87171]/20 text-[#F87171]'
                        : t.priority === 'High'
                        ? 'bg-[#FBBF24]/20 text-[#FBBF24]'
                        : 'bg-[#4F8CFF]/20 text-[#4F8CFF]'
                    }`}
                  >
                    {t.priority}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Matched Members */}
          {matchedMembers.length > 0 && (
            <div className="space-y-1 pt-2">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-[#6B7A94] tracking-wider">
                Team Members ({matchedMembers.length})
              </div>
              {matchedMembers.slice(0, 3).map(m => (
                <button
                  key={m.userId}
                  onClick={() => {
                    onSelectTab('members');
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-lg hover:bg-[#1C2638] text-left flex items-center justify-between text-[#F3F6FC] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={m.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-white">{m.name}</div>
                      <div className="text-[10px] text-[#9AA8BD]">{m.email}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#4F8CFF]">{m.role}</span>
                </button>
              ))}
            </div>
          )}

          {query && matchedProjects.length === 0 && matchedTasks.length === 0 && matchedMembers.length === 0 && (
            <div className="py-8 text-center text-[#9AA8BD]">
              No matches found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
