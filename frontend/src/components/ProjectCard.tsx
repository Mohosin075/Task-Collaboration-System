'use client';

import React from 'react';
import { Calendar, Users, Pencil, Trash2 } from 'lucide-react';
import Avatar from './Avatar';

interface ProjectCardProps {
  project: any;
  isAuthorized: boolean;
  onEditClick: (project: any) => void;
  onDeleteClick: (id: string) => void;
}

export default function ProjectCard({
  project,
  isAuthorized,
  onEditClick,
  onDeleteClick,
}: ProjectCardProps) {
  const totalTasks = project.totalTasks || 0;
  const completedTasks = project.completedTasks || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              project.status === 'Active'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                : project.status === 'Completed'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
            }`}
          >
            {project.status}
          </span>
          
          {/* Action buttons (only for Admin/PM) */}
          {isAuthorized && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditClick(project)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDeleteClick(project._id)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{project.name}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-3 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/80 mt-6 pt-4 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Completion Progress:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {completedTasks}/{totalTasks} Tasks ({progressPercent}%)
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Deadline view */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>Deadline:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {new Date(project.deadline).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Members populated avatars */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Team:</span>
          <div className="flex -space-x-1.5 overflow-hidden">
            {project.members && project.members.length > 0 ? (
              project.members.map((member: any) => (
                <Avatar
                  key={member._id}
                  name={member.name}
                  size="sm"
                  className="ring-2 ring-white dark:ring-slate-900"
                />
              ))
            ) : (
              <span className="text-xs text-slate-400">No members assigned</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
