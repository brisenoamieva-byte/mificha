-- MiFicha — Videos promocionales por jugador (sube la academia)
-- Ejecutar después de privacy-minors.sql y storage-and-triggers.sql

create table if not exists public.player_videos (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  academy_id uuid not null references public.academies(id) on delete cascade,
  title text not null default 'Highlight',
  video_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists player_videos_player_idx
  on public.player_videos (player_id, sort_order asc, created_at asc);

comment on table public.player_videos is
  'Clips promocionales cargados por la academia. Visibles en ficha pública con consentimiento.';

alter table public.player_videos enable row level security;

drop policy if exists "player_videos_select_public" on public.player_videos;
drop policy if exists "player_videos_select_owner" on public.player_videos;
drop policy if exists "player_videos_insert_owner" on public.player_videos;
drop policy if exists "player_videos_update_owner" on public.player_videos;
drop policy if exists "player_videos_delete_owner" on public.player_videos;

create policy "player_videos_select_public"
on public.player_videos
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.players p
    where p.id = player_videos.player_id
      and p.is_public = true
      and p.public_consent_at is not null
  )
);

create policy "player_videos_select_owner"
on public.player_videos
for select
to authenticated
using (
  exists (
    select 1
    from public.academies a
    where a.id = player_videos.academy_id
      and a.owner_id = auth.uid()
  )
);

create policy "player_videos_insert_owner"
on public.player_videos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.academies a
    where a.id = player_videos.academy_id
      and a.owner_id = auth.uid()
  )
  and exists (
    select 1
    from public.players p
    where p.id = player_videos.player_id
      and p.academy_id = player_videos.academy_id
  )
);

create policy "player_videos_update_owner"
on public.player_videos
for update
to authenticated
using (
  exists (
    select 1
    from public.academies a
    where a.id = player_videos.academy_id
      and a.owner_id = auth.uid()
  )
);

create policy "player_videos_delete_owner"
on public.player_videos
for delete
to authenticated
using (
  exists (
    select 1
    from public.academies a
    where a.id = player_videos.academy_id
      and a.owner_id = auth.uid()
  )
);

-- Storage: lectura anónima de clips en bucket player-videos para fichas públicas
drop policy if exists "player_videos_storage_public_read" on storage.objects;

create policy "player_videos_storage_public_read"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'player-videos'
  and exists (
    select 1
    from public.player_videos pv
    join public.players p on p.id = pv.player_id
    where p.is_public = true
      and p.public_consent_at is not null
      and pv.video_url like ('%' || name)
  )
);
