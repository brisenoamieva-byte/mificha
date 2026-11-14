-- Permite categoría "otro" (fuera de bandas oficiales; año real de nacimiento).
-- Ejecutar en Supabase → SQL Editor.

alter table public.visoria_registrations
  drop constraint if exists visoria_registrations_category_check;

alter table public.visoria_registrations
  add constraint visoria_registrations_category_check
  check (category in ('femenil', 'varonil', 'otro'));
