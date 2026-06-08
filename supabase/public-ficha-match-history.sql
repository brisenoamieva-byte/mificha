-- MiFicha — Historial partido a partido en ficha pública (/j/slug)
-- Ejecutar en Supabase → SQL Editor (paso 16)
--
-- Permite leer datos del partido (rival, fecha, marcador) cuando el jugador
-- tiene stats públicas con consentimiento parental.

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
