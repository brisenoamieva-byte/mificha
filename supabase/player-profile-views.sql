-- MiFicha — Tracking de aperturas de ficha pública (padres / tutores)
-- Ejecutar en Supabase → SQL Editor (paso 18)
--
-- Registra visitas anónimas a /j/[slug] para medir engagement parental.
-- Sin IP en claro: solo visitor_key (hash) para deduplicar.

create table if not exists public.player_profile_views (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  academy_id uuid not null references public.academies (id) on delete cascade,
  visitor_key text not null,
  viewed_at timestamptz not null default now()
);

create index if not exists player_profile_views_academy_idx
  on public.player_profile_views (academy_id, viewed_at desc);

create index if not exists player_profile_views_player_idx
  on public.player_profile_views (player_id, viewed_at desc);

create index if not exists player_profile_views_dedup_idx
  on public.player_profile_views (player_id, visitor_key, viewed_at desc);

comment on table public.player_profile_views is
  'Aperturas de fichas públicas /j/slug — métrica de engagement parental.';
comment on column public.player_profile_views.visitor_key is
  'Hash anónimo por visitante (sin IP en claro).';

alter table public.player_profile_views enable row level security;

drop policy if exists "profile_views_select_academy" on public.player_profile_views;

create policy "profile_views_select_academy"
on public.player_profile_views
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create or replace function public.get_academy_profile_view_stats(p_academy_id uuid)
returns json
language sql
stable
security invoker
as $$
  select json_build_object(
    'total_views', count(*)::int,
    'unique_visitors', count(distinct visitor_key)::int,
    'views_last_7_days', count(*) filter (where viewed_at >= now() - interval '7 days')::int
  )
  from public.player_profile_views
  where academy_id = p_academy_id;
$$;

comment on function public.get_academy_profile_view_stats(uuid) is
  'Totales de aperturas de ficha para el dashboard de academia.';
