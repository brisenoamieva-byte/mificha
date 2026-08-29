-- MiFicha — Equipo de academia (dueño invita staff, p. ej. socio evaluador)
-- Ejecutar en Supabase → SQL Editor (paso 26)

create table if not exists public.academy_members (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  invited_email text not null,
  invited_name text,
  role text not null default 'staff'
    check (role in ('staff')),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'revoked')),
  invite_token_hash text unique,
  invite_expires_at timestamptz,
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create unique index if not exists academy_members_active_user_uidx
  on public.academy_members (academy_id, user_id)
  where user_id is not null and status = 'active';

create unique index if not exists academy_members_pending_email_uidx
  on public.academy_members (academy_id, lower(invited_email))
  where status = 'pending';

create index if not exists academy_members_user_idx
  on public.academy_members (user_id)
  where user_id is not null;

comment on table public.academy_members is
  'Staff invitado a una academia. Puede capturar y ver diagnósticos; no sustituye al dueño.';

alter table public.academy_members enable row level security;

drop policy if exists "academy_members_select_self_or_owner" on public.academy_members;
drop policy if exists "academy_members_insert_owner" on public.academy_members;
drop policy if exists "academy_members_update_owner" on public.academy_members;
drop policy if exists "academy_members_delete_owner" on public.academy_members;

create policy "academy_members_select_self_or_owner"
on public.academy_members
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.academies a
    where a.id = academy_members.academy_id
      and a.owner_id = auth.uid()
  )
);

create policy "academy_members_insert_owner"
on public.academy_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.academies a
    where a.id = academy_members.academy_id
      and a.owner_id = auth.uid()
  )
);

create policy "academy_members_update_owner"
on public.academy_members
for update
to authenticated
using (
  exists (
    select 1
    from public.academies a
    where a.id = academy_members.academy_id
      and a.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.academies a
    where a.id = academy_members.academy_id
      and a.owner_id = auth.uid()
  )
);

create policy "academy_members_delete_owner"
on public.academy_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.academies a
    where a.id = academy_members.academy_id
      and a.owner_id = auth.uid()
  )
);

-- Dueño o staff activo
create or replace function public.is_academy_owner(academy_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.academies
    where id = academy_uuid
      and owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.academy_members
    where academy_id = academy_uuid
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.owns_player(player_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.players p
    where p.id = player_uuid
      and public.is_academy_owner(p.academy_id)
  );
$$;

drop policy if exists "academies_select_public_or_owner_or_admin" on public.academies;

create policy "academies_select_public_or_owner_or_admin"
on public.academies
for select
to authenticated
using (
  is_public = true
  or owner_id = auth.uid()
  or public.get_user_role() = 'admin'
  or exists (
    select 1
    from public.academy_members m
    where m.academy_id = academies.id
      and m.user_id = auth.uid()
      and m.status = 'active'
  )
);
