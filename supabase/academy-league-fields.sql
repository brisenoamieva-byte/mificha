-- MiFicha — Liga oficial (complemento, no reemplazo federación)
-- Ejecutar en Supabase → SQL Editor

alter table public.academies
add column if not exists league_name text;

alter table public.academies
add column if not exists league_calendar_url text;

comment on column public.academies.league_name is
  'Nombre de la liga o competición oficial (ej. Liga MX Sub-15 CDMX)';

comment on column public.academies.league_calendar_url is
  'URL al calendario/clasificación oficial de la liga';
