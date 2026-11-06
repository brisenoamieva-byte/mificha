-- MiFicha — registro de visorías GPH/CRACKS (p. ej. Querétaro nov 2026)
-- Ejecutar en Supabase → SQL Editor.

create table if not exists public.visoria_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null default 'queretaro-nov-2026',
  folio text not null unique,
  source text not null default 'platform'
    check (source in ('platform', 'google_forms', 'whatsapp', 'import')),
  player_full_name text not null,
  birth_date date not null,
  category text not null check (category in ('femenil', 'varonil')),
  position text,
  current_club text,
  city text,
  guardian_name text not null,
  guardian_phone text not null,
  guardian_email text,
  attend_thursday boolean not null default true,
  attend_friday boolean not null default false,
  gph_selected boolean not null default false,
  privacy_accepted_at timestamptz not null,
  image_rights_accepted_at timestamptz not null,
  clubs_share_accepted_at timestamptz not null,
  marketing_accepted_at timestamptz,
  notes text,
  age_at_registration integer,
  years_training numeric,
  nui text,
  created_at timestamptz not null default now()
);

create unique index if not exists visoria_registrations_dup_uidx
  on public.visoria_registrations (
    event_id,
    lower(btrim(player_full_name)),
    guardian_phone
  );

create index if not exists visoria_registrations_event_idx
  on public.visoria_registrations (event_id, created_at desc);

create index if not exists visoria_registrations_category_idx
  on public.visoria_registrations (event_id, category);

alter table public.visoria_registrations
  add column if not exists age_at_registration integer;
alter table public.visoria_registrations
  add column if not exists years_training numeric;
alter table public.visoria_registrations
  add column if not exists nui text;

alter table public.visoria_registrations enable row level security;

drop policy if exists "visoria_registrations_staff_select" on public.visoria_registrations;
create policy "visoria_registrations_staff_select"
on public.visoria_registrations
for select
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'brisenoamieva@gmail.com',
    'gkperformancehub@gmail.com'
  )
);

comment on table public.visoria_registrations is
  'Inscripciones a visorías GPH/CRACKS. El alta público entra por service role en /fut/api/visorias.';
