-- MiFicha — Marcador oficial solo organizador (jornadas is_official)
-- Ejecutar en Supabase → SQL Editor (paso 20, después de #15 platform-fixtures-rls)
--
-- Las academias completan convocados y stats individuales; el marcador (result,
-- goals_for, goals_against) lo fija MiFicha / organizador del torneo.

alter table public.matches
  add column if not exists result_locked_at timestamptz;

comment on column public.matches.result_locked_at is
  'Momento en que el organizador fijó el marcador oficial de la jornada.';

create or replace function public.enforce_official_match_result()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role public.user_role;
begin
  if coalesce(new.is_official, false) is not true then
    return new;
  end if;

  -- Service role (panel interno) y admin de plataforma pueden fijar marcador.
  if auth.uid() is null then
    if tg_op = 'UPDATE'
      and new.result is not null
      and (
        old.result is distinct from new.result
        or old.goals_for is distinct from new.goals_for
        or old.goals_against is distinct from new.goals_against
      ) then
      new.result_locked_at = coalesce(new.result_locked_at, now());
    end if;
    return new;
  end if;

  role := public.get_user_role();

  if role = 'admin'::public.user_role then
    if tg_op = 'UPDATE'
      and new.result is not null
      and (
        old.result is distinct from new.result
        or old.goals_for is distinct from new.goals_for
        or old.goals_against is distinct from new.goals_against
      ) then
      new.result_locked_at = coalesce(new.result_locked_at, now());
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.result is distinct from old.result
      or new.goals_for is distinct from old.goals_for
      or new.goals_against is distinct from old.goals_against then
      raise exception
        'El marcador de jornadas oficiales lo registra el organizador (MiFicha). La academia solo captura stats del plantel.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists matches_enforce_official_result on public.matches;

create trigger matches_enforce_official_result
before insert or update on public.matches
for each row
execute function public.enforce_official_match_result();

comment on function public.enforce_official_match_result() is
  'Impide que academias modifiquen marcador en jornadas oficiales (is_official).';
