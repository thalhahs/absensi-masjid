import { supabase } from './supabase';


export async function getOfficers() {
  const { data, error } = await supabase
    .from('officers')
    .select('name')
    .eq('active', true);

  if (error) {
    console.error(error);
    return [];
  }

  return data.map((item) => item.name);
}


export async function getPrayerSchedules() {
  const { data, error } = await supabase
    .from('prayer_schedules')
    .select('*');

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}