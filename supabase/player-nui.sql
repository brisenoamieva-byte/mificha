-- MiFicha — NUI federado (GASER) en jugadores de academia
-- Ejecutar en Supabase → SQL Editor
--
-- El registro global NUI ↔ MF- vive en mificha-ops (families/nui-registry.json).
-- Esta columna es la copia en plantel para UI y unicidad SQL.

alter table public.players
  add column if not exists nui text;

create unique index if not exists players_nui_unique
  on public.players (nui)
  where nui is not null;

comment on column public.players.nui is
  'NUI federado (GASER). Único. Asociado al código MF- vía registry en mificha-ops.';
