import { NextResponse } from "next/server";
import { publicActaSession, resolveActaDispute } from "@/lib/match-acta-server";
import { canAccessPitchDeck } from "@/lib/pitch-access";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";

async function assertPlatformAdmin(request: Request) {
  const supabase = await getAuthedSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!canAccessPitchDeck(user?.id, user?.email)) {
    return { error: NextResponse.json({ error: "No autorizado." }, { status: 403 }) };
  }

  return { admin: createSupabaseAdminClient() };
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface ResolveBody {
  action?: "publish" | "cancel";
  note?: string;
}

/** Resuelve disputa: publish (forzar) o cancel. */
export async function POST(request: Request, context: RouteContext) {
  const auth = await assertPlatformAdmin(request);
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = (await request.json()) as ResolveBody;
  const action = body.action;

  if (action !== "publish" && action !== "cancel") {
    return NextResponse.json(
      { error: "action debe ser publish o cancel." },
      { status: 400 },
    );
  }

  try {
    const session = await resolveActaDispute(auth.admin, id, action, body.note);
    return NextResponse.json({ session: publicActaSession(session) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo resolver.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
