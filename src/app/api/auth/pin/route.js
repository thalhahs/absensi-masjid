import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

const PIN_LENGTH = 6;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(pin, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `pbkdf2_sha512$${salt}$${hash}`;
}

async function verifyPin(pin, storedHash) {
  if (!storedHash || !storedHash.includes('$')) {
    return false;
  }
  const [algo, salt, expectedHash] = storedHash.split('$');
  const actualHash = crypto
    .pbkdf2Sync(pin, salt, 100000, 64, 'sha512')
    .toString('hex');
  return actualHash === expectedHash;
}

export async function POST(request) {
  try {
    const { pin } = await request.json().catch(() => ({}));

    if (!pin || typeof pin !== 'string' || pin.length !== PIN_LENGTH || !/^\d+$/.test(pin)) {
      return NextResponse.json(
        { success: false, message: `PIN harus ${PIN_LENGTH} digit angka` },
        { status: 400 }
      );
    }

    const { data: officers, error } = await supabase
      .from('officers')
      .select('id, name, role, pin_hash, active')
      .eq('active', true);

    if (error || !officers || officers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'PIN tidak valid' },
        { status: 401 }
      );
    }

    let matchedOfficer = null;

    for (const officer of officers) {
      if (!officer.pin_hash || officer.pin_hash === '') {
        continue;
      }
      if (await verifyPin(pin, officer.pin_hash)) {
        matchedOfficer = officer;
        break;
      }
    }

    if (!matchedOfficer) {
      clearSession();
      return NextResponse.json(
        { success: false, message: 'PIN salah' },
        { status: 401 }
      );
    }

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    const sessionPayload = {
      officerId: matchedOfficer.id,
      name: matchedOfficer.name,
      role: matchedOfficer.role || 'officer',
      expiresAt,
    };

    return NextResponse.json({
      success: true,
      session: sessionPayload,
    });
  } catch (error) {
    console.error('AUTH ERROR:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Simple health check - for checking if auth endpoint is alive
    return NextResponse.json({ success: true, status: 'ok' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
