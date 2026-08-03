'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, Shield, User } from 'lucide-react';
import { setSession, clearSession, getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

const PIN_LENGTH = 6;

export default function PinGate({ children }) {
  const [officers, setOfficers] = useState([]);
  const [officersLoading, setOfficersLoading] = useState(true);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(() => {
    const session = getSession();
    if (session?.expiresAt && Date.now() > session.expiresAt) {
      try { clearSession(); } catch {}
      return false;
    }
    return !!session;
  });

  const loadingRef = useRef(false);
  const authenticatedRef = useRef(authenticated);

  useEffect(() => {
    authenticatedRef.current = authenticated;
  }, [authenticated]);

  useEffect(() => {
    const handleLogout = () => {
      setAuthenticated(false);
      setSelectedOfficer(null);
      setPin('');
      setError('');
    };

    window.addEventListener('app:logout', handleLogout);
    return () => window.removeEventListener('app:logout', handleLogout);
  }, []);

  useEffect(() => {
    const fetchOfficers = async () => {
      setOfficersLoading(true);
      const { data, error } = await supabase
        .from('officers')
        .select('id, name, role, active')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error || !data) {
        console.error('Failed to fetch officers:', error);
        setOfficers([]);
      } else {
        setOfficers(data || []);
      }
      setOfficersLoading(false);
    };

    fetchOfficers();
  }, []);

  const handlePinChange = useCallback((value) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
    setPin(cleaned);
    setError('');
  }, []);

  const submitPin = useCallback((pinToSubmit, officer) => {
    if (loadingRef.current || authenticatedRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    fetch('/api/auth/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pinToSubmit }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          const sessionPayload = {
            officerId: officer.id,
            name: officer.name,
            role: officer.role || 'officer',
            expiresAt: Date.now() + (24 * 60 * 60 * 1000),
          };
          setSession(sessionPayload);
          setAuthenticated(true);
        } else {
          setError(data?.message || 'PIN salah');
          setPin('');
          setLoading(false);
          loadingRef.current = false;
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        setError('Gagal terhubung ke server');
        setPin('');
        setLoading(false);
        loadingRef.current = false;
      });
  }, []);

  const fillDigit = useCallback((digit) => {
    const newPin = pin + digit;
    handlePinChange(newPin);
    if (newPin.length === PIN_LENGTH && selectedOfficer) {
      submitPin(newPin, selectedOfficer);
    }
  }, [pin, handlePinChange, submitPin, selectedOfficer]);

  const clearPin = useCallback(() => {
    handlePinChange('');
  }, [handlePinChange]);

  const selectOfficer = (officer) => {
    setSelectedOfficer(officer);
    setPin('');
    setError('');
  };

  if (authenticated) {
    return children;
  }

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
            {selectedOfficer ? `Masukkan PIN untuk ${selectedOfficer.name}` : 'Pilih akun Anda'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-stone-200 dark:border-stone-700 rounded-3xl p-5 shadow-lg">
          {!selectedOfficer ? (
            <>
              <div className="flex items-center justify-center gap-1 mb-4">
                <User size={14} className="text-app-muted" />
                <span className="text-[10px] font-bold text-app-muted uppercase tracking-wider">
                  Daftar Petugas
                </span>
              </div>

              {officersLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-5 h-5 border-2 border-app-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] text-app-muted mt-2">Memuat data...</p>
                </div>
              ) : officers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-app-muted">Tidak ada petugas tersedia</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-auto">
                  {officers.map((officer) => (
                    <button
                      key={officer.id}
                      onClick={() => selectOfficer(officer)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors text-left"
                    >
                      <div className="bg-app-primary/10 dark:bg-app-primary/20 text-app-primary dark:text-app-primary-light p-2 rounded-xl">
                        <User size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-app-text dark:text-slate-100 truncate">
                          {officer.name}
                        </p>
                        <p className="text-[10px] font-bold text-app-muted uppercase tracking-wider">
                          {officer.role === 'superadmin' ? 'Superadmin' : officer.role === 'masjid' ? 'Masjid' : 'Petugas'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-app-muted mt-4 font-medium">
          {selectedOfficer
            ? `Login sebagai ${selectedOfficer.name}`
            : 'Pilih akun terlebih dahulu, lalu masukkan PIN'}
        </p>
      </div>
    </div>
  );
}
