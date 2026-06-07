-- MiFicha — Endurecimiento RLS (privacidad alineada con la app)
-- Ejecutar en Supabase → SQL Editor DESPUÉS de los pasos 1–11

-- Jugadores: landing pública solo con consentimiento
drop policy if exists "players_select_public_academy_landing" on public.players;

create policy "players_select_public_academy_landing"
on public.players
for select
to anon
using (
  is_public = true
  and public_consent_at is not null
  and exists (
    select 1
    from public.academies a
    where a.id = players.academy_id
      and a.is_public = true
  )
);

-- Jugadores: scouts autenticados solo ven fichas con consentimiento
drop policy if exists "players_select_public_or_owner_or_admin" on public.players;

create policy "players_select_public_or_owner_or_admin"
on public.players
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
  or (is_public = true and public_consent_at is not null)
);

-- Stats de temporada: requieren consentimiento (ficha pública /j/slug)
drop policy if exists "player_season_stats_select_public" on public.player_season_stats;

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
      and p.public_consent_at is not null
  )
);

-- Temporadas: solo si hay jugador con ficha pública consentida
drop policy if exists "seasons_select_via_public_player" on public.seasons;
drop policy if exists "seasons_select_public_academy_landing" on public.seasons;

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
      and p.public_consent_at is not null
  )
);

-- Match stats: directorio / ideal XI — jugador discoverable + consentimiento
drop policy if exists "match_stats_select_public_anon" on public.match_stats;

create policy "match_stats_select_public_anon"
on public.match_stats
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.players p
    where p.id = match_stats.player_id
      and p.is_public = true
      and p.public_consent_at is not null
      and p.is_discoverable = true
  )
);

-- Match stats: ficha individual /j/slug — consentimiento sin discoverable
create policy "match_stats_select_public_ficha"
on public.match_stats
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.players p
    where p.id = match_stats.player_id
      and p.is_public = true
      and p.public_consent_at is not null
  )
);

-- Academias: ocultar datos sensibles en lectura anónima directa
drop policy if exists "academies_select_public_anon" on public.academies;
drop policy if exists "academies_select_via_public_player" on public.academies;

create policy "academies_select_public_anon"
on public.academies
for select
to anon
using (is_public = true);

create policy "academies_select_via_public_player"
on public.academies
for select
to anon
using (
  exists (
    select 1
    from public.players p
    where p.academy_id = academies.id
      and p.is_public = true
      and p.public_consent_at is not null
  )
);

-- Asegurar buckets de media privados (idempotente)
update storage.buckets
set public = false
where id in ('player-photos', 'player-videos');
