'use client';

import React from 'react';
import { BarChart3, User } from 'lucide-react';

export default function StatistikView({
  statsData,
  statsLoading,
}) {
  if (statsLoading) {
    return (
      <main
        className="
        flex-1
        bg-white dark:bg-slate-800
        rounded-2xl
        shadow-sm
        p-3
        overflow-auto
        border
        border-app-border dark:border-slate-700
      "
      >
        <div className="text-center py-8 text-xs text-slate-400">
          Memuat statistik...
        </div>
      </main>
    );
  }

  if (statsData.length === 0) {
    return (
      <main
        className="
        flex-1
        bg-white dark:bg-slate-800
        rounded-2xl
        shadow-sm
        p-3
        overflow-auto
        border
        border-app-border dark:border-slate-700
      "
      >
        <h2
          className="
          text-xs
          font-bold
          uppercase
          text-app-text dark:text-slate-100
          mb-3
        "
        >
          <BarChart3 size={14} className="inline mr-1 mb-0.5" />
          Statistik Petugas
        </h2>
        <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
          Belum ada data statistik.
        </div>
      </main>
    );
  }

  return (
    <main
      className="
      flex-1
      bg-white dark:bg-slate-800
      rounded-2xl
      shadow-sm
      p-3
      overflow-auto
      border
      border-app-border dark:border-slate-700
    "
    >
      <h2
        className="
        text-xs
        font-bold
        uppercase
        text-app-text dark:text-slate-100
        mb-3
      "
      >
        <BarChart3 size={14} className="inline mr-1 mb-0.5" />
        Statistik Petugas
      </h2>

      <div className="space-y-2">
        {statsData.map((stat) => (
          <div
            key={stat.name}
            className="
            bg-white dark:bg-slate-800/90
            border
            border-app-border dark:border-slate-700
            rounded-2xl
            p-3
            shadow-sm
            hover:shadow-md
            transition-all
          "
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-app-primary/10 dark:bg-app-primary/20 text-app-primary dark:text-app-primary-light p-1.5 rounded-lg">
                  <User size={14} />
                </div>
                <span className="text-xs font-bold text-app-text dark:text-slate-100">
                  {stat.name}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-app-primary/10 dark:bg-app-primary/20 text-app-primary dark:text-app-primary-light">
                {stat.hadirRate}% Hadir
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-50 dark:bg-emerald-900/40 rounded-xl p-2">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                  Hadir
                </p>
                <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                  {stat.HADIR}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/40 rounded-xl p-2">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                  Terlambat
                </p>
                <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                  {stat.TERLAMBAT}
                </p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/40 rounded-xl p-2">
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">
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
    </main>
  );
}
