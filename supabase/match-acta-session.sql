-- MiFicha — Acta en cancha Fase 1
-- Ejecutar en Supabase → SQL Editor (después de official-match-stats-rls / fixtures oficiales)
--
-- Sesión de acta post-partido: alineaciones, eventos append-only, firmas digitales.
-- Publicación escribe matches + match_stats (flujo existente). Sin acceso anon vía RLS.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'acta_session_status' and n.nspname = 'public'
  ) then
    create type public.acta_session_status as enum (
      'lineup',
      'capturing',
      'review',
      'pending_signatures',
      'published',
      'disputed',
      'cancelled'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'acta_side' and n.nspname = 'public'
  ) then
    create type public.acta_side as enum ('home', 'away');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'acta_lineup_role' and n.nspname = 'public'
  ) then
    create type public.acta_lineup_role as enum ('starter', 'bench');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'acta_event_type' and n.nspname = 'public'
  ) then
    create type public.acta_event_type as enum (
      'goal',
      'own_goal',
      'assist',
      'yellow_card',
      'red_card',
      'second_yellow',
      'sub_out',
      'sub_in'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'acta_signer_role' and n.nspname = 'public'
  ) then
    create type public.acta_signer_role as enum (
      'referee',
      'home_delegate',
      'away_delegate'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'acta_sign_decision' and n.nspname = 'public'
  ) then
    create type public.acta_sign_decision as enum ('accept', 'object');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Sesión de acta
-- ---------------------------------------------------------------------------

create table if not exists public.match_acta_sessions (
  id uuid primary key default gen_random_uuid(),
  home_match_id uuid not null references public.matches (id) on delete cascade,
  away_match_id uuid references public.matches (id) on delete set null,
  home_academy_id uuid not null references public.academies (id) on delete restrict,
  away_academy_id uuid references public.academies (id) on delete set null,
  opponent_name text not null,
  category text,
  venue_name text,
  kickoff_at timestamptz,
  status public.acta_session_status not null default 'lineup',
  -- tokens: solo hash sha256 hex; el valor en claro vive en el link
  referee_token_hash text not null,
  home_sign_token_hash text,
  away_sign_token_hash text,
  referee_token_expires_at timestamptz not null,
  sign_tokens_expires_at timestamptz,
  score_home integer,
  score_away integer,
  payload_hash text,
  referee_name text,
  closed_at timestamptz,
  published_at timestamptz,
  dispute_note text,
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint match_acta_sessions_home_match_unique unique (home_match_id),
  constraint match_acta_sessions_scores_nonneg check (
    (score_home is null or score_home >= 0)
    and (score_away is null or score_away >= 0)
  )
);

create index if not exists match_acta_sessions_status_idx
  on public.match_acta_sessions (status);

create index if not exists match_acta_sessions_home_academy_idx
  on public.match_acta_sessions (home_academy_id);

create unique index if not exists match_acta_sessions_referee_token_hash_uidx
  on public.match_acta_sessions (referee_token_hash);

create unique index if not exists match_acta_sessions_home_sign_token_hash_uidx
  on public.match_acta_sessions (home_sign_token_hash)
  where home_sign_token_hash is not null;

create unique index if not exists match_acta_sessions_away_sign_token_hash_uidx
  on public.match_acta_sessions (away_sign_token_hash)
  where away_sign_token_hash is not null;

comment on table public.match_acta_sessions is
  'Sesión de acta en cancha (Fase 1 post-pito). Publicación escribe matches + match_stats.';

comment on column public.match_acta_sessions.payload_hash is
  'sha256 del resumen firmado (marcador + eventos no anulados).';

-- ---------------------------------------------------------------------------
-- Alineaciones
-- ---------------------------------------------------------------------------

create table if not exists public.match_lineups (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.match_acta_sessions (id) on delete cascade,
  side public.acta_side not null,
  player_id uuid references public.players (id) on delete set null,
  jersey_number integer,
  display_name text not null,
  role public.acta_lineup_role not null default 'bench',
  sort_order integer not null default 0,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint match_lineups_jersey_nonneg check (
    jersey_number is null or jersey_number >= 0
  ),
  constraint match_lineups_player_or_name check (
    player_id is not null or length(trim(display_name)) > 0
  )
);

create index if not exists match_lineups_session_side_idx
  on public.match_lineups (session_id, side);

create unique index if not exists match_lineups_session_player_uidx
  on public.match_lineups (session_id, player_id)
  where player_id is not null;

create unique index if not exists match_lineups_session_side_jersey_uidx
  on public.match_lineups (session_id, side, jersey_number)
  where jersey_number is not null;

comment on table public.match_lineups is
  'Titulares y banca por lado. player_id null = visitante externo (sin ficha).';

-- ---------------------------------------------------------------------------
-- Eventos (append-only; anulación lógica)
-- ---------------------------------------------------------------------------

create table if not exists public.match_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.match_acta_sessions (id) on delete cascade,
  seq integer not null,
  minute integer not null default 0,
  stoppage integer not null default 0,
  event_type public.acta_event_type not null,
  side public.acta_side not null,
  lineup_id uuid references public.match_lineups (id) on delete set null,
  player_id uuid references public.players (id) on delete set null,
  related_lineup_id uuid references public.match_lineups (id) on delete set null,
  related_player_id uuid references public.players (id) on delete set null,
  notes text,
  voided_at timestamptz,
  void_reason text,
  created_at timestamptz not null default now(),
  constraint match_events_minute_range check (minute >= 0 and minute <= 130),
  constraint match_events_stoppage_range check (stoppage >= 0 and stoppage <= 30),
  constraint match_events_session_seq_unique unique (session_id, seq),
  constraint match_events_void_reason check (
    (voided_at is null and void_reason is null)
    or (voided_at is not null and length(trim(void_reason)) > 0)
  )
);

create index if not exists match_events_session_active_idx
  on public.match_events (session_id, seq)
  where voided_at is null;

comment on table public.match_events is
  'Timeline del acta. No borrar filas: anular con voided_at + void_reason.';

comment on column public.match_events.related_lineup_id is
  'Asistente (goal) o pareja de cambio (sub_in ↔ sub_out).';

-- ---------------------------------------------------------------------------
-- Firmas
-- ---------------------------------------------------------------------------

create table if not exists public.match_signatures (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.match_acta_sessions (id) on delete cascade,
  signer_role public.acta_signer_role not null,
  decision public.acta_sign_decision not null,
  signer_name text not null,
  signer_title text,
  objection_note text,
  payload_hash text not null,
  ip_hash text,
  user_agent text,
  signed_at timestamptz not null default now(),
  constraint match_signatures_objection check (
    (decision = 'accept' and objection_note is null)
    or (decision = 'object' and length(trim(coalesce(objection_note, ''))) > 0)
  ),
  constraint match_signatures_session_role_unique unique (session_id, signer_role)
);

comment on table public.match_signatures is
  'Cierre árbitro + confirmación/objeción de delegados. Una fila por rol.';

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------

create or replace function public.set_match_acta_session_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists match_acta_sessions_set_updated_at on public.match_acta_sessions;

create trigger match_acta_sessions_set_updated_at
before update on public.match_acta_sessions
for each row
execute function public.set_match_acta_session_updated_at();

-- ---------------------------------------------------------------------------
-- Inmutabilidad básica post-publicación (eventos / firmas)
-- ---------------------------------------------------------------------------

create or replace function public.enforce_acta_event_immutability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  session_status public.acta_session_status;
begin
  select status into session_status
  from public.match_acta_sessions
  where id = coalesce(new.session_id, old.session_id);

  if session_status in ('published'::public.acta_session_status, 'cancelled'::public.acta_session_status) then
    raise exception 'El acta ya está %: no se pueden modificar eventos.', session_status;
  end if;

  if tg_op = 'DELETE' then
    raise exception 'Los eventos no se eliminan; anúlalos con voided_at.';
  end if;

  if tg_op = 'UPDATE' then
    -- Solo permitir anulación (void) o notas menores antes de firmas
    if old.voided_at is not null then
      raise exception 'Un evento anulado no se puede modificar.';
    end if;

    if new.session_id is distinct from old.session_id
      or new.seq is distinct from old.seq
      or new.event_type is distinct from old.event_type
      or new.side is distinct from old.side
      or new.lineup_id is distinct from old.lineup_id
      or new.player_id is distinct from old.player_id
      or new.minute is distinct from old.minute
      or new.stoppage is distinct from old.stoppage then
      if new.voided_at is null then
        raise exception 'Solo se puede anular un evento (voided_at + void_reason), no reeditarlo.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists match_events_enforce_immutability on public.match_events;

create trigger match_events_enforce_immutability
before update or delete on public.match_events
for each row
execute function public.enforce_acta_event_immutability();

create or replace function public.enforce_acta_signature_immutability()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' or tg_op = 'DELETE' then
    raise exception 'Las firmas del acta son inmutables.';
  end if;
  return new;
end;
$$;

drop trigger if exists match_signatures_enforce_immutability on public.match_signatures;

create trigger match_signatures_enforce_immutability
before update or delete on public.match_signatures
for each row
execute function public.enforce_acta_signature_immutability();

-- ---------------------------------------------------------------------------
-- RLS: sin políticas para authenticated/anon → solo service role
-- ---------------------------------------------------------------------------

alter table public.match_acta_sessions enable row level security;
alter table public.match_lineups enable row level security;
alter table public.match_events enable row level security;
alter table public.match_signatures enable row level security;

-- Sin policies públicas a propósito. El API Next.js usa service role + tokens.

comment on table public.match_lineups is
  'Titulares y banca por lado. player_id null = visitante externo (sin ficha). Acceso solo vía service role.';
