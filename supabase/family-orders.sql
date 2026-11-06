-- Cobros familia: evaluación GPH $2,900 (incluye 1 año MiFicha) y membresía $1,200.
-- Split interno: MiFicha (Ricardo) $600; GPH el resto.
-- Ejecutar en SQL Editor de Supabase.

create table if not exists public.family_orders (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  sku text not null check (sku in ('diagnosis', 'membership')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'expired')),
  amount_mxn integer not null,
  mificha_share_mxn integer not null,
  gph_share_mxn integer not null,
  payer_name text not null,
  payer_email text,
  payer_phone text,
  player_name text,
  mp_preference_id text,
  mp_payment_id text,
  paid_at timestamptz,
  membership_until date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists family_orders_status_idx on public.family_orders (status, created_at desc);

alter table public.family_orders enable row level security;

-- Solo service role (API) escribe. Staff lee vía service role en /fut/api/pay/orders.
