import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  extractStoragePath,
  signMediaUrlIfNeeded,
} from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

type MediaBucket = "player-photos" | "player-videos";

function detectBucket(url: string): MediaBucket | null {
  if (extractStoragePath(url, "player-photos")) return "player-photos";
  if (extractStoragePath(url, "player-videos")) return "player-videos";
  return null;
}

async function academyIdsForUser(userId: string) {
  const admin = createSupabaseAdminClient();
  const ids = new Set<string>();

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  const role = (profile as { role?: string } | null)?.role ?? null;
  if (role === "admin") return { all: true as const, ids };

  const [{ data: owned }, { data: members }] = await Promise.all([
    admin.from("academies").select("id").eq("owner_id", userId),
    admin.from("academy_members").select("academy_id").eq("user_id", userId),
  ]);

  for (const row of owned ?? []) {
    if (row.id) ids.add(String(row.id));
  }
  for (const row of members ?? []) {
    if (row.academy_id) ids.add(String(row.academy_id));
  }
  return { all: false as const, ids };
}

function pathAllowed(
  path: string,
  access: { all: boolean; ids: Set<string> },
) {
  if (access.all) return true;
  const academyId = path.split("/")[0]?.trim();
  if (!academyId) return false;
  return access.ids.has(academyId);
}

export async function POST(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    urls?: unknown;
  };
  const urls = Array.isArray(body.urls)
    ? body.urls.filter((value): value is string => typeof value === "string" && value.length > 0)
    : [];

  if (urls.length === 0) {
    return NextResponse.json({ signed: {} });
  }

  const unique = [...new Set(urls)].slice(0, 40);

  let access: { all: boolean; ids: Set<string> };
  try {
    access = await academyIdsForUser(user.id);
  } catch {
    return NextResponse.json({ signed: Object.fromEntries(unique.map((u) => [u, u])) });
  }

  if (!access.all && access.ids.size === 0) {
    return NextResponse.json(
      { error: "Sin acceso a medios de academia." },
      { status: 403 },
    );
  }

  const signed: Record<string, string> = {};
  await Promise.all(
    unique.map(async (url) => {
      const bucket = detectBucket(url);
      if (!bucket) {
        signed[url] = url;
        return;
      }
      const path = extractStoragePath(url, bucket);
      if (!path || !pathAllowed(path, access)) {
        signed[url] = url;
        return;
      }
      signed[url] = (await signMediaUrlIfNeeded(url, bucket)) ?? url;
    }),
  );

  return NextResponse.json({ signed });
}
