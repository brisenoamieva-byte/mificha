-- MiFicha — Logros / insignias verificadas por stats
-- Ejecutar en Supabase → SQL Editor (paso 19)

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
