import { NextResponse } from "next/server";
import {
  getAppBaseUrl,
  getStripeClient,
  PLAN_CONFIG,
  type SubscriptionPlan,
} from "@/lib/stripe";
import { getAuthedSupabaseClient } from "@/lib/supabase-server";
import type { Profile } from "@/types/database";

interface CheckoutBody {
  plan?: SubscriptionPlan;
  academy_id?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const { plan, academy_id } = body;

    if (!plan || !academy_id || !PLAN_CONFIG[plan]) {
      return NextResponse.json(
        { error: "plan y academy_id son requeridos." },
        { status: 400 },
      );
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
      .select("role, email")
      .eq("id", user.id)
      .single<Pick<Profile, "role" | "email">>();

    if (!profile || (profile.role !== "academy_admin" && profile.role !== "admin")) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const { data: academy, error: academyError } = await supabase
      .from("academies")
      .select("id, name, owner_id, stripe_customer_id")
      .eq("id", academy_id)
      .single();

    if (academyError || !academy) {
      return NextResponse.json({ error: "Academia no encontrada." }, { status: 404 });
    }

    if (academy.owner_id !== user.id && profile.role !== "admin") {
      return NextResponse.json(
        { error: "No eres el administrador de esta academia." },
        { status: 403 },
      );
    }

    const stripe = getStripeClient();
    let customerId = academy.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email ?? undefined,
        name: academy.name,
        metadata: {
          academy_id: academy.id,
        },
      });

      customerId = customer.id;

      await supabase
        .from("academies")
        .update({ stripe_customer_id: customerId })
        .eq("id", academy.id);
    }

    const appUrl = getAppBaseUrl();
    const planConfig = PLAN_CONFIG[plan];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "mxn",
            unit_amount: planConfig.amount,
            product_data: {
              name: `MiFicha ${planConfig.label}`,
              description: `Suscripción ${planConfig.label} para ${academy.name}`,
            },
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        academy_id: academy.id,
        plan,
      },
      subscription_data: {
        metadata: {
          academy_id: academy.id,
          plan,
        },
      },
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/dashboard?canceled=true`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "No se pudo crear la sesión de pago." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear checkout.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
