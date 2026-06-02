'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { X, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import DatePicker from '@/components/DatePicker';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/redux/api/taskApi';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: any;
  projects: any[];
  team: any[];
}

export default function TaskModal({ isOpen, onClose, editingTask, projects, team }: TaskModalProps) {
  const auth = useSelector((state: RootState) => state.auth);
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  // Form states
  const [projectInput, setProjectInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [assigneeInput, setAssigneeInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [priorityInput, setPriorityInput] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [statusInput, setStatusInput] = useState<'Todo' | 'In Progress' | 'Completed'>('Todo');
  const [attachmentInput, setAttachmentInput] = useState('');
  const [subtasksInput, setSubtasksInput] = useState<{ title: string; isCompleted: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Sync inputs on open/editTask changes
  useEffect(() => {
    if (editingTask) {
      setProjectInput(editingTask.project?._id || '');
      setTitleInput(editingTask.title || '');
      setDescInput(editingTask.description || '');
      setAssigneeInput(editingTask.assignedTo?._id || '');
      setDueDateInput(editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().substring(0, 10) : '');
      setPriorityInput(editingTask.priority || 'Medium');
      setStatusInput(editingTask.status || 'Todo');
      setAttachmentInput(editingTask.attachments?.[0] || '');
      setSubtasksInput(editingTask.subtasks || []);
      setNewSubtaskTitle('');
    } else {
      setProjectInput(projects?.[0]?._id || '');
      setTitleInput('');
      setDescInput('');
      setAssigneeInput(team?.[0]?._id || '');
      setDueDateInput('');
      setPriorityInput('Medium');
      setStatusInput('Todo');
      setAttachmentInput('');
      setSubtasksInput([]);
      setNewSubtaskTitle('');
    }
  }, [editingTask, isOpen, projects, team]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsFileUploading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success && data.url) {
        setAttachmentInput(data.url);
        toast.success(`File "${file.name}" uploaded successfully!`);
      } else {
        toast.error(data.message || 'File upload failed!');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to connect to the upload server.');
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput || !dueDateInput) {
      return toast.warning('Please enter title and due date!');
    }

    try {
      if (editingTask) {
        await updateTask({
          id: editingTask._id,
          project: projectInput,
          title: titleInput,
          description: descInput,
          assignedTo: assigneeInput,
          dueDate: dueDateInput,
          priority: priorityInput,
          status: statusInput,
          attachments: attachmentInput ? [attachmentInput] : [],
          subtasks: subtasksInput,
          userName: auth.user?.name || 'User',
        }).unwrap();
        toast.success('Task updated successfully!');
      } else {
        await createTask({
          project: projectInput,
          title: titleInput,
          description: descInput,
          assignedTo: assigneeInput,
          dueDate: new Date(dueDateInput) as any,
          priority: priorityInput,
          status: statusInput,
          attachments: attachmentInput ? [attachmentInput] : [],
          subtasks: subtasksInput,
          userName: auth.user?.name || 'User',
        }).unwrap();
        toast.success('Task created successfully!');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Operation failed!');
    }
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasksInput([...subtasksInput, { title: newSubtaskTitle.trim(), isCompleted: false }]);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (idx: number) => {
    setSubtasksInput(subtasksInput.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-800/40 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Project Workspace</label>
            <select
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
            >
              {projects.map((p: any) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Task Title</label>
            <input
              type="text"
              required
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Enter task name"
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              rows={3}
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="Provide details about expectations, goals..."
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Task Attachment</label>
            {attachmentInput ? (
              <div className="flex items-center justify-between rounded-xl border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/30 dark:bg-indigo-950/10 px-4 py-3 text-sm text-indigo-900 dark:text-indigo-300">
                <span className="flex items-center gap-2 truncate">
                  <Paperclip className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span className="font-semibold truncate">{attachmentInput.split('/').pop()}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAttachmentInput('')}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors py-4 flex flex-col items-center justify-center cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isFileUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Paperclip className={`h-6 w-6 text-slate-400 mb-1 ${isFileUploading ? 'animate-bounce' : ''}`} />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isFileUploading ? 'Uploading file...' : 'Choose or Drag File to upload'}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign To</label>
              <select
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
              >
                {team.map((m: any) => (
                  <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Due Date</label>
              <DatePicker
                value={dueDateInput}
                onChange={setDueDateInput}
                className="mt-1"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setDueDateInput(d.toISOString().substring(0, 10));
                  }}
                  className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200/50 dark:border-slate-800 cursor-pointer transition-all"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 3);
                    setDueDateInput(d.toISOString().substring(0, 10));
                  }}
                  className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200/50 dark:border-slate-800 cursor-pointer transition-all"
                >
                  3 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setDueDateInput(d.toISOString().substring(0, 10));
                  }}
                  className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200/50 dark:border-slate-800 cursor-pointer transition-all"
                >
                  1 Week
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
              <select
                value={priorityInput}
                onChange={(e: any) => setPriorityInput(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select
                value={statusInput}
                onChange={(e: any) => setStatusInput(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Subtask checklist */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Checklist / Subtasks</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add subtask title..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {subtasksInput.length === 0 ? (
                <p className="text-xs text-slate-400">No subtasks added yet.</p>
              ) : (
                subtasksInput.map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <span className="truncate">{sub.title}</span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(idx)}
                      className="text-rose-500 hover:text-rose-600 font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {isCreating || isUpdating ? 'Saving...' : 'Save Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
