-- MiFicha — Storage buckets + trigger player_season_stats
-- Ejecutar en Supabase → SQL Editor

insert into storage.buckets (id, name, public)
values
  ('player-photos', 'player-photos', true),
  ('player-videos', 'player-videos', true)
on conflict (id) do update set public = excluded.public;

create policy "player_photos_public_read"
on storage.objects for select
to public
using (bucket_id = 'player-photos');

create policy "player_photos_auth_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'player-photos');

create policy "player_photos_auth_update"
on storage.objects for update
to authenticated
using (bucket_id = 'player-photos');

create policy "player_videos_public_read"
on storage.objects for select
to public
using (bucket_id = 'player-videos');

create policy "player_videos_auth_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'player-videos');

create policy "player_videos_auth_update"
on storage.objects for update
to authenticated
using (bucket_id = 'player-videos');

create or replace function public.refresh_player_season_stats(
  p_player_id uuid,
  p_season_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  totals record;
begin
  select
    count(distinct ms.match_id)::integer as total_matches,
    coalesce(sum(ms.goals), 0)::integer as total_goals,
    coalesce(sum(ms.assists), 0)::integer as total_assists,
    coalesce(sum(ms.minutes_played), 0)::integer as total_minutes,
    coalesce(sum(ms.yellow_cards), 0)::integer as total_yellow_cards,
    coalesce(sum(ms.red_cards), 0)::integer as total_red_cards
  into totals
  from public.match_stats ms
  join public.matches m on m.id = ms.match_id
  where ms.player_id = p_player_id
    and m.season_id = p_season_id;

  insert into public.player_season_stats (
    player_id,
    season_id,
    total_matches,
    total_goals,
    total_assists,
    total_minutes,
    total_yellow_cards,
    total_red_cards,
    updated_at
  )
  values (
    p_player_id,
    p_season_id,
    totals.total_matches,
    totals.total_goals,
    totals.total_assists,
    totals.total_minutes,
    totals.total_yellow_cards,
    totals.total_red_cards,
    now()
  )
  on conflict (player_id, season_id) do update
  set
    total_matches = excluded.total_matches,
    total_goals = excluded.total_goals,
    total_assists = excluded.total_assists,
    total_minutes = excluded.total_minutes,
    total_yellow_cards = excluded.total_yellow_cards,
    total_red_cards = excluded.total_red_cards,
    updated_at = now();
end;
$$;

create or replace function public.handle_match_stats_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_player_id uuid;
  target_season_id uuid;
begin
  target_player_id := coalesce(new.player_id, old.player_id);

  select m.season_id
  into target_season_id
  from public.matches m
  where m.id = coalesce(new.match_id, old.match_id);

  if target_player_id is not null and target_season_id is not null then
    perform public.refresh_player_season_stats(target_player_id, target_season_id);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists match_stats_refresh_totals on public.match_stats;

create trigger match_stats_refresh_totals
after insert or update or delete on public.match_stats
for each row
execute function public.handle_match_stats_change();

-- Permitir ver academia en fichas públicas de jugadores
drop policy if exists "academies_select_via_public_player" on public.academies;

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
  )
);
