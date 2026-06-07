-- MiFicha — Contacto del padre/tutor para reportes
-- Ejecutar en Supabase → SQL Editor (paso 11)

alter table public.players
  add column if not exists guardian_name text,
  add column if not exists guardian_email text;

comment on column public.players.guardian_name is
  'Nombre del padre, madre o tutor responsable.';
comment on column public.players.guardian_email is
  'Email del tutor para reportes mensuales verificados.';

create index if not exists players_guardian_email_idx
  on public.players (guardian_email)
  where guardian_email is not null;
