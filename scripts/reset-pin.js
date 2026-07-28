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

function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(pin, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `pbkdf2_sha512$${salt}$${hash}`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node reset-pin.js <nama-petugas> [pin-baru]');
    console.log('  nama-petugas : Nama petugas yang ingin di-reset PIN-nya');
    console.log('  pin-baru     : PIN baru 6 digit (opsional, jika kosong akan generate random)');
    console.log();
    console.log('Example:');
    console.log('  node reset-pin.js Ahmad 123456');
    console.log('  node reset-pin.js Ahmad');
    process.exit(1);
  }

  const officerName = args[0];
  const newPin = args[1];

  if (newPin && (!/^\d{6}$/.test(newPin))) {
    console.error('PIN harus 6 digit angka');
    process.exit(1);
  }

  const finalPin = newPin || String(Math.floor(100000 + Math.random() * 900000));

  console.log(`Mencari petugas: ${officerName}...`);

  const { data: officers, error } = await supabase
    .from('officers')
    .select('id, name, role')
    .ilike('name', officerName);

  if (error) {
    console.error('Failed to fetch officers:', error.message);
    process.exit(1);
  }

  if (!officers || officers.length === 0) {
    console.error(`Petugas "${officerName}" tidak ditemukan.`);
    process.exit(1);
  }

  if (officers.length > 1) {
    console.error(`Ditemukan lebih dari 1 petugas dengan nama "${officerName}". Harap gunakan nama yang lebih spesifik.`);
    process.exit(1);
  }

  const officer = officers[0];
  const pinHash = hashPin(finalPin);

  const { error: updateError } = await supabase
    .from('officers')
    .update({ pin_hash: pinHash })
    .eq('id', officer.id);

  if (updateError) {
    console.error('Failed to update PIN:', updateError.message);
    process.exit(1);
  }

  console.log('PIN berhasil di-reset!');
  console.log(`  Nama  : ${officer.name}`);
  console.log(`  Role  : ${officer.role}`);
  console.log(`  PIN   : ${finalPin}`);
  console.log();
  console.log('Simpan PIN ini dengan aman.');
}

main();
