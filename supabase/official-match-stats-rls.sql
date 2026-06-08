-- MiFicha — Acta oficial: stats individuales solo organizador en jornadas is_official
-- Ejecutar en Supabase → SQL Editor (paso 21, después de #20)
--
-- Academia: convocados + minutos. Organizador: goles, asistencias y tarjetas (acta).

alter table public.matches
  add column if not exists acta_published_at timestamptz;

comment on column public.matches.acta_published_at is
  'Cuando el organizador publicó goles/asistencias/tarjetas del acta oficial.';

create or replace function public.enforce_official_match_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role public.user_role;
  match_row public.matches;
begin
  select * into match_row from public.matches where id = new.match_id;

  if coalesce(match_row.is_official, false) is not true then
    return new;
  end if;

  -- Service role (panel interno / acta)
  if auth.uid() is null then
    return new;
  end if;

  role := public.get_user_role();

  if role = 'admin'::public.user_role then
    return new;
  end if;

  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    if new.goals <> 0
      or new.assists <> 0
      or new.yellow_cards <> 0
      or new.red_cards <> 0 then
      raise exception
        'En jornadas oficiales, goles/asistencias/tarjetas las registra el organizador (acta MiFicha). La academia solo captura minutos jugados.';
    end if;

    if match_row.acta_published_at is not null and tg_op = 'UPDATE' then
      if new.goals is distinct from old.goals
        or new.assists is distinct from old.assists
        or new.yellow_cards is distinct from old.yellow_cards
        or new.red_cards is distinct from old.red_cards then
        raise exception 'El acta oficial ya fue publicada. Contacta al organizador del torneo.';
      end if;
    end if;
  end if;

  new.captured_by := coalesce(new.captured_by, 'coach'::public.captured_by);
  return new;
end;
$$;

drop trigger if exists match_stats_enforce_official on public.match_stats;

create trigger match_stats_enforce_official
before insert or update on public.match_stats
for each row
execute function public.enforce_official_match_stats();

comment on function public.enforce_official_match_stats() is
  'Academias solo minutos en jornadas oficiales; scoring stats vía acta del organizador.';
