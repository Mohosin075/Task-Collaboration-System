'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { toggleTheme } from '@/redux/slices/themeSlice';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users2,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Authenticate guard: redirect to /login if no session exists
  useEffect(() => {
    if (mounted && !auth.token) {
      router.push('/login');
    }
  }, [auth.token, router, mounted]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Team Workload', path: '/team', icon: Users2 },
  ];

  if (!mounted || !auth.token || !auth.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Activity className="h-6 w-6 text-indigo-500 mr-2" />
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Smart Work</span>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* User Card inside Sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold truncate">{auth.user?.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{auth.user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 bg-white dark:bg-slate-900 h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center">
                <Activity className="h-6 w-6 text-indigo-500 mr-2" />
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Smart Work</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-500 dark:text-slate-400">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-semibold truncate">{auth.user?.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{auth.user?.role}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content pane */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Header toolbar */}
        <header className="flex h-16 items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
          
          {/* Mobile menu trigger */}
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 md:hidden cursor-pointer">
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="hidden md:flex text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Workspace: {auth.user?.role} Shell
          </div>
          
          {/* Toolbar Actions */}
          <div className="flex items-center gap-4">
            
            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-500" />}
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

          </div>
        </header>

        {/* Viewport scrolling area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>

    </div>
  );
}
