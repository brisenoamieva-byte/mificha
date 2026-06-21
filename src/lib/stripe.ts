import Stripe from "stripe";
import type { PlanStatus } from "@/types/database";
import { LEGACY_ACADEMY_PLANS } from "@/lib/pricing";

export type SubscriptionPlan = "starter" | "pro" | "elite";

/** @deprecated Cobro a academias desactivado — ver ORGANIZER_PRICING en pricing.ts */
export const PLAN_CONFIG: Record<
  SubscriptionPlan,
  { label: string; priceLabel: string; amount: number }
> = {
  starter: LEGACY_ACADEMY_PLANS.starter,
  pro: LEGACY_ACADEMY_PLANS.pro,
  elite: LEGACY_ACADEMY_PLANS.elite,
};

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey === "sk_test_...") {
    throw new Error("Configura STRIPE_SECRET_KEY en .env.local.");
  }

  return new Stripe(secretKey);
}

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://mificha.mx"
  );
}

export function getPlanStatusLabel(planStatus: PlanStatus) {
  switch (planStatus) {
    case "starter":
      return "Starter";
    case "pro":
      return "Pro";
    case "elite":
      return "Elite";
    default:
      return "Inactiva";
  }
}

export function planFromStripeMetadata(
  value: string | null | undefined,
): PlanStatus | null {
  if (value === "starter" || value === "pro" || value === "elite") {
    return value;
  }
  return null;
}
