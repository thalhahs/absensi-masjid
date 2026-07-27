'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Shield } from 'lucide-react';
import { setSession, getSession, clearSession } from '@/lib/session';

const PIN_LENGTH = 6;

export default function PinGate({ children }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const session = getSession();
    if (session && session.expiresAt && Date.now() > session.expiresAt) {
      clearSession();
    }
  }, []);

  const handlePinChange = useCallback((value) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
    setPin(cleaned);
    setError('');
  }, []);

  const login = useCallback(async () => {
    if (pin.length !== PIN_LENGTH) {
      setError(`Masukkan ${PIN_LENGTH} digit PIN`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();
      console.log('PIN login response:', data);

      if (!res.ok || !data.success) {
        setError(data.message || 'PIN salah');
        setLoading(false);
        return;
      }

      setSession(data.session);
      setPin('');
      setLoading(false);
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.name === 'AbortError' ? 'Permintaan timeout' : 'Gagal terhubung ke server');
      setLoading(false);
    }
  }, [pin]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      login();
    }
  }, [pin, login]);

  const fillDigit = (digit) => {
    handlePinChange(pin + digit);
  };

  const clearPin = () => {
    handlePinChange('');
  };

  // Always show PIN gate - no auto-login from localStorage
  // User must enter PIN every time they open the app

  const digits = pin.split('').map(() => '●').join('');

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-800 p-3">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl gradient-brown text-white mb-3">
            <Shield size={28} className="stroke-[2.5]" />
          </div>
          <h1 className="text-lg font-extrabold text-app-text dark:text-slate-100 tracking-tight">
            Masuk Aplikasi
          </h1>
          <p className="text-[10px] font-bold text-app-muted uppercase tracking-wider mt-1">
            Masukkan PIN Petugas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-stone-700 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-center gap-1 mb-5">
            <Lock size={14} className="text-app-muted" />
            <span className="text-[10px] font-bold text-app-muted uppercase tracking-wider">
              {PIN_LENGTH} Digit PIN
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={`
                  w-10 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-bold
                  transition-all duration-200
                  ${i < pin.length
                    ? 'border-app-primary bg-app-primary/5 dark:bg-app-primary/10 text-app-text'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-slate-800'
                  }
                `}
              >
                {i < pin.length ? '●' : ''}
              </div>
            ))}
          </div>

          {error && (
            <div className="text-center mb-3">
              <p className="text-[10px] font-bold text-app-error">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center mb-3">
              <div className="inline-block w-5 h-5 border-2 border-app-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', 'C'].map((key) => {
              const isBackspace = key === '←';
              const isClear = key === 'C';

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (isClear) {
                      clearPin();
                    } else if (isBackspace) {
                      handlePinChange(pin.slice(0, -1));
                    } else {
                      fillDigit(key);
                    }
                  }}
                  disabled={loading}
                  className={`
                    h-12 rounded-xl text-sm font-bold transition-all duration-200
                    active:scale-95 disabled:opacity-50
                    ${isClear || isBackspace
                      ? 'bg-stone-100 dark:bg-stone-700 text-app-muted border border-stone-200 dark:border-stone-600'
                      : 'bg-white dark:bg-slate-700 text-app-text border border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-slate-600'
                    }
                  `}
                >
                  {isClear ? 'Hapus' : key}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[10px] text-app-muted mt-4 font-medium">
          Masukkan PIN 6 digit untuk mengakses aplikasi
        </p>
      </div>
    </div>
  );
}
