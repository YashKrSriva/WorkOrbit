import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { Task, Project } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onOpenCreateTask: (defaultStatus?: any) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onOpenCreateTask
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  // Group tasks by dueDate (YYYY-MM-DD)
  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (!acc[t.dueDate]) acc[t.dueDate] = [];
    acc[t.dueDate].push(t);
    return acc;
  }, {});

  const daysCells = [];
  // Empty slots for days before start of month
  for (let i = 0; i < startDayOfWeek; i++) {
    daysCells.push(null);
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    daysCells.push({ day, dateStr: dStr, tasks: tasksByDate[dStr] || [] });
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Calendar & Deadlines</span>
            <span className="text-xs font-mono text-[#9AA8BD] px-2 py-0.5 rounded bg-[#151C2C] border border-[#1E283D]">
              {monthNames[month]} {year}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA8BD] mt-0.5">
            Visualize release cutoffs, sprint checkpoints, and scheduled milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={todayMonth}
            className="px-3 py-1.5 rounded-lg bg-[#151C2C] hover:bg-[#1C2638] border border-[#1E283D] text-xs font-medium text-white transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg bg-[#151C2C] border border-[#1E283D]">
            <button
              onClick={prevMonth}
              className="p-1.5 text-[#9AA8BD] hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-medium text-white">
              {monthNames[month].slice(0, 3)}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-[#9AA8BD] hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl bg-[#151C2C] border border-[#1E283D] flex-1 flex flex-col overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#1E283D] bg-[#101625] text-center py-2 text-[11px] font-semibold uppercase tracking-wider text-[#6B7A94]">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-[#1E283D]/60 overflow-y-auto">
          {daysCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty_${idx}`} className="bg-[#0B0F19]/40 min-h-[90px]" />;
            }

            const isToday = cell.dateStr === todayStr;

            return (
              <div
                key={cell.dateStr}
                className={`p-2 flex flex-col justify-between min-h-[90px] transition-colors hover:bg-[#1C2638]/40 ${
                  isToday ? 'bg-[#4F8CFF]/5 ring-1 ring-inset ring-[#4F8CFF]/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      isToday ? 'bg-[#4F8CFF] text-white' : 'text-[#9AA8BD]'
                    }`}
                  >
                    {cell.day}
                  </span>
                  {cell.tasks.length > 0 && (
                    <span className="text-[10px] text-[#6B7A94] font-mono">
                      {cell.tasks.length} task{cell.tasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1.5 overflow-y-auto max-h-24">
                  {cell.tasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="p-1 rounded bg-[#0B0F19] hover:bg-[#1C2638] border border-[#1E283D] text-[10px] font-medium text-white truncate cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: t.projectColor || '#4F8CFF' }}
                      />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
