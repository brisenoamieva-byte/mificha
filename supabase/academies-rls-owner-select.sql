-- MiFicha — #29 Cortar recursión RLS academies ↔ academy_members (42P17)
-- Ejecutar en Supabase → SQL Editor
--
-- Síntoma: el dueño entra al panel y ve «No tienes una academia registrada».
-- Causa: la política de academies hace EXISTS sobre academy_members, y la de
-- members llama is_academy_owner() que vuelve a leer academies.

create or replace function public.is_academy_staff(academy_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.academy_members
    where academy_id = academy_uuid
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

revoke all on function public.is_academy_staff(uuid) from public;
grant execute on function public.is_academy_staff(uuid) to authenticated, anon;

drop policy if exists "academies_select_public_or_owner_or_admin" on public.academies;

create policy "academies_select_public_or_owner_or_admin"
on public.academies
for select
to authenticated
using (
  is_public = true
  or owner_id = auth.uid()
  or public.get_user_role() = 'admin'
  or public.is_academy_staff(id)
);
