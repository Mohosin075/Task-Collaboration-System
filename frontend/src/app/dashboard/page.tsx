'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useGetProjectsQuery } from '@/redux/api/projectApi';
import { useGetTasksQuery, useGetActivitiesQuery } from '@/redux/api/taskApi';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  Activity as ActivityIcon,
  ChevronRight,
  ListTodo,
  Star,
  Users2,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { io } from 'socket.io-client';

const COLORS = ['#6366f1', '#10b981', '#f59e0b']; // Indigo, Emerald, Amber

export default function DashboardPage() {
  const { data: projectsRes, isLoading: projectsLoading } = useGetProjectsQuery(undefined) as any;
  const { data: tasksRes, isLoading: tasksLoading } = useGetTasksQuery(undefined) as any;
  const { data: activitiesRes, isLoading: activitiesLoading } = useGetActivitiesQuery(undefined) as any;

  const [liveActivities, setLiveActivities] = useState<any[]>([]);

  // Initialize live Socket.IO connection for real-time logs
  useEffect(() => {
    if (activitiesRes?.data) {
      setLiveActivities(activitiesRes.data);
    }
  }, [activitiesRes]);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('new-activity', (newLog: any) => {
      setLiveActivities((prev) => [newLog, ...prev.slice(0, 8)]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const projects = projectsRes?.data || [];
  const tasks = tasksRes?.data || [];

  // Compute KPI Statistics
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter((t: any) => t.status !== 'Completed' && new Date(t.dueDate) < today).length;

  // Chart Data 1: Task Status Distribution
  const todoTasks = tasks.filter((t: any) => t.status === 'Todo').length;
  const inProgressTasks = tasks.filter((t: any) => t.status === 'In Progress').length;
  
  const statusChartData = [
    { name: 'Todo', value: todoTasks || 0 },
    { name: 'In Progress', value: inProgressTasks || 0 },
    { name: 'Completed', value: completedTasks || 0 },
  ].filter(item => item.value > 0);

  // Chart Data 2: Tasks by Priority
  const highPriority = tasks.filter((t: any) => t.priority === 'High').length;
  const medPriority = tasks.filter((t: any) => t.priority === 'Medium').length;
  const lowPriority = tasks.filter((t: any) => t.priority === 'Low').length;

  const priorityChartData = [
    { name: 'High', count: highPriority },
    { name: 'Medium', count: medPriority },
    { name: 'Low', count: lowPriority },
  ];

  // Chart Data 3: Project Deadlines & Progress Trend (mock/calculated trend)
  const trendChartData = projects.map((p: any, i: number) => {
    const projTasks = tasks.filter((t: any) => t.project?._id === p._id);
    const completed = projTasks.filter((t: any) => t.status === 'Completed').length;
    const progress = projTasks.length > 0 ? Math.round((completed / projTasks.length) * 100) : 0;
    return {
      name: p.name.substring(0, 10),
      progress,
    };
  });

  const isLoading = projectsLoading || tasksLoading || activitiesLoading;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspace Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time statistics and team activity tracking.</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          
          <div className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Projects</p>
              <h3 className="text-2xl font-bold">{isLoading ? '...' : totalProjects}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <ListTodo className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Tasks</p>
              <h3 className="text-2xl font-bold">{isLoading ? '...' : totalTasks}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tasks Completed</p>
              <h3 className="text-2xl font-bold">{isLoading ? '...' : completedTasks}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Tasks</p>
              <h3 className="text-2xl font-bold">{isLoading ? '...' : pendingTasks}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Overdue Tasks</p>
              <h3 className="text-2xl font-bold">{isLoading ? '...' : overdueTasks}</h3>
            </div>
          </div>

        </div>

        {/* Charts & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart 1: Tasks by Priority */}
          <div className="lg:col-span-2 rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <h3 className="text-lg font-bold mb-4">Tasks by Priority</h3>
            <div className="h-80 w-full">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">Loading Chart...</div>
              ) : totalTasks === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500">No tasks created yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Task Status Distribution */}
          <div className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <h3 className="text-lg font-bold mb-4">Status Distribution</h3>
            <div className="h-80 w-full flex flex-col justify-between">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">Loading Chart...</div>
              ) : totalTasks === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500">No tasks created yet</div>
              ) : (
                <>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Custom Legend */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 font-medium">
                    <div className="flex flex-col items-center">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 mb-1"></span>
                      <span>Todo ({todoTasks})</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 mb-1"></span>
                      <span>In Progress ({inProgressTasks})</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="h-2 w-2 rounded-full bg-amber-500 mb-1"></span>
                      <span>Completed ({completedTasks})</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart 3: Project Progress Trends */}
          <div className="lg:col-span-2 rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <h3 className="text-lg font-bold mb-4">Project Progress Trend</h3>
            <div className="h-72 w-full">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">Loading Chart...</div>
              ) : totalProjects === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500">No projects created yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData}>
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Area type="monotone" dataKey="progress" stroke="#6366f1" fillOpacity={1} fill="url(#colorProgress)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Real-time Activity Logs Feed */}
          <div className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <ActivityIcon className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-bold">Recent Activities</h3>
              <span className="ml-auto inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Live
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-64 space-y-4 pr-1">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">Loading Activities...</div>
              ) : liveActivities.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500 text-sm">No activity logs recorded yet</div>
              ) : (
                liveActivities.map((act: any, index: number) => (
                  <div key={act._id || index} className="flex gap-3 text-sm pb-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{act.userName}</span>
                      <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">{act.action}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
