'use client';

import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-100 via-indigo-50/10 to-slate-50 dark:from-slate-950 dark:via-indigo-950/5 dark:to-slate-950 text-slate-900 dark:text-slate-100 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/45 p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}
