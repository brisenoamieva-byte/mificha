-- MiFicha — schema inicial
-- Pegar en Supabase → SQL Editor → New query → Run

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.user_role as enum (
  'academy_admin',
  'scout',
  'admin'
);

create type public.plan_status as enum (
  'inactive',
  'starter',
  'pro',
  'elite'
);

create type public.player_position as enum (
  'goalkeeper',
  'defender',
  'midfielder',
  'forward'
);

create type public.dominant_foot as enum (
  'left',
  'right',
  'both'
);

create type public.match_result as enum (
  'win',
  'draw',
  'loss'
);

create type public.captured_by as enum (
  'coach',
  'admin'
);

create type public.email_status as enum (
  'sent',
  'failed'
);

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.academies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  city text,
  state text,
  address text,
  phone text,
  website text,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  plan_status public.plan_status not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  is_certified boolean not null default false,
  primary_color text not null default '#1B4F8C',
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  position public.player_position not null,
  dominant_foot public.dominant_foot not null,
  height_cm integer,
  weight_kg integer,
  jersey_number integer,
  photo_url text,
  video_url text,
  academy_id uuid not null references public.academies (id) on delete cascade,
  passport_score integer not null default 0,
  qr_code text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default false
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  academy_id uuid not null references public.academies (id) on delete cascade,
  opponent text not null,
  match_date date not null,
  result public.match_result not null,
  goals_for integer not null,
  goals_against integer not null,
  created_at timestamptz not null default now()
);

create table public.match_stats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  goals integer not null default 0,
  assists integer not null default 0,
  minutes_played integer not null default 0,
  yellow_cards integer not null default 0,
  red_cards integer not null default 0,
  captured_by public.captured_by not null,
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create table public.player_season_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  season_id uuid not null references public.seasons (id) on delete cascade,
  total_matches integer not null default 0,
  total_goals integer not null default 0,
  total_assists integer not null default 0,
  total_minutes integer not null default 0,
  total_yellow_cards integer not null default 0,
  total_red_cards integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (player_id, season_id)
);

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  status public.email_status not null,
  sent_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index academies_owner_id_idx on public.academies (owner_id);
create index players_academy_id_idx on public.players (academy_id);
create index seasons_academy_id_idx on public.seasons (academy_id);
create index matches_season_id_idx on public.matches (season_id);
create index matches_academy_id_idx on public.matches (academy_id);
create index match_stats_match_id_idx on public.match_stats (match_id);
create index match_stats_player_id_idx on public.match_stats (player_id);
create index player_season_stats_player_id_idx on public.player_season_stats (player_id);
create index player_season_stats_season_id_idx on public.player_season_stats (season_id);
create index email_logs_academy_id_idx on public.email_logs (academy_id);
create index email_logs_player_id_idx on public.email_logs (player_id);

-- ---------------------------------------------------------------------------
-- Helpers (RLS)
-- ---------------------------------------------------------------------------

create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.is_academy_owner(academy_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.academies
    where id = academy_uuid
      and owner_id = auth.uid()
  );
$$;

create or replace function public.owns_player(player_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.players p
    join public.academies a on a.id = p.academy_id
    where p.id = player_uuid
      and a.owner_id = auth.uid()
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger player_season_stats_set_updated_at
before update on public.player_season_stats
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth: crear perfil al registrarse
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role public.user_role;
begin
  selected_role := case
    when new.raw_user_meta_data->>'role' in ('academy_admin', 'scout', 'admin')
      then (new.raw_user_meta_data->>'role')::public.user_role
    else 'academy_admin'::public.user_role
  end;

  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    selected_role,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    email = coalesce(excluded.email, public.profiles.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.academies enable row level security;
alter table public.players enable row level security;
alter table public.seasons enable row level security;
alter table public.matches enable row level security;
alter table public.match_stats enable row level security;
alter table public.player_season_stats enable row level security;
alter table public.email_logs enable row level security;

-- profiles
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.get_user_role() = 'admin'
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.get_user_role() = 'admin'
)
with check (
  id = auth.uid()
  or public.get_user_role() = 'admin'
);

-- academies
create policy "academies_select_public_or_owner_or_admin"
on public.academies
for select
to authenticated
using (
  is_public = true
  or owner_id = auth.uid()
  or public.get_user_role() = 'admin'
);

create policy "academies_select_public_anon"
on public.academies
for select
to anon
using (is_public = true);

create policy "academies_insert_owner"
on public.academies
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and public.get_user_role() in ('academy_admin', 'admin')
);

create policy "academies_update_owner_or_admin"
on public.academies
for update
to authenticated
using (
  owner_id = auth.uid()
  or public.get_user_role() = 'admin'
)
with check (
  owner_id = auth.uid()
  or public.get_user_role() = 'admin'
);

create policy "academies_delete_owner_or_admin"
on public.academies
for delete
to authenticated
using (
  owner_id = auth.uid()
  or public.get_user_role() = 'admin'
);

-- players
create policy "players_select_public_or_owner_or_admin"
on public.players
for select
to authenticated
using (
  is_public = true
  or public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create policy "players_select_public_anon"
on public.players
for select
to anon
using (is_public = true);

create policy "players_insert_owner_or_admin"
on public.players
for insert
to authenticated
with check (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

create policy "players_update_owner_or_admin"
on public.players
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

create policy "players_delete_owner_or_admin"
on public.players
for delete
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

-- seasons
create policy "seasons_all_owner_or_admin"
on public.seasons
for all
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
)
with check (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

-- matches
create policy "matches_all_owner_or_admin"
on public.matches
for all
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
)
with check (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);

-- match_stats
create policy "match_stats_select_owner_or_admin"
on public.match_stats
for select
to authenticated
using (
  public.owns_player(player_id)
  or public.get_user_role() = 'admin'
);

create policy "match_stats_insert_owner_or_admin"
on public.match_stats
for insert
to authenticated
with check (
  public.owns_player(player_id)
  or public.get_user_role() = 'admin'
);

create policy "match_stats_update_owner_or_admin"
on public.match_stats
for update
to authenticated
using (
  public.owns_player(player_id)
  or public.get_user_role() = 'admin'
)
with check (
  public.owns_player(player_id)
  or public.get_user_role() = 'admin'
);

create policy "match_stats_delete_owner_or_admin"
on public.match_stats
for delete
to authenticated
using (
  public.owns_player(player_id)
  or public.get_user_role() = 'admin'
);

-- player_season_stats
create policy "player_season_stats_all_owner_or_admin"
on public.player_season_stats
for all
to authenticated
using (
  public.owns_player(player_id)
  or public.get_user_role() = 'admin'
)
with check (
  public.owns_player(player_id)
  or public.get_user_role() = 'admin'
);

-- email_logs
create policy "email_logs_all_owner_or_admin"
on public.email_logs
for all
to authenticated
using (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
)
with check (
  public.is_academy_owner(academy_id)
  or public.get_user_role() = 'admin'
);
