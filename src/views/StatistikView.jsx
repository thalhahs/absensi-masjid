'use client';

import React from 'react';
import { BarChart3, User } from 'lucide-react';

export default function StatistikView({
  statsData,
  statsLoading,
}) {
  if (statsLoading) {
    return (
      <main className="flex-1 glass-strong rounded-3xl shadow-sm p-4 overflow-auto border border-stone-200/80 dark:border-stone-700/60">
        <div className="text-center py-12">
          <div className="inline-block w-6 h-6 border-2 border-app-primary border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-app-muted">Memuat statistik...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 glass-strong rounded-3xl shadow-sm p-4 overflow-auto border border-stone-200/80 dark:border-stone-700/60">
      <h2 className="text-sm font-extrabold text-app-text dark:text-slate-100 tracking-tight mb-4">
        <BarChart3 size={16} className="inline mr-1.5 mb-0.5 text-app-primary" />
        Statistik Petugas
      </h2>

      {statsData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-xs font-bold text-app-muted">Belum ada data statistik.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {statsData.map((stat) => (
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
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-2">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    Hadir
                  </p>
                  <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                    {stat.HADIR}
                  </p>
                </div>
                <div className="bg-amber-50/80 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50 rounded-xl p-2">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                    Terlambat
                  </p>
                  <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                    {stat.TERLAMBAT}
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
          ))}
        </div>
      )}
    </main>
  );
}
