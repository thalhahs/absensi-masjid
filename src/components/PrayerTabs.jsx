'use client';

import React, { useState } from 'react';

const prayerList = [
  { id: 'subuh', name: 'SUBUH', time: '04:45' },
  { id: 'dzuhur', name: 'DZUHUR', time: '12:00' },
  { id: 'ashar', name: 'ASHAR', time: '15:15' },
  { id: 'maghrib', name: 'MAGHRIB', time: '18:10' },
  { id: 'isya', name: 'ISYA', time: '19:20' },
];

export default function PrayerTabs() {
  const [activePrayer, setActivePrayer] = useState('subuh');

  return (
    <div className="p-4 bg-slate-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-4 rounded-2xl shadow-md">
        
        <p className="text-xs text-slate-500 mb-2 font-medium text-center">
          Waktu Terpilih: <span className="font-bold uppercase text-emerald-800">{activePrayer}</span>
        </p>

        {/* PILIHAN WAKTU SHALAT */}
        <div className="grid grid-cols-5 gap-1 bg-slate-200/80 p-1 rounded-xl">
          {prayerList.map((item) => {
            const isSelected = activePrayer === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePrayer(item.id)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 cursor-pointer select-none ${
                  isSelected 
                    ? 'bg-emerald-950 text-white shadow-md scale-[1.02]' 
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <span className="text-[10px] font-bold tracking-wider pointer-events-none">
                  {item.name}
                </span>
                <span className={`text-xs font-mono mt-0.5 pointer-events-none ${
                  isSelected ? 'text-amber-400 font-bold' : 'text-slate-500'
                }`}>
                  {item.time}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}