'use client';

import React from 'react';
import { History, Download, CalendarDays } from 'lucide-react';

const SKELETON_RIWAYAT = [1, 2, 3];

export default function RiwayatView({
  history,
  historyLoading,
  historyFilterDate,
  historyFilterOfficer,
  officers,
  setHistoryFilterDate,
  setHistoryFilterOfficer,
  exportHistoryCSV,
}) {
  const getBadgeStyles = (status) => {
    const styles = {
      HADIR: "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-md",
      TERLAMBAT: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md",
      ALFA: "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 shadow-md",
      SUKSES: "bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-md",
    };
    return styles[status] || styles.HADIR;
  };

  return (
    <main className="flex-1 glass-strong rounded-3xl shadow-sm p-4 overflow-auto border border-stone-200/80 dark:border-stone-700/60">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-extrabold text-app-text dark:text-slate-100 tracking-tight">
          <History size={16} className="inline mr-1.5 mb-0.5 text-app-primary" />
          Riwayat Absensi
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-700 text-app-muted">
            {history.length} data
          </span>

          <button
            onClick={exportHistoryCSV}
            className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-app-muted hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
        <div>
          <label className="block text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1.5">
            Filter Tanggal
          </label>

          <input
            type="date"
            value={historyFilterDate}
            onChange={(e) => setHistoryFilterDate(e.target.value)}
            className="mt-0 w-full text-xs border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 bg-white/80 dark:bg-slate-800/80 text-app-text font-medium focus:outline-none focus:ring-2 focus:ring-app-primary/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1.5">
            Filter Petugas
          </label>

          {officers.length > 0 ? (
            <select
              value={historyFilterOfficer}
              onChange={(e) => setHistoryFilterOfficer(e.target.value)}
              className="mt-0 w-full text-xs border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 bg-white/80 dark:bg-slate-800/80 text-app-text font-medium focus:outline-none focus:ring-2 focus:ring-app-primary/30 transition-all"
            >
              <option value="">Semua Petugas</option>

              {officers.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Nama petugas..."
              value={historyFilterOfficer}
              onChange={(e) => setHistoryFilterOfficer(e.target.value)}
              className="mt-0 w-full text-xs border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 bg-white/80 dark:bg-slate-800/80 text-app-text font-medium focus:outline-none focus:ring-2 focus:ring-app-primary/30 transition-all"
            />
          )}
        </div>
      </div>

      {historyLoading ? (
        <div className="space-y-2.5">
          {SKELETON_RIWAYAT.map((s) => (
            <div key={s} className="rounded-2xl border border-stone-100 dark:border-stone-700/50 overflow-hidden">
              <div className="p-3.5 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-8 h-8 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-32" />
                    <div className="skeleton h-3 w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto w-16 h-16 mb-3 text-stone-200 dark:text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12m-3.75.75h9.75m-9.75 0V19.5m0 2.25h9.75m-9.75 0V19.5m0 2.25h9.75" />
          </svg>
          <p className="text-xs font-extrabold text-app-text dark:text-slate-200">Belum ada data absensi.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="group flex items-start gap-3 p-3.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-stone-100 dark:border-stone-700/50 rounded-2xl hover:bg-stone-50/80 dark:hover:bg-stone-800/80 transition-all duration-200"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-app-text dark:text-slate-100 tracking-tight">
                    {item.officer_name}
                  </span>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border-0 ${getBadgeStyles(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  {item.role && (
                    <span className="text-[10px] font-medium text-app-muted">
                      Role: <span className="text-app-text dark:text-slate-300">{item.role}</span>
                    </span>
                  )}
                  {item.prayer && (
                    <span className="text-[10px] font-medium text-app-muted">
                      Shalat: <span className="text-app-text dark:text-slate-300">{item.prayer}</span>
                    </span>
                  )}
                  {item.prayer_time && (
                    <span className="text-[10px] font-medium text-app-muted">
                      Jam Adzan: <span className="text-app-text dark:text-slate-300">{item.prayer_time}</span>
                    </span>
                  )}
                  {item.scan_time && (
                    <span className="text-[10px] font-medium text-app-muted">
                      Scan: <span className="text-app-text dark:text-slate-300">{item.scan_time}</span>
                    </span>
                  )}
                  {item.attendance_date && (
                    <span className="text-[10px] font-medium text-app-muted">
                      Tanggal: <span className="text-app-text dark:text-slate-300">{item.attendance_date}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
