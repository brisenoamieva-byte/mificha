-- MiFicha — Recalcular Passport Score al actualizar stats de temporada
-- Ejecutar en Supabase → SQL Editor (después de storage-and-triggers.sql)

create or replace function public.calculate_passport_score(
  p_player_id uuid,
  p_season_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  player_row public.players%rowtype;
  stats_row public.player_season_stats%rowtype;
  score integer := 0;
begin
  select *
  into player_row
  from public.players
  where id = p_player_id;

  if not found then
    return 0;
  end if;

  select *
  into stats_row
  from public.player_season_stats
  where player_id = p_player_id
    and season_id = p_season_id;

  if player_row.photo_url is not null then score := score + 10; end if;
  if player_row.video_url is not null then score := score + 10; end if;
  if player_row.height_cm is not null then score := score + 5; end if;
  if player_row.weight_kg is not null then score := score + 5; end if;

  if stats_row.player_id is not null then
    if stats_row.total_matches > 0 then score := score + 5; end if;
    score := score + least(25, stats_row.total_matches * 5);
    score := score + least(25, stats_row.total_goals * 4);
    score := score + least(15, stats_row.total_assists * 3);
    score := score + least(10, floor(stats_row.total_minutes / 45.0)::integer);
    score := score - (stats_row.total_red_cards * 8);
    score := score - (stats_row.total_yellow_cards * 2);
  end if;

  score := greatest(0, least(100, score));

  update public.players
  set passport_score = score
  where id = p_player_id;

  return score;
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
    perform public.calculate_passport_score(target_player_id, target_season_id);
  end if;

  return coalesce(new, old);
end;
$$;

-- Recalcular al completar perfil (foto, video, etc.)
create or replace function public.handle_player_profile_passport()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_season_id uuid;
begin
  select s.id
  into active_season_id
  from public.seasons s
  where s.academy_id = new.academy_id
    and s.is_active = true
  order by s.start_date desc
  limit 1;

  if active_season_id is not null then
    perform public.calculate_passport_score(new.id, active_season_id);
  end if;

  return new;
end;
$$;

drop trigger if exists players_refresh_passport on public.players;

create trigger players_refresh_passport
after insert or update of photo_url, video_url, height_cm, weight_kg
on public.players
for each row
execute function public.handle_player_profile_passport();
