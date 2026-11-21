-- MiFicha data moat — tutor_children + códigos unificados + outbox + eventos
-- Pegar en Supabase SQL Editor (producción) cuando esté listo el dual-write.

create table if not exists public.tutor_children (
  id text primary key,
  -- text: cuentas reales (uuid) o pending:visoria:<id>
  guardian_user_id text,
  guardian_email text,
  guardian_phone text,
  player_name text not null,
  public_code text,
  share_token text,
  explore_opt_in boolean not null default false,
  explore_opt_in_at timestamptz,
  birth_date date,
  position text,
  city text,
  state text,
  club text,
  profile jsonb not null default '{}'::jsonb,
  linked_player_id uuid,
  linked_academy_id uuid,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tutor_children_public_code_uidx
  on public.tutor_children (public_code)
  where public_code is not null and public_code <> '';

create index if not exists tutor_children_guardian_email_idx
  on public.tutor_children (lower(guardian_email));

create index if not exists tutor_children_guardian_phone_idx
  on public.tutor_children (guardian_phone);

create index if not exists tutor_children_explore_idx
  on public.tutor_children (explore_opt_in, state, city)
  where explore_opt_in = true;

create index if not exists tutor_children_geo_idx
  on public.tutor_children (state, city);

-- Vista de códigos públicos unificados (tutor + plantel cuando exista).
create or replace view public.public_codes_unified as
select
  c.public_code as code,
  'tutor'::text as source,
  c.id as entity_id,
  c.player_name as display_name,
  c.explore_opt_in,
  c.city,
  c.state,
  c.updated_at
from public.tutor_children c
where c.public_code is not null and length(trim(c.public_code)) > 0;

create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  template_key text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  attempts int not null default 0,
  last_error text,
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_outbox_pending_idx
  on public.email_outbox (status, scheduled_at)
  where status = 'pending';

create table if not exists public.product_events (
  id bigserial primary key,
  event_name text not null,
  props jsonb not null default '{}'::jsonb,
  session_id text,
  user_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists product_events_name_created_idx
  on public.product_events (event_name, created_at desc);

alter table public.tutor_children enable row level security;
alter table public.email_outbox enable row level security;
alter table public.product_events enable row level security;

-- Solo service role escribe; lectura pública limitada vía API de app.
drop policy if exists tutor_children_service_all on public.tutor_children;
create policy tutor_children_service_all
  on public.tutor_children
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists email_outbox_service_all on public.email_outbox;
create policy email_outbox_service_all
  on public.email_outbox
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists product_events_service_all on public.product_events;
create policy product_events_service_all
  on public.product_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
