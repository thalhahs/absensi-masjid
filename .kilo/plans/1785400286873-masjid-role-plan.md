# Masjid Role Implementation Plan

## Goal
Add a `masjid` role (kios station) for the mosque's HP device. Masjid can generate QR codes and view presensi/profile only. Admin (`superadmin`) handles all management.

## Role matrix
| Role | Presensi | Riwayat | Jadwal | Petugas | Statistik | Profile |
|---|---|---|---|---|---|---|
| superadmin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| masjid | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| officer | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |

## Changes

### 1. `supabase-schema.sql`
- Add `'masjid'` to `check (role in ('superadmin', 'officer'))` constraint on `officers.role`

### 2. `src/lib/session.js`
- No change needed — `getRole()` returns the raw role string; role checks happen in components

### 3. `src/components/MosqueApp.jsx`
- Add derived boolean: `const canGenerateQR = currentRole === 'superadmin' || currentRole === 'masjid'`
- Keep `isSuperadmin` as-is (used for management tabs: jadwal, petugas, statistik)
- Pass `canGenerateQR` to `PresensiView` as a new prop
- Pass `canGenerateQR` to `generateQrCode` — update guard at line ~1162 from `if (!isSuperadmin)` to `if (!canGenerateQR)`
- Update navbar tab visibility (lines 1566-1710):
  - Presensi: always visible
  - Riwayat: visible for `superadmin` and `officer` only (add guard)
  - Jadwal: visible for `superadmin` and `officer` only (add `isSuperadmin` guard — was previously unguarded)
  - Statistik: `isSuperadmin` only (already guarded, no change)
  - Petugas: `isSuperadmin` only (already guarded, no change)
  - Profile: always visible
- Pass `canGenerateQR={canGenerateQR}` to `PresensiView`

### 4. `src/views/PresensiView.jsx`
- Add `canGenerateQR` to destructured props
- Change QR button condition at line 340 from `isSuperadmin && meta.scanRole && ...` to `canGenerateQR && meta.scanRole && ...`

### 5. `src/views/ProfileView.jsx`
- No change needed

## Key design decisions

### Riwayat tab visibility
- **masjid**: hidden (only Presensi + Profile)
- **officer**: visible (unchanged from current behavior)
- **superadmin**: visible (unchanged)
- Guard: `currentRole === 'superadmin' || currentRole === 'officer'`

### Jadwal tab visibility  
- **masjid**: hidden
- **officer**: visible (currently no guard — this is an existing gap to fix)
- **superadmin**: visible
- Guard: `isSuperadmin` (add guard for officer too? Or keep as-is? Open question)
- **Recommendation**: give `isSuperadmin` guard to Jadwal tab, same as current behavior for officer = hidden. This simplifies the logic. Clarify with user.

### Open questions
1. Should `Jadwal` tab be hidden for `officer` too? Currently visible to officer with no guard. If yes, the guard is `isSuperadmin`. If no, officer keeps Jadwal access and the guard is `currentRole === 'superadmin' || currentRole === 'officer'`.
2. Should `canGenerateQR` be computed in `MosqueApp` and passed down, or computed inside `PresensiView` from its `role` prop? (Computed in MosqueApp is cleaner since it's already passed down.)

## Verification
- `npm run build` passes
- Login as `masjid` → only Presensi + Profile tabs visible, QR generate button shown on presensi page
- Login as `officer` → QR generate button hidden, scan-only, all existing tabs preserved
- Login as `superadmin` → all tabs visible, QR generation works
