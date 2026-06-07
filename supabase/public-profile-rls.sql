-- MiFicha — RLS para fichas públicas
-- Ejecutar en Supabase → SQL Editor

drop policy if exists "player_season_stats_select_public" on public.player_season_stats;
drop policy if exists "seasons_select_via_public_player" on public.seasons;
drop policy if exists "players_select_public_anon" on public.players;

create policy "players_select_public_anon"
on public.players
for select
to anon
using (is_public = true);

create policy "player_season_stats_select_public"
on public.player_season_stats
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.players p
    where p.id = player_season_stats.player_id
      and p.is_public = true
  )
);

create policy "seasons_select_via_public_player"
on public.seasons
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.players p
    where p.academy_id = seasons.academy_id
      and p.is_public = true
  )
);
