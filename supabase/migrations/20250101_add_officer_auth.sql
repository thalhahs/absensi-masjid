-- Migration: add auth fields to officers and link attendance
-- This adds:
--   officers.role / officers.pin_hash
--   attendance.officer_id foreign key
-- It is safe to run on top of the existing schema.

-- 1. Auth fields on officers
alter table public.officers
  add column if not exists role text not null default 'officer' check (role in ('superadmin', 'officer'));

alter table public.officers
  add column if not exists pin_hash text not null default '';

create unique index if not exists idx_officers_name on public.officers(name);

comment on column public.officers.role is 'superadmin | officer';
comment on column public.officers.pin_hash is 'bcrypt/argon2 hash of 6-digit PIN';

-- 2. Link attendance to officers
alter table public.attendance
  add column if not exists officer_id bigint references public.officers(id) on delete set null;

-- Rebuild the composite index using the real foreign key
drop index if exists public.idx_attendance_date_officer;
create index if not exists idx_attendance_date_officer
  on public.attendance(attendance_date, officer_id);
