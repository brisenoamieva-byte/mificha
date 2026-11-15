-- MiFicha — Catálogo de torneos (competencias / ligas)
-- Ejecutar en Supabase → SQL Editor
--
-- Un torneo es la competencia del organizador (ej. Interescolar Querétaro 2026).
-- Las jornadas oficiales (matches) apuntan con tournament_id.
-- La temporada de academia (seasons) sigue siendo el ciclo escolar / stats.

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  platform_season_id uuid references public.platform_seasons (id) on delete set null,
  region text,
  organizer_name text,
  organizer_contact text,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists tournaments_active_idx
  on public.tournaments (is_active)
  where is_active = true;

create index if not exists tournaments_platform_season_idx
  on public.tournaments (platform_season_id);

comment on table public.tournaments is
  'Catálogo de torneos / ligas. Las jornadas oficiales se ligan con matches.tournament_id.';

alter table public.matches
  add column if not exists tournament_id uuid
  references public.tournaments (id) on delete set null;

create index if not exists matches_tournament_idx
  on public.matches (tournament_id, kickoff_at desc)
  where tournament_id is not null;

comment on column public.matches.tournament_id is
  'Torneo del catálogo cuando la jornada pertenece a una competencia registrada.';

alter table public.tournaments enable row level security;

drop policy if exists "tournaments_select_authenticated" on public.tournaments;
drop policy if exists "tournaments_admin_all" on public.tournaments;

create policy "tournaments_select_authenticated"
on public.tournaments
for select
to authenticated
using (true);

create policy "tournaments_admin_all"
on public.tournaments
for all
to authenticated
using (public.get_user_role() = 'admin')
with check (public.get_user_role() = 'admin');
