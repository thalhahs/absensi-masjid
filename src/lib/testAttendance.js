import { supabase } from './supabase';

export async function testAttendance() {
  const { data, error } = await supabase
    .from('attendance')
    .insert([
      {
        officer_name: 'Test Imam',
        role: 'Imam',
        prayer: 'Subuh',
        prayer_time: '04:45',
        status: 'HADIR',
        scan_time: '04:30',
        date: new Date().toISOString().split('T')[0],
      },
    ])
    .select();

  if (error) {
    console.error('SUPABASE ERROR:', error);
    return;
  }

  console.log('BERHASIL:', data);
}