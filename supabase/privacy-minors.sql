-- MiFicha — Privacidad y protección de datos de menores
-- Ejecutar en Supabase → SQL Editor (después del schema base)

alter table public.players
  add column if not exists public_consent_at timestamptz,
  add column if not exists is_discoverable boolean not null default false;

comment on column public.players.public_consent_at is
  'Momento en que la academia registró autorización parental para compartir datos.';
comment on column public.players.is_discoverable is
  'Si true, el jugador puede aparecer en /explorar, rankings e ideal 11. Requiere is_public y consentimiento.';

-- Perfiles públicos existentes sin consentimiento documentado vuelven a privados
update public.players
set
  is_public = false,
  is_discoverable = false
where is_public = true
  and public_consent_at is null;

create index if not exists players_discoverable_idx
  on public.players (is_discoverable)
  where is_discoverable = true and is_public = true;

create or replace function public.enforce_player_privacy()
returns trigger
language plpgsql
as $$
begin
  if new.is_public = true and new.public_consent_at is null then
    raise exception 'Se requiere consentimiento parental para activar la ficha pública.';
  end if;

  if new.is_public = false then
    new.is_discoverable := false;
  end if;

  if new.is_discoverable = true then
    if new.is_public = false then
      raise exception 'Solo las fichas con link activo pueden aparecer en el directorio.';
    end if;

    if new.public_consent_at is null then
      raise exception 'Se requiere consentimiento parental para el directorio público.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists players_enforce_privacy on public.players;

create trigger players_enforce_privacy
before insert or update on public.players
for each row
execute function public.enforce_player_privacy();

-- Lectura anónima: solo fichas con consentimiento parental registrado
drop policy if exists "players_select_public_anon" on public.players;
drop policy if exists "players_select_public_link_anon" on public.players;

create policy "players_select_public_anon"
on public.players
for select
to anon
using (
  is_public = true
  and public_consent_at is not null
);

-- El directorio (/explorar) filtra adicionalmente is_discoverable=eq.true en la app.
