'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
}

export default function DatePicker({ value, onChange, className = '' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date value or default to today
  const initialDate = value ? new Date(value) : new Date();
  const [displayYear, setDisplayYear] = useState(initialDate.getFullYear() || new Date().getFullYear());
  const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth() || new Date().getMonth());

  // Close calendar popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update display month/year when value changes from parent
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setDisplayYear(d.getFullYear());
        setDisplayMonth(d.getMonth());
      }
    }
  }, [value]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calculations for calendar grid
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayIndex = new Date(displayYear, displayMonth, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const formattedMonth = String(displayMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateString = `${displayYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === displayMonth &&
      today.getFullYear() === displayYear
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const current = new Date(value);
    return (
      current.getDate() === day &&
      current.getMonth() === displayMonth &&
      current.getFullYear() === displayYear
    );
  };

  // Format readable display value for trigger button
  const getDisplayValue = () => {
    if (!value) return 'Select Date';
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'Select Date';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300 text-left transition-all hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer shadow-sm"
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
          <span>{getDisplayValue()}</span>
        </span>
      </button>

      {/* Modern Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-72 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl shadow-slate-100/40 dark:shadow-none animate-in fade-in slide-in-from-top-1 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {monthNames[displayMonth]} {displayYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekdays.map((day) => (
              <span key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank offset tiles for calendar align */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-8 w-8" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const selected = isSelected(dayNum);
              const today = isToday(dayNum);

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  onClick={() => handleDateSelect(dayNum)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    selected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : today
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-850/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
