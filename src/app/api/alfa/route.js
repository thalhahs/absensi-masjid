import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getWindowEndMinutes } from '@/lib/attendance';

const PRAYER_LABELS = {
  subuh: 'Subuh',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya',
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const now = new Date();
    const dateStr = dateParam || now.toISOString().split('T')[0];

    const { data: assignments, error: assignError } = await supabase
      .from('schedule_assignments')
      .select('prayer_id, imam_id, muadzin_id, badal_imam_id')
      .eq('date', dateStr);

    if (assignError || !assignments || assignments.length === 0) {
      return NextResponse.json({ success: true, created: [], message: 'Tidak ada jadwal untuk tanggal ini' });
    }

    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('prayer, officer_name')
      .eq('attendance_date', dateStr);

    const existingSet = new Set((existingAttendance || []).map(a => `${a.prayer}|${a.officer_name}`));

    const { data: officers } = await supabase
      .from('officers')
      .select('id, name, role')
      .eq('active', true);

    const officerMap = new Map((officers || []).map(o => [o.id, o]));

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const scanTime = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta',
    });

    const created = [];

    for (const assignment of assignments) {
      const prayerTimeResult = await supabase
        .from('jadwal_shalat')
        .select('adzan')
        .eq('prayer', assignment.prayer_id)
        .single();

      const prayerTime = prayerTimeResult.data?.adzan || '00:00';
      const windowEndMinutes = getWindowEndMinutes('Imam', prayerTime, assignment.prayer_id);

      if (nowMinutes <= windowEndMinutes) {
        continue;
      }

      const roleMap = {
        imam_id: 'Imam',
        muadzin_id: 'Muadzin',
        badal_imam_id: 'Badal Imam',
      };

      for (const [field, role] of Object.entries(roleMap)) {
        const officerId = assignment[field];
        if (!officerId) continue;

        const officer = officerMap.get(officerId);
        if (!officer) continue;

        const key = `${assignment.prayer_id}|${officer.name}`;
        if (existingSet.has(key)) continue;

        const { error: insertError } = await supabase
          .from('attendance')
          .insert({
            officer_id: officerId,
            officer_name: officer.name,
            role: role,
            prayer: assignment.prayer_id,
            prayer_time: prayerTime,
            status: 'ALFA',
            scan_time: scanTime,
            attendance_date: dateStr,
          });

        if (!insertError) {
          created.push({ officer_name: officer.name, prayer: assignment.prayer_id, role });
          existingSet.add(key);
        }
      }
    }

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error('ALFA GENERATION ERROR:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
