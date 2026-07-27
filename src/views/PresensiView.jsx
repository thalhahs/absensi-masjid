'use client';

import React, { useState, useEffect } from 'react';
import { parseTimeToMinutes, getDateMinutes } from '@/lib/attendance';
import { Bell, X, Timer, QrCode, Crown, Shield, Check, User } from 'lucide-react';
import QrCodeModal from '@/components/QrCodeModal';

function getIqomahCountdown(adzanTime, prayerId, now) {
  if (!adzanTime || adzanTime === '--:--' || !prayerId || !now) {
    return null;
  }

  const adzanMinutes = parseTimeToMinutes(adzanTime);
  const iqomahMinutes = prayerId === 'subuh' ? 20 : 15;
  const iqomahEndMinutes = adzanMinutes + iqomahMinutes;
  const currentMinutes = getDateMinutes(now);

  if (currentMinutes >= adzanMinutes && currentMinutes <= iqomahEndMinutes) {
    const diff = iqomahEndMinutes - currentMinutes;
    const mins = Math.floor(diff / 60);
    const secs = diff - mins * 60;
    return {
      minutes: mins,
      seconds: secs,
      label: prayerId === 'subuh' ? 'Iqomah Shubuh' : 'Iqomah',
    };
  }

  return null;
}

export default function PresensiView({
  sortedOfficers,
  schedules,
  selectedPrayer,
  setSelectedPrayer,
  currentSchedule,
  currentTime,
  reminderNotification,
  isReminderMuted,
  setReminderNotification,
  setIsReminderMuted,
  getOfficerMeta,
  generateQrCode,
  qrSuccessNotification,
  setQrSuccessNotification,
  suppressReminders,
}) {
  const [qrModal, setQrModal] = useState({
    isOpen: false,
    officerName: '',
    role: '',
    prayer: '',
    prayerTime: '',
    token: '',
    expiresAt: null,
  });

  const iqomahInfo = getIqomahCountdown(
    currentSchedule.time,
    currentSchedule.id,
    currentTime,
  );

  const iqomahEndTime = iqomahInfo
    ? (() => {
        const [h, m] = currentSchedule.time.split(":").map(Number);
        const total = h * 60 + m + (currentSchedule.id === "subuh" ? 20 : 15);
        const endH = Math.floor(total / 60) % 24;
        const endM = total % 60;
        return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
      })()
    : null;

  const [scannedTokens, setScannedTokens] = useState(new Set());
  const [scanError, setScanError] = useState('');

  useEffect(() => {
    if (!qrModal.token || !qrModal.isOpen) return;

    const stateRef = { current: qrModal };
    const setState = (updater) => {
      const next = typeof updater === 'function' ? updater(stateRef.current) : updater;
      stateRef.current = next;
    };

    const interval = setInterval(async () => {
      const current = stateRef.current;
      if (!current.token || !current.isOpen) return;

      try {
        const res = await fetch(`/api/approve?token=${current.token}`);
        const data = await res.json();
        if (data.success && data.qrToken?.used) {
          setScannedTokens((prev) => new Set(prev).add(current.officerName + '-' + current.role));
          setQrModal((prev) => ({ ...prev, isOpen: false }));
          setQrSuccessNotification({
            officerName: current.officerName,
            role: current.role,
            prayer: current.prayer,
            prayerTime: current.prayerTime,
          });
          suppressReminders(30000);
        }
      } catch (err) {
        console.error('Polling QR status error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [qrModal.token, qrModal.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* QR Success Notification */}
      {qrSuccessNotification && (
        <div className="relative overflow-hidden rounded-3xl p-4 shadow-lg flex items-start gap-3 shrink-0 border border-stone-200 dark:border-stone-700 bg-white dark:bg-slate-800 mt-2 mb-3 animate-bounce-in">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Check size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-app-muted mb-0.5">
              Absensi Berhasil
            </p>
            <p className="text-sm font-extrabold text-app-text dark:text-slate-100 tracking-tight">
              {qrSuccessNotification.officerName} - {qrSuccessNotification.role}
            </p>
            <p className="text-[11px] font-medium text-app-muted mt-0.5">
              {qrSuccessNotification.prayer} - {qrSuccessNotification.prayerTime} WIB
            </p>
          </div>
        </div>
      )}

      {/* Reminder Notification */}
      {reminderNotification && (
        <div className="relative overflow-hidden rounded-3xl p-4 shadow-sm flex items-start gap-3 shrink-0 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-slate-800/80 mt-2 mb-3 animate-bounce-in">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-slate-700 text-app-primary border border-stone-200 dark:border-stone-600 shrink-0">
            <Bell size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-app-muted mb-0.5">
              Adzan {reminderNotification.prayerName} dalam {reminderNotification.timeUntil} menit
            </p>
            <p className="text-sm font-extrabold text-app-text dark:text-slate-100 tracking-tight">
              {reminderNotification.prayerTime} WIB
            </p>
            {(reminderNotification.imam || reminderNotification.muadzin || reminderNotification.badal) && (
              <div className="text-[11px] font-medium text-app-muted mt-1 space-y-0.5">
                {reminderNotification.imam && (
                  <p>Imam: <span className="text-app-text dark:text-slate-300 font-bold">{reminderNotification.imam}</span></p>
                )}
                {reminderNotification.muadzin && (
                  <p>Muadzin: <span className="text-app-text dark:text-slate-300 font-bold">{reminderNotification.muadzin}</span></p>
                )}
                {reminderNotification.badal && (
                  <p>Badal: <span className="text-app-text dark:text-slate-300 font-bold">{reminderNotification.badal}</span></p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setReminderNotification(null);
                setIsReminderMuted(!isReminderMuted);
              }}
              className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-stone-200 dark:border-stone-600 text-app-muted hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              title={isReminderMuted ? "Unmute" : "Mute"}
            >
              {isReminderMuted ? (
                <X size={14} />
              ) : (
                <Bell size={14} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Iqomah Countdown */}
      {iqomahInfo && (
        <div className="relative overflow-hidden rounded-3xl px-6 py-5 shadow-lg flex items-center justify-between shrink-0 gap-4 border border-white/20 gradient-brown mt-2 mb-4">
          <div className="absolute inset-0 bg-white/5" />
          <div className="relative flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 text-amber-300 shrink-0">
              <Timer size={20} className="stroke-[2.5]" />
            </div>
            <span className="text-sm font-black tracking-tight text-white">
              {iqomahInfo.label}
            </span>
          </div>

          <div className="relative text-right">
            <div className="text-3xl font-mono font-extrabold leading-none tracking-widest text-white">
              {String(iqomahInfo.minutes).padStart(2, "0")}:
              {String(iqomahInfo.seconds).padStart(2, "0")}
            </div>
            <div className="text-[11px] text-emerald-100 font-semibold mt-1 tracking-wide">
              Berakhir pukul {iqomahEndTime || "--:--"} WIB
            </div>
          </div>
        </div>
      )}

      {/* PILIH SHALAT */}
      <div className="my-3">
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          {schedules.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedPrayer(s.id)}
              className={`
                flex-1
                min-w-0
                px-3 sm:px-5
                py-3
                rounded-2xl
                text-xs
                font-bold
                transition-all
                duration-200
                border
                ${
                  selectedPrayer === s.id
                    ? "gradient-brown text-white shadow-md scale-[1.02] border-transparent"
                    : "bg-white/80 dark:bg-slate-800/80 text-app-muted border-stone-200 dark:border-stone-700 hover:shadow-sm hover:bg-stone-50 dark:hover:bg-stone-800"
                }
              `}
            >
              <div className="text-sm font-extrabold tracking-tight">{s.name}</div>
              <div className="font-mono text-[11px] font-bold mt-0.5 opacity-90">
                {s.time}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* LIST PETUGAS */}
      <main className="flex-1 glass-strong rounded-3xl shadow-sm p-4 overflow-auto border border-stone-200/80 dark:border-stone-700/60">
        <div className="space-y-2">
          {sortedOfficers.map((officer) => {
            const meta = getOfficerMeta(officer);

            const roleConfig = {
              Imam: {
                icon: Crown,
                gradient: "from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30",
                iconColor: "text-amber-600 dark:text-amber-400",
                avatarText: "text-amber-700 dark:text-amber-300",
                border: "border-l-amber-400 dark:border-l-amber-500",
                borderLeft: "amber",
                badge: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
              },
              Muadzin: {
                icon: Bell,
                gradient: "from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30",
                iconColor: "text-cyan-600 dark:text-cyan-400",
                avatarText: "text-cyan-700 dark:text-cyan-300",
                border: "border-l-cyan-400 dark:border-l-cyan-500",
                borderLeft: "cyan",
                badge: "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/60",
              },
              "Badal Imam": {
                icon: Shield,
                gradient: "from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30",
                iconColor: "text-emerald-600 dark:text-emerald-400",
                avatarText: "text-emerald-700 dark:text-emerald-300",
                border: "border-l-emerald-400 dark:border-l-emerald-500",
                borderLeft: "emerald",
                badge: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
              },
            };

            const roleStyle =
              roleConfig[meta.roleTitle] || roleConfig["Badal Imam"];

            const RoleIcon = roleStyle.icon;

            return (
              <div
                key={officer.id}
                className="group flex items-center justify-between p-3.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-stone-100 dark:border-stone-700/50 rounded-2xl hover:bg-stone-50/80 dark:hover:bg-stone-800/80 transition-all duration-200 active:scale-[0.98] border-l-4"
                style={{
                  borderLeftColor: meta.roleTitle === 'Imam' ? '#f59e0b' : meta.roleTitle === 'Muadzin' ? '#06b6d4' : '#10b981',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar with role icon */}
                  <div className={`flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br ${roleStyle.gradient} ${roleStyle.iconColor} shadow-sm border border-white/60 dark:border-white/5 shrink-0`}>
                    <RoleIcon size={18} strokeWidth={2.5} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-app-text dark:text-slate-100 tracking-tight leading-tight truncate">
                      {officer.name}
                    </p>
                    <span
                      className={`
                        text-[10px]
                        font-bold
                        px-2
                        py-0.5
                        rounded-full
                        inline-block
                        mt-1
                        border
                        ${roleStyle.badge}
                      `}
                    >
                      {meta.roleTitle}
                    </span>
                    {meta.scanRole && (
                      <p className="text-[10px] text-app-muted font-medium mt-1">
                        {meta.windowLabel}
                      </p>
                    )}
                  </div>
                </div>

                {meta.scanRole && (
                  <button
                    disabled={!meta.windowOpen}

                    onClick={async () => {
                      const result = await generateQrCode(
                        officer.name,
                        meta.scanRole,
                        currentSchedule
                      );
                      if (result?.success && result.token) {
                        setQrModal({
                          isOpen: true,
                          officerName: officer.name,
                          role: meta.scanRole,
                          prayer: currentSchedule.name || currentSchedule.id,
                          prayerTime: currentSchedule.time,
                          token: result.token,
                          expiresAt: result.expiresAt,
                        });
                      }
                    }}

                    className={`
                      relative
                      flex items-center justify-center
                      p-2.5
                      rounded-2xl
                      transition-all
                      duration-200
                      overflow-hidden

                      ${meta.windowOpen
                        ? "gradient-brown text-white shadow-md hover:shadow-lg active:scale-95"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400 border border-stone-200 dark:border-stone-700"
                      }
                    `}
                  >
                    {meta.windowOpen && (
                      <span className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl" />
                    )}
                    <QrCode size={26} className="relative" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <QrCodeModal
        isOpen={qrModal.isOpen}
        onClose={() =>
          setQrModal((prev) => ({ ...prev, isOpen: false }))
        }
        token={qrModal.token}
        officerName={qrModal.officerName}
        prayer={qrModal.prayer}
        prayerTime={qrModal.prayerTime}
        expiresAt={qrModal.expiresAt}
      />
    </>
  );
}
