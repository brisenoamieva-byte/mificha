-- MiFicha — Storage privado para fotos/videos de jugadores
-- Ejecutar después de storage-and-triggers.sql y privacy-minors.sql

update storage.buckets
set public = false
where id in ('player-photos', 'player-videos');

drop policy if exists "player_photos_public_read" on storage.objects;
drop policy if exists "player_videos_public_read" on storage.objects;
drop policy if exists "player_photos_owner_read" on storage.objects;
drop policy if exists "player_videos_owner_read" on storage.objects;
drop policy if exists "player_photos_public_consented_read" on storage.objects;
drop policy if exists "player_videos_public_consented_read" on storage.objects;

create policy "player_photos_owner_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'player-photos'
  and exists (
    select 1
    from public.academies a
    where a.owner_id = auth.uid()
      and split_part(name, '/', 1) = a.id::text
  )
);

create policy "player_videos_owner_read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'player-videos'
  and exists (
    select 1
    from public.academies a
    where a.owner_id = auth.uid()
      and split_part(name, '/', 1) = a.id::text
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

-- Los buckets privados requieren URLs firmadas desde el cliente autenticado.
-- Las fichas públicas siguen mostrando media si la URL ya está guardada y cumple la política.
