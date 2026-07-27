import {
  WINDOW_BEFORE_ADZAN,
  WINDOW_AFTER_ADZAN_IMAM,
  IQOMAH_MINUTES,
} from './mosque-config';

export function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTimeStr(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function getDateMinutes(date) {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Imam & Badal: 10 menit sebelum adzan s/d 5 menit setelah adzan
 * Muadzin: 10 menit sebelum adzan s/d adzan
 */
export function getAttendanceWindow(role, adzanTime, prayerId) {
  const adzanMinutes = parseTimeToMinutes(adzanTime);
  const iqomahMinutes = prayerId ? (IQOMAH_MINUTES[prayerId] || 15) : 15;
  const start = adzanMinutes - WINDOW_BEFORE_ADZAN;
  const end = adzanMinutes + iqomahMinutes;

  if (role === 'Muadzin') {
    return {
      start,
      end,
      adzan: adzanMinutes,
      label: `${minutesToTimeStr(start)} – ${minutesToTimeStr(end)} WIB`,
    };
  }

  return {
    start,
    end,
    adzan: adzanMinutes,
    label: `${minutesToTimeStr(start)} – ${minutesToTimeStr(end)} WIB`,
  };
}

export function isWithinWindow(role, now, adzanTime, prayerId) {
  const scanMinutes = getDateMinutes(now);
  const { start, end } = getAttendanceWindow(role, adzanTime, prayerId);
  return scanMinutes >= start && scanMinutes <= end;
}

export function validateScan(role, now, adzanTime, prayerId) {
  const scanMinutes = getDateMinutes(now);
  const timeStr = minutesToTimeStr(scanMinutes);
  const { start, end, adzan, label } = getAttendanceWindow(role, adzanTime, prayerId);

  if (scanMinutes < start) {
    return {
      allowed: false,
      reason: `Absen ${role} dibuka pukul ${minutesToTimeStr(start)} WIB (window: ${label})`,
      timeStr,
    };
  }

  if (scanMinutes > end) {
    return {
      allowed: false,
      reason: `Window absen ${role} sudah tutup (maks ${minutesToTimeStr(end)} WIB)`,
      timeStr,
    };
  }

  let status = 'HADIR';
  if (scanMinutes > adzan) {
    status = role === 'Imam' ? 'TERLAMBAT' : 'HADIR';
  }

  return { allowed: true, status, timeStr };
}

export function getWindowEndMinutes(role, adzanTime, prayerId) {
  return getAttendanceWindow(role, adzanTime, prayerId).end;
}

/** Map respons API jadwal ke id shalat di app */
export const PRAYER_TIME_KEYS = {
  subuh: 'subuh',
  dzuhur: 'dzuhur',
  ashar: 'ashar',
  maghrib: 'maghrib',
  isya: 'isya',
};
