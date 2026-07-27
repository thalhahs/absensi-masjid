import crypto from 'crypto';

const SUPABASE_ADMIN_PIN = '123580';

function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(pin, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `pbkdf2_sha512$${salt}$${hash}`;
}

function generateFixedPin(officerName) {
  const base = officerName.trim().toLowerCase();
  const hash = crypto.createHash('md5').update(base).digest('hex');
  const numeric = parseInt(hash.slice(0, 12), 16);
  return String(numeric % 900000 + 100000);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/generate-officer-pins.js "<nama1>" "<nama2>" ...');
    console.log('Example: node scripts/generate-officer-pins.js "Ustadz Ahmad" "Ustadz Budi" admin');
    process.exit(1);
  }

  const rows = [];
  for (const rawName of args) {
    const name = rawName.trim();
    if (!name) continue;
    const role = name.toLowerCase() === 'admin' ? 'superadmin' : 'officer';
    const pin = role === 'superadmin' ? SUPABASE_ADMIN_PIN : generateFixedPin(name);
    const pinHash = hashPin(pin);
    rows.push({ name, role, pin, pinHash });
  }

  console.log('===================');
  console.log('OFFICER PIN LIST');
  console.log('===================');
  for (const row of rows) {
    console.log(`${row.name} (${row.role}): ${row.pin}`);
  }

  console.log('\n-------------------');
  console.log('SUPABASE SQL');
  console.log('-------------------');

  const whenClause = rows.map((row) => `  WHEN '${row.name}' THEN '${row.pinHash}'`).join('\n');
  const roleClause = rows.map((row) => `  WHEN '${row.name}' THEN '${row.role}'`).join('\n');
  const namesList = rows.map((row) => `'${row.name}'`).join(', ');

  console.log(`
UPDATE public.officers
SET pin_hash = CASE name
${whenClause}
END,
    role = CASE name
${roleClause}
END
WHERE name IN (${namesList});
  `.trim());
}

main();
