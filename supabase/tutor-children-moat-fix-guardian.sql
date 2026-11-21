-- Fix: guardian_user_id debe aceptar pending:visoria:... (no solo uuid)
-- Pegar en Supabase SQL Editor y Run.

-- 1) Quitar FK a auth.users (bloquea el cambio de tipo).
alter table public.tutor_children
  drop constraint if exists tutor_children_guardian_user_id_fkey;

-- 2) Pasar columna a text.
alter table public.tutor_children
  alter column guardian_user_id type text using guardian_user_id::text;
