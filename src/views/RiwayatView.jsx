'use client';

import React from 'react';
import { History, Download } from 'lucide-react';

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
  const uniqueOfficers = Array.from(
    new Set(history.map((item) => item.officer_name)),
  ).filter(Boolean);

  return (
    <main
      className="
      flex-1
      bg-white dark:bg-slate-800
      rounded-2xl
      shadow-sm
      p-3
      overflow-auto
      border
      border-app-border dark:border-slate-700
    "
    >
      <div
        className="
        flex
        items-center
        justify-between
        mb-3
      "
    >
      <h2
        className="
        text-xs
        font-bold
        uppercase
        text-app-text
      "
      >
        <History size={14} className="inline mr-1 mb-0.5" />
        Riwayat Absensi
      </h2>

      <span
        className="
        text-xs
        bg-app-primary/10
        text-app-primary
        px-2
        py-1
        rounded-full
        font-bold
      "
      >
        {history.length} data
      </span>

      <button
        onClick={exportHistoryCSV}
        className="
        flex
        items-center
        gap-1
        text-[10px]
        bg-app-success/10
        text-app-success
        px-2
        py-1
        rounded-full
        font-bold
        hover:bg-app-success/20
        transition-colors
      "
      >
        <Download size={12} />
        Export CSV
      </button>
    </div>

      <div
        className="
        grid
        grid-cols-1
        sm:grid-cols-2
        gap-2
        mb-3
      "
      >
        <div>
          <label
            className="
            text-[10px]
            text-slate-500
            font-semibold
            uppercase
          "
          >
            Filter Tanggal
          </label>

          <input
            type="date"
            value={historyFilterDate}
            onChange={(e) => setHistoryFilterDate(e.target.value)}

            className="
            mt-1
            w-full
            text-xs
            border
            border-app-border
            rounded-xl
            px-2.5
            py-2
            bg-white dark:bg-slate-700 dark:text-slate-100
            font-medium
            focus:outline-none
            focus:ring-2
            focus:ring-app-primary/30
          "
          />
        </div>

        <div>
          <label
            className="
            text-[10px]
            text-slate-500
            font-semibold
            uppercase
          "
          >
            Filter Petugas
          </label>

          {officers.length > 0 ? (
            <select
              value={historyFilterOfficer}
              onChange={(e) => setHistoryFilterOfficer(e.target.value)}

              className="
              mt-1
              w-full
              text-xs
              border
              border-app-border
              rounded-xl
              px-2.5
              py-2
              bg-white dark:bg-slate-700 dark:text-slate-100
              font-medium
              focus:outline-none
              focus:ring-2
              focus:ring-app-primary/30
            "
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

              className="
              mt-1
              w-full
              text-xs
              border
              border-app-border
              rounded-xl
              px-2.5
              py-2
              bg-white
              font-medium
              focus:outline-none
              focus:ring-2
              focus:ring-app-primary/30
            "
            />
          )}
        </div>
      </div>

      {historyLoading ? (
        <div
          className="
          text-center
          py-8
          text-xs
          text-slate-400
        "
        >
          Memuat data...
        </div>
      ) : history.length === 0 ? (
        <div
          className="
          text-center
          py-8
          text-xs
          text-slate-400
        "
        >
          Belum ada data absensi.
        </div>
      ) : (
        <div
          className="
          space-y-2
          max-h-[60vh]
          overflow-auto
        "
        >
          {history.map((item) => {
            const statusColors = {
              HADIR: "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-md shadow-emerald-200",

              TERLAMBAT: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md shadow-amber-200",

              ALFA: "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 shadow-md shadow-rose-200",

              SUKSES: "bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-md shadow-purple-200",
            };

            return (
               <div
                 key={item.id}
                 className="
                 bg-white/80 dark:bg-slate-800/80
                 backdrop-blur-sm
                 border
                 border-app-border dark:border-slate-700
                 rounded-2xl
                 p-3
                 shadow-sm
                 hover:shadow-md
                 transition-all
                 duration-200
               "
               >
                <div
                  className="
                  flex
                  items-center
                  justify-between
                  mb-1
                "
              >
                <span
                  className="
                  text-xs
                  font-bold
                  text-app-text
                "
              >
                {item.officer_name}
              </span>

              <span
                className={`
                  text-[10px]
                  font-bold
                  px-2
                  py-0.5
                  rounded-full
                  border
                  ${statusColors[item.status] || statusColors.HADIR}
                `}
              >
                {item.status}
              </span>
            </div>

            <div
              className="
              text-[10px]
              text-app-muted
              grid grid-cols-2 gap-x-3 gap-y-0.5
              font-medium
            "
          >
            <span>
              Role:{" "}
              <span className="font-bold text-app-text">
                {item.role}
              </span>
            </span>

            <span>
              Shalat:{" "}
              <span className="font-bold text-app-text">
                {item.prayer}
              </span>
            </span>

            <span>
              Jam Adzan:{" "}
              <span className="font-bold text-app-text">
                {item.prayer_time}
              </span>
            </span>

            <span>
              Scan:{" "}
              <span className="font-bold text-app-text">
                {item.scan_time}
              </span>
            </span>

            <span className="col-span-2">
              Tanggal:{" "}
              <span className="font-bold text-app-text">
                {item.attendance_date}
              </span>
            </span>
          </div>
        </div>
      );
    })}
        </div>
      )}
    </main>
  );
}
