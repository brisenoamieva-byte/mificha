-- MiFicha production rollout
-- Order: 11 -> 13 -> 14-19 -> 12
-- Run verify-production-readiness.sql after

-- ===== player-guardian-contact.sql =====
-- MiFicha â€” Contacto del padre/tutor para reportes
-- Ejecutar en Supabase â†’ SQL Editor (paso 11)

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


-- ===== match-schedule.sql =====
-- MiFicha â€” Calendario de partidos (programados + pÃºblicos)
-- Ejecutar en Supabase â†’ SQL Editor (paso 13)

do $$
begin
  create type public.match_status as enum (
    'scheduled',
    'completed',
    'cancelled',
    'postponed'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.matches
  add column if not exists status public.match_status not null default 'completed',
  add column if not exists kickoff_at timestamptz,
  add column if not exists venue_name text,
  add column if not exists venue_address text,
  add column if not exists category text,
  add column if not exists is_public boolean not null default true,
  add column if not exists notes text;

update public.matches
set status = 'completed'
where status is null;

update public.matches
set kickoff_at = ((match_date::text || ' 10:00:00')::timestamp at time zone 'America/Mexico_City')
where kickoff_at is null;

alter table public.matches
  alter column result drop not null,
  alter column goals_for drop not null,
  alter column goals_against drop not null;

create index if not exists matches_kickoff_at_idx on public.matches (kickoff_at);
create index if not exists matches_status_idx on public.matches (status);
create index if not exists matches_public_schedule_idx
  on public.matches (academy_id, kickoff_at)
  where status = 'scheduled' and is_public = true;

comment on column public.matches.status is
  'scheduled = calendario pÃºblico; completed = resultado capturado.';
comment on column public.matches.kickoff_at is
  'Fecha y hora del partido (zona del usuario al capturar).';
comment on column public.matches.venue_name is
  'Nombre de la cancha o sede.';
comment on column public.matches.is_public is
  'Si true, aparece en el calendario pÃºblico de la academia.';

drop policy if exists "matches_select_public_schedule" on public.matches;

create policy "matches_select_public_schedule"
on public.matches
for select
to anon, authenticated
using (
  status in ('scheduled', 'postponed')
  and is_public = true
  and kickoff_at is not null
  and exists (
    select 1
    from public.academies a
    where a.id = matches.academy_id
      and a.is_public = true
  )
);


-- ===== platform-seasons-rls.sql =====
-- MiFicha â€” Temporadas centralizadas (solo admin de plataforma)
-- Ejecutar en Supabase â†’ SQL Editor
--
-- Las academias solo leen su temporada activa; crear/editar temporadas queda
-- restringido al rol admin (panel /interno/temporadas o service role).

drop policy if exists "seasons_all_owner_or_admin" on public.seasons;

drop policy if exists "seasons_select_owner_or_admin" on public.seasons;
drop policy if exists "seasons_insert_admin_only" on public.seasons;
drop policy if exists "seasons_update_admin_only" on public.seasons;
drop policy if exists "seasons_delete_admin_only" on public.seasons;

create policy "seasons_select_owner_or_admin"
on public.seasons
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create policy "seasons_insert_admin_only"
on public.seasons
for insert
to authenticated
with check (public.get_user_role() = 'admin');

create policy "seasons_update_admin_only"
on public.seasons
for update
to authenticated
using (public.get_user_role() = 'admin')
with check (public.get_user_role() = 'admin');

create policy "seasons_delete_admin_only"
on public.seasons
for delete
to authenticated
using (public.get_user_role() = 'admin');


-- ===== platform-fixtures-rls.sql =====
-- MiFicha â€” Jornadas oficiales (fixtures publicados por plataforma)
-- Ejecutar en Supabase â†’ SQL Editor (paso 15)
--
-- Las academias solo capturan stats sobre partidos ya publicados;
-- insertar jornadas queda restringido al rol admin.

alter table public.matches
  add column if not exists is_official boolean not null default false;

comment on column public.matches.is_official is
  'True cuando MiFicha publicÃ³ la jornada. Las academias completan el resultado, no crean el partido.';

create index if not exists matches_official_schedule_idx
  on public.matches (academy_id, kickoff_at)
  where status in ('scheduled', 'postponed') and is_official = true;

drop policy if exists "matches_all_owner_or_admin" on public.matches;

drop policy if exists "matches_select_owner_or_admin" on public.matches;
drop policy if exists "matches_insert_admin_only" on public.matches;
drop policy if exists "matches_update_owner_or_admin" on public.matches;
drop policy if exists "matches_delete_admin_only" on public.matches;

create policy "matches_select_owner_or_admin"
on public.matches
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create policy "matches_insert_admin_only"
on public.matches
for insert
to authenticated
with check (public.get_user_role() = 'admin');

create policy "matches_update_owner_or_admin"
on public.matches
for update
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
)
with check (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create policy "matches_delete_admin_only"
on public.matches
for delete
to authenticated
using (public.get_user_role() = 'admin');

-- Partidos capturados antes de este script siguen vÃ¡lidos (is_official = false por default).


-- ===== public-ficha-match-history.sql =====
-- MiFicha â€” Historial partido a partido en ficha pÃºblica (/j/slug)
-- Ejecutar en Supabase â†’ SQL Editor (paso 16)
--
-- Permite leer datos del partido (rival, fecha, marcador) cuando el jugador
-- tiene stats pÃºblicas con consentimiento parental.

drop policy if exists "matches_select_public_ficha" on public.matches;

create policy "matches_select_public_ficha"
on public.matches
for select
to anon, authenticated
using (
  status = 'completed'
  and exists (
    select 1
    from public.match_stats ms
    join public.players p on p.id = ms.player_id
    where ms.match_id = matches.id
      and p.is_public = true
      and p.public_consent_at is not null
  )
);


-- ===== platform-seasons-shared.sql =====
-- MiFicha â€” Temporada compartida de plataforma (ciclo Ãºnico MiFicha)
-- Ejecutar en Supabase â†’ SQL Editor (paso 17)
--
-- Una temporada MiFicha (ej. Escolar QuerÃ©taro 2025â€“26) se asigna a cada academia
-- para stats comparables entre colegios.

create table if not exists public.platform_seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  region text,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists platform_seasons_active_idx
  on public.platform_seasons (is_active)
  where is_active = true;

alter table public.seasons
  add column if not exists platform_season_id uuid references public.platform_seasons (id) on delete set null;

create index if not exists seasons_platform_season_id_idx
  on public.seasons (platform_season_id);

comment on table public.platform_seasons is
  'Ciclo oficial MiFicha compartido entre academias (ej. escolar estatal).';
comment on column public.seasons.platform_season_id is
  'Enlace a la temporada de plataforma cuando la academia participa en un ciclo compartido.';

alter table public.platform_seasons enable row level security;

drop policy if exists "platform_seasons_select_authenticated" on public.platform_seasons;
drop policy if exists "platform_seasons_admin_all" on public.platform_seasons;

create policy "platform_seasons_select_authenticated"
on public.platform_seasons
for select
to authenticated
using (true);

create policy "platform_seasons_admin_all"
on public.platform_seasons
for all
to authenticated
using (public.get_user_role() = 'admin')
with check (public.get_user_role() = 'admin');


-- ===== player-profile-views.sql =====
-- MiFicha â€” Tracking de aperturas de ficha pÃºblica (padres / tutores)
-- Ejecutar en Supabase â†’ SQL Editor (paso 18)
--
-- Registra visitas anÃ³nimas a /j/[slug] para medir engagement parental.
-- Sin IP en claro: solo visitor_key (hash) para deduplicar.

create table if not exists public.player_profile_views (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  academy_id uuid not null references public.academies (id) on delete cascade,
  visitor_key text not null,
  viewed_at timestamptz not null default now()
);

create index if not exists player_profile_views_academy_idx
  on public.player_profile_views (academy_id, viewed_at desc);

create index if not exists player_profile_views_player_idx
  on public.player_profile_views (player_id, viewed_at desc);

create index if not exists player_profile_views_dedup_idx
  on public.player_profile_views (player_id, visitor_key, viewed_at desc);

comment on table public.player_profile_views is
  'Aperturas de fichas pÃºblicas /j/slug â€” mÃ©trica de engagement parental.';
comment on column public.player_profile_views.visitor_key is
  'Hash anÃ³nimo por visitante (sin IP en claro).';

alter table public.player_profile_views enable row level security;

drop policy if exists "profile_views_select_academy" on public.player_profile_views;

create policy "profile_views_select_academy"
on public.player_profile_views
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create or replace function public.get_academy_profile_view_stats(p_academy_id uuid)
returns json
language sql
stable
security invoker
as $$
  select json_build_object(
    'total_views', count(*)::int,
    'unique_visitors', count(distinct visitor_key)::int,
    'views_last_7_days', count(*) filter (where viewed_at >= now() - interval '7 days')::int
  )
  from public.player_profile_views
  where academy_id = p_academy_id;
$$;

comment on function public.get_academy_profile_view_stats(uuid) is
  'Totales de aperturas de ficha para el dashboard de academia.';


-- ===== player-achievements.sql =====
-- MiFicha â€” Logros / insignias verificadas por stats
-- Ejecutar en Supabase â†’ SQL Editor (paso 19)

create table if not exists public.player_achievements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  academy_id uuid not null references public.academies (id) on delete cascade,
  achievement_key text not null,
  match_id uuid references public.matches (id) on delete set null,
  unlocked_at timestamptz not null default now(),
  unique (player_id, achievement_key)
);

create index if not exists player_achievements_player_idx
  on public.player_achievements (player_id, unlocked_at desc);

create index if not exists player_achievements_academy_idx
  on public.player_achievements (academy_id);

comment on table public.player_achievements is
  'Insignias verificadas desbloqueadas por stats capturadas (MiFicha).';

alter table public.player_achievements enable row level security;

drop policy if exists "player_achievements_select_public" on public.player_achievements;
drop policy if exists "player_achievements_select_owner" on public.player_achievements;
drop policy if exists "player_achievements_insert_owner" on public.player_achievements;

create policy "player_achievements_select_public"
on public.player_achievements
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.players p
    where p.id = player_achievements.player_id
      and p.is_public = true
      and p.public_consent_at is not null
  )
);

create policy "player_achievements_select_owner"
on public.player_achievements
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create policy "player_achievements_insert_owner"
on public.player_achievements
for insert
to authenticated
with check (public.is_academy_owner(academy_id));


-- ===== privacy-rls-hardening.sql =====
-- MiFicha â€” Endurecimiento RLS (privacidad alineada con la app)
-- Ejecutar en Supabase â†’ SQL Editor DESPUÃ‰S de los pasos 1â€“11

-- Jugadores: landing pÃºblica solo con consentimiento
drop policy if exists "players_select_public_academy_landing" on public.players;

create policy "players_select_public_academy_landing"
on public.players
for select
to anon
using (
  is_public = true
  and public_consent_at is not null
  and exists (
    select 1
    from public.academies a
    where a.id = players.academy_id
      and a.is_public = true
  )
);

-- Jugadores: scouts autenticados solo ven fichas con consentimiento
drop policy if exists "players_select_public_or_owner_or_admin" on public.players;

create policy "players_select_public_or_owner_or_admin"
on public.players
for select
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
  or (is_public = true and public_consent_at is not null)
);

-- Stats de temporada: requieren consentimiento (ficha pÃºblica /j/slug)
drop policy if exists "player_season_stats_select_public" on public.player_season_stats;

create policy "player_season_stats_select_public"
on public.player_season_stats
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.players p
    where p.id = player_season_stats.player_id
      and p.is_public = true
      and p.public_consent_at is not null
  )
);

-- Temporadas: solo si hay jugador con ficha pÃºblica consentida
drop policy if exists "seasons_select_via_public_player" on public.seasons;
drop policy if exists "seasons_select_public_academy_landing" on public.seasons;

create policy "seasons_select_via_public_player"
on public.seasons
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.players p
    where p.academy_id = seasons.academy_id
      and p.is_public = true
      and p.public_consent_at is not null
  )
);

-- Match stats: directorio / ideal XI â€” jugador discoverable + consentimiento
drop policy if exists "match_stats_select_public_anon" on public.match_stats;

create policy "match_stats_select_public_anon"
on public.match_stats
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.players p
    where p.id = match_stats.player_id
      and p.is_public = true
      and p.public_consent_at is not null
      and p.is_discoverable = true
  )
);

-- Match stats: ficha individual /j/slug â€” consentimiento sin discoverable
drop policy if exists "match_stats_select_public_ficha" on public.match_stats;

create policy "match_stats_select_public_ficha"
on public.match_stats
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.players p
    where p.id = match_stats.player_id
      and p.is_public = true
      and p.public_consent_at is not null
  )
);

-- Academias: ocultar datos sensibles en lectura anÃ³nima directa
drop policy if exists "academies_select_public_anon" on public.academies;
drop policy if exists "academies_select_via_public_player" on public.academies;

create policy "academies_select_public_anon"
on public.academies
for select
to anon
using (is_public = true);

create policy "academies_select_via_public_player"
on public.academies
for select
to anon
using (
  exists (
    select 1
    from public.players p
    where p.academy_id = academies.id
      and p.is_public = true
      and p.public_consent_at is not null
  )
);

-- Asegurar buckets de media privados (idempotente)
update storage.buckets
set public = false
where id in ('player-photos', 'player-videos');


