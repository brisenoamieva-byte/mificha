-- MiFicha — #27 Romper recursión RLS academies ↔ players
-- Ejecutar en Supabase → SQL Editor
--
-- Síntoma: 42P17 infinite recursion detected in policy for relation "academies"
-- Tumbar /fut/explorar (embed academies en players) y el historial de /fut/j/[slug]
-- (match_stats → matches → players → academies → players).

create or replace function public.academy_row_is_public(a_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_public from public.academies where id = a_id),
    false
  );
$$;

create or replace function public.player_row_is_public_consented(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.players
    where id = p_id
      and is_public = true
      and public_consent_at is not null
  );
$$;

create or replace function public.player_row_is_discoverable_public(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.players
    where id = p_id
      and is_public = true
      and public_consent_at is not null
      and is_discoverable = true
  );
$$;

create or replace function public.academy_has_public_consented_player(a_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.players
    where academy_id = a_id
      and is_public = true
      and public_consent_at is not null
  );
$$;

create or replace function public.match_visible_on_public_ficha(m_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.match_stats ms
    join public.players p on p.id = ms.player_id
    where ms.match_id = m_id
      and p.is_public = true
      and p.public_consent_at is not null
  );
$$;

revoke all on function public.academy_row_is_public(uuid) from public;
revoke all on function public.player_row_is_public_consented(uuid) from public;
revoke all on function public.player_row_is_discoverable_public(uuid) from public;
revoke all on function public.academy_has_public_consented_player(uuid) from public;
revoke all on function public.match_visible_on_public_ficha(uuid) from public;

grant execute on function public.academy_row_is_public(uuid) to anon, authenticated;
grant execute on function public.player_row_is_public_consented(uuid) to anon, authenticated;
grant execute on function public.player_row_is_discoverable_public(uuid) to anon, authenticated;
grant execute on function public.academy_has_public_consented_player(uuid) to anon, authenticated;
grant execute on function public.match_visible_on_public_ficha(uuid) to anon, authenticated;

drop policy if exists "players_select_public_academy_landing" on public.players;

create policy "players_select_public_academy_landing"
on public.players
for select
to anon
using (
  is_public = true
  and public_consent_at is not null
  and public.academy_row_is_public(academy_id)
);

drop policy if exists "academies_select_via_public_player" on public.academies;

create policy "academies_select_via_public_player"
on public.academies
for select
to anon
using (public.academy_has_public_consented_player(id));

drop policy if exists "match_stats_select_public_anon" on public.match_stats;

create policy "match_stats_select_public_anon"
on public.match_stats
for select
to anon, authenticated
using (public.player_row_is_discoverable_public(player_id));

drop policy if exists "match_stats_select_public_ficha" on public.match_stats;

create policy "match_stats_select_public_ficha"
on public.match_stats
for select
to anon, authenticated
using (public.player_row_is_public_consented(player_id));

drop policy if exists "matches_select_public_ficha" on public.matches;

create policy "matches_select_public_ficha"
on public.matches
for select
to anon, authenticated
using (
  status = 'completed'
  and public.match_visible_on_public_ficha(id)
);

drop policy if exists "player_season_stats_select_public" on public.player_season_stats;

create policy "player_season_stats_select_public"
on public.player_season_stats
for select
to anon, authenticated
using (public.player_row_is_public_consented(player_id));

drop policy if exists "seasons_select_via_public_player" on public.seasons;

create policy "seasons_select_via_public_player"
on public.seasons
for select
to anon, authenticated
using (public.academy_has_public_consented_player(academy_id));
