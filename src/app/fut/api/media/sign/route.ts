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

  // Limita abuso; el panel pide unas pocas a la vez.
  const unique = [...new Set(urls)].slice(0, 40);

  try {
    createSupabaseAdminClient();
  } catch {
    return NextResponse.json({ signed: Object.fromEntries(unique.map((u) => [u, u])) });
  }

  const signed: Record<string, string> = {};
  await Promise.all(
    unique.map(async (url) => {
      const bucket = detectBucket(url);
      if (!bucket) {
        signed[url] = url;
        return;
      }
      signed[url] = (await signMediaUrlIfNeeded(url, bucket)) ?? url;
    }),
  );

  return NextResponse.json({ signed });
}
