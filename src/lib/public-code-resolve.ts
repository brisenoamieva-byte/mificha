import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizePublicCode,
  readPlayerPublicCodeMap,
  readPublicCodeRegistry,
  readVisoriaPublicCodeMap,
} from "@/lib/public-player-code";
import {
  peekTutorChildByShareToken,
  type TutorChild,
} from "@/lib/tutor-family";
import { VISORIA_EVENT, VISORIA_PUBLIC_PATH } from "@/lib/visoria-event";

export type ResolvedTutorNode = {
  childId: string;
  playerName: string;
  publicCode: string | null;
  shareToken: string;
  linkedPlayerId: string | null;
  linkedPlayerSlug: string | null;
  linkedAcademyName: string | null;
};

export type ResolvedPlayerNode = {
  playerId: string;
  slug: string | null;
  displayName: string;
  academyName: string | null;
  isPublicFicha: boolean;
};

export type ResolvedVisoriaNode = {
  registrationId: string;
  playerName: string;
  folio: string | null;
  eventTitle: string;
  eventPath: string;
};

export type PublicCodeResolution = {
  code: string | null;
  /** Token de acceso usado en la URL (código o share_token). */
  access: string;
  tutor: ResolvedTutorNode | null;
  player: ResolvedPlayerNode | null;
  visoria: ResolvedVisoriaNode | null;
  child: TutorChild | null;
};

function invertCodeMap(map: Record<string, string>) {
  const out = new Map<string, string>();
  for (const [id, code] of Object.entries(map)) {
    const normalized = normalizePublicCode(code);
    if (normalized && !out.has(normalized)) out.set(normalized, id);
  }
  return out;
}

async function hydratePlayer(
  admin: SupabaseClient,
  playerId: string,
): Promise<ResolvedPlayerNode | null> {
  const { data } = await admin
    .from("players")
    .select("id,slug,first_name,last_name,is_public,public_consent_at,academies(name)")
    .eq("id", playerId)
    .maybeSingle();
  if (!data?.id) return null;
  const academyJoin = data.academies as { name?: string } | { name?: string }[] | null;
  const academyName = Array.isArray(academyJoin)
    ? academyJoin[0]?.name ?? null
    : academyJoin?.name ?? null;
  return {
    playerId: String(data.id),
    slug: data.slug ? String(data.slug) : null,
    displayName: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || "Jugador",
    academyName,
    isPublicFicha: Boolean(data.is_public && data.public_consent_at),
  };
}

async function hydrateVisoria(
  admin: SupabaseClient,
  registrationId: string,
): Promise<ResolvedVisoriaNode | null> {
  const { listVisoriaRegistrations } = await import("@/lib/visoria-server");
  const rows = await listVisoriaRegistrations(admin).catch(() => []);
  const row = rows.find((item) => item.id === registrationId);
  if (!row) return null;
  return {
    registrationId: row.id,
    playerName: row.player_full_name,
    folio: row.folio ?? null,
    eventTitle: VISORIA_EVENT.title,
    eventPath: VISORIA_PUBLIC_PATH,
  };
}

/**
 * Resuelve un MF-… (o share token tutor) hacia todos los nodos ligados.
 * El registro puede tener un solo kind; los mapas permiten multi-arista real.
 */
export async function resolvePublicCode(
  admin: SupabaseClient,
  rawToken: string,
): Promise<PublicCodeResolution | null> {
  const access = rawToken.trim();
  if (!access) return null;

  const code = normalizePublicCode(access);
  const child = await peekTutorChildByShareToken(admin, access);

  const [playerMap, visoriaMap, registry] = await Promise.all([
    readPlayerPublicCodeMap(admin),
    readVisoriaPublicCodeMap(admin),
    readPublicCodeRegistry(admin),
  ]);

  const playersByCode = invertCodeMap(playerMap);
  const visoriaByCode = invertCodeMap(visoriaMap);

  const resolvedCode = code ?? normalizePublicCode(child?.public_code);

  let playerId =
    (resolvedCode && playersByCode.get(resolvedCode)) ||
    child?.linked_player_id ||
    null;
  let visoriaId = (resolvedCode && visoriaByCode.get(resolvedCode)) || null;

  if (resolvedCode && registry[resolvedCode]) {
    const entry = registry[resolvedCode];
    if (entry.kind === "player" && !playerId) playerId = entry.id;
    if (entry.kind === "visoria" && !visoriaId) visoriaId = entry.id;
  }

  const [player, visoria] = await Promise.all([
    playerId ? hydratePlayer(admin, playerId) : Promise.resolve(null),
    visoriaId ? hydrateVisoria(admin, visoriaId) : Promise.resolve(null),
  ]);

  const tutor: ResolvedTutorNode | null = child
    ? {
        childId: child.id,
        playerName: child.player_name,
        publicCode: child.public_code || null,
        shareToken: child.share_token,
        linkedPlayerId: child.linked_player_id,
        linkedPlayerSlug: child.linked_player_slug,
        linkedAcademyName: child.linked_academy_name,
      }
    : null;

  if (!tutor && !player && !visoria) return null;

  return {
    code: resolvedCode ?? tutor?.publicCode ?? null,
    access: tutor?.publicCode || resolvedCode || access,
    tutor,
    player,
    visoria,
    child,
  };
}
