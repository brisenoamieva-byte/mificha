-- MiFicha — fix registro de usuarios
-- Ejecutar en Supabase → SQL Editor → Run (una sola vez)

-- 1. Crear perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role public.user_role;
begin
  selected_role := case
    when new.raw_user_meta_data->>'role' in ('academy_admin', 'scout', 'admin')
      then (new.raw_user_meta_data->>'role')::public.user_role
    else 'academy_admin'::public.user_role
  end;

  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    selected_role,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 2. Reparar usuarios que ya existen en Auth pero no tienen perfil
insert into public.profiles (id, role, full_name, email)
select
  u.id,
  case
    when u.raw_user_meta_data->>'role' in ('academy_admin', 'scout', 'admin')
      then (u.raw_user_meta_data->>'role')::public.user_role
    else 'academy_admin'::public.user_role
  end,
  u.raw_user_meta_data->>'full_name',
  u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
