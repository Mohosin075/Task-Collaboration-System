'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  useGetTasksQuery,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from '@/redux/api/taskApi';
import { useGetProjectsQuery } from '@/redux/api/projectApi';
import { useGetTeamMembersQuery } from '@/redux/api/authApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
} from 'lucide-react';
import { io } from 'socket.io-client';
import TaskCard, { TaskKanbanCard } from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import TaskDrawer from '@/components/TaskDrawer';

export default function TasksPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const searchParams = useSearchParams();
  const queryTaskId = searchParams.get('taskId');
  
  // Search, Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedDeadline, setSelectedDeadline] = useState('');
  
  // Sort State
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Page State
  const [page, setPage] = useState(1);

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');

  // Queries
  const { data: tasksRes, isLoading, refetch } = useGetTasksQuery({
    searchTerm,
    project: selectedProject,
    status: selectedStatus,
    priority: selectedPriority,
    assignedTo: selectedAssignee,
    deadlineStatus: selectedDeadline,
    sortBy,
    order,
    page,
    limit: 50,
  }) as any;

  const { data: projectsRes } = useGetProjectsQuery(undefined) as any;
  const { data: teamRes } = useGetTeamMembersQuery(undefined) as any;

  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  // Task Drawer for comments & details
  const [activeTaskForComments, setActiveTaskForComments] = useState<any>(null);

  // Form Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const isAuthorized = auth.user?.role === 'Admin' || auth.user?.role === 'Project Manager';

  // Socket IO for live comments & updates
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

    socket.on('task-status-changed', () => {
      refetch();
    });

    return () => {
      socket.disconnect();
    };
  }, [refetch]);

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

  // Handle auto-selecting task from query parameter
  useEffect(() => {
    if (queryTaskId && tasks.length > 0) {
      const matched = tasks.find((t: any) => t._id === queryTaskId);
      if (matched) {
        setActiveTaskForComments(matched);
      }
    }
  }, [queryTaskId, tasks]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  // Drag and drop handlers
  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent, newStatus: 'Todo' | 'In Progress' | 'Completed') => {
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    
    const task = tasks.find((t: any) => t._id === taskId);
    if (!task) return;
    
    if (task.status === newStatus) return;

    await handleQuickStatusUpdate(task, newStatus);
  };

  const handleQuickStatusUpdate = async (task: any, newStatus: string) => {
    // Non-Admin/PM members can only update status on tasks assigned to them
    if (auth.user?.role === 'Team Member' && task.assignedTo?._id !== auth.user?._id) {
      return toast.error('You can only update the status of tasks assigned to you!');
    }

    try {
      await updateTask({
        id: task._id,
        status: newStatus,
        userName: auth.user?.name || 'User',
      }).unwrap();
      toast.success(`Task status updated to: ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask({ id, userName: auth.user?.name || 'User' }).unwrap();
      toast.success('Task deleted successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete task!');
    }
  };

  const handleClaimTask = async (task: any) => {
    try {
      await updateTask({
        id: task._id,
        assignedTo: auth.user?._id,
        userName: auth.user?.name || 'User',
      }).unwrap();
      toast.success('Task claimed successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to claim task!');
    }
  };

  const projects = projectsRes?.data || [];
  const team = teamRes?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Page header and CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            
            {/* View Mode Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800/40 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                List Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Kanban Board
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthorized && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer transition-all animate-in fade-in zoom-in-95 duration-200"
              >
                <Plus className="h-5 w-5" />
                New Task
              </button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        <div className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Filter className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Search & Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* Search query */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Project selection */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
            >
              <option value="">All Projects</option>
              {projects.map((p: any) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>

            {/* Status selection */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
            >
              <option value="">All Status</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Priority selection */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
            >
              <option value="">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Assignee selection */}
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
            >
              <option value="">All Members</option>
              {team.map((m: any) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>

            {/* Deadline status selection */}
            <select
              value={selectedDeadline}
              onChange={(e) => setSelectedDeadline(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
            >
              <option value="">All Deadlines</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Overdue">Overdue</option>
            </select>

          </div>

          {/* Sorting panel */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <span className="text-slate-500 flex items-center gap-1 font-semibold">
              <ArrowUpDown className="h-4.5 w-4.5 text-indigo-500" /> Sort By:
            </span>
            <button
              onClick={() => { setSortBy('createdAt'); setOrder(order === 'asc' ? 'desc' : 'asc'); }}
              className={`px-3 py-1 rounded-full font-semibold border transition-all cursor-pointer ${
                sortBy === 'createdAt' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/50' : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              Latest Creation
            </button>
            <button
              onClick={() => { setSortBy('dueDate'); setOrder(order === 'asc' ? 'desc' : 'asc'); }}
              className={`px-3 py-1 rounded-full font-semibold border transition-all cursor-pointer ${
                sortBy === 'dueDate' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/50' : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              Nearest Deadline
            </button>
            <button
              onClick={() => { setSortBy('priority'); setOrder(order === 'asc' ? 'desc' : 'asc'); }}
              className={`px-3 py-1 rounded-full font-semibold border transition-all cursor-pointer ${
                sortBy === 'priority' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/50' : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              Priority Rank
            </button>
          </div>

        </div>

        {/* Task Grid & Kanban Board rendering */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading Tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 animate-in fade-in duration-200">
            <Clock className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold">No tasks matched</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Todo Column */}
            <div
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, 'Todo')}
              className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 p-4 space-y-4 min-h-[400px]"
            >
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  Todo
                </span>
                <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                  {tasks.filter((t: any) => t.status === 'Todo').length}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                {tasks.filter((t: any) => t.status === 'Todo').length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Drag tasks here</p>
                ) : (
                  tasks.filter((t: any) => t.status === 'Todo').map((task: any) => (
                    <TaskKanbanCard
                      key={task._id}
                      task={task}
                      currentUserId={auth.user?._id || ''}
                      onClick={() => setActiveTaskForComments(task)}
                      onDragStart={onDragStart}
                    />
                  ))
                )}
              </div>
            </div>

            {/* In Progress Column */}
            <div
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, 'In Progress')}
              className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 p-4 space-y-4 min-h-[400px]"
            >
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  In Progress
                </span>
                <span className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-bold">
                  {tasks.filter((t: any) => t.status === 'In Progress').length}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                {tasks.filter((t: any) => t.status === 'In Progress').length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Drag tasks here</p>
                ) : (
                  tasks.filter((t: any) => t.status === 'In Progress').map((task: any) => (
                    <TaskKanbanCard
                      key={task._id}
                      task={task}
                      currentUserId={auth.user?._id || ''}
                      onClick={() => setActiveTaskForComments(task)}
                      onDragStart={onDragStart}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, 'Completed')}
              className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 p-4 space-y-4 min-h-[400px]"
            >
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Completed
                </span>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">
                  {tasks.filter((t: any) => t.status === 'Completed').length}
                </span>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                {tasks.filter((t: any) => t.status === 'Completed').length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Drag tasks here</p>
                ) : (
                  tasks.filter((t: any) => t.status === 'Completed').map((task: any) => (
                    <TaskKanbanCard
                      key={task._id}
                      task={task}
                      currentUserId={auth.user?._id || ''}
                      onClick={() => setActiveTaskForComments(task)}
                      onDragStart={onDragStart}
                    />
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.map((task: any) => (
              <TaskCard
                key={task._id}
                task={task}
                currentUserId={auth.user?._id || ''}
                isAuthorized={isAuthorized}
                onClick={() => setActiveTaskForComments(task)}
                onStatusChange={handleQuickStatusUpdate}
                onEditClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(task);
                }}
                onDeleteClick={(e) => {
                  e.stopPropagation();
                  handleDelete(task._id);
                }}
                onClaimClick={(e) => {
                  e.stopPropagation();
                  handleClaimTask(task);
                }}
              />
            ))}
          </div>
        )}

        {/* Task Form Modal */}
        <TaskModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          editingTask={editingTask}
          projects={projects}
          team={team}
        />

        {/* Task Discussion Sidebar Drawer */}
        <TaskDrawer
          task={activeTaskForComments}
          onClose={() => setActiveTaskForComments(null)}
        />

      </div>
    </DashboardLayout>
  );
}
