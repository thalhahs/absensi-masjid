'use client';

import React, { useState, useEffect } from 'react';
import { User, CalendarDays, Clock, CheckCircle2, XCircle, Trophy, LogOut, BarChart3 } from 'lucide-react';

export default function ProfileView({ history, officers, session, onLogout, isSuperadmin }) {
  const officerName = session?.name || '';
  const officerRole = session?.role || 'officer';

  const [statsData, setStatsData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!session?.expiresAt) return;

    const updateCountdown = () => {
      const remaining = session.expiresAt - Date.now();
      if (remaining <= 0) {
        setTimeLeft('Session expired');
        return;
      }
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`Session expires in ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [session?.expiresAt]);

  const myHistory = history.filter((item) => item.officer_name === officerName);

  useEffect(() => {
    if (!isSuperadmin) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const { data, error } = await fetch('/api/jadwal-shalat?date=' + new Date().toISOString().split('T')[0])
          .then(r => r.json());
        if (error || !data) {
          setStatsData([]);
        } else {
          setStatsData(data.stats || []);
        }
      } catch {
        setStatsData([]);
      }
      setStatsLoading(false);
    };

    fetchStats();
  }, [isSuperadmin]);

  const hadir = myHistory.filter((item) => item.status === 'HADIR').length;
  const alfa = myHistory.filter((item) => item.status === 'ALFA').length;
  const total = myHistory.length;
  const hadirRate = total > 0 ? Math.round((hadir / total) * 100) : 0;

  const getBadgeStyles = (status) => {
    const styles = {
      HADIR: "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-md",
      ALFA: "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 shadow-md",
    };
    return styles[status] || styles.HADIR;
  };

  return (
    <main className="flex-1 glass-strong rounded-3xl shadow-sm p-4 overflow-auto border border-stone-200/80 dark:border-stone-700/60">
      <h2 className="text-sm font-extrabold text-app-text dark:text-slate-100 tracking-tight mb-4">
        <User size={16} className="inline mr-1.5 mb-0.5 text-app-primary" />
        Profile Saya
      </h2>

      <div className="space-y-4">
        {/* Officer Info Card */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-stone-100 dark:border-stone-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-app-primary/10 dark:bg-app-primary/20 text-app-primary dark:text-app-primary-light p-2 rounded-xl">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-app-text dark:text-slate-100 tracking-tight">
                {officerName || 'Petugas'}
              </p>
              <p className="text-[10px] font-bold text-app-muted uppercase tracking-wider">
                {officerRole === 'superadmin' ? 'Superadmin' : 'Petugas'}
              </p>
            </div>
          </div>
          {timeLeft && (
            <p className="text-[10px] text-app-muted mt-2">
              {timeLeft}
            </p>
          )}

          <button
            onClick={onLogout}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold text-app-muted border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>

        {/* Stats Grid - Personal */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl p-3 text-center">
            <CheckCircle2 size={20} className="mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
              Hadir
            </p>
            <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {hadir}
            </p>
          </div>

          <div className="bg-rose-50/80 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 rounded-2xl p-3 text-center">
            <XCircle size={20} className="mx-auto text-rose-600 dark:text-rose-400 mb-1" />
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
              Alfa
            </p>
            <p className="text-xl font-extrabold text-rose-700 dark:text-rose-300">
              {alfa}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 border border-stone-200 dark:border-stone-700 rounded-2xl p-3 text-center">
            <Trophy size={20} className="mx-auto text-app-primary mb-1" />
            <p className="text-[10px] text-app-muted font-bold uppercase tracking-wider">
              Hadir Rate
            </p>
            <p className="text-xl font-extrabold text-app-text dark:text-slate-100">
              {hadirRate}%
            </p>
          </div>
        </div>

        {/* Superadmin Stats Overview */}
        {isSuperadmin && (
          <div className="mt-4">
            <h3 className="text-xs font-extrabold text-app-text dark:text-slate-100 tracking-tight mb-2">
              <BarChart3 size={14} className="inline mr-1 mb-0.5 text-app-primary" />
              Statistik Semua Petugas
            </h3>

            {statsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="skeleton h-16 rounded-2xl" />
                ))}
              </div>
            ) : statsData.length === 0 ? (
              <p className="text-xs text-app-muted text-center py-4">Belum ada data statistik.</p>
            ) : (
              <div className="space-y-2 max-h-[40vh] overflow-auto">
                {statsData.map((stat) => (
                  <div
                    key={stat.name}
                    className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-stone-100 dark:border-stone-700/50 rounded-2xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-app-text dark:text-slate-100 truncate">
                        {stat.name}
                      </p>
                      <p className="text-[10px] text-app-muted">
                        Hadir: {stat.HADIR} · Alfa: {stat.ALFA}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-app-primary/10 dark:bg-app-primary/20 text-app-primary border border-stone-200 dark:border-stone-700 ml-2">
                      {stat.hadirRate}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Superadmin Stats Section */}
        {isSuperadmin && (
          <div className="mt-4">
            <h3 className="text-xs font-extrabold text-app-text dark:text-slate-100 tracking-tight mb-2">
              <BarChart3 size={14} className="inline mr-1 mb-0.5 text-app-primary" />
              Statistik Semua Petugas
            </h3>
            <div className="text-center py-8">
              <p className="text-[10px] text-app-muted">Fitur statistik dalam pengembangan</p>
            </div>
          </div>
        )}

        {/* Recent History */}
        <div>
          <h3 className="text-xs font-extrabold text-app-text dark:text-slate-100 tracking-tight mb-2">
            <CalendarDays size={14} className="inline mr-1 mb-0.5 text-app-primary" />
            Riwayat Terbaru
          </h3>

          {myHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-app-muted">Belum ada riwayat absensi.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[40vh] overflow-auto">
              {myHistory.slice(0, 20).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-stone-100 dark:border-stone-700/50 rounded-2xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-app-text dark:text-slate-100">
                      {item.prayer}
                    </p>
                    <p className="text-[10px] text-app-muted">
                      {item.attendance_date} · {item.scan_time}
                    </p>
                  </div>
                  <span
                    className={`
                      text-[10px]
                      font-bold
                      px-2
                      py-0.5
                      rounded-full
                      border
                      ${getBadgeStyles(item.status)}
                    `}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
