-- Perfil visual del entrenador (capa academia — no verificada por el acta)
alter table public.players
  add column if not exists secondary_position public.player_position,
  add column if not exists trait_technical smallint check (trait_technical between 1 and 10),
  add column if not exists trait_tactical smallint check (trait_tactical between 1 and 10),
  add column if not exists trait_physical smallint check (trait_physical between 1 and 10),
  add column if not exists trait_attitude smallint check (trait_attitude between 1 and 10),
  add column if not exists coach_notes text check (char_length(coach_notes) <= 280);

comment on column public.players.secondary_position is 'Posición alternativa marcada por el entrenador';
comment on column public.players.trait_technical is 'Evaluación academia 1-10 — no verificada por acta';
comment on column public.players.coach_notes is 'Observaciones del cuerpo técnico (máx. 280 caracteres)';
