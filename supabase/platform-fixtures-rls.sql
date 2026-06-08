-- MiFicha — Jornadas oficiales (fixtures publicados por plataforma)
-- Ejecutar en Supabase → SQL Editor (paso 15)
--
-- Las academias solo capturan stats sobre partidos ya publicados;
-- insertar jornadas queda restringido al rol admin.

alter table public.matches
  add column if not exists is_official boolean not null default false;

comment on column public.matches.is_official is
  'True cuando MiFicha publicó la jornada. Las academias completan el resultado, no crean el partido.';

create index if not exists matches_official_schedule_idx
  on public.matches (academy_id, kickoff_at)
  where status in ('scheduled', 'postponed') and is_official = true;

drop policy if exists "matches_all_owner_or_admin" on public.matches;

drop policy if exists "matches_select_owner_or_admin" on public.matches;
drop policy if exists "matches_insert_admin_only" on public.matches;
drop policy if exists "matches_update_owner_or_admin" on public.matches;
drop policy if exists "matches_delete_admin_only" on public.matches;

create policy "matches_select_owner_or_admin"
on public.matches
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create policy "matches_insert_admin_only"
on public.matches
for insert
to authenticated
with check (public.get_user_role() = 'admin');

create policy "matches_update_owner_or_admin"
on public.matches
for update
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
)
with check (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create policy "matches_delete_admin_only"
on public.matches
for delete
to authenticated
using (public.get_user_role() = 'admin');

-- Partidos capturados antes de este script siguen válidos (is_official = false por default).
