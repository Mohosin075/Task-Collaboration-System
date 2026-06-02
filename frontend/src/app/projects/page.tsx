'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
} from '@/redux/api/projectApi';
import { useGetTeamMembersQuery } from '@/redux/api/authApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';
import {
  FolderPlus,
  Layers,
  AlertCircle,
  Plus,
} from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';

export default function ProjectsPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const { data: projectsRes, isLoading } = useGetProjectsQuery(undefined) as any;
  const { data: teamRes } = useGetTeamMembersQuery(undefined) as any;
  
  const [deleteProject] = useDeleteProjectMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const isAuthorized = auth.user?.role === 'Admin' || auth.user?.role === 'Project Manager';

  const handleOpenCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (project: any) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will be lost.')) return;
    try {
      await deleteProject({ id, userName: auth.user?.name || 'User' }).unwrap();
      toast.success('Project deleted successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete project!');
    }
  };

  const projects = projectsRes?.data || [];
  const team = teamRes?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Workspaces</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage, allocate team resources, and follow active deliverables.</p>
          </div>
          
          {isAuthorized && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer transition-all shrink-0 animate-in fade-in zoom-in-95 duration-200"
            >
              <Plus className="h-5 w-5" />
              New Project
            </button>
          )}
        </div>

        {/* Info banner for general members */}
        {!isAuthorized && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 dark:border-indigo-950/20 dark:border-indigo-900/30 p-4 flex gap-3 text-sm text-blue-700 dark:text-indigo-400 animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="leading-relaxed">
              <strong>Workspace Member Mode:</strong> You can view all projects and active team rosters. Project setup and modifications are restricted to Administrators or Project Managers.
            </p>
          </div>
        )}

        {/* Project Roster Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading workspaces...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 animate-in fade-in duration-200">
            <FolderPlus className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold">No projects found</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {isAuthorized ? 'Create a project to begin workspace allocation.' : 'Wait for an administrator to invite or assign projects.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <ProjectCard
                key={project._id}
                project={project}
                isAuthorized={isAuthorized}
                onEditClick={handleOpenEdit}
                onDeleteClick={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Modal dialog for creating/editing projects */}
        <ProjectModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          editingProject={editingProject}
          team={team}
        />

      </div>
    </DashboardLayout>
  );
}
