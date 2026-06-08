-- MiFicha — Temporadas centralizadas (solo admin de plataforma)
-- Ejecutar en Supabase → SQL Editor
--
-- Las academias solo leen su temporada activa; crear/editar temporadas queda
-- restringido al rol admin (panel /interno/temporadas o service role).

drop policy if exists "seasons_all_owner_or_admin" on public.seasons;

drop policy if exists "seasons_select_owner_or_admin" on public.seasons;
drop policy if exists "seasons_insert_admin_only" on public.seasons;
drop policy if exists "seasons_update_admin_only" on public.seasons;
drop policy if exists "seasons_delete_admin_only" on public.seasons;

create policy "seasons_select_owner_or_admin"
on public.seasons
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create policy "seasons_insert_admin_only"
on public.seasons
for insert
to authenticated
with check (public.get_user_role() = 'admin');

create policy "seasons_update_admin_only"
on public.seasons
for update
to authenticated
using (public.get_user_role() = 'admin')
with check (public.get_user_role() = 'admin');

create policy "seasons_delete_admin_only"
on public.seasons
for delete
to authenticated
using (public.get_user_role() = 'admin');
