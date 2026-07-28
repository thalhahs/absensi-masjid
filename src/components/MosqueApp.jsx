"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useCallback, useRef } from "react";

import Image from "next/image";

import {
  CheckCircle2,
  Clock,
  XCircle,
  Fingerprint,
  UserCheck,
  User,
  CalendarDays,
  AlertCircle,
  Plus,
  Minus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  UserPlus,
  History,
  X,
  Timer,
  Pencil,
  Trash2,
  Save,
  Crown,
  Shield,
  Sparkles,
  Flame,
  Trophy,
  BarChart3,
  Download,
} from "lucide-react";

import {
  getAttendanceWindow,
  isWithinWindow,
  validateScan,
  getWindowEndMinutes,
  parseTimeToMinutes,
  getDateMinutes,
} from "@/lib/attendance";

import { supabase } from "@/lib/supabase";

import { MOSQUE_NAME, MOSQUE_AREA } from "@/lib/mosque-config";

import { getSession, clearSession } from "@/lib/session";

const DEFAULT_SCHEDULES = [
  {
    id: "subuh",
    name: "Subuh",
    time: "--:--",
  },
  {
    id: "dzuhur",
    name: "Dzuhur",
    time: "--:--",
  },
  {
    id: "ashar",
    name: "Ashar",
    time: "--:--",
  },
  {
    id: "maghrib",
    name: "Maghrib",
    time: "--:--",
  },
  {
    id: "isya",
    name: "Isya",
    time: "--:--",
  },
];

function toLocalDateStr(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getActivePrayerId(schedules, now, currentPrayerId = null, iqomahEndMinutes = null) {
  const currentMinutes = getDateMinutes(now);

  // Grace period: tetap di shalat yang sedang berjalan sampai 10 menit setelah iqomah berakhir
  if (currentPrayerId && iqomahEndMinutes && currentMinutes <= iqomahEndMinutes + 10) {
    const currentPrayer = schedules.find((s) => s.id === currentPrayerId);
    if (currentPrayer && currentMinutes >= parseTimeToMinutes(currentPrayer.time)) {
      return currentPrayerId;
    }
  }

  for (const schedule of schedules) {
    const prayerMinutes = parseTimeToMinutes(schedule.time);
    if (currentMinutes < prayerMinutes) {
      return schedule.id;
    }
  }

  return schedules[0]?.id;
}

function getIqomahCountdown(adzanTime, prayerId, now) {
  if (!adzanTime || adzanTime === "--:--" || !prayerId || !now) {
    return null;
  }

  const adzanMinutes = parseTimeToMinutes(adzanTime);
  const iqomahMinutes = prayerId === "subuh" ? 20 : 15;
  const iqomahEndMinutes = adzanMinutes + iqomahMinutes;
  const currentMinutes = getDateMinutes(now);

  if (currentMinutes >= adzanMinutes && currentMinutes <= iqomahEndMinutes) {
    const diff = iqomahEndMinutes - currentMinutes;
    const mins = Math.floor(diff / 60);
    const secs = diff - mins * 60;
    return {
      minutes: mins,
      seconds: secs,
      label: prayerId === "subuh" ? "Iqomah Shubuh" : "Iqomah",
    };
  }

  if (
    currentMinutes > iqomahEndMinutes &&
    currentMinutes <= iqomahEndMinutes + 1
  ) {
    return {
      minutes: 0,
      seconds: 0,
      label: "Iqomah Selesai",
    };
  }

  return null;
}


import PetugasView from "@/views/PetugasView";
import PresensiView from "@/views/PresensiView";
import RiwayatView from "@/views/RiwayatView";
import JadwalView from "@/views/JadwalView";
import ProfileView from "@/views/ProfileView";

export default function MosqueApp() {
  const [currentTime, setCurrentTime] = useState(null);

  const [selectedPrayer, setSelectedPrayer] = useState(null);

  const [schedules, setSchedules] = useState(DEFAULT_SCHEDULES);

  const [officers, setOfficers] = useState([]);

  const [assignments, setAssignments] = useState([]);

  const [recentNotification, setRecentNotification] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);

  const [jadwalInfo, setJadwalInfo] = useState(null);

  const [currentView, setCurrentView] = useState("presensi");

  const [history, setHistory] = useState([]);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [historyFilterDate, setHistoryFilterDate] = useState("");

  const [historyFilterOfficer, setHistoryFilterOfficer] = useState("");

  const [showAddOfficerForm, setShowAddOfficerForm] = useState(false);

  const [newOfficerName, setNewOfficerName] = useState("");

  const [addingOfficer, setAddingOfficer] = useState(false);

  const [allAssignments, setAllAssignments] = useState([]);

  const [allAssignmentsLoading, setAllAssignmentsLoading] = useState(false);

  const [expandedDates, setExpandedDates] = useState({});

  const [editingAssignmentId, setEditingAssignmentId] = useState(null);

  const [editForm, setEditForm] = useState({
    imam_id: "",
    muadzin_id: "",
    badal_imam_id: "",
  });

  const [showAddAssignmentForm, setShowAddAssignmentForm] = useState(false);

  const [addAssignmentForm, setAddAssignmentForm] = useState({
    date: "",
    prayer_id: "subuh",
    imam_id: "",
    muadzin_id: "",
    badal_imam_id: "",
  });

  const [editingOfficerId, setEditingOfficerId] = useState(null);

  const [editOfficerName, setEditOfficerName] = useState("");

  const [showConfetti, setShowConfetti] = useState(false);

  const [streakCount, setStreakCount] = useState(0);

  const [reminderNotification, setReminderNotification] = useState(null);
  const [qrSuccessNotification, setQrSuccessNotification] = useState(null);

  const [isReminderMuted, setIsReminderMuted] = useState(false);



  const [statsData, setStatsData] = useState([]);

  const [statsLoading, setStatsLoading] = useState(false);

  const [session, setSession] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem('absensi_masjid_session');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem('absensi_masjid_session');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const currentRole = session?.role || 'superadmin';
  const isSuperadmin = currentRole === 'superadmin';

  const fetchedDateRef = useRef(null);

  const fetchedAssignmentsDateRef = useRef(null);

  const reminderTriggeredRef = useRef({});

  const currentTimeRef = useRef(null);

  const assignmentsRef = useRef(assignments);

  const isReminderMutedRef = useRef(isReminderMuted);

  const suppressRemindersUntilRef = useRef(0);

  const schedulesRef = useRef(schedules);

  useEffect(() => {
    currentTimeRef.current = null;
    schedulesRef.current = schedules;
    assignmentsRef.current = assignments;
    isReminderMutedRef.current = isReminderMuted;
  }, [schedules, assignments, isReminderMuted]);



  const showError = useCallback((message) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage(null);
    }, 4000);
  }, []);

  const showSuccess = useCallback((message, status = "SUKSES") => {
    setRecentNotification({
      officerName: message,
      role: "",
      prayer: "",
      prayerTime: "",
      status,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    setTimeout(() => {
      setRecentNotification(null);
    }, 3500);
  }, []);

  const exportHistoryCSV = useCallback(() => {
    if (history.length === 0) {
      showError("Tidak ada data untuk diexport");
      return;
    }

    const headers = [
      "Nama Petugas",
      "Peran",
      "Shalat",
      "Jam Adzan",
      "Status",
      "Waktu Scan",
      "Tanggal",
    ];
    const rows = history.map((item) => [
      item.officer_name,
      item.role,
      item.prayer,
      item.prayer_time,
      item.status,
      item.scan_time,
      item.attendance_date,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `absensi-${
      historyFilterDate || "all"
    }-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [history, historyFilterDate, showError]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);

    const today = toLocalDateStr(new Date());

    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("officer_name, status, attendance_date");

    if (attendanceError) {
      console.error("STATS ERROR:", attendanceError);
      showError("Gagal mengambil data statistik");
      setStatsLoading(false);
      return;
    }

    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from("schedule_assignments")
      .select(
        `
        id,
        date,
        prayer_id,
        imam:officers!imam_id(
          id,
          name
        ),
        muadzin:officers!muadzin_id(
          id,
          name
        ),
        badal:officers!badal_imam_id(
          id,
          name
        )
      `,
      )
      .eq("date", today);

    if (assignmentsError) {
      console.error("ASSIGNMENTS STATS ERROR:", assignmentsError);
    }

    const grouped = {};

    (attendanceData || []).forEach((item) => {
      if (!grouped[item.officer_name]) {
        grouped[item.officer_name] = {
          name: item.officer_name,
          HADIR: 0,
          TERLAMBAT: 0,
          ALFA: 0,
          total: 0,
        };
      }
      grouped[item.officer_name][item.status] =
        (grouped[item.officer_name][item.status] || 0) + 1;
      grouped[item.officer_name].total += 1;
    });

    if (assignmentsData) {
      const expectedAttendance = [];

      assignmentsData.forEach((asgn) => {
        const prayer = asgn.prayer_id;
        const date = asgn.date;

        if (asgn.imam) {
          expectedAttendance.push({
            officer_name: asgn.imam.name,
            role: "Imam",
            prayer,
            attendance_date: date,
          });
        }

        if (asgn.muadzin) {
          expectedAttendance.push({
            officer_name: asgn.muadzin.name,
            role: "Muadzin",
            prayer,
            attendance_date: date,
          });
        }

        if (asgn.badal) {
          expectedAttendance.push({
            officer_name: asgn.badal.name,
            role: "Badal Imam",
            prayer,
            attendance_date: date,
          });
        }
      });

      expectedAttendance.forEach((expected) => {
        const exists = (attendanceData || []).some(
          (a) =>
            a.officer_name === expected.officer_name &&
            a.role === expected.role &&
            a.prayer === expected.prayer &&
            a.attendance_date === expected.attendance_date,
        );

        if (!exists) {
          if (!grouped[expected.officer_name]) {
            grouped[expected.officer_name] = {
              name: expected.officer_name,
              HADIR: 0,
              TERLAMBAT: 0,
              ALFA: 0,
              total: 0,
            };
          }
          grouped[expected.officer_name].ALFA += 1;
          grouped[expected.officer_name].total += 1;
        }
      });
    }

    const stats = Object.values(grouped).map((s) => ({
      ...s,
      hadirRate:
        s.total > 0
          ? Math.round(((s.HADIR + s.TERLAMBAT) / s.total) * 100)
          : 0,
    }));

    setStatsData(stats);
    setStatsLoading(false);
  }, [showError]);

  // ===============================
  // REMINDER ADZAN
  // ===============================

  const suppressReminders = useCallback((ms = 30000) => {
    suppressRemindersUntilRef.current = Date.now() + ms;
  }, []);

  const playReminderSound = useCallback(() => {
    if (Date.now() < suppressRemindersUntilRef.current) return;
    if (isReminderMutedRef.current) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;

      const playTone = (frequency, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      playTone(800, now, 0.2);
      playTone(1000, now + 0.25, 0.2);
      playTone(800, now + 0.5, 0.2);
      playTone(1200, now + 0.75, 0.3);
    } catch (error) {
      console.error("Audio play failed:", error);
    }
  }, []);

  const checkReminders = useCallback(() => {
    const now = new Date();
    const currentMinutes = getDateMinutes(now);
    const today = toLocalDateStr(now);
    const currentSchedules = schedulesRef.current;
    const currentAssignments = assignmentsRef.current;

    if (currentSchedules.length === 0) return;
    if (Date.now() < suppressRemindersUntilRef.current) return;

    currentSchedules.forEach((schedule) => {
      if (schedule.time === "--:--") return;

      const prayerMinutes = parseTimeToMinutes(schedule.time);
      const reminderKey = `${today}-${schedule.id}`;
      const timeUntilPrayer = prayerMinutes - currentMinutes;

      if (
        timeUntilPrayer > 0 &&
        timeUntilPrayer <= 15 &&
        !reminderTriggeredRef.current[reminderKey]
      ) {
        reminderTriggeredRef.current[reminderKey] = true;

        const assignment = currentAssignments.find(
          (a) => a.prayer_id === schedule.id,
        );

        setReminderNotification({
          prayerName: schedule.name,
          prayerTime: schedule.time,
          timeUntil: timeUntilPrayer,
          isSubuh: schedule.id === "subuh",
          imam: assignment?.imam?.name || null,
          muadzin: assignment?.muadzin?.name || null,
          badal: assignment?.badal?.name || null,
        });

        playReminderSound();
      }
    });
  }, [playReminderSound]); // stable: uses refs for data, playReminderSound is stable with [] deps

  // ===============================
  // AMBIL DATA PETUGAS
  // ===============================

  const fetchOfficers = useCallback(async () => {
    const { data, error } = await supabase
      .from("officers")
      .select("id, name, active")
      .order("name");

    if (error) {
      console.error("OFFICERS ERROR:", error);

      showError("Gagal mengambil data petugas");

      return;
    }

    setOfficers(data || []);
  }, [showError]);

  // ===============================
  // AMBIL JADWAL PETUGAS HARIAN
  // ===============================

  const fetchAssignments = useCallback(async () => {
    const today = toLocalDateStr(new Date());

    if (fetchedAssignmentsDateRef.current === today) {
      return;
    }

    fetchedAssignmentsDateRef.current = today;

    const { data, error } = await supabase
      .from("schedule_assignments")
      .select(
        `
        id,
        date,
        prayer_id,
        imam:officers!imam_id(
          id,
          name
        ),
        muadzin:officers!muadzin_id(
          id,
          name
        ),
        badal:officers!badal_imam_id(
          id,
          name
        )
      `,
      )
      .eq("date", today);

    if (error) {
      console.error("ASSIGNMENT ERROR:", error);

      return;
    }

    console.log("ASSIGNMENTS:", data);

    setAssignments(data || []);
  }, []);

  // ===============================
  // AMBIL RIWAYAT ABSENSI
  // ===============================

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);

    let query = supabase
      .from("attendance")
      .select("*")
      .order("attendance_date", { ascending: false })
      .order("scan_time", { ascending: false });

    if (historyFilterDate) {
      query = query.eq("attendance_date", historyFilterDate);
    }

    if (historyFilterOfficer) {
      query = query.eq("officer_name", historyFilterOfficer);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("HISTORY ERROR:", error);
      showError("Gagal mengambil riwayat absensi");
      setHistoryLoading(false);
      return;
    }

    setHistory(data || []);
    setHistoryLoading(false);
  }, [historyFilterDate, historyFilterOfficer, showError]);

  // ===============================
  // TAMBAH PETUGAS
  // ===============================

  const addOfficer = useCallback(async () => {
    const trimmed = newOfficerName.trim();

    if (!trimmed) {
      showError("Nama petugas tidak boleh kosong");
      return;
    }

    if (trimmed.length < 3) {
      showError("Nama minimal 3 karakter");
      return;
    }

    setAddingOfficer(true);

    const { data, error } = await supabase
      .from("officers")
      .insert([{ name: trimmed, active: true }])
      .select();

    if (error) {
      console.error("ADD OFFICER ERROR:", error);

      showError(error.message || "Gagal menambahkan petugas");

      setAddingOfficer(false);

      return;
    }

    setOfficers((prev) => [...prev, ...(data || [])]);

    setNewOfficerName("");

    setShowAddOfficerForm(false);

    setAddingOfficer(false);

    showSuccess(`Petugas "${trimmed}" berhasil ditambahkan`);
  }, [newOfficerName, showError, showSuccess]);

  // ===============================
  // AMBIL SEMUA JADWAL
  // ===============================

  const fetchAllAssignments = useCallback(async () => {
    setAllAssignmentsLoading(true);

    const { data, error } = await supabase
      .from("schedule_assignments")
      .select(
        `
        id,
        date,
        prayer_id,
        imam:officers!imam_id(id, name),
        muadzin:officers!muadzin_id(id, name),
        badal:officers!badal_imam_id(id, name)
      `,
      )
      .order("date", { ascending: false })
      .order("prayer_id", { ascending: true });

    if (error) {
      console.error("ALL ASSIGNMENTS ERROR:", error);
      showError("Gagal mengambil data jadwal");
      setAllAssignmentsLoading(false);
      return;
    }

    setAllAssignments(data || []);
    setAllAssignmentsLoading(false);
  }, [showError]);

  // ===============================
  // EDIT / DELETE JADWAL
  // ===============================

  const toggleDateExpanded = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const startEditAssignment = (assignment) => {
    setEditingAssignmentId(assignment.id);
    setEditForm({
      imam_id: assignment.imam?.id || "",
      muadzin_id: assignment.muadzin?.id || "",
      badal_imam_id: assignment.badal?.id || "",
    });
  };

  const cancelEditAssignment = () => {
    setEditingAssignmentId(null);
    setEditForm({
      imam_id: "",
      muadzin_id: "",
      badal_imam_id: "",
    });
  };

  const saveAssignmentEdit = async (assignmentId) => {
    const { error } = await supabase
      .from("schedule_assignments")
      .update({
        imam_id: editForm.imam_id || null,
        muadzin_id: editForm.muadzin_id || null,
        badal_imam_id: editForm.badal_imam_id || null,
      })
      .eq("id", assignmentId);

    if (error) {
      console.error("UPDATE ASSIGNMENT ERROR:", error);
      showError(error.message || "Gagal update jadwal");
      return;
    }

    showSuccess("Jadwal berhasil diperbarui");
    cancelEditAssignment();
    fetchAllAssignments();
    fetchAssignments();
  };

  const deleteAssignment = async (assignmentId) => {
    const { error } = await supabase
      .from("schedule_assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      console.error("DELETE ASSIGNMENT ERROR:", error);
      showError(error.message || "Gagal menghapus jadwal");
      return;
    }

    showSuccess("Jadwal berhasil dihapus");
    fetchAllAssignments();
    fetchAssignments();
  };

  const createAssignment = async () => {
    if (!addAssignmentForm.date || !addAssignmentForm.prayer_id) {
      showError("Tanggal dan shalat harus diisi");
      return;
    }

    const { error } = await supabase
      .from("schedule_assignments")
      .insert([
        {
          date: addAssignmentForm.date,
          prayer_id: addAssignmentForm.prayer_id,
          imam_id: addAssignmentForm.imam_id || null,
          muadzin_id: addAssignmentForm.muadzin_id || null,
          badal_imam_id: addAssignmentForm.badal_imam_id || null,
        },
      ]);

    if (error) {
      console.error("CREATE ASSIGNMENT ERROR:", error);
      showError(error.message || "Gagal menambahkan jadwal");
      return;
    }

    showSuccess("Jadwal berhasil ditambahkan");
    setAddAssignmentForm({
      date: "",
      prayer_id: "subuh",
      imam_id: "",
      muadzin_id: "",
      badal_imam_id: "",
    });
    setShowAddAssignmentForm(false);
    fetchAllAssignments();
    fetchAssignments();
  };

  // ===============================
  // EDIT / DELETE PETUGAS
  // ===============================

  const startEditOfficer = (officer) => {
    setEditingOfficerId(officer.id);
    setEditOfficerName(officer.name);
  };

  const cancelEditOfficer = () => {
    setEditingOfficerId(null);
    setEditOfficerName("");
  };

  const saveOfficerEdit = async (officerId) => {
    const trimmed = editOfficerName.trim();

    if (!trimmed || trimmed.length < 3) {
      showError("Nama minimal 3 karakter");
      return;
    }

    const { error } = await supabase
      .from("officers")
      .update({ name: trimmed })
      .eq("id", officerId);

    if (error) {
      console.error("UPDATE OFFICER ERROR:", error);
      showError(error.message || "Gagal update petugas");
      return;
    }

    showSuccess("Nama petugas berhasil diperbarui");
    cancelEditOfficer();
    fetchOfficers();
  };

  const deleteOfficer = async (officerId, officerName) => {
    const { error } = await supabase
      .from("officers")
      .delete()
      .eq("id", officerId);

    if (error) {
      console.error("DELETE OFFICER ERROR:", error);
      showError(error.message || "Gagal menghapus petugas");
      return;
    }

    showSuccess(`Petugas "${officerName}" berhasil dihapus`);
    setOfficers((prev) => prev.filter((o) => o.id !== officerId));
  };

  // ===============================
  // AMBIL JADWAL SHALAT KEMENAG
  // ===============================

  const fetchJadwal = useCallback(async (dateStr) => {
    if (fetchedDateRef.current === dateStr) {
      return;
    }

    fetchedDateRef.current = dateStr;

    try {
      const response = await fetch(`/api/jadwal-shalat?date=${dateStr}`);

      const data = await response.json();

      if (!data.success) {
        fetchedDateRef.current = null;

        return;
      }

      setJadwalInfo({
        lokasi: data.lokasi,

        tanggal: data.tanggal,
      });

      setSchedules((prev) =>
        prev.map((schedule) => ({
          ...schedule,
          time: data.times[schedule.id] || schedule.time,
        })),
      );
    } catch (error) {
      console.error("JADWAL ERROR:", error);

      fetchedDateRef.current = null;
    }
  }, []);

  // ===============================
  // SIMPAN ABSENSI
  // ===============================

  const saveAttendance = async ({
    officerName,
    role,
    prayer,
    prayerTime,
    status,
    scanTime,
  }) => {
    const { data, error } = await supabase
      .from("attendance")
      .insert([
        {
          officer_name: officerName,

          role: role,

          prayer: prayer,

          prayer_time: prayerTime,

          status: status,

          scan_time: scanTime,

          attendance_date: toLocalDateStr(new Date()),
        },
      ])
      .select();

    if (error) {
      console.error("SAVE ATTENDANCE ERROR:", error);

      showError(error.message);

      return;
    }

    console.log("ABSENSI SAVED:", data);
  };

  // ===============================
  // CLOCK + INITIAL LOAD
  // ===============================

  useEffect(() => {
    fetchOfficers();

  const tick = () => {
    const now = new Date();

    setCurrentTime(now);

    const dateStr = toLocalDateStr(now);

    fetchJadwal(dateStr);

    fetchAssignments();

    checkReminders();
  };

    tick();

    const timer = setInterval(tick, 1000);

    return () => clearInterval(timer);
  }, [fetchOfficers, fetchJadwal, fetchAssignments, checkReminders]); // callbacks are stable via useCallback

  useEffect(() => {
    if (!reminderNotification) return;

    const timeout = setTimeout(() => {
      setReminderNotification(null);
    }, 300000);

    return () => clearTimeout(timeout);
  }, [reminderNotification]);

  // ===============================
  // CURRENT SCHEDULE
  // ===============================

  const currentAssignment = assignments.find(
    (item) => item.prayer_id === selectedPrayer,
  );

  const currentSchedule =
    schedules.find((item) => item.id === selectedPrayer) || schedules[0];

  // ===============================
  // FORMAT TANGGAL
  // ===============================

  const formattedDate = currentTime
    ? currentTime.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  // ===============================
  // INFO PETUGAS
  // ===============================

  const getOfficerMeta = (officer) => {
    const isImam = currentAssignment?.imam?.id === officer.id;

    const isMuadzin = currentAssignment?.muadzin?.id === officer.id;

    const isBadal = currentAssignment?.badal?.id === officer.id;

    let roleTitle = "";
    let scanRole = null;

    if (isImam) {
      roleTitle = "Imam Utama";
      scanRole = "Imam";
    }

    if (isMuadzin) {
      roleTitle = "Muadzin";
      scanRole = "Muadzin";
    }

    if (isBadal) {
      roleTitle = "Badal Imam";
      scanRole = "Badal Imam";
    }

    const windowOpen =
      scanRole && currentTime
        ? isWithinWindow(
            scanRole,
            currentTime,
            currentSchedule.time,
            currentSchedule.id,
          )
        : false;

    const windowLabel = scanRole
      ? getAttendanceWindow(scanRole, currentSchedule.time, currentSchedule.id)
          .label
      : null;

    return {
      roleTitle,
      scanRole,
      windowOpen,
      windowLabel,
    };
  };

  // ===============================
  // PROSES SCAN
  // ===============================

  const triggerScan = (officerName, role) => {
    const now = new Date();

    const result = validateScan(
      role,
      now,
      currentSchedule.time,
      currentSchedule.id,
    );

    if (!result.allowed) {
      showError(result.reason);

      return;
    }

    setStreakCount((prev) => prev + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);

    setRecentNotification({
      officerName,
      role,
      prayer: currentSchedule.name,
      prayerTime: currentSchedule.time,
      status: result.status,
      time: result.timeStr,
    });

    saveAttendance({
      officerName,
      role,
      prayer: currentSchedule.name,
      prayerTime: currentSchedule.time,
      status: result.status,
      scanTime: result.timeStr,
    });

    setTimeout(() => {
      setRecentNotification(null);
    }, 3500);
  };

  const generateQrCode = async (officerName, officerId, role, schedule) => {
    const now = new Date();
    const result = validateScan(
      role,
      now,
      schedule.time,
      schedule.id,
    );

    if (!result.allowed) {
      showError(result.reason);
      return { success: false, message: result.reason };
    }

    const token =
      Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10) + '-' + Math.random().toString(36).slice(2, 10);
    const dateStr = toLocalDateStr(now);

    const adzanMinutes = parseTimeToMinutes(schedule.time);
    const iqomahMinutes = schedule.id === 'subuh' ? 20 : 15;
    const windowEndMinutes = adzanMinutes + iqomahMinutes;
    const currentMinutes = getDateMinutes(now);
    const endTotal = Math.max(windowEndMinutes, currentMinutes);
    const endH = Math.floor(endTotal / 60) % 24;
    const endM = endTotal % 60;
    const expiresAt = new Date(now);
    expiresAt.setHours(endH, endM, 0, 0);
    if (endTotal <= currentMinutes) {
      expiresAt.setDate(expiresAt.getDate() + 1);
    }

    const { error: insertError } = await supabase
      .from("qr_tokens")
      .insert([
        {
          token,
          officer_id: officerId || null,
          officer_name: officerName,
          role,
          prayer: schedule.name || schedule.id,
          prayer_time: schedule.time,
          attendance_date: dateStr,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select();

    if (insertError) {
      console.error("QR TOKEN ERROR:", insertError);
      showError("Gagal membuat QR code");
      return { success: false, message: "Gagal membuat QR code" };
    }

    return {
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
      officerId: officerId || null,
    };
  };

  // ===============================
  // RENDER: TAMBAH PETUGAS
  // ===============================


  // ===============================
  // URUTKAN PETUGAS
  // ===============================

  const sortedOfficers = [
    currentAssignment?.imam,
    currentAssignment?.muadzin,
    currentAssignment?.badal,
  ].filter(Boolean);

  // ===============================
  // REFRESH HISTORY KETIKA FILTER BERUBAH
  // ===============================

  useEffect(() => {
    if (currentView === "riwayat" || currentView === "profile") {
      fetchHistory();
    }
  }, [currentView, fetchHistory]);

  useEffect(() => {
    if (selectedPrayer) return;
    const hasValid = schedules.some((s) => s.time !== "--:--");
    if (!hasValid) return;
    const now = new Date();
    setSelectedPrayer(getActivePrayerId(schedules, now));
  }, [schedules, selectedPrayer]);

  // ===============================
  // REFRESH JADWAL KETIKA TAB DIBUKA
  // ===============================

  useEffect(() => {
    if (currentView === "jadwal") {
      fetchAllAssignments();
    }
  }, [currentView, fetchAllAssignments]);

  useEffect(() => {
    if (currentView === "statistik") {
      fetchStats();
    }
  }, [currentView, fetchStats]);

  return (
    <div
      className="
  h-dvh
  max-h-dvh
  w-full
  bg-white dark:bg-slate-900
  text-app-text
  font-sans
  flex
  flex-col
  p-3
  select-none
  box-border
"
    >
      {/* HEADER */}

      <header
        className="
  bg-gradient-to-br from-[#7D5A41] to-[#D3AF96] dark:from-[#5C4033] dark:to-[#8B7355]
  text-white
  px-5
  py-4
  rounded-3xl
  shadow-lg shadow-purple-200 dark:shadow-black/40
  flex
  items-center
  justify-between
  shrink-0
  gap-3
  relative
  overflow-hidden
"
      >
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="absolute inset-0 dark:hidden bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_45%)]" />

        <div className="relative z-10 flex items-center gap-3">
          <Image
            src="/logomasjidputih.png"
            alt="Logo Masjid"
            width={72}
            height={72}
            className="object-contain h-[72px] w-[72px]"
          />

          <div>
            <p
              className="
   text-sm
   font-extrabold
   leading-tight
   tracking-tight
   text-white
   dark:text-slate-100
 "
            >
              {MOSQUE_NAME}
            </p>

            <p
              className="
   text-[10px]
   text-purple-100
   font-semibold
   mt-0.5
   dark:text-slate-300
 "
            >
              {MOSQUE_AREA}
            </p>

            <div
              className="
   text-3xl
   font-mono
   font-extrabold
   mt-2
   leading-none
   tracking-tighter
   drop-shadow-sm
   text-white
   dark:text-slate-50
 "
            >
              {currentTime
                ? currentTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "--:--:--"}
            </div>

            <div
              className="
   flex
   items-center
   gap-1
   mt-1
   text-white
   dark:text-slate-200
 "
            >
              <CalendarDays size={12} />

              <span
                className="
   text-[11px]
   font-semibold
   capitalize
 "
              >
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

      </header>

      {showConfetti && (
        <div className="confetti">
          {[...Array(20)].map((_, i) => {
            const colors = ['#8B5A2B', '#D3AF96', '#C9A96E', '#5B8C5A', '#A68B5B'];
            return (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${(i * 37 + 13) % 100}%`,
                  backgroundColor: colors[i % colors.length],
                  animationDelay: `${(i * 0.12) % 0.5}s`,
                  animationDuration: `${1.5 + (i % 5) * 0.3}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* NOTIFIKASI TENGAH */}

      {recentNotification && (
        <div
          className="
    fixed
    inset-0
    z-50
    flex
    items-center
    justify-center
    p-4
    bg-black/40
    backdrop-blur-sm
"
        >
          <div
            className={`
        w-full
        max-w-xs
        rounded-3xl
        p-5
        shadow-2xl
        border
        flex
        flex-col
        items-center
        text-center
        gap-2
        animate-bounce-in
        
        ${
          recentNotification.status === "HADIR"
            ? "bg-emerald-500 text-white border-emerald-300"
            : recentNotification.status === "TERLAMBAT"
              ? "bg-emerald-500 text-white border-emerald-300"
              : "bg-rose-500 text-white border-rose-300"
        }
      `
            }
          >
            {recentNotification.status === "HADIR" && (
              <CheckCircle2 size={48} className="text-white drop-shadow-md" />
            )}

            {recentNotification.status === "TERLAMBAT" && (
              <Clock size={48} className="text-white drop-shadow-md" />
            )}

            {recentNotification.status === "ALFA" && (
              <XCircle size={48} className="text-white drop-shadow-md" />
            )}

            <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">
              {recentNotification.status}
            </p>

            <p className="text-lg font-extrabold leading-tight">
              {recentNotification.officerName}
            </p>

            <div className="text-[11px] font-semibold opacity-90 space-y-0.5">
              <p>{recentNotification.role}</p>
              <p>
                {recentNotification.prayer} · {recentNotification.prayerTime}
              </p>
              <p>Scan: {recentNotification.time}</p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          className="
  fixed
  top-3
  left-3
  right-3
  z-50
  max-w-sm
  mx-auto
  animate-shake
"
        >
          <div
            className="
  bg-app-error
  text-white
  rounded-2xl
  p-3
  shadow-lg shadow-rose-200
  flex
  gap-3
  items-center
"
          >
            <div className="bg-white/20 p-1.5 rounded-full">
              <AlertCircle className="text-rose-100 w-4 h-4" />
            </div>

            <p className="text-sm font-semibold">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* KONTEN */}

      <div className="flex-1 overflow-auto mt-3">
        {currentView === "presensi" && <PresensiView sortedOfficers={sortedOfficers} schedules={schedules} selectedPrayer={selectedPrayer} setSelectedPrayer={setSelectedPrayer} currentSchedule={currentSchedule} currentTime={currentTime} reminderNotification={reminderNotification} isReminderMuted={isReminderMuted} setReminderNotification={setReminderNotification} setIsReminderMuted={setIsReminderMuted} getOfficerMeta={getOfficerMeta} generateQrCode={generateQrCode} qrSuccessNotification={qrSuccessNotification} setQrSuccessNotification={setQrSuccessNotification} suppressReminders={suppressReminders} showError={showError} session={session} />}

        {currentView === "riwayat" && <RiwayatView history={history} historyLoading={historyLoading} historyFilterDate={historyFilterDate} historyFilterOfficer={historyFilterOfficer} officers={officers} setHistoryFilterDate={setHistoryFilterDate} setHistoryFilterOfficer={setHistoryFilterOfficer} exportHistoryCSV={exportHistoryCSV} />}

        {currentView === "jadwal" && <JadwalView allAssignments={allAssignments} allAssignmentsLoading={allAssignmentsLoading} expandedDates={expandedDates} editingAssignmentId={editingAssignmentId} editForm={editForm} officers={officers} fetchAllAssignments={fetchAllAssignments} toggleDateExpanded={toggleDateExpanded} startEditAssignment={startEditAssignment} cancelEditAssignment={cancelEditAssignment} saveAssignmentEdit={saveAssignmentEdit} deleteAssignment={deleteAssignment} showAddAssignmentForm={showAddAssignmentForm} setShowAddAssignmentForm={setShowAddAssignmentForm} addAssignmentForm={addAssignmentForm} setAddAssignmentForm={setAddAssignmentForm} createAssignment={createAssignment} role={currentRole} isSuperadmin={isSuperadmin} />}

        {currentView === "petugas" && (
          <PetugasView
            officers={officers}
            editingOfficerId={editingOfficerId}
            editOfficerName={editOfficerName}
            newOfficerName={newOfficerName}
            addingOfficer={addingOfficer}
            setNewOfficerName={setNewOfficerName}
            setEditOfficerName={setEditOfficerName}
            startEditOfficer={startEditOfficer}
            saveOfficerEdit={saveOfficerEdit}
            cancelEditOfficer={cancelEditOfficer}
            addOfficer={addOfficer}
            deleteOfficer={deleteOfficer}
            role={currentRole}
            isSuperadmin={isSuperadmin}
          />
        )}

{currentView === "statistik" && <StatistikView statsData={statsData} statsLoading={statsLoading} role={currentRole} isSuperadmin={isSuperadmin} />}
         {currentView === "profile" && <ProfileView history={history} officers={officers} session={session} setHistoryFilterDate={setHistoryFilterDate} setHistoryFilterOfficer={setHistoryFilterOfficer} exportHistoryCSV={exportHistoryCSV} />}
       </div>

      {/* TAB NAVIGASI */}

      <div
        className="
  flex
  gap-1.5
  bg-white/70
  dark:bg-slate-800/70
  backdrop-blur-md
  p-1.5
  rounded-3xl
  mt-2
  shrink-0
  border
  border-purple-100
  dark:border-slate-700
  shadow-sm
"
      >
        <button
          onClick={() => setCurrentView("presensi")}

          className={`
  flex-1
  flex
  items-center
  justify-center
  gap-1
  py-2.5
  rounded-2xl
  text-[10px]
  font-bold
  transition-all
  duration-300
  
  ${
    currentView === "presensi"
      ? "bg-gradient-to-r from-[#7D5A41] to-[#D3AF96] text-white shadow-md scale-[1.02]"
      : "text-app-muted hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:shadow-none"
  }

  `}
        >
          <Fingerprint size={14} />
          Presensi
        </button>

        <button
          onClick={() => setCurrentView("riwayat")}

          className={`
  flex-1
  flex
  items-center
  justify-center
  gap-1
  py-2.5
  rounded-2xl
  text-[10px]
  font-bold
  transition-all
  duration-300
  
  ${
    currentView === "riwayat"
      ? "bg-gradient-to-r from-[#7D5A41] to-[#D3AF96] text-white shadow-md scale-[1.02]"
      : "text-app-muted hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:shadow-none"
  }
  
  `}
        >
          <History size={14} />
          Riwayat
        </button>

        <button
          onClick={() => setCurrentView("jadwal")}

          className={`
  flex-1
  flex
  items-center
  justify-center
  gap-1
  py-2.5
  rounded-2xl
  text-[10px]
  font-bold
  transition-all
  duration-300
  
  ${
    currentView === "jadwal"
      ? "bg-gradient-to-r from-[#7D5A41] to-[#D3AF96] text-white shadow-md scale-[1.02]"
      : "text-app-muted hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:shadow-none"
  }
  
  `}
        >
          <CalendarDays size={14} />
          Jadwal
        </button>

        <button
          onClick={() => setCurrentView("statistik")}

          className={`
  flex-1
  flex
  items-center
  justify-center
  gap-1
  py-2.5
  rounded-2xl
  text-[10px]
  font-bold
  transition-all
  duration-300
  
  ${
    currentView === "statistik"
      ? "bg-gradient-to-r from-[#7D5A41] to-[#D3AF96] text-white shadow-md scale-[1.02]"
      : "text-app-muted hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:shadow-none"
  }
  
  `}
        >
          <BarChart3 size={14} />
          Statistik
        </button>

        <button
          onClick={() => setCurrentView("petugas")}

          className={`
  flex-1
  flex
  items-center
  justify-center
  gap-1
  py-2.5
  rounded-2xl
  text-[10px]
  font-bold
  transition-all
  duration-300
  
  ${
    currentView === "petugas"
      ? "bg-gradient-to-r from-[#7D5A41] to-[#D3AF96] text-white shadow-md scale-[1.02]"
      : "text-app-muted hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:shadow-none"
  }
  
  `}
        >
          <UserPlus size={14} />
          Petugas
        </button>
        <button
          onClick={() => setCurrentView("profile")}
          className={`
            flex-1
            flex
            items-center
            justify-center
            gap-1
            py-2.5
            rounded-2xl
            text-[10px]
            font-bold
            transition-all
            duration-300
            
            ${currentView === "profile"
              ? "bg-gradient-to-r from-[#7D5A41] to-[#D3AF96] text-white shadow-md scale-[1.02]"
              : "text-app-muted hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:shadow-none"
            }
          `}
        >
          <UserCheck size={14} />
          Profile
        </button>
      </div>
    </div>
  );
}
