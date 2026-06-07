-- MiFicha — lectura pública de partidos y stats para el 11 ideal semanal
-- Ejecutar en Supabase → SQL Editor (después de schema.sql y public-profile-rls.sql)

drop policy if exists "matches_select_public_anon" on public.matches;
drop policy if exists "match_stats_select_public_anon" on public.match_stats;

create policy "matches_select_public_anon"
on public.matches
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.academies a
    where a.id = matches.academy_id
      and a.is_public = true
  )
);

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
  )
);
