import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

const parseEnv = (text) => {
  const result = {};
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key) {
      result[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
    }
  }
  return result;
};

const env = parseEnv(envText);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_KEY wajib ada di .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const csvPath = process.argv[2] || path.join(process.cwd(), 'schedule.csv');

if (!fs.existsSync(csvPath)) {
  console.error(`File tidak ditemukan: ${csvPath}`);
  console.error('Penggunaan: node scripts/import-schedule.js <path-to-csv>');
  process.exit(1);
}

const raw = fs.readFileSync(csvPath, 'utf-8');
const lines = raw
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

if (lines.length === 0) {
  console.error('CSV kosong');
  process.exit(1);
}

const headers = lines[0].split(',').map((h) => h.trim());
const rows = [];

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',').map((v) => v.trim());
  if (values.length !== headers.length) {
    console.warn(`Baris ${i + 1} dilewati: kolom tidak sesuai`);
    continue;
  }
  const row = {};
  headers.forEach((h, idx) => (row[h] = values[idx]));
  rows.push(row);
}

async function main() {
  const { data: officers, error: officersError } = await supabase
    .from('officers')
    .select('id, name');

  if (officersError) {
    console.error('Gagal mengambil officers:', officersError.message);
    process.exit(1);
  }

  const officerMap = new Map(officers.map((o) => [o.name, o.id]));
  const inserts = [];
  const skipped = [];

  for (const row of rows) {
    const { date, prayer_id, imam_name, muadzin_name, badal_name } = row;

    if (!date || !prayer_id || !imam_name || !muadzin_name || !badal_name) {
      skipped.push({ row, reason: 'Kolom kurang' });
      continue;
    }

    const imamId = officerMap.get(imam_name);
    const muadzinId = officerMap.get(muadzin_name);
    const badalId = officerMap.get(badal_name);

    if (!imamId || !muadzinId || !badalId) {
      skipped.push({
        row,
        reason: 'Nama officer tidak ditemukan',
        missing: [
          !imamId ? imam_name : null,
          !muadzinId ? muadzin_name : null,
          !badalId ? badal_name : null,
        ].filter(Boolean),
      });
      continue;
    }

    inserts.push({
      date,
      prayer_id,
      imam_id: imamId,
      muadzin_id: muadzinId,
      badal_imam_id: badalId,
    });
  }

  if (inserts.length === 0) {
    console.warn('Tidak ada data valid untuk diinsert.');
  } else {
    const { error } = await supabase
      .from('schedule_assignments')
      .insert(inserts);

    if (error) {
      console.error('Gagal insert schedule_assignments:', error.message);
      process.exit(1);
    }

    console.log(`Berhasil insert ${inserts.length} jadwal ke schedule_assignments.`);
  }

  if (skipped.length > 0) {
    console.warn(`Dilewati ${skipped.length} baris:`);
    skipped.forEach((item) => {
      console.warn(
        `- ${JSON.stringify(item.row)} | alasan: ${item.reason}${item.missing ? ' | missing: ' + item.missing.join(', ') : ''}`
      );
    });
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
