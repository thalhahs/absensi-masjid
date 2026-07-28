'use client';

import React from 'react';
import { UserPlus, User, Pencil, Trash2, Save, X } from 'lucide-react';

export default function PetugasView({
  officers,
  editingOfficerId,
  editOfficerName,
  newOfficerName,
  addingOfficer,
  setNewOfficerName,
  setEditOfficerName,
  startEditOfficer,
  saveOfficerEdit,
  cancelEditOfficer,
  addOfficer,
  deleteOfficer,
  role,
  isSuperadmin,
}) {
  return (
    <main className="flex-1 glass-strong rounded-3xl shadow-sm p-4 overflow-auto border border-stone-200/80 dark:border-stone-700/60">
      <h2 className="text-sm font-extrabold text-app-text dark:text-slate-100 tracking-tight mb-5">
        <UserPlus size={16} className="inline mr-1.5 mb-0.5 text-app-primary" />
        Tambah Petugas
      </h2>

      <div className="max-w-md mx-auto">
        {!isSuperadmin && (
          <div className="text-center py-3 mb-3 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-stone-700">
            <p className="text-[10px] font-bold text-app-muted">
              Hanya superadmin yang bisa mengelola petugas
            </p>
          </div>
        )}

        {isSuperadmin && (
          <>
            <label className="block text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1.5">
              Nama Petugas
            </label>

            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                placeholder="Contoh: Ustadz Ahmad"
                value={newOfficerName}
                onChange={(e) => setNewOfficerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addOfficer();
                  }
                }}
                className="flex-1 text-xs border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 bg-white/80 dark:bg-slate-800/80 text-app-text font-medium focus:outline-none focus:ring-2 focus:ring-app-primary/30 transition-all"
              />

              <button
                onClick={addOfficer}
                disabled={addingOfficer}
                className="gradient-brown text-white px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                {addingOfficer ? "Menyimpan..." : "Tambah"}
              </button>
            </div>
          </>
        )}

        <div className="mt-5">
          <h3 className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-2.5">
            Daftar Petugas Aktif ({officers.length})
          </h3>

          <div className="space-y-1.5">
            {officers.map((officer) => (
              <div
                key={officer.id}
                className="group flex items-center justify-between px-3 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-stone-100 dark:border-stone-700/50 rounded-2xl hover:bg-stone-50/80 dark:hover:bg-stone-800/80 transition-all duration-200"
              >
                {editingOfficerId === officer.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    {isSuperadmin ? (
                      <>
                        <input
                          type="text"
                          value={editOfficerName}
                          onChange={(e) => setEditOfficerName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveOfficerEdit(officer.id);
                            } else if (e.key === "Escape") {
                              cancelEditOfficer();
                            }
                          }}
                          autoFocus
                          className="flex-1 text-xs border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 bg-white/80 dark:bg-slate-800/80 text-app-text font-medium focus:outline-none focus:ring-2 focus:ring-app-primary/30 transition-all"
                        />

                        <button
                          onClick={() => saveOfficerEdit(officer.id)}
                          className="p-1.5 rounded-lg text-app-primary hover:bg-app-primary/10 dark:hover:bg-app-primary/20 transition-colors"
                        >
                          <Save size={14} />
                        </button>

                        <button
                          onClick={cancelEditOfficer}
                          className="p-1.5 rounded-lg text-app-muted hover:bg-stone-100 dark:hover:bg-stone-700 dark:text-slate-300 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="bg-white dark:bg-slate-700 text-app-muted dark:text-slate-400 p-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                        <User size={14} />
                      </div>

                      <span className="text-sm font-bold text-app-text dark:text-slate-100 tracking-tight">
                        {officer.name}
                      </span>
                    </div>

                    {isSuperadmin && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => startEditOfficer(officer)}
                          className="p-1.5 rounded-lg text-app-primary hover:bg-app-primary/10 dark:hover:bg-app-primary/20 transition-colors"
                          title="Edit nama"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus petugas "${officer.name}"?`)) {
                              deleteOfficer(officer.id, officer.name);
                            }
                          }}
                          className="p-1.5 rounded-lg text-app-error hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}
                <span
                  className={`
                    text-[10px]
                    px-2
                    py-0.5
                    rounded-full
                    font-bold
                    border
                    ${
                      officer.active
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                        : "bg-slate-100 dark:bg-slate-700 text-app-muted dark:text-slate-400 border-slate-200 dark:border-slate-600"
                    }
                  `}
                >
                  {officer.active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
