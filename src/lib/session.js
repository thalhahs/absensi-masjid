const SESSION_KEY = 'absensi_masjid_session';
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours

function readStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const session = JSON.parse(raw);
    if (!session || !session.expiresAt || Date.now() > session.expiresAt) {
      try { window.localStorage.removeItem(SESSION_KEY); } catch {}
      return null;
    }
    return session;
  } catch {
    try { window.localStorage.removeItem(SESSION_KEY); } catch {}
    return null;
  }
}

export function getSession() {
  if (typeof window === 'undefined') {
    return null;
  }
  const session = readStoredSession();
  if (!session) return null;
  return session;
}

export function getRole() {
  const session = getSession();
  return session?.role ?? null;
}

export function getOfficerId() {
  const session = getSession();
  return session?.officerId ?? null;
}

export function isSuperadmin() {
  return getRole() === 'superadmin';
}

export function isAuthenticated() {
  return !!getSession();
}

export function setSession({ officerId, name, role, expiresAt }) {
  if (typeof window === 'undefined') {
    return;
  }
  const session = {
    officerId,
    name: name || '',
    role: role || 'officer',
    expiresAt: expiresAt || Date.now() + SESSION_TTL,
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
}

export function refreshSession() {
  if (typeof window === 'undefined') {
    return;
  }
  const session = readStoredSession();
  if (!session) {
    return;
  }

  const refreshed = {
    ...session,
    expiresAt: Date.now() + SESSION_TTL,
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(refreshed));
}
