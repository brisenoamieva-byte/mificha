import { NextResponse } from "next/server";
import { isLaunchFreeMode } from "@/lib/launch-mode";
import { getAppBaseUrl, getStripeClient } from "@/lib/stripe";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import type { Profile } from "@/types/database";

interface PortalBody {
  academy_id?: string;
}

export async function POST(request: Request) {
  try {
    if (isLaunchFreeMode()) {
      return NextResponse.json(
        {
          error:
            "MiFicha está en lanzamiento. La gestión de suscripción se activará más adelante.",
        },
        { status: 403 },
      );
    }

    const body = (await request.json()) as PortalBody;
    const { academy_id } = body;

    if (!academy_id) {
      return NextResponse.json({ error: "academy_id es requerido." }, { status: 400 });
    }

    const supabase = await getAuthedSupabaseClient(request);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single<Pick<Profile, "role">>();

    if (!profile || (profile.role !== "academy_admin" && profile.role !== "admin")) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const { data: academy, error: academyError } = await supabase
      .from("academies")
      .select("id, owner_id, stripe_customer_id")
      .eq("id", academy_id)
      .single();

    if (academyError || !academy) {
      return NextResponse.json({ error: "Academia no encontrada." }, { status: 404 });
    }

    if (academy.owner_id !== user.id && profile.role !== "admin") {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    if (!academy.stripe_customer_id) {
      return NextResponse.json(
        { error: "Esta academia aún no tiene un cliente de Stripe." },
        { status: 400 },
      );
    }

    const stripe = getStripeClient();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: academy.stripe_customer_id,
      return_url: `${getAppBaseUrl()}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al abrir el portal de pagos.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
