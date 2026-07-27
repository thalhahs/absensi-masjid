-- ============================================
-- ABSENSI MASJID - AUTH SETUP
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- 1. Add auth columns if they don't exist
alter table public.officers
  add column if not exists role text not null default 'officer' check (role in ('superadmin', 'officer'));

alter table public.officers
  add column if not exists pin_hash text not null default '';

-- 2. Create indexes
create unique index if not exists idx_officers_name on public.officers(name);

-- 3. Set all existing officers as 'officer' by default
update public.officers set role = 'officer' where role is null;

-- 4. Delete old admin if exists
delete from public.officers where name = 'admin';

-- 5. Insert superadmin with PIN "123580"
-- Hash: pbkdf2_sha512$83936ce16f482d37a47d3b7091223ef4$676db7d4c683ffc1c9ba4838e5636ab91df3b1779813bb40f4fbea914a88a056fa96b514d4149c153bb49ac9db919d56532108a463efa26caffd3a889f0928f1
insert into public.officers (id, name, role, pin_hash, active)
values (
  999,
  'admin',
  'superadmin',
  'pbkdf2_sha512$83936ce16f482d37a47d3b7091223ef4$676db7d4c683ffc1c9ba4838e5636ab91df3b1779813bb40f4fbea914a88a056fa96b514d4149c153bb49ac9db919d56532108a463efa26caffd3a889f0928f1',
  true
);

-- 6. Update PIN hashes for your officers
-- Ustadz Hasbi: 476207
-- Ustadz Asep: 255701
-- Ustadz Nandar: 689684
-- Ustadz Shofwan: 151232
-- Ustadz Dzul: 381417
-- Ustadz Shidqi: 462383
update public.officers set pin_hash = 'pbkdf2_sha512$d2eb4ab0117ba15a389c5e12ab282305$a4eff484398cf432d06df303758fe0bd7749e28d24021dfd53d6187ed8771305311b4748f1964ce1aca1cc7e3b4c50be1d9080042c6c47ecc3a014f04890dc47' where name = 'Ustadz Hasbi';
update public.officers set pin_hash = 'pbkdf2_sha512$7b353d6a1e90acfe9d809946107c19bb$0c1c0856c2d5752ae30e6d54a2e672135fc462f5b4d8d6535f193ce9b94fde7e1132bc7ebc5aea2ad3ea481544aaa65221e00f59089d8c24bd934b559d52510c' where name = 'Ustadz Asep';
update public.officers set pin_hash = 'pbkdf2_sha512$2fbd421f26b9eaed250680497ad20c51$19a4a84194093bf81e62cfed57eb864822d7f2b167c565b4d2e589153d7c47987bf15af36cff9521fb1588ab9216b9eface685c815a01495b9c7982462a0acdb' where name = 'Ustadz Nandar';
update public.officers set pin_hash = 'pbkdf2_sha512$b492c67bc0f95f1afc2946bb97841738$c31c53f5b3ed9e1df190332d5df5762d4dccd85b7d3e92bb3bdeedf41af1f99e0e023fa1fa11204bf57d2ec56ffdd21ee11dedeb4cfaa943e5496b91c9f98160' where name = 'Ustadz Shofwan';
update public.officers set pin_hash = 'pbkdf2_sha512$ae53ea7d42661c1a1392c3e3a1f437a6$81bcec3c32d8cf6ece787b4c3becd30ebe19669744dcbc7714219050a3568180a0902362050bb33a0c5eebe1cb15beccfd7a334f74e826820d4e9118002f4c89' where name = 'Ustadz Dzul';
update public.officers set pin_hash = 'pbkdf2_sha512$4acb875778f97f1596c89988016f9bc2$267d116bd57db93e7120e02c15c1962742bf59ee046e0381a9e5125f6a3e8db0940feb90bdc12ac4efc298a6f1de1079e72d607346688f1bbf4a682afc5d57af' where name = 'Ustadz Shidqi';

-- 7. Verify setup
select id, name, role, active, length(pin_hash) as pin_hash_length
from public.officers
order by id;
