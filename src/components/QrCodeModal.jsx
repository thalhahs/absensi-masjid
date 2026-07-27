'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Timer } from 'lucide-react';

export default function QrCodeModal({
  isOpen,
  onClose,
  token,
  officerName,
  prayer,
  prayerTime,
  expiresAt,
}) {
  const [timeLeft, setTimeLeft] = useState(0);

  const isActive = isOpen && expiresAt;

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const tick = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(diff);
    };

    tick();

    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [isActive, expiresAt]);

  if (!isOpen || !token) {
    return null;
  }

  const qrUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/approve/${token}`;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 max-w-xs w-full border border-app-border dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-app-text dark:text-slate-100">
            QR Code Absensi
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-3 rounded-2xl border border-app-border">
            <QRCodeSVG value={qrUrl} size={180} />
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-app-text dark:text-slate-100">
              {officerName}
            </p>
            <p className="text-[10px] text-app-muted dark:text-slate-400">
              {prayer} - {prayerTime} WIB
            </p>
          </div>

          {timeLeft > 0 ? (
            <div className="flex items-center gap-1 text-rose-500">
              <Timer size={14} />
              <span className="text-[10px] font-bold">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          ) : (
            <p className="text-[10px] text-rose-500 font-bold">QR Code expired</p>
          )}
        </div>
      </div>
    </div>
  );
}
