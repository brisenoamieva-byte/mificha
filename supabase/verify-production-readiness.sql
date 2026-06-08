-- MiFicha — Verificar readiness de producción (solo lectura)
-- Ejecutar en Supabase → SQL Editor antes de la primera demo con academia real.

select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'matches'
      and column_name = 'status'
  ) as match_schedule_sql,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'matches'
      and column_name = 'kickoff_at'
  ) as match_kickoff_sql,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'players'
      and column_name = 'guardian_email'
  ) as guardian_contact_sql,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'matches'
      and column_name = 'is_official'
  ) as platform_fixtures_sql,
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'matches_select_public_ficha'
  ) as public_ficha_match_history_sql;

-- Si alguna columna es false, ejecuta el script correspondiente:
-- #11 player-guardian-contact.sql
-- #13 match-schedule.sql
-- #12 privacy-rls-hardening.sql (recomendado al final)
-- #14 platform-seasons-rls.sql
-- #15 platform-fixtures-rls.sql
-- #16 public-ficha-match-history.sql
