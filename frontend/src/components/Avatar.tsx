'use client';

import React from 'react';

interface AvatarProps {
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ name = 'Anonymous', size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'NA';

  const sizeClasses = {
    xs: 'h-5 w-5 text-[9px]',
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-9 w-9 text-sm',
    xl: 'h-10 w-10 text-sm font-bold',
  };

  return (
    <div
      title={name}
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold shadow-sm shrink-0 border border-white dark:border-slate-900 select-none ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
