'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import DatePicker from '@/components/DatePicker';
import { useCreateProjectMutation, useUpdateProjectMutation } from '@/redux/api/projectApi';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: any;
  team: any[];
}

export default function ProjectModal({ isOpen, onClose, editingProject, team }: ProjectModalProps) {
  const auth = useSelector((state: RootState) => state.auth);
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'Active' | 'Completed' | 'On Hold'>('Active');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Sync inputs
  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name || '');
      setDescription(editingProject.description || '');
      setDeadline(editingProject.deadline ? new Date(editingProject.deadline).toISOString().substring(0, 10) : '');
      setStatus(editingProject.status || 'Active');
      setSelectedMembers(editingProject.members?.map((m: any) => m._id) || []);
    } else {
      setName('');
      setDescription('');
      setDeadline('');
      setStatus('Active');
      setSelectedMembers([]);
    }
  }, [editingProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !deadline) {
      return toast.warning('Please enter project name and deadline!');
    }

    try {
      if (editingProject) {
        await updateProject({
          id: editingProject._id,
          name,
          description,
          deadline,
          status,
          members: selectedMembers,
          userName: auth.user?.name || 'User',
        }).unwrap();
        toast.success('Project updated successfully!');
      } else {
        await createProject({
          name,
          description,
          deadline: new Date(deadline),
          status,
          members: selectedMembers as any,
          userName: auth.user?.name || 'User',
        }).unwrap();
        toast.success('Project created successfully!');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Operation failed!');
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-800/40 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {editingProject ? 'Edit Project' : 'New Project'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details about the project goals..."
              className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deadline</label>
              <DatePicker
                value={deadline}
                onChange={setDeadline}
                className="mt-1"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setDeadline(d.toISOString().substring(0, 10));
                  }}
                  className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200/50 dark:border-slate-800 cursor-pointer transition-all"
                >
                  +1 Week
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 14);
                    setDeadline(d.toISOString().substring(0, 10));
                  }}
                  className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200/50 dark:border-slate-800 cursor-pointer transition-all"
                >
                  +2 Weeks
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 1);
                    setDeadline(d.toISOString().substring(0, 10));
                  }}
                  className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200/50 dark:border-slate-800 cursor-pointer transition-all"
                >
                  +1 Month
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Team Members checklist */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Team Members Collaboration</label>
            <div className="max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 space-y-2">
              {team.length === 0 ? (
                <p className="text-xs text-slate-400">No members found. Please register members first.</p>
              ) : (
                team.map((member: any) => (
                  <label key={member._id} className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member._id)}
                      onChange={() => handleMemberToggle(member._id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="flex-1 font-medium">{member.name} ({member.role})</span>
                  </label>
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
              {isCreating || isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
