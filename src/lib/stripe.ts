import Stripe from "stripe";
import type { PlanStatus } from "@/types/database";

export type SubscriptionPlan = "starter" | "pro" | "elite";

export const PLAN_CONFIG: Record<
  SubscriptionPlan,
  { label: string; priceLabel: string; amount: number }
> = {
  starter: {
    label: "Starter",
    priceLabel: "$4,990/mes",
    amount: 499_000,
  },
  pro: {
    label: "Pro",
    priceLabel: "$6,990/mes",
    amount: 699_000,
  },
  elite: {
    label: "Elite",
    priceLabel: "$9,990/mes",
    amount: 999_000,
  },
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
