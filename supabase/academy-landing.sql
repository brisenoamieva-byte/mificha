-- MiFicha — Landing pública de academias + bucket de logos
-- Ejecutar en Supabase → SQL Editor

alter table public.academies
add column if not exists description text;

insert into storage.buckets (id, name, public)
values ('academy-logos', 'academy-logos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "academy_logos_public_read" on storage.objects;
drop policy if exists "academy_logos_auth_insert" on storage.objects;
drop policy if exists "academy_logos_auth_update" on storage.objects;

create policy "academy_logos_public_read"
on storage.objects for select
to public
using (bucket_id = 'academy-logos');

create policy "academy_logos_auth_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'academy-logos');

create policy "academy_logos_auth_update"
on storage.objects for update
to authenticated
using (bucket_id = 'academy-logos');

drop policy if exists "players_select_public_academy_landing" on public.players;
drop policy if exists "seasons_select_public_academy_landing" on public.seasons;
drop policy if exists "matches_select_public_academy_landing" on public.matches;

create policy "players_select_public_academy_landing"
on public.players
for select
to anon
using (
  exists (
    select 1
    from public.academies a
    where a.id = players.academy_id
      and a.is_public = true
  )
);

create policy "seasons_select_public_academy_landing"
on public.seasons
for select
to anon
using (
  exists (
    select 1
    from public.academies a
    where a.id = seasons.academy_id
      and a.is_public = true
  )
);

create policy "matches_select_public_academy_landing"
on public.matches
for select
to anon
using (
  exists (
    select 1
    from public.academies a
    where a.id = matches.academy_id
      and a.is_public = true
  )
);
