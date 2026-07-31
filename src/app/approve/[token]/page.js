'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, X, Loader2, User, Clock, Lock } from 'lucide-react';
import { getSession, setSession } from '@/lib/session';

export default function ApprovePage() {
  const params = useParams();
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [needsPin, setNeedsPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [identityError, setIdentityError] = useState('');

  const currentSession = getSession();

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function fetchToken() {
      try {
        const res = await fetch(`/api/approve?token=${token}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.message || 'Token tidak valid');
        } else {
          setQrData(data.qrToken);
        }
      } catch (err) {
        setError('Gagal memuat data token');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchToken();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!qrData || !token) return;

    const session = getSession();

    if (!session) {
      setNeedsPin(true);
      return;
    }

    if (session.officerId && qrData.officer_id && session.officerId !== qrData.officer_id) {
      setIdentityError('QR ini bukan untuk akun Anda. Scan ini tidak bisa dipakai untuk presensi Anda.');
      setNeedsPin(false);
      return;
    }

    setNeedsPin(false);
    setIdentityError('');
  }, [qrData, token]);

  async function handlePinSubmit(e) {
    e.preventDefault();
    setPinError('');
    setPinLoading(true);

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (data.success && data.session) {
        setSession(data.session);

        const session = getSession();
        if (qrData.officer_id && session.officerId !== qrData.officer_id) {
          setIdentityError('QR ini bukan untuk akun Anda. Scan ini tidak bisa dipakai untuk presensi Anda.');
          setNeedsPin(false);
        } else {
          setIdentityError('');
          setNeedsPin(false);
        }
      } else {
        setPinError(data.message || 'PIN salah');
      }
    } catch (err) {
      setPinError('Terjadi kesalahan jaringan');
    } finally {
      setPinLoading(false);
    }
  }

  async function handleApprove() {
    setSubmitting(true);

    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Gagal menyimpan absensi');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="animate-spin text-app-primary mx-auto mb-2" size={32} />
          <p className="text-sm text-slate-600 dark:text-slate-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error && !qrData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center max-w-sm mx-auto p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
          <X className="text-rose-500 mx-auto mb-2" size={32} />
          <p className="text-sm text-slate-700 dark:text-slate-300 font-bold mb-1">Gagal</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center max-w-sm mx-auto p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
          <Check className="text-emerald-500 mx-auto mb-2" size={32} />
          <p className="text-sm text-slate-700 dark:text-slate-300 font-bold mb-1">Absensi Tercatat</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Terima kasih, {qrData?.officer_name || 'petugas'}. Kehadiran Anda telah disimpan.
          </p>
        </div>
      </div>
    );
  }

  if (identityError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center max-w-sm mx-auto p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
          <X className="text-rose-500 mx-auto mb-2" size={32} />
          <p className="text-sm text-slate-700 dark:text-slate-300 font-bold mb-1">Akses Ditolak</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{identityError}</p>
        </div>
      </div>
    );
  }

  if (needsPin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <h1 className="text-sm font-bold text-app-text dark:text-slate-100 text-center mb-1">
            Masukkan PIN
          </h1>
          <p className="text-[10px] text-app-muted text-center mb-4">
            Masukkan PIN akun Anda untuk memverifikasi identitas
          </p>

          {qrData && (
            <div className="space-y-2 mb-5 p-3 rounded-xl bg-stone-50 dark:bg-slate-700/50 border border-stone-200 dark:border-stone-600">
              <div className="flex items-center gap-2 text-xs">
                <User className="text-app-muted" size={14} />
                <span className="text-slate-700 dark:text-slate-300 font-bold">{qrData.officer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="text-app-muted" size={14} />
                <span className="text-slate-600 dark:text-slate-400">
                  {qrData.prayer} - {qrData.prayer_time} WIB
                </span>
              </div>
            </div>
          )}

          {pinError && (
            <p className="text-[10px] text-rose-500 text-center mb-3">{pinError}</p>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              pattern="\d{6}"
              placeholder="PIN 6 digit"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="
                w-full
                text-center
                text-lg
                tracking-[0.5em]
                font-mono
                border
                border-stone-200
                dark:border-stone-700
                rounded-xl
                px-4
                py-3
                bg-white/80
                dark:bg-slate-800/80
                text-app-text
                font-bold
                focus:outline-none
                focus:ring-2
                focus:ring-app-primary/30
              "
              autoFocus
            />

            <button
              type="submit"
              disabled={pinLoading || pin.length !== 6}
              className="
                w-full
                bg-app-primary
                text-white
                py-2.5
                rounded-xl
                text-xs
                font-bold
                shadow-sm
                hover:bg-app-primary-dark
                active:scale-95
                transition-all
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {pinLoading ? (
                <Loader2 className="animate-spin inline mr-1" size={14} />
              ) : (
                <Lock className="inline mr-1" size={14} />
              )}
              {pinLoading ? 'Memverifikasi...' : 'Verifikasi & Lanjutkan'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h1 className="text-sm font-bold text-app-text dark:text-slate-100 text-center mb-4">
          Konfirmasi Absensi
        </h1>

        {error && (
          <p className="text-[10px] text-rose-500 text-center mb-3">{error}</p>
        )}

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-xs">
            <User className="text-app-muted" size={16} />
            <span className="text-slate-700 dark:text-slate-300 font-bold">{qrData?.officer_name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="text-app-muted" size={16} />
            <span className="text-slate-600 dark:text-slate-400">
              {qrData?.prayer} - {qrData.prayer_time} WIB
            </span>
          </div>
        </div>

        <button
          onClick={handleApprove}
          disabled={submitting}
          className="
            w-full
            bg-app-primary
            text-white
            py-2.5
            rounded-xl
            text-xs
            font-bold
            shadow-sm
            hover:bg-app-primary-dark
            active:scale-95
            transition-all
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {submitting ? (
            <Loader2 className="animate-spin inline mr-1" size={14} />
          ) : (
            <Check className="inline mr-1" size={14} />
          )}
          {submitting ? 'Menyimpan...' : 'Setuju / Approve'}
        </button>
      </div>
    </div>
  );
}
