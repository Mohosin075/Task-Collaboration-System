'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import DatePicker from '@/components/DatePicker';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
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
  Calendar,
  MessageSquare,
  Paperclip,
  Clock,
  X,
  Edit2,
  Trash2,
  ChevronRight,
  User,
  Shield,
  CornerDownRight,
  Send,
} from 'lucide-react';
import { io } from 'socket.io-client';

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

  // Kanban & Subtask State
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [subtasksInput, setSubtasksInput] = useState<{ title: string; isCompleted: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  // Task Drawer for comments & details
  const [activeTaskForComments, setActiveTaskForComments] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const { data: commentsRes, refetch: refetchComments } = useGetCommentsQuery(
    activeTaskForComments?._id,
    { skip: !activeTaskForComments }
  ) as any;
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();

  // Form Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Form inputs
  const [projectInput, setProjectInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [assigneeInput, setAssigneeInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [priorityInput, setPriorityInput] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [statusInput, setStatusInput] = useState<'Todo' | 'In Progress' | 'Completed'>('Todo');
  const [attachmentInput, setAttachmentInput] = useState('');

  const isAuthorized = auth.user?.role === 'Admin' || auth.user?.role === 'Project Manager';

  // Socket IO for live comments & updates
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

    // Register inside room
    if (activeTaskForComments) {
      socket.emit('join-project', activeTaskForComments.project?._id);
    }

    socket.on('new-comment', ({ taskId, comment }) => {
      if (activeTaskForComments && activeTaskForComments._id === taskId) {
        refetchComments();
      }
    });

    socket.on('task-status-changed', () => {
      refetch();
    });

    return () => {
      socket.disconnect();
    };
  }, [activeTaskForComments, refetch, refetchComments]);

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
    setProjectInput(projectsRes?.data?.[0]?._id || '');
    setTitleInput('');
    setDescInput('');
    setAssigneeInput(teamRes?.data?.[0]?._id || '');
    setDueDateInput('');
    setPriorityInput('Medium');
    setStatusInput('Todo');
    setAttachmentInput('');
    setSubtasksInput([]);
    setNewSubtaskTitle('');
    setModalOpen(true);
  };

  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setProjectInput(task.project?._id || '');
    setTitleInput(task.title);
    setDescInput(task.description || '');
    setAssigneeInput(task.assignedTo?._id || '');
    setDueDateInput(new Date(task.dueDate).toISOString().substring(0, 10));
    setPriorityInput(task.priority);
    setStatusInput(task.status);
    setAttachmentInput(task.attachments?.[0] || '');
    setSubtasksInput(task.subtasks || []);
    setNewSubtaskTitle('');
    setModalOpen(true);
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
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Operation failed!');
    }
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

  const renderKanbanCard = (task: any) => {
    const isAssignedToCurrentUser = task.assignedTo?._id === auth.user?._id;
    return (
      <div
        key={task._id}
        draggable
        onDragStart={(e) => onDragStart(e, task._id)}
        onClick={() => setActiveTaskForComments(task)}
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
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-400">
              {task.assignedTo?.name?.substring(0, 2).toUpperCase() || 'NA'}
            </div>
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[80px]">
              {isAssignedToCurrentUser ? 'You' : task.assignedTo?.name || 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
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
  };


  const handleQuickStatusUpdate = async (task: any, newStatus: any) => {
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

  const [isFileUploading, setIsFileUploading] = useState(false);

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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment({
        task: activeTaskForComments._id,
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

  const projects = projectsRes?.data || [];
  const team = teamRes?.data || [];
  const comments = commentsRes?.data || [];

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
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/10 cursor-pointer transition-all"
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
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
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
                  tasks.filter((t: any) => t.status === 'Todo').map((task: any) => renderKanbanCard(task))
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
                  tasks.filter((t: any) => t.status === 'In Progress').map((task: any) => renderKanbanCard(task))
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
                  tasks.filter((t: any) => t.status === 'Completed').map((task: any) => renderKanbanCard(task))
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.map((task: any) => {
              const isAssignedToCurrentUser = task.assignedTo?._id === auth.user?._id;
              return (
                <div
                  key={task._id}
                  onClick={() => setActiveTaskForComments(task)}
                  className="group relative rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  <div>
                    {/* Header: Project name, Action triggers */}
                    <div className="flex items-center justify-between mb-3" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {task.project?.name || 'Project'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {/* Status Select switcher */}
                        <select
                          value={task.status}
                          disabled={auth.user?.role === 'Team Member' && task.assignedTo?._id !== auth.user?._id && task.assignedTo !== auth.user?._id}
                          onChange={(e) => handleQuickStatusUpdate(task, e.target.value)}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                            auth.user?.role === 'Team Member' && task.assignedTo?._id !== auth.user?._id && task.assignedTo !== auth.user?._id
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
                              onClick={() => handleOpenEdit(task)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(task._id)}
                              className="p-1 text-rose-400 hover:text-rose-600 rounded cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
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
                      
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          {task.assignedTo?.name?.substring(0, 2).toUpperCase() || 'NA'}
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[80px]">
                          {isAssignedToCurrentUser ? 'Assigned to You' : task.assignedTo?.name || 'Unassigned'}
                        </span>
                        {!isAssignedToCurrentUser && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClaimTask(task);
                            }}
                            className="px-2 py-0.5 text-[9px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded border border-indigo-200/50 dark:border-indigo-800/50 cursor-pointer font-bold transition-all"
                          >
                            Claim
                          </button>
                        )}
                      </div>

                      {/* Attachments & Comments counter */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
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
            })}
          </div>
        )}

        {/* Task Form Modal for Admin / PM CRUD */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-800/40 overflow-hidden shadow-2xl">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    rows={3}
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="Provide details about expectations, goals..."
                    className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

                {/* Subtask editing in form */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Checklist / Subtasks</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add subtask title..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSubtaskTitle.trim()) return;
                        setSubtasksInput([...subtasksInput, { title: newSubtaskTitle.trim(), isCompleted: false }]);
                        setNewSubtaskTitle('');
                      }}
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
                            onClick={() => {
                              setSubtasksInput(subtasksInput.filter((_, i) => i !== idx));
                            }}
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
                    {isCreating || isUpdating ? 'Saving...' : 'Save Task'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* Task Discussion Sidebar Drawer */}
        {activeTaskForComments && (
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-l border-white/40 dark:border-slate-800/30 shadow-2xl flex flex-col justify-between">
            
            <div>
              {/* Header drawer */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[280px]">
                    {activeTaskForComments.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {activeTaskForComments.project?.name}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTaskForComments(null)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Task Details Info segment */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Task Description</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeTaskForComments.description || 'No description was provided.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <h5 className="font-semibold text-slate-400 uppercase mb-1">Assignee</h5>
                    <p className="font-medium">{activeTaskForComments.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-400 uppercase mb-1">Due Date</h5>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {new Date(activeTaskForComments.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Subtasks checklist inside drawer */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Subtasks Checklist</span>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                      {activeTaskForComments.subtasks?.filter((s: any) => s.isCompleted).length || 0} / {activeTaskForComments.subtasks?.length || 0}
                    </span>
                  </h4>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1">
                    {(!activeTaskForComments.subtasks || activeTaskForComments.subtasks.length === 0) ? (
                      <p className="text-xs text-slate-400">No subtasks created.</p>
                    ) : (
                      activeTaskForComments.subtasks.map((sub: any) => (
                        <label
                          key={sub._id}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 p-1.5 rounded cursor-pointer border border-slate-100/50 dark:border-slate-800/40 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={sub.isCompleted}
                            disabled={auth.user?.role === 'Team Member' && activeTaskForComments.assignedTo?._id !== auth.user?._id && activeTaskForComments.assignedTo !== auth.user?._id}
                            onChange={async (e) => {
                              const updatedSubtasks = activeTaskForComments.subtasks.map((s: any) =>
                                s._id === sub._id ? { ...s, isCompleted: e.target.checked } : s
                              );
                              try {
                                await updateTask({
                                  id: activeTaskForComments._id,
                                  subtasks: updatedSubtasks,
                                  userName: auth.user?.name || 'User',
                                }).unwrap();
                                toast.success('Subtask status updated!');
                              } catch (err: any) {
                                toast.error(err?.data?.message || 'Failed to update subtask');
                              }
                            }}
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

                {activeTaskForComments.attachments && activeTaskForComments.attachments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5 text-indigo-500" /> Attachments
                    </h4>
                    <div className="space-y-1">
                      {activeTaskForComments.attachments.map((link: string, idx: number) => (
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

              {/* Comments Feed */}
              <div className="p-6 flex-1 flex flex-col">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Task Discussion Feed</h4>
                <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-1">
                  {comments.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No comments yet. Start the conversation!
                    </div>
                  ) : (
                    comments.map((comment: any) => (
                      <div key={comment._id} className="text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
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

            {/* Discussion Comment Input box */}
            <form onSubmit={handleAddComment} className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Share a message or update..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
        )}

      </div>
    </DashboardLayout>
  );
}
