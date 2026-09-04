-- MiFicha — Crear buckets de fotos/videos + políticas (si faltan en producción)
-- Ejecutar en Supabase → SQL Editor

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('player-photos', 'player-photos', false, 12582912),
  ('player-videos', 'player-videos', false, 52428800)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- Lectura: dueño de academia (ruta = academyId/...)
drop policy if exists "player_photos_owner_read" on storage.objects;
drop policy if exists "player_videos_owner_read" on storage.objects;
drop policy if exists "player_photos_public_read" on storage.objects;
drop policy if exists "player_videos_public_read" on storage.objects;
drop policy if exists "player_photos_public_consented_read" on storage.objects;
drop policy if exists "player_videos_public_consented_read" on storage.objects;
drop policy if exists "player_photos_auth_insert" on storage.objects;
drop policy if exists "player_videos_auth_insert" on storage.objects;
drop policy if exists "player_photos_auth_update" on storage.objects;
drop policy if exists "player_videos_auth_update" on storage.objects;
drop policy if exists "player_photos_auth_delete" on storage.objects;
drop policy if exists "player_videos_auth_delete" on storage.objects;
drop policy if exists "player_photos_gph_read" on storage.objects;
drop policy if exists "player_videos_gph_read" on storage.objects;
drop policy if exists "player_photos_gph_write" on storage.objects;
drop policy if exists "player_videos_gph_write" on storage.objects;

create policy "player_photos_owner_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'player-photos'
  and (
    public.is_gph_evaluator()
    or exists (
      select 1
      from public.academies a
      where a.owner_id = auth.uid()
        and split_part(name, '/', 1) = a.id::text
    )
  )
);

create policy "player_videos_owner_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'player-videos'
  and (
    public.is_gph_evaluator()
    or exists (
      select 1
      from public.academies a
      where a.owner_id = auth.uid()
        and split_part(name, '/', 1) = a.id::text
    )
  )
);

create policy "player_photos_public_consented_read"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'player-photos'
  and exists (
    select 1
    from public.players p
    where p.is_public = true
      and p.public_consent_at is not null
      and p.photo_url is not null
      and p.photo_url like ('%' || name)
  )
);

create policy "player_videos_public_consented_read"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'player-videos'
  and exists (
    select 1
    from public.players p
    where p.is_public = true
      and p.public_consent_at is not null
      and p.video_url is not null
      and p.video_url like ('%' || name)
  )
);

create policy "player_photos_auth_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'player-photos'
  and (
    public.is_gph_evaluator()
    or exists (
      select 1
      from public.academies a
      where a.owner_id = auth.uid()
        and split_part(name, '/', 1) = a.id::text
    )
  )
);

create policy "player_videos_auth_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'player-videos'
  and (
    public.is_gph_evaluator()
    or exists (
      select 1
      from public.academies a
      where a.owner_id = auth.uid()
        and split_part(name, '/', 1) = a.id::text
    )
  )
);

create policy "player_photos_auth_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'player-photos'
  and (
    public.is_gph_evaluator()
    or exists (
      select 1
      from public.academies a
      where a.owner_id = auth.uid()
        and split_part(name, '/', 1) = a.id::text
    )
  )
);

create policy "player_videos_auth_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'player-videos'
  and (
    public.is_gph_evaluator()
    or exists (
      select 1
      from public.academies a
      where a.owner_id = auth.uid()
        and split_part(name, '/', 1) = a.id::text
    )
  )
);

create policy "player_photos_auth_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'player-photos'
  and (
    public.is_gph_evaluator()
    or exists (
      select 1
      from public.academies a
      where a.owner_id = auth.uid()
        and split_part(name, '/', 1) = a.id::text
    )
  )
);

create policy "player_videos_auth_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'player-videos'
  and (
    public.is_gph_evaluator()
    or exists (
      select 1
      from public.academies a
      where a.owner_id = auth.uid()
        and split_part(name, '/', 1) = a.id::text
    )
  )
);
