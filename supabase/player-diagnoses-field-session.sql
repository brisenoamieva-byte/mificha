-- Paso 27: sesión de cancha GPH (dato crudo del manual v1.0)
-- Ejecutar en Supabase → SQL Editor si player_diagnoses ya existía.

alter table public.player_diagnoses
  add column if not exists field_session jsonb not null default '{}'::jsonb;

comment on column public.player_diagnoses.field_session is
  'Captura cruda del manual GPH en cancha: estaciones, condiciones y consistencia.';
