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

  // Poll QR token status to detect scans from other devices
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
      {qrSuccessNotification && (
        <div
          className="
            rounded-3xl
            p-4
            shadow-lg
            flex
            items-start
            justify-between
            shrink-0
            gap-3
            border
            border-emerald-200
            bg-emerald-50
            dark:bg-emerald-900/40
            dark:border-emerald-600
            animate-bounce-in
            mt-2
            mb-3
          "
        >
          <div className="flex items-start gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-800 p-2 rounded-xl mt-0.5">
              <Check size={22} className="text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-200">
                Absensi Berhasil
              </p>
              <p className="text-xs font-bold mt-0.5 text-emerald-900 dark:text-emerald-100">
                {qrSuccessNotification.officerName} - {qrSuccessNotification.role}
              </p>
              <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 mt-0.5">
                {qrSuccessNotification.prayer} - {qrSuccessNotification.prayerTime} WIB
              </p>
            </div>
          </div>
        </div>
      )}
      {reminderNotification && (
        <div
          className={`
            rounded-3xl
            p-4
            shadow-lg
            flex
            items-start
            justify-between
            shrink-0
            gap-3
            border
            animate-bounce-in
            mt-2
            mb-3
            
            "bg-rose-200 text-rose-900 border-rose-300 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-600"
          `
          }
        >
          <div className="flex items-start gap-3">
            <div className="bg-white/40 p-2 rounded-xl mt-0.5">
              <Bell size={22} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">
                Adzan {reminderNotification.prayerName} dalam {reminderNotification.timeUntil} menit
              </p>
              <p className="text-xs font-bold mt-0.5 opacity-90">
                {reminderNotification.prayerTime} WIB
              </p>
              <div className="text-[11px] font-medium opacity-90 mt-1 space-y-0.5">
                {reminderNotification.imam && (
                  <p>Imam: {reminderNotification.imam}</p>
                )}
                {reminderNotification.muadzin && (
                  <p>Muadzin: {reminderNotification.muadzin}</p>
                )}
                {reminderNotification.badal && (
                  <p>Badal: {reminderNotification.badal}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReminderNotification(null);
                setIsReminderMuted(!isReminderMuted);
              }}
              className="
                bg-white/20
                hover:bg-white/30
                p-2
                rounded-xl
                transition-colors
              "
              title={isReminderMuted ? "Unmute" : "Mute"}
            >
              {isReminderMuted ? (
                <X size={16} />
              ) : (
                <Bell size={16} />
              )}
            </button>
          </div>
        </div>
      )}
      {iqomahInfo && (
        <div
          className="
            bg-gradient-to-r from-app-primary-dark to-app-primary
            text-white
            px-6
            py-5
            rounded-3xl
            shadow-lg
            flex
            items-center
            justify-between
            shrink-0
            gap-4
            border
            border-white/20
            mt-2
            mb-4
          "
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Timer size={22} className="text-amber-300" />
            </div>
            <span className="text-sm font-bold tracking-wide">
              {iqomahInfo.label}
            </span>
          </div>

          <div className="text-right">
            <div className="text-3xl font-mono font-extrabold leading-none tracking-wider">
              {String(iqomahInfo.minutes).padStart(2, "0")}:
              {String(iqomahInfo.seconds).padStart(2, "0")}
            </div>
            <div className="text-[11px] text-emerald-100 font-medium mt-1">
              Berakhir pukul {iqomahEndTime || "--:--"} WIB
            </div>
          </div>
        </div>
      )}
      {/* PILIH SHALAT */}
      <div className="my-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {schedules.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedPrayer(s.id)}
              className={`
                flex-shrink-0
                px-4
                py-2.5
                rounded-2xl
                text-xs
                font-bold
                transition-all
                duration-300
                border
                ${
                  selectedPrayer === s.id
                    ? "gradient-brown text-white shadow-md scale-[1.02] border-transparent"
                    : "bg-white/80 dark:bg-slate-800/80 text-app-muted border-stone-200 dark:border-slate-700 hover:shadow-sm"
                }
              `}
            >
              <div className="text-sm font-semibold">{s.name}</div>
              <div className="font-mono text-[11px] font-bold mt-0.5 opacity-80">
                {s.time}
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* LIST PETUGAS */}
      <main
        className="
        flex-1
        glass-strong
        rounded-3xl
        shadow-sm
        p-4
        overflow-auto
        border
        border-stone-200/80
        dark:border-stone-700/60
      "
      >
        <div
          className="
            space-y-3
          "
        >
          {sortedOfficers.map((officer) =>
            (() => {
              const meta = getOfficerMeta(officer);

              const roleConfig = {
                Imam: {
                  icon: Crown,
                  gradient: "from-amber-100 to-orange-100",
                  iconColor: "text-amber-600",
                  border: "border-l-amber-400",
                  badge: "role-imam",
                },
                Muadzin: {
                  icon: Bell,
                  gradient: "from-cyan-100 to-blue-100",
                  iconColor: "text-cyan-600",
                  border: "border-l-cyan-400",
                  badge: "role-muadzin",
                },
                "Badal Imam": {
                  icon: Shield,
                  gradient: "from-emerald-100 to-green-100",
                  iconColor: "text-emerald-600",
                  border: "border-l-emerald-400",
                  badge: "role-badal",
                },
              };

              const roleStyle =
                roleConfig[meta.roleTitle] ||
                roleConfig["Badal Imam"];

              const RoleIcon = roleStyle.icon;

              return (
                <div
                  key={officer.id}

                  className={`
            flex
            items-center
            justify-between
            card-base
            p-4
            border-l-4
            ${roleStyle.border}
            animate-fade-in
            active:scale-[0.98]
          `
                  }
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar with initials */}
                    <div
                      className={`
                w-11 h-11
                rounded-2xl
                flex
                items-center
                justify-center
                text-sm
                font-bold
                shadow-sm
                ${roleStyle.iconColor}
                bg-gradient-to-br ${roleStyle.gradient}
              `}
                    >
                      {officer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>

                    <div>
                      <p className="font-bold text-sm text-app-text tracking-tight leading-tight">
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
                  ${roleStyle.badge}
                  border
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
                p-2.5
                rounded-2xl
                shadow-lg
                transition-all
                duration-200
                relative
                overflow-hidden

                 ${
                   meta.windowOpen
                     ? "bg-gradient-to-br from-[#7D5A41] to-[#D3AF96] text-white hover:shadow-xl hover:scale-110 active:scale-95 dark:hover:shadow-none dark:border dark:border-white/10"
                     : "bg-slate-100 text-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400"
                 }

                `
                      }
                    >
                      {meta.windowOpen && (
                        <span className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl" />
                      )}
                      <QrCode size={26} />
                    </button>
                  )}
                </div>
              );
            })(),
          )}
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
