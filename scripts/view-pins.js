import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log('Fetching officers...\n');

  const { data: officers, error } = await supabase
    .from('officers')
    .select('id, name, role, active, pin_hash')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch officers:', error.message);
    process.exit(1);
  }

  if (!officers || officers.length === 0) {
    console.log('No officers found.');
    return;
  }

  console.log('Daftar Petugas:\n');
  console.log('Nama                 | Role          | Status  | PIN');
  console.log('---------------------|---------------|---------|----------');

  for (const officer of officers) {
    const status = officer.active ? 'Aktif' : 'Nonaktif';
    const pin = officer.pin_hash ? '***set***' : '(belum diset)';
    const name = officer.name.padEnd(20);
    const role = (officer.role || 'officer').padEnd(13);
    console.log(`${name} | ${role} | ${status} | ${pin}`);
  }

  console.log();
  console.log('Catatan: PIN sudah di-hash dan tidak bisa dilihat langsung.');
  console.log('Gunakan reset-pin.js untuk mengatur PIN baru.');
}

main();
