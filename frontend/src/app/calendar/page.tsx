'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useGetTasksQuery } from '@/redux/api/taskApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  User,
} from 'lucide-react';
import TaskDrawer from '@/components/TaskDrawer';

export default function CalendarPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTasks, setSelectedDayTasks] = useState<any[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const [activeTaskForComments, setActiveTaskForComments] = useState<any>(null);

  // Fetch tasks
  const { data: tasksRes, isLoading } = useGetTasksQuery({
    limit: 100,
  }) as any;

  const tasks = tasksRes?.data || [];

  // Keep activeTaskForComments in sync with latest tasks data
  useEffect(() => {
    if (activeTaskForComments && tasks.length > 0) {
      const updated = tasks.find((t: any) => t._id === activeTaskForComments._id);
      if (updated) {
        setActiveTaskForComments(updated);
      }
    }
  }, [tasks, activeTaskForComments?._id]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper to format Date to YYYY-MM-DD
  const formatDateKey = (yearNum: number, monthNum: number, dayNum: number) => {
    const mm = String(monthNum + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${yearNum}-${mm}-${dd}`;
  };

  // Calendar dates generation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const prevLastDay = new Date(year, month, 0).getDate();

  const daysArray: { day: number; currentMonth: boolean; dateStr: string }[] = [];

  // Previous month padding days
  for (let i = firstDayIndex; i > 0; i--) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dayVal = prevLastDay - i + 1;
    daysArray.push({
      day: dayVal,
      currentMonth: false,
      dateStr: formatDateKey(prevYear, prevMonth, dayVal),
    });
  }

  // Current month days
  for (let i = 1; i <= lastDay; i++) {
    daysArray.push({
      day: i,
      currentMonth: true,
      dateStr: formatDateKey(year, month, i),
    });
  }

  // Next month padding days to complete grid (total multiple of 7)
  const remaining = 42 - daysArray.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    daysArray.push({
      day: i,
      currentMonth: false,
      dateStr: formatDateKey(nextYear, nextMonth, i),
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getTasksForDate = (dateStr: string) => {
    return tasks.filter((task: any) => {
      const taskDateStr = new Date(task.dueDate).toISOString().substring(0, 10);
      return taskDateStr === dateStr;
    });
  };

  const handleDayClick = (dateStr: string, dayTasks: any[]) => {
    setSelectedDateStr(dateStr);
    setSelectedDayTasks(dayTasks);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar Workspace</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track upcoming deadlines, project completions, and schedules.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/50 rounded-xl px-4 py-2 text-sm font-semibold">
            <CalendarIcon className="h-4.5 w-4.5 text-indigo-500 mr-1.5" />
            <span>{monthNames[month]} {year}</span>
          </div>
        </div>

        {/* Grid Calendar Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Main calendar grid wrapper */}
          <div className="xl:col-span-3 rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl space-y-6">
            
            {/* Nav Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {monthNames[month]} {year}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer text-slate-600 dark:text-slate-400 text-slate-650"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer text-slate-600 dark:text-slate-400 text-slate-650"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="space-y-2">
              
              {/* Day headers */}
              <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Day Cells */}
              {isLoading ? (
                <div className="text-center py-24 text-slate-500">Loading schedules...</div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {daysArray.map((cell, index) => {
                    const dayTasks = getTasksForDate(cell.dateStr);
                    const isSelected = selectedDateStr === cell.dateStr;
                    const isToday = new Date().toISOString().substring(0, 10) === cell.dateStr;

                    return (
                      <div
                        key={index}
                        onClick={() => handleDayClick(cell.dateStr, dayTasks)}
                        className={`min-h-[90px] rounded-xl border p-2 cursor-pointer transition-all flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-950/40 ${
                          cell.currentMonth
                            ? 'border-slate-100 dark:border-slate-800/30'
                            : 'border-slate-50 dark:border-slate-900/10 opacity-30'
                        } ${
                          isSelected
                            ? 'ring-2 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10'
                            : ''
                        } ${
                          isToday
                            ? 'bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-900/60'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${
                            isToday
                              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded-md'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {cell.day}
                          </span>
                          {dayTasks.length > 0 && (
                            <span className="text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
                              {dayTasks.length}
                            </span>
                          )}
                        </div>

                        {/* Miniature Preview of Tasks */}
                        <div className="space-y-1 mt-2">
                          {dayTasks.slice(0, 2).map((t: any) => (
                            <div
                              key={t._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTaskForComments(t);
                              }}
                              className="text-[9px] font-semibold truncate rounded px-1 py-0.5 leading-tight bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-l-2 border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                              title={t.title}
                            >
                              {t.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-[8px] text-slate-400 text-center font-bold">
                              + {dayTasks.length - 2} more
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

          {/* Sidebar drawer showing selected day's tasks */}
          <div className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              <span>Deadlines: {selectedDateStr ? new Date(selectedDateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Select Day'}</span>
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {!selectedDateStr ? (
                <p className="text-xs text-slate-400 text-center py-12">Click a day on the calendar grid to view scheduled deadlines.</p>
              ) : selectedDayTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500/80 mb-2" />
                  <p className="text-xs font-semibold">No deadlines due on this day.</p>
                </div>
              ) : (
                selectedDayTasks.map((task: any) => (
                  <div
                    key={task._id}
                    onClick={() => setActiveTaskForComments(task)}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-white/50 dark:bg-slate-950/20 space-y-3 cursor-pointer hover:border-indigo-500/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                        {task.project?.name || 'Project'}
                      </span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : task.status === 'In Progress'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{task.title}</h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100/50 dark:border-slate-800/20">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[100px]">{task.assignedTo?.name || 'Unassigned'}</span>
                      </span>
                      <span className={`h-2 w-2 rounded-full ${
                        task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} title={`${task.priority} Priority`} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Task Discussion Sidebar Drawer */}
        <TaskDrawer
          task={activeTaskForComments}
          onClose={() => setActiveTaskForComments(null)}
        />

      </div>
    </DashboardLayout>
  );
}
