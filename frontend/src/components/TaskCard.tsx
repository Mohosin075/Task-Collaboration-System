'use client';

import React from 'react';
import { Calendar, MessageSquare, Paperclip, Edit2, Trash2 } from 'lucide-react';
import Avatar from './Avatar';

interface TaskCardProps {
  task: any;
  currentUserId: string;
  isAuthorized: boolean;
  onClick: () => void;
  onStatusChange: (task: any, newStatus: string) => void;
  onEditClick?: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
  onClaimClick?: (e: React.MouseEvent) => void;
}

export default function TaskCard({
  task,
  currentUserId,
  isAuthorized,
  onClick,
  onStatusChange,
  onEditClick,
  onDeleteClick,
  onClaimClick,
}: TaskCardProps) {
  const isAssignedToCurrentUser = task.assignedTo?._id === currentUserId;

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      <div>
        {/* Header: Project name, Action triggers */}
        <div className="flex items-center justify-between mb-3" onClick={(e) => e.stopPropagation()}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
            {task.project?.name || 'Project'}
          </span>
          
          <div className="flex items-center gap-2">
            {/* Status Select switcher */}
            <select
              value={task.status}
              disabled={!isAuthorized && !isAssignedToCurrentUser}
              onChange={(e) => onStatusChange(task, e.target.value)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                !isAuthorized && !isAssignedToCurrentUser
                  ? 'opacity-65 cursor-not-allowed bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                  : 'cursor-pointer ' + (
                    task.status === 'Todo'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/50'
                      : task.status === 'In Progress'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/50'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/50'
                  )
              }`}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            {isAuthorized && (
              <div className="flex items-center gap-1">
                <button
                  onClick={onEditClick}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onDeleteClick}
                  className="p-1 text-rose-400 hover:text-rose-650 rounded cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
          {task.title}
        </h4>

        {/* Description */}
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
          {task.description || 'No description provided.'}
        </p>
      </div>

      {/* Progress Bar for checklist */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-4 pt-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-semibold">
            <span>Subtasks checklist progress</span>
            <span>
              {task.subtasks.filter((s: any) => s.isCompleted).length} / {task.subtasks.length}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{
                width: `${(task.subtasks.filter((s: any) => s.isCompleted).length / task.subtasks.length) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 dark:border-slate-800/80 mt-6 pt-4 space-y-3">
        
        {/* Priority, Due Date indicators */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${
              task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span className="font-semibold">{task.priority} Priority</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium">
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Assigned User avatar row */}
        <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/40 pt-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar name={task.assignedTo?.name || 'Unassigned'} size="sm" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[100px]">
              {isAssignedToCurrentUser ? 'Assigned to You' : task.assignedTo?.name || 'Unassigned'}
            </span>
            {!isAssignedToCurrentUser && onClaimClick && (
              <button
                onClick={onClaimClick}
                className="px-2 py-0.5 text-[9px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-200/50 dark:border-indigo-800/50 cursor-pointer font-bold transition-all shrink-0"
              >
                Claim
              </button>
            )}
          </div>

          {/* Attachments & Comments counter */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1" title={`${task.attachments.length} attachment(s)`}>
                <Paperclip className="h-3.5 w-3.5 text-indigo-500" />
                <span>{task.attachments.length}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Discuss ({task.commentCount || 0})</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

interface TaskKanbanCardProps {
  task: any;
  currentUserId: string;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export function TaskKanbanCard({ task, currentUserId, onClick, onDragStart }: TaskKanbanCardProps) {
  const isAssignedToCurrentUser = task.assignedTo?._id === currentUserId;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      onClick={onClick}
      className="group relative rounded-xl border border-white/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 shadow hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
          {task.project?.name || 'Project'}
        </span>
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${
          task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
        }`} title={`${task.priority} Priority`} />
      </div>
      <div>
        <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug truncate">
          {task.title}
        </h5>
        {task.description && (
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>
      
      {/* Progress Bar for checklist */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1 font-semibold">
            <span>Subtasks</span>
            <span>
              {task.subtasks.filter((s: any) => s.isCompleted).length} / {task.subtasks.length}
            </span>
          </div>
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{
                width: `${(task.subtasks.filter((s: any) => s.isCompleted).length / task.subtasks.length) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100/50 dark:border-slate-800/20 pt-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar name={task.assignedTo?.name || 'Unassigned'} size="xs" />
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[80px]">
            {isAssignedToCurrentUser ? 'You' : task.assignedTo?.name || 'Unassigned'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
          {task.attachments && task.attachments.length > 0 && (
            <Paperclip className="h-3 w-3 text-indigo-500" />
          )}
          <div className="flex items-center gap-0.5">
            <MessageSquare className="h-3 w-3" />
            <span>{task.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
