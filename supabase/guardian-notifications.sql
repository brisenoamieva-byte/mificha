-- MiFicha — Notificaciones automáticas a tutores post-partido
-- Ejecutar en Supabase → SQL Editor (paso 22)

alter table public.players
  add column if not exists guardian_phone text,
  add column if not exists notify_guardian_on_match boolean not null default true;

comment on column public.players.guardian_phone is
  'WhatsApp del tutor (10 dígitos MX). Para avisos automáticos post-partido.';
comment on column public.players.notify_guardian_on_match is
  'Si true, MiFicha envía actualización automática cuando hay stats nuevas del jugador.';

create index if not exists players_guardian_phone_idx
  on public.players (guardian_phone)
  where guardian_phone is not null;

create table if not exists public.guardian_notifications (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  match_id uuid references public.matches (id) on delete set null,
  channel text not null check (channel in ('whatsapp', 'email')),
  recipient text not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  error_message text,
  sent_at timestamptz not null default now()
);

create index if not exists guardian_notifications_player_idx
  on public.guardian_notifications (player_id, sent_at desc);

create index if not exists guardian_notifications_match_idx
  on public.guardian_notifications (match_id);

alter table public.guardian_notifications enable row level security;

drop policy if exists "guardian_notifications_select_owner" on public.guardian_notifications;

create policy "guardian_notifications_select_owner"
on public.guardian_notifications
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

drop policy if exists "guardian_notifications_insert_service" on public.guardian_notifications;

create policy "guardian_notifications_insert_service"
on public.guardian_notifications
for insert
to authenticated
with check (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

comment on table public.guardian_notifications is
  'Log de avisos automáticos a tutores (WhatsApp o email) tras captura de partido.';
