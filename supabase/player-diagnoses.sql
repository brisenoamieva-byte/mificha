-- MiFicha — Diagnósticos de jugador (hoja GPH / evaluación 1–5)
-- Ejecutar en Supabase → SQL Editor (paso 25)

create table if not exists public.player_diagnoses (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  kind text not null default 'inicial'
    check (kind in ('inicial', 'seguimiento', 'revaloracion')),
  module text not null
    check (module in ('campo', 'portero')),
  evaluated_at date not null default (timezone('America/Mexico_City', now()))::date,
  evaluator_name text not null,
  years_experience numeric,
  venue text,
  session_days text,
  sessions_per_week smallint,
  injuries text,
  why_join text,
  player_goal text,
  family_goal text,
  medical_notes text,
  scores jsonb not null default '{}'::jsonb,
  notes jsonb not null default '{}'::jsonb,
  flagged jsonb not null default '[]'::jsonb,
  domain_averages jsonb not null default '{}'::jsonb,
  global_score numeric(3, 1),
  computed_stage text
    check (computed_stage in ('iniciacion', 'desarrollo', 'alto_rendimiento')),
  assigned_stage text
    check (assigned_stage in ('iniciacion', 'desarrollo', 'alto_rendimiento')),
  assigned_group text,
  assignment_notes text,
  program_priorities jsonb not null default '[]'::jsonb,
  monthly_plan jsonb not null default '{}'::jsonb,
  field_session jsonb not null default '{}'::jsonb,
  share_token_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists player_diagnoses_academy_idx
  on public.player_diagnoses (academy_id, evaluated_at desc);

create index if not exists player_diagnoses_player_idx
  on public.player_diagnoses (player_id, evaluated_at desc);

create unique index if not exists player_diagnoses_share_token_hash_uidx
  on public.player_diagnoses (share_token_hash);

comment on table public.player_diagnoses is
  'Evaluación GPH 1–5 por jugador. Cada fila genera una ficha de diagnóstico con token de consulta.';

create or replace function public.set_player_diagnoses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists player_diagnoses_set_updated_at on public.player_diagnoses;

create trigger player_diagnoses_set_updated_at
before update on public.player_diagnoses
for each row
execute function public.set_player_diagnoses_updated_at();

alter table public.player_diagnoses enable row level security;

drop policy if exists "player_diagnoses_select_owner" on public.player_diagnoses;
drop policy if exists "player_diagnoses_insert_owner" on public.player_diagnoses;
drop policy if exists "player_diagnoses_update_owner" on public.player_diagnoses;
drop policy if exists "player_diagnoses_delete_owner" on public.player_diagnoses;

create policy "player_diagnoses_select_owner"
on public.player_diagnoses
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create policy "player_diagnoses_insert_owner"
on public.player_diagnoses
for insert
to authenticated
with check (public.is_academy_owner(academy_id));

create policy "player_diagnoses_update_owner"
on public.player_diagnoses
for update
to authenticated
using (public.is_academy_owner(academy_id))
with check (public.is_academy_owner(academy_id));

create policy "player_diagnoses_delete_owner"
on public.player_diagnoses
for delete
to authenticated
using (public.is_academy_owner(academy_id));
