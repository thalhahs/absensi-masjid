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
}) {
  return (
    <main
      className="
        flex-1
        bg-white dark:bg-slate-800
        rounded-2xl
        shadow-sm
        p-4
        overflow-auto
        border
        border-app-border dark:border-slate-700
      "
    >
      <h2
        className="
          text-xs
          font-bold
          uppercase
          mb-4
          text-app-text dark:text-slate-100
        "
      >
        <UserPlus size={14} className="inline mr-1 mb-0.5" />
        Tambah Petugas
      </h2>

      <div
        className="
          max-w-md
          mx-auto
        "
      >
        <label
          className="
            text-xs
            text-app-muted dark:text-slate-400
            font-bold
            uppercase
            tracking-wide
          "
        >
          Nama Petugas
        </label>

        <div
          className="
            mt-2
            flex
            gap-2
          "
        >
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
            className="
              flex-1
              text-sm
              border
              border-app-border
              rounded-xl
              px-3
              py-2
              bg-white dark:bg-slate-700 dark:text-slate-100
              focus:outline-none
              focus:ring-2
              focus:ring-app-primary/30
            "
          />

          <button
            onClick={addOfficer}
            disabled={addingOfficer}
            className="
              bg-app-primary
              text-white
              px-5
              py-2
              rounded-xl
              text-sm
              font-bold
              disabled:opacity-50
              disabled:cursor-not-allowed
              shadow-md
              shadow-emerald-200
              hover:bg-app-primary-dark
              hover:shadow-lg
              hover:shadow-emerald-200
              active:scale-95
              transition-all
            "
          >
            {addingOfficer ? "Menyimpan..." : "Tambah"}
          </button>
        </div>

        <div className="mt-6">
          <h3
            className="
              text-xs
              font-bold
              text-app-muted dark:text-slate-400
              uppercase
              tracking-wide
              mb-3
            "
          >
            Daftar Petugas Aktif ({officers.length})
          </h3>

          <div className="space-y-1.5">
            {officers.map((officer) => (
              <div
                key={officer.id}
                className="
                  flex
                  items-center
                  justify-between
                  bg-white dark:bg-slate-800/90
                  border
                  border-app-border dark:border-slate-700
                  rounded-xl
                  px-3
                  py-2.5
                  shadow-sm
                  hover:shadow-md
                  transition-all
                "
              >
                {editingOfficerId === officer.id ? (
                  <div className="flex-1 flex items-center gap-2">
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
                      className="
                        flex-1
                        text-sm
                        border
                        border-app-border
                        rounded-lg
                        px-2
                        py-1
                        bg-white dark:bg-slate-700 dark:text-slate-100
                        focus:outline-none
                        focus:ring-2
                        focus:ring-app-primary/30
                      "
                    />

                    <button
                      onClick={() => saveOfficerEdit(officer.id)}
                      className="
                        p-1.5
                        rounded-lg
                        text-app-primary
                        hover:bg-app-primary/10
                        dark:hover:bg-app-primary/20
                        transition-colors
                      "
                    >
                      <Save size={14} />
                    </button>

                    <button
                      onClick={cancelEditOfficer}
                      className="
                        p-1.5
                        rounded-lg
                        text-app-muted
                        hover:bg-slate-100
                        dark:hover:bg-slate-700
                        dark:text-slate-300
                        transition-colors
                      "
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div
                        className="
                          bg-emerald-100
                          text-emerald-700
                          p-1.5
                          rounded-lg
                          dark:bg-emerald-900/40
                          dark:text-emerald-300
                        "
                      >
                        <User size={14} />
                      </div>

                      <span className="text-sm font-bold text-app-text dark:text-slate-100">
                        {officer.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => startEditOfficer(officer)}
                        className="
                          p-1.5
                          rounded-lg
                          text-app-primary
                          hover:bg-app-primary/10
                          dark:hover:bg-app-primary/20
                          transition-colors
                        "
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
                        ? "bg-app-primary/10 text-app-primary border-app-border dark:bg-app-primary/20 dark:text-app-primary-light dark:border-slate-600"
                        : "bg-slate-100 text-app-muted border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600"
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
