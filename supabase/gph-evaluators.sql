-- MiFicha — #28 Evaluador GPH + academia socio sin cobro
-- Ejecutar en Supabase → SQL Editor
--
-- Gustavo Reyes: dueño de su academia (billing_exempt) y evaluador GPH
-- de diagnósticos en cualquier academia de la plataforma.

alter table public.academies
  add column if not exists billing_exempt boolean not null default false;

comment on column public.academies.billing_exempt is
  'Academia socio / piloto: no se cobra suscripción aunque se active billing.';

create table if not exists public.gph_evaluators (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  email text not null,
  full_name text,
  granted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists gph_evaluators_email_uidx
  on public.gph_evaluators (lower(email));

comment on table public.gph_evaluators is
  'Socios GPH: administran diagnósticos en cualquier academia.';

alter table public.gph_evaluators enable row level security;

drop policy if exists "gph_evaluators_select_self" on public.gph_evaluators;

create policy "gph_evaluators_select_self"
on public.gph_evaluators
for select
to authenticated
using (user_id = auth.uid() or public.get_user_role() = 'admin');

create or replace function public.is_gph_evaluator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gph_evaluators
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_gph_evaluator() to authenticated, anon;

drop policy if exists "player_diagnoses_select_gph" on public.player_diagnoses;
drop policy if exists "player_diagnoses_insert_gph" on public.player_diagnoses;
drop policy if exists "player_diagnoses_update_gph" on public.player_diagnoses;
drop policy if exists "player_diagnoses_delete_gph" on public.player_diagnoses;

create policy "player_diagnoses_select_gph"
on public.player_diagnoses
for select
to authenticated
using (public.is_gph_evaluator());

create policy "player_diagnoses_insert_gph"
on public.player_diagnoses
for insert
to authenticated
with check (public.is_gph_evaluator());

create policy "player_diagnoses_update_gph"
on public.player_diagnoses
for update
to authenticated
using (public.is_gph_evaluator())
with check (public.is_gph_evaluator());

create policy "player_diagnoses_delete_gph"
on public.player_diagnoses
for delete
to authenticated
using (public.is_gph_evaluator());

drop policy if exists "players_select_gph" on public.players;

create policy "players_select_gph"
on public.players
for select
to authenticated
using (public.is_gph_evaluator());

drop policy if exists "academies_select_gph" on public.academies;

create policy "academies_select_gph"
on public.academies
for select
to authenticated
using (public.is_gph_evaluator());
