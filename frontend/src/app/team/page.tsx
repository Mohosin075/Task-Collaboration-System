'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useGetWorkloadQuery, useGetTeamMembersQuery } from '@/redux/api/authApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Users2, CheckCircle2, AlertCircle, HelpCircle, Layers } from 'lucide-react';

export default function TeamWorkloadPage() {
  const auth = useSelector((state: RootState) => state.auth);
  
  const isAuthorized = auth.user?.role === 'Admin' || auth.user?.role === 'Project Manager';

  // Fetch workload details only if authorized
  const { data: workloadRes, isLoading: workloadLoading } = useGetWorkloadQuery(undefined, {
    skip: !isAuthorized,
  }) as any;

  // Fetch team members roster if not authorized
  const { data: teamRes, isLoading: teamLoading } = useGetTeamMembersQuery(undefined, {
    skip: isAuthorized,
  }) as any;

  const isLoading = isAuthorized ? workloadLoading : teamLoading;
  const workload = workloadRes?.data || [];
  const team = teamRes?.data || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Workload</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isAuthorized
              ? 'Analyze resource allocation and track project task volumes per member.'
              : 'View workspace team members and active project workloads.'}
          </p>
        </div>

        {/* Load Status message */}
        {!isAuthorized && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20 p-4 flex gap-3 text-sm text-blue-700 dark:text-blue-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="leading-relaxed">
              <strong>Access Info:</strong> Team members can view the workspace roster. Granular analytical reports are restricted to Administrators and Project Managers.
            </p>
          </div>
        )}

        {/* Workload listing */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading Team Data...</div>
        ) : isAuthorized && workload.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
            <Users2 className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold">No active workload</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Add tasks and assign members to view workload metrics.</p>
          </div>
        ) : !isAuthorized && team.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
            <Users2 className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-bold">No team members found</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">There are no team members in the roster.</p>
          </div>
        ) : isAuthorized ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workload.map((member: any) => {
              const workloadPercentage = member.totalTasks > 0
                ? Math.round((member.completedTasks / member.totalTasks) * 100)
                : 0;

              return (
                <div
                  key={member._id}
                  className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
                >
                  <div>
                    {/* Role Tag & Name */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                        {member.role}
                      </span>
                      <Users2 className="h-4.5 w-4.5 text-indigo-500" />
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{member.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 truncate">{member.email}</p>
                  </div>

                  {/* Task counts summary */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 mt-6 pt-4 space-y-4">
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned</span>
                        <h4 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-1">{member.totalTasks}</h4>
                      </div>
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-2.5 rounded-xl border border-emerald-100/30">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Done</span>
                        <h4 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{member.completedTasks}</h4>
                      </div>
                      <div className="bg-amber-50/50 dark:bg-amber-950/10 p-2.5 rounded-xl border border-amber-100/30">
                        <span className="text-[10px] font-bold text-amber-500 uppercase">Pending</span>
                        <h4 className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-1">{member.pendingTasks}</h4>
                      </div>
                    </div>

                    {/* Progress Bar visual indicator */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500 dark:text-slate-400">Workload Efficiency:</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{workloadPercentage}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${workloadPercentage}%` }}
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member: any) => (
              <div
                key={member._id}
                className="rounded-2xl border border-white/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50 dark:shadow-none flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300"
              >
                <div>
                  {/* Role Tag & Name */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                      {member.role}
                    </span>
                    <Users2 className="h-4.5 w-4.5 text-indigo-500" />
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{member.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 truncate">{member.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
