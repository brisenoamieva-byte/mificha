import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { listExplorePlayersFromPg } from "@/lib/tutor-children-pg";
import { fetchTutorDirectoryPlayers } from "@/lib/tutor-directory";
import { formatPublicLockedName } from "@/lib/privacy";
import { normalizePublicCode } from "@/lib/public-player-code";

export const dynamic = "force-dynamic";

/**
 * API Explorar (server-side filters). Prefer Postgres; fallback a roster JSON.
 * Sin write-on-read: no llama ensurePlayerPublicCodes.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state")?.trim() || "";
  const city = url.searchParams.get("city")?.trim() || "";
  const q = url.searchParams.get("q")?.trim().toLowerCase() || "";
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") || 200) || 200, 1),
    500,
  );

  try {
    const admin = createSupabaseAdminClient();
    const fromPg = await listExplorePlayersFromPg(admin, { state, city, limit });

    if (fromPg && fromPg.length > 0) {
      const players = fromPg
        .filter((row) => {
          if (!q) return true;
          return (
            row.name.toLowerCase().includes(q) ||
            row.code.toLowerCase().includes(q) ||
            (row.city ?? "").toLowerCase().includes(q)
          );
        })
        .slice(0, limit)
        .map((row) => ({
          code: row.code,
          name: formatPublicLockedName(row.name),
          position: row.position,
          city: row.city,
          state: row.state,
          birth_date: row.birth_date,
          href: `/fut/f/${encodeURIComponent(row.code)}`,
        }));

      return NextResponse.json({
        source: "postgres",
        count: players.length,
        players,
      });
    }

    const directory = await fetchTutorDirectoryPlayers(admin);
    const players = directory
      .filter((row) => {
        const rowState = row.academies?.state ?? "";
        const rowCity = row.academies?.city ?? "";
        if (state && !rowState.toLowerCase().includes(state.toLowerCase())) {
          return false;
        }
        if (city && !rowCity.toLowerCase().includes(city.toLowerCase())) {
          return false;
        }
        if (q) {
          const hay =
            `${row.first_name} ${row.last_name} ${row.public_code ?? ""} ${rowCity}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .slice(0, limit)
      .map((row) => {
        const code =
          normalizePublicCode(row.public_code) ||
          row.slug.replace(/^tutor-/i, "").toUpperCase();
        return {
          code,
          name: formatPublicLockedName(
            `${row.first_name} ${row.last_name}`.trim(),
          ),
          position: row.position,
          city: row.academies?.city ?? null,
          state: row.academies?.state ?? null,
          birth_date: row.birth_date,
          href: `/fut/f/${encodeURIComponent(code)}`,
        };
      });

    return NextResponse.json({
      source: "roster_json",
      count: players.length,
      players,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "explore_api_failed",
      },
      { status: 500 },
    );
  }
}
