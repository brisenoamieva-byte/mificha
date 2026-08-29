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
  ) as public_ficha_match_history_sql,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'platform_seasons'
  ) as platform_seasons_shared_sql,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'seasons'
      and column_name = 'platform_season_id'
  ) as seasons_platform_link_sql,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'player_profile_views'
  ) as player_profile_views_sql,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'player_achievements'
  ) as player_achievements_sql,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'matches'
      and column_name = 'result_locked_at'
  ) as official_match_scoring_sql,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'matches'
      and column_name = 'acta_published_at'
  ) as official_match_acta_sql,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'players'
      and column_name = 'guardian_phone'
  ) as guardian_notifications_sql,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'player_videos'
  ) as player_videos_sql,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'match_acta_sessions'
  ) as match_acta_session_sql,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'match_events'
  ) as match_events_sql,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'match_signatures'
  ) as match_signatures_sql,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'player_diagnoses'
  ) as player_diagnoses_sql,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'academy_members'
  ) as academy_members_sql,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'gph_evaluators'
  ) as gph_evaluators_sql;

-- Si alguna columna es false, ejecuta el script correspondiente:
-- #11 player-guardian-contact.sql
-- #13 match-schedule.sql
-- #12 privacy-rls-hardening.sql (recomendado al final)
-- #14 platform-seasons-rls.sql
-- #15 platform-fixtures-rls.sql
-- #16 public-ficha-match-history.sql
-- #17 platform-seasons-shared.sql
-- #18 player-profile-views.sql
-- #19 player-achievements.sql
-- #20 official-match-scoring-rls.sql
-- #21 official-match-stats-rls.sql
-- #23 player-videos.sql
-- #24 match-acta-session.sql (Acta en cancha Fase 1 — docs/acta-en-cancha-fase-1.md)
-- #25 player-diagnoses.sql (Diagnóstico GPH 1–5)
-- #26 academy-members.sql (Equipo / socio evaluador)
-- #27 rls-public-recursion-fix.sql (42P17 academies ↔ players — explorar + ficha)
-- #28 gph-evaluators.sql (socio GPH: academia sin cobro + diagnósticos en cualquier plantel)
-- #29 academies-rls-owner-select.sql (42P17 academies ↔ academy_members — panel del dueño)
