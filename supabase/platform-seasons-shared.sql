-- MiFicha — Temporada compartida de plataforma (ciclo único MiFicha)
-- Ejecutar en Supabase → SQL Editor (paso 17)
--
-- Una temporada MiFicha (ej. Escolar Querétaro 2025–26) se asigna a cada academia
-- para stats comparables entre colegios.

create table if not exists public.platform_seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  region text,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists platform_seasons_active_idx
  on public.platform_seasons (is_active)
  where is_active = true;

alter table public.seasons
  add column if not exists platform_season_id uuid references public.platform_seasons (id) on delete set null;

create index if not exists seasons_platform_season_id_idx
  on public.seasons (platform_season_id);

comment on table public.platform_seasons is
  'Ciclo oficial MiFicha compartido entre academias (ej. escolar estatal).';
comment on column public.seasons.platform_season_id is
  'Enlace a la temporada de plataforma cuando la academia participa en un ciclo compartido.';

alter table public.platform_seasons enable row level security;

drop policy if exists "platform_seasons_select_authenticated" on public.platform_seasons;
drop policy if exists "platform_seasons_admin_all" on public.platform_seasons;

create policy "platform_seasons_select_authenticated"
on public.platform_seasons
for select
to authenticated
using (true);

create policy "platform_seasons_admin_all"
on public.platform_seasons
for all
to authenticated
using (public.get_user_role() = 'admin')
with check (public.get_user_role() = 'admin');
