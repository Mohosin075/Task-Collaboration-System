'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useSeedDemoMutation } from '@/redux/api/authApi';
import { setCredentials } from '@/redux/slices/authSlice';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';
import { LogIn, Shield, Users, User, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();
  
  const auth = useSelector((state: RootState) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  const [seedDemo, { isLoading: isSeeding }] = useSeedDemoMutation();

  // Redirect if already logged in
  useEffect(() => {
    if (auth.token) {
      router.push('/dashboard');
    }
  }, [auth.token, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.warning('Please enter both email and password!');
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: res.data.accessToken, user: res.data.user }));
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Login failed! Check your credentials.');
    }
  };

  const handleDemoLogin = async (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('demo123456@Password');
    
    // Seed demo accounts first to make sure they exist
    try {
      await seedDemo(undefined).unwrap();
      
      const res = await login({ email: roleEmail, password: 'demo123456@Password' }).unwrap();
      dispatch(setCredentials({ token: res.data.accessToken, user: res.data.user }));
      toast.success(`Demo Login successful: Logged in as ${res.data.user.role}!`);
      router.push('/dashboard');
    } catch (err: any) {
      // Retry in case seeding fails but users already exist
      try {
        const res = await login({ email: roleEmail, password: 'demo123456@Password' }).unwrap();
        dispatch(setCredentials({ token: res.data.accessToken, user: res.data.user }));
        toast.success(`Demo Login successful: Logged in as ${res.data.user.role}!`);
        router.push('/dashboard');
      } catch (retryErr: any) {
        toast.error('Demo Login failed. Please register an account.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-700/30 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Title / Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Activity className="h-7 w-7 text-indigo-400" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">Smart Collaboration</h2>
          <p className="mt-2 text-sm text-slate-400">Sign in to manage projects and track tasks</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-sm font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>

        {/* Demo login buttons divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 py-1 rounded text-slate-400 font-semibold border border-slate-800">Or Demo Quick Sign In</span>
          </div>
        </div>

        {/* Demo Roles selection grid */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleDemoLogin('admin@demo.com')}
            className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-center text-xs font-semibold text-indigo-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Shield className="mb-1 h-5 w-5" />
            Admin
          </button>
          <button
            onClick={() => handleDemoLogin('pm@demo.com')}
            className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-center text-xs font-semibold text-emerald-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Users className="mb-1 h-5 w-5" />
            Manager
          </button>
          <button
            onClick={() => handleDemoLogin('member1@demo.com')}
            className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-center text-xs font-semibold text-amber-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <User className="mb-1 h-5 w-5" />
            Member
          </button>
        </div>

        {/* Redirect Link */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-indigo-400 hover:underline">
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}
