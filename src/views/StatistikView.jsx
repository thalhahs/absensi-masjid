'use client';

import React from 'react';
import { BarChart3, User } from 'lucide-react';

const SKELETON_STATISTIK = [1, 2, 3];

export default function StatistikView({
  statsData,
  statsLoading,
  role,
  isSuperadmin,
}) {
  if (statsLoading) {
    return (
      <main className="flex-1 glass-strong rounded-3xl shadow-sm p-4 overflow-auto border border-stone-200/80 dark:border-stone-700/60">
        <div className="space-y-2.5">
          {SKELETON_STATISTIK.map((s) => (
            <div key={s} className="rounded-2xl border border-stone-100 dark:border-stone-700/50 overflow-hidden">
              <div className="p-3.5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-32" />
                    <div className="skeleton h-2.5 w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="skeleton h-16 rounded-xl" />
                  <div className="skeleton h-16 rounded-xl" />
                  <div className="skeleton h-16 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 glass-strong rounded-3xl shadow-sm p-4 overflow-auto border border-stone-200/80 dark:border-stone-700/60">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-extrabold text-app-text dark:text-slate-100 tracking-tight">
          <BarChart3 size={16} className="inline mr-1.5 mb-0.5 text-app-primary" />
          Statistik Petugas
        </h2>
      </div>

      {statsData.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto w-16 h-16 mb-3 text-stone-200 dark:text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 15.375v-2.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-xs font-extrabold text-app-text dark:text-slate-200">Belum ada data statistik.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {statsData.map((stat) => {
            return (
              <div
                key={stat.name}
                className="group flex flex-col p-3.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-stone-100 dark:border-stone-700/50 rounded-2xl hover:bg-stone-50/80 dark:hover:bg-stone-800/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-app-primary/10 dark:bg-app-primary/20 text-app-primary dark:text-app-primary-light p-1.5 rounded-lg">
                      <User size={14} />
                    </div>
                    <span className="text-sm font-bold text-app-text dark:text-slate-100 tracking-tight">
                      {stat.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-app-primary/10 dark:bg-app-primary/20 text-app-primary border border-stone-200 dark:border-stone-700">
                    {stat.hadirRate}% Hadir
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-2">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                      Hadir
                    </p>
                    <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                      {stat.HADIR}
                    </p>
                  </div>
                  <div className="bg-rose-50/80 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 rounded-xl p-2">
                    <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
                      Alfa
                    </p>
                    <p className="text-sm font-extrabold text-rose-700 dark:text-rose-300">
                      {stat.ALFA}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
