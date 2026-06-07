-- MiFicha — Calendario de partidos (programados + públicos)
-- Ejecutar en Supabase → SQL Editor (paso 13)

do $$
begin
  create type public.match_status as enum (
    'scheduled',
    'completed',
    'cancelled',
    'postponed'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.matches
  add column if not exists status public.match_status not null default 'completed',
  add column if not exists kickoff_at timestamptz,
  add column if not exists venue_name text,
  add column if not exists venue_address text,
  add column if not exists category text,
  add column if not exists is_public boolean not null default true,
  add column if not exists notes text;

update public.matches
set status = 'completed'
where status is null;

update public.matches
set kickoff_at = ((match_date::text || ' 10:00:00')::timestamp at time zone 'America/Mexico_City')
where kickoff_at is null;

alter table public.matches
  alter column result drop not null,
  alter column goals_for drop not null,
  alter column goals_against drop not null;

create index if not exists matches_kickoff_at_idx on public.matches (kickoff_at);
create index if not exists matches_status_idx on public.matches (status);
create index if not exists matches_public_schedule_idx
  on public.matches (academy_id, kickoff_at)
  where status = 'scheduled' and is_public = true;

comment on column public.matches.status is
  'scheduled = calendario público; completed = resultado capturado.';
comment on column public.matches.kickoff_at is
  'Fecha y hora del partido (zona del usuario al capturar).';
comment on column public.matches.venue_name is
  'Nombre de la cancha o sede.';
comment on column public.matches.is_public is
  'Si true, aparece en el calendario público de la academia.';

drop policy if exists "matches_select_public_schedule" on public.matches;

create policy "matches_select_public_schedule"
on public.matches
for select
to anon, authenticated
using (
  status in ('scheduled', 'postponed')
  and is_public = true
  and kickoff_at is not null
  and exists (
    select 1
    from public.academies a
    where a.id = matches.academy_id
      and a.is_public = true
  )
);
