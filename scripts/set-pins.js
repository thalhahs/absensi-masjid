import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SUPABASE_ADMIN_PIN = '123580';

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

async function ensureAdmin() {
  const { data, error } = await supabase
    .from('officers')
    .select('id, name, role')
    .eq('role', 'superadmin')
    .limit(1);

  if (error) {
    console.error('Failed to check superadmin:', error.message);
    process.exit(1);
  }

  if (data?.length === 0) {
    console.log('No superadmin found. Creating superadmin "admin"...');
    const adminHash = hashPin(SUPABASE_ADMIN_PIN);

    const { data: inserted, error: insertError } = await supabase
      .from('officers')
      .insert([
        {
          name: 'admin',
          role: 'superadmin',
          pin_hash: adminHash,
          active: true,
        },
      ])
      .select('id, name')
      .single();

    if (insertError || !inserted) {
      console.error('Failed to create superadmin:', insertError?.message || insertError);
      process.exit(1);
    }

    console.log('Superadmin created:');
    console.log(`  name : ${inserted.name}`);
    console.log(`  pin  : ${SUPABASE_ADMIN_PIN}`);
    return inserted;
  }

  console.log('Existing superadmin found.');
  console.log(`  name : ${data[0].name}`);

  const { data: adminData, error: adminError } = await supabase
    .from('officers')
    .select('pin_hash')
    .eq('name', data[0].name)
    .single();

  if (!adminError && adminData && !adminData.pin_hash) {
    const adminHash = hashPin(SUPABASE_ADMIN_PIN);
    await supabase.from('officers').update({ pin_hash: adminHash }).eq('name', data[0].name);
    console.log(`  pin  : ${SUPABASE_ADMIN_PIN} (newly set)`);
  } else if (!adminError && adminData?.pin_hash) {
    console.log('  pin  : already set');
  } else {
    console.log('  pin  : unable to read pin_hash');
  }

  return data[0];
}

async function setRandomPin(officerId, officerName) {
  const randomPin = String(Math.floor(100000 + Math.random() * 900000));
  const pinHash = hashPin(randomPin);

  const { error } = await supabase
    .from('officers')
    .update({
      pin_hash: pinHash,
      role: 'officer',
      active: true,
    })
    .eq('id', officerId);

  if (error) {
    console.error(`Failed to set PIN for ${officerName}:`, error.message);
    return null;
  }

  return randomPin;
}

async function main() {
  console.log('Setting up officers PINs...\n');

  const admin = await ensureAdmin();
  console.log();

  const { data: officers, error: officersError } = await supabase
    .from('officers')
    .select('id, name, role, pin_hash')
    .neq('role', 'superadmin')
    .order('name', { ascending: true });

  if (officersError) {
    console.error('Failed to fetch officers:', officersError.message);
    process.exit(1);
  }

  if (!officers || officers.length === 0) {
    console.log('No officers found to set PINs for.');
    return;
  }

  console.log('Setting random PINs for officers:\n');

  const results = [];
  for (const officer of officers) {
    const pin = await setRandomPin(officer.id, officer.name);
    if (pin) {
      results.push({ name: officer.name, pin });
      console.log(`  ✓ ${officer.name}: ${pin}`);
    }
  }

  console.log();
  console.log('===================');
  console.log('SUMMARY');
  console.log('===================');
  console.log();
  console.log('Superadmin:');
  console.log(`  name : ${admin.name}`);
  console.log(`  pin  : ${SUPABASE_ADMIN_PIN}`);
  console.log();
  console.log('Officers:');
  for (const item of results) {
    console.log(`  ${item.name}: ${item.pin}`);
  }
  console.log();
  console.log('Save these PINs securely. Each officer must login with their own PIN.');
  console.log('Officers can only access Presensi view. Superadmin has full access.');
}

main();
