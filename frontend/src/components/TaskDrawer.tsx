'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  X,
  Paperclip,
  Send,
  MessageSquare,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import {
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpdateTaskMutation,
} from '@/redux/api/taskApi';

interface TaskDrawerProps {
  task: any;
  onClose: () => void;
}

export default function TaskDrawer({ task, onClose }: TaskDrawerProps) {
  const auth = useSelector((state: RootState) => state.auth);
  const [commentText, setCommentText] = useState('');

  const { data: commentsRes, refetch: refetchComments } = useGetCommentsQuery(
    task?._id,
    { skip: !task?._id }
  ) as any;
  
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [updateTask] = useUpdateTaskMutation();

  const comments = commentsRes?.data || [];

  // Socket IO for live comments
  useEffect(() => {
    if (!task) return;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

    socket.emit('join-project', task.project?._id);

    socket.on('new-comment', ({ taskId }) => {
      if (task._id === taskId) {
        refetchComments();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [task, refetchComments]);

  if (!task) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment({
        task: task._id,
        text: commentText,
        userName: auth.user?.name || 'User',
      }).unwrap();
      setCommentText('');
      refetchComments();
      toast.success('Comment added!');
    } catch (err: any) {
      toast.error('Failed to add comment');
    }
  };

  const handleSubtaskToggle = async (subId: string, isChecked: boolean) => {
    const updatedSubtasks = task.subtasks.map((s: any) =>
      s._id === subId ? { ...s, isCompleted: isChecked } : s
    );
    try {
      await updateTask({
        id: task._id,
        subtasks: updatedSubtasks,
        userName: auth.user?.name || 'User',
      }).unwrap();
      toast.success('Subtask status updated!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update subtask');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-white/40 dark:border-slate-800/30 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-250">
      
      <div className="overflow-y-auto flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[280px]">
              {task.title}
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {task.project?.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Task Details */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Task Description</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {task.description || 'No description was provided.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <h5 className="font-semibold text-slate-400 uppercase mb-1">Assignee</h5>
              <p className="font-medium">{task.assignedTo?.name || 'Unassigned'}</p>
            </div>
            <div>
              <h5 className="font-semibold text-slate-400 uppercase mb-1">Due Date</h5>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Checklist / Subtasks */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Subtasks Checklist</span>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                {task.subtasks?.filter((s: any) => s.isCompleted).length || 0} / {task.subtasks?.length || 0}
              </span>
            </h4>
            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1">
              {(!task.subtasks || task.subtasks.length === 0) ? (
                <p className="text-xs text-slate-400">No subtasks created.</p>
              ) : (
                task.subtasks.map((sub: any) => (
                  <label
                    key={sub._id}
                    className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 p-1.5 rounded cursor-pointer border border-slate-100/50 dark:border-slate-800/40 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={sub.isCompleted}
                      disabled={auth.user?.role === 'Team Member' && task.assignedTo?._id !== auth.user?._id && task.assignedTo !== auth.user?._id}
                      onChange={(e) => handleSubtaskToggle(sub._id, e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={sub.isCompleted ? 'line-through text-slate-400' : ''}>
                      {sub.title}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5 text-indigo-500" /> Attachments
              </h4>
              <div className="space-y-1">
                {task.attachments.map((link: string, idx: number) => (
                  <a
                    key={idx}
                    href={link.startsWith('http') ? link : `https://${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 truncate font-semibold"
                  >
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                    <span>{link.split('/').pop()}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Discussion Feed */}
        <div className="p-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Task Discussion Feed</h4>
          <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No comments yet. Start the conversation!
              </div>
            ) : (
              comments.map((comment: any) => (
                <div key={comment._id} className="text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-200">{comment.userName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Discussion Input */}
      <form onSubmit={handleAddComment} className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="relative">
          <input
            type="text"
            placeholder="Share a message or update..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full pl-4 pr-12 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={isAddingComment}
            className="absolute right-2.5 top-2 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>

    </div>
  );
}
