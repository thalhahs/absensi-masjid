-- Insert officer dengan role masjid (kios)
-- Ganti 'Operator Kios' dengan nama yang diinginkan
-- Ganti PIN '123456' di bawah dengan PIN yang diinginkan,
-- lalu generate ulang pin_hash dengan command:
--   node -e "const c=require('crypto');const p='PIN_BARU';const s=c.randomBytes(16).toString('hex');const h=c.pbkdf2Sync(p,s,100000,64,'sha512').toString('hex');console.log('pbkdf2_sha512$'+s+'$'+h);"

INSERT INTO public.officers (name, role, active, pin_hash)
VALUES (
  'Operator Kios',
  'masjid',
  true,
  'pbkdf2_sha512$525bf6fcda970c39eeb2be2a2367a8b4$8c57dc8b6a44a0d598a9cbf08ca1409dcd3f6f23ab38abc6ec70bc8a31357e5934f3d6d26f7083157134ac1542862629d8395bd6b0384c5e3d74b9fa9f90f9e6'
);

-- Catatan: pin_hash di atas adalah untuk PIN 123456.
-- Jika ingin PIN lain, generate ulang dengan command Node.js di atas.
