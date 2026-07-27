'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, X, Loader2, User, Clock } from 'lucide-react';

export default function ApprovePage() {
  const params = useParams();
  const token = params.token;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
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
        setLoading(false);
      }
    }

    if (token) {
      fetchToken();
    }
  }, [token]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h1 className="text-sm font-bold text-app-text dark:text-slate-100 text-center mb-4">
          Konfirmasi Absensi
        </h1>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-xs">
            <User className="text-app-muted" size={16} />
            <span className="text-slate-700 dark:text-slate-300 font-bold">{qrData?.officer_name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="text-app-muted" size={16} />
            <span className="text-slate-600 dark:text-slate-400">
              {qrData?.prayer} - {qrData?.prayer_time} WIB
            </span>
          </div>
        </div>

        {error && (
          <p className="text-[10px] text-rose-500 text-center mb-3">{error}</p>
        )}

        <button
          onClick={handleApprove}
          disabled={submitting}
          className="w-full bg-app-primary text-white py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-app-primary-dark active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
