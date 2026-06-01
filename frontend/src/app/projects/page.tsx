'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '@/redux/api/projectApi';
import { useGetTeamMembersQuery } from '@/redux/api/authApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';
import {
  FolderPlus,
  Pencil,
  Trash2,
  Calendar,
  Layers,
  Users,
  AlertCircle,
  Plus,
  X,
  PlusCircle,
} from 'lucide-react';

export default function ProjectsPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const { data: projectsRes, isLoading } = useGetProjectsQuery(undefined) as any;
  const { data: teamRes } = useGetTeamMembersQuery(undefined) as any;
  
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<'Active' | 'Completed' | 'On Hold'>('Active');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const isAuthorized = auth.user?.role === 'Admin' || auth.user?.role === 'Project Manager';

  const resetForm = () => {
    setName('');
    setDescription('');
    setDeadline('');
    setStatus('Active');
    setSelectedMembers([]);
    setEditingProject(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (project: any) => {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description || '');
    setDeadline(new Date(project.deadline).toISOString().substring(0, 10));
    setStatus(project.status);
    setSelectedMembers(project.members?.map((m: any) => m._id) || []);
    setModalOpen(true);
  };

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
      setModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Operation failed!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject({ id, userName: auth.user?.name || 'User' }).unwrap();
      toast.success('Project deleted successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete project!');
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const projects = projectsRes?.data || [];
  const team = teamRes?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Page title and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage workspaces, project goals, and assignees.</p>
          </div>
          {isAuthorized && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer transition-all"
            >
              <FolderPlus className="h-5 w-5" />
              New Project
            </button>
          )}
        </div>

        {/* Project cards listing */}
        {isLoading ? (
          <div className="flex justify-center py-12 text-slate-500">Loading Projects...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
            <Layers className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">No projects yet</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new workspace project.</p>
            {isAuthorized && (
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <div
                key={project._id}
                className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
              >
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
                          onClick={() => handleOpenEdit(project)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
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

                <div className="border-t border-slate-100 dark:border-slate-800/80 mt-6 pt-4 space-y-3">
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
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Team:</span>
                    <div className="flex -space-x-2 overflow-hidden">
                      {project.members && project.members.length > 0 ? (
                        project.members.map((member: any) => (
                          <div
                            key={member._id}
                            title={`${member.name} (${member.role})`}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-white dark:border-slate-900"
                          >
                            {member.name.substring(0, 2).toUpperCase()}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No members assigned</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Modal dialog for creating/editing projects */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-800/40 overflow-hidden">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {editingProject ? 'Edit Project' : 'New Project'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief details about the project goals..."
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deadline</label>
                    <input
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
                    />
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

                {/* Team Members checklist inside creation form */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Team Members Collaboration</label>
                  <div className="max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 space-y-2">
                    {team.length === 0 ? (
                      <p className="text-xs text-slate-400">No members found. Please register members first.</p>
                    ) : (
                      team.map((member: any) => (
                        <label key={member._id} className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
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
                    onClick={() => setModalOpen(false)}
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
        )}

      </div>
    </DashboardLayout>
  );
}
