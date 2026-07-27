'use client';

import React from 'react';
import { CalendarDays, ChevronUp, ChevronDown, Save, X, Pencil, Trash2 } from 'lucide-react';

export default function JadwalView({
  allAssignments,
  allAssignmentsLoading,
  expandedDates,
  editingAssignmentId,
  editForm,
  officers,
  fetchAllAssignments,
  toggleDateExpanded,
  startEditAssignment,
  cancelEditAssignment,
  saveAssignmentEdit,
  deleteAssignment,
  showAddAssignmentForm,
  setShowAddAssignmentForm,
  addAssignmentForm,
  setAddAssignmentForm,
  createAssignment,
}) {
  const grouped = allAssignments.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const prayerLabels = {
    subuh: 'Subuh',
    dzuhur: 'Dzuhur',
    ashar: 'Ashar',
    maghrib: 'Maghrib',
    isya: 'Isya',
  };

  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
    } catch {
      return dateStr;
    }
  };

  return (
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
            text-app-text dark:text-slate-100
          "
        >
          <CalendarDays size={14} className="inline mr-1 mb-0.5" />
          Kelola Jadwal
        </h2>

        <button
          onClick={fetchAllAssignments}
          className="
            text-[10px]
            bg-app-primary/10
            text-app-primary
            px-2
            py-1
            rounded-lg
            font-bold
            border
            border-app-border
            hover:bg-app-primary/20
            dark:text-app-primary-light
            dark:bg-app-primary/20
            dark:border-slate-600
            dark:hover:bg-app-primary/30
            transition-colors
          "
        >
          Refresh
        </button>

        {!showAddAssignmentForm ? (
          <button
            onClick={() => setShowAddAssignmentForm(true)}
            className="
              text-[10px]
              bg-app-primary
              text-white
              px-2.5
              py-1
              rounded-lg
              font-bold
              shadow-sm
              hover:bg-app-primary-dark
              active:scale-95
              transition-all
            "
          >
            + Tambah Jadwal
          </button>
        ) : (
          <button
            onClick={() => setShowAddAssignmentForm(false)}
            className="
              text-[10px]
              bg-white dark:bg-slate-700
              text-app-muted dark:text-slate-200
              border
              border-app-border dark:border-slate-600
              px-2.5
              py-1
              rounded-lg
              font-bold
              hover:bg-slate-50 dark:hover:bg-slate-600
              active:scale-95
              transition-all
            "
          >
            Batal
          </button>
        )}
      </div>

      {showAddAssignmentForm && (
        <div
          className="
            bg-white dark:bg-slate-800
            border
            border-app-border dark:border-slate-700
            rounded-2xl
            shadow-sm
            p-3
            mb-3
            space-y-2
          "
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-app-muted font-bold uppercase tracking-wide">
                Tanggal
              </label>
              <input
                type="date"
                value={addAssignmentForm.date}
                onChange={(e) =>
                  setAddAssignmentForm((prev) => ({ ...prev, date: e.target.value }))
                }

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
              <label className="text-[10px] text-app-muted font-bold uppercase tracking-wide">
                Shalat
              </label>
              <select
                value={addAssignmentForm.prayer_id}
                onChange={(e) =>
                  setAddAssignmentForm((prev) => ({ ...prev, prayer_id: e.target.value }))
                }

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
                <option value="subuh">Subuh</option>
                <option value="dzuhur">Dzuhur</option>
                <option value="ashar">Ashar</option>
                <option value="maghrib">Maghrib</option>
                <option value="isya">Isya</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-app-muted font-bold uppercase tracking-wide">
                Imam
              </label>
              <select
                value={addAssignmentForm.imam_id}
                onChange={(e) =>
                  setAddAssignmentForm((prev) => ({ ...prev, imam_id: e.target.value }))
                }

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
                <option value="">- Pilih -</option>
                {officers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-app-muted font-bold uppercase tracking-wide">
                Muadzin
              </label>
              <select
                value={addAssignmentForm.muadzin_id}
                onChange={(e) =>
                  setAddAssignmentForm((prev) => ({ ...prev, muadzin_id: e.target.value }))
                }

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
                <option value="">- Pilih -</option>
                {officers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-[10px] text-app-muted font-bold uppercase tracking-wide">
                Badal Imam
              </label>
              <select
                value={addAssignmentForm.badal_imam_id}
                onChange={(e) =>
                  setAddAssignmentForm((prev) => ({ ...prev, badal_imam_id: e.target.value }))
                }

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
                <option value="">- Pilih -</option>
                {officers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={createAssignment}
              className="
                flex-1
                bg-app-primary
                text-white
                py-2
                rounded-xl
                text-xs
                font-bold
                shadow-sm
                hover:bg-app-primary-dark
                active:scale-95
                transition-all
              "
            >
              Simpan
            </button>
            <button
              onClick={() => setShowAddAssignmentForm(false)}
              className="
                flex-1
                bg-white dark:bg-slate-700
                text-app-muted dark:text-slate-200
                border
                border-app-border dark:border-slate-600
                py-2
                rounded-xl
                text-xs
                font-bold
                hover:bg-slate-50 dark:hover:bg-slate-600
                active:scale-95
                transition-all
              "
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {allAssignmentsLoading ? (
        <div
          className="
            text-center
            py-8
            text-xs
            text-app-muted
          "
        >
          Memuat jadwal...
        </div>
      ) : sortedDates.length === 0 ? (
        <div
          className="
            text-center
            py-8
            text-xs
            text-app-muted
          "
        >
          Belum ada jadwal. Import CSV untuk menambahkan.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedDates.map((date) => {
            const isExpanded = expandedDates[date];
            const items = grouped[date];

            return (
              <div
                key={date}
                className="
                  card-base
                  overflow-hidden
                  transition-all
                  duration-300
                "
              >
                <button
                  onClick={() => toggleDateExpanded(date)}
                  className="
                    w-full
                    flex
                    items-center
                    justify-between
                    px-4
                    py-3
                    hover:bg-stone-50/80
                    dark:hover:bg-stone-800/60
                    transition-colors
                    rounded-t-2xl
                  "
                >
                  <span className="text-xs font-bold text-app-text dark:text-slate-100">
                    {formatDate(date)}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-app-muted dark:text-slate-400 font-medium">
                      {items.length} shalat
                    </span>

                    {isExpanded ? (
                      <ChevronUp size={14} className="text-app-muted dark:text-slate-400" />
                    ) : (
                      <ChevronDown size={14} className="text-app-muted dark:text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-app-border">
                    {items.map((item) => {
                      const isEditing = editingAssignmentId === item.id;

                      if (isEditing) {
                        return (
                          <div
                            key={item.id}
                            className="
                              p-3
                              bg-app-bg/50
                              space-y-2
                            "
                          >
                            <div className="grid grid-cols-1 gap-2">
                              <div>
                                <label className="text-[10px] text-app-muted font-bold uppercase tracking-wide">
                                  Imam
                                </label>

                                <select
                                  value={editForm.imam_id}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      imam_id: e.target.value,
                                    }))
                                  }

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
                                  <option value="">- Pilih -</option>

                                  {officers.map((o) => (
                                    <option key={o.id} value={o.id}>
                                      {o.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-app-muted font-bold uppercase tracking-wide">
                                  Muadzin
                                </label>

                                <select
                                  value={editForm.muadzin_id}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      muadzin_id: e.target.value,
                                    }))
                                  }

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
                                  <option value="">- Pilih -</option>

                                  {officers.map((o) => (
                                    <option key={o.id} value={o.id}>
                                      {o.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-app-muted font-bold uppercase tracking-wide">
                                  Badal Imam
                                </label>

                                <select
                                  value={editForm.badal_imam_id}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      badal_imam_id: e.target.value,
                                    }))
                                  }

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
                                  <option value="">- Pilih -</option>

                                  {officers.map((o) => (
                                    <option key={o.id} value={o.id}>
                                      {o.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => saveAssignmentEdit(item.id)}
                                className="
                                  flex-1
                                  bg-app-primary
                                  text-white
                                  py-2
                                  rounded-xl
                                  text-xs
                                  font-bold
                                  shadow-sm
                                  hover:bg-app-primary-dark
                                  active:scale-95
                                  transition-all
                                "
                              >
                                <Save size={14} className="inline mr-1 mb-0.5" />
                                Simpan
                              </button>

                              <button
                                onClick={cancelEditAssignment}
                                className="
                                  flex-1
                                  bg-white dark:bg-slate-700
                                  text-app-muted dark:text-slate-200
                                  border
                                  border-app-border dark:border-slate-600
                                  py-2
                                  rounded-xl
                                  text-xs
                                  font-bold
                                  hover:bg-slate-50 dark:hover:bg-slate-600
                                  active:scale-95
                                  transition-all
                                "
                              >
                                <X size={14} className="inline mr-1 mb-0.5" />
                                Batal
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={item.id}
                          className="
                            flex
                            items-center
                            justify-between
                            px-3
                            py-2.5
                          "
                        >
                          <div className="flex-1">
                            <p className="text-xs font-bold text-app-text dark:text-slate-100">
                              {prayerLabels[item.prayer_id] || item.prayer_id}
                            </p>

                            <div className="text-[10px] text-app-muted dark:text-slate-400 font-medium mt-0.5 space-x-2">
                              <span>Imam: {item.imam?.name || '-'}</span>
                              <span>Muadzin: {item.muadzin?.name || '-'}</span>
                              <span>Badal: {item.badal?.name || '-'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 ml-3">
                            <button
                              onClick={() => startEditAssignment(item)}
                              className="
                                p-1.5
                                rounded-lg
                                text-app-primary
                                hover:bg-app-primary/10
                                dark:hover:bg-app-primary/20
                                transition-colors
                              "
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm('Hapus jadwal ini?')) {
                                  deleteAssignment(item.id);
                                }
                              }}
                              className="
                                p-1.5
                                rounded-lg
                                text-app-error
                                hover:bg-rose-50
                                dark:hover:bg-rose-900/40
                                transition-colors
                              "
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
