'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignupMutation } from '@/redux/api/authApi';
import { toast } from 'sonner';
import { UserPlus, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Project Manager' | 'Team Member'>('Team Member');
  const router = useRouter();
  const [signup, { isLoading }] = useSignupMutation();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.warning('Please fill in all required fields!');
    }

    try {
      await signup({ name, email, password, role }).unwrap();
      toast.success('Registration successful! Please login to proceed.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Registration failed! Try another email.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-700/30 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Title */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Activity className="h-7 w-7 text-indigo-400" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white">Create Account</h2>
          <p className="mt-2 text-sm text-slate-400">Join a workspace to begin collaborating</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Workspace Role</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Team Member">Team Member (Task Updates Only)</option>
                <option value="Project Manager">Project Manager (CRUD Projects & Assign Tasks)</option>
                <option value="Admin">Admin (Full Workspace Access)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Redirect */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
