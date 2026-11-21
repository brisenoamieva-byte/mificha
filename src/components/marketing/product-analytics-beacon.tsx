"use client";

import { useEffect } from "react";
import {
  trackProductEvent,
  type ProductEventName,
} from "@/lib/product-analytics";

export function ProductAnalyticsBeacon({
  event,
  props,
}: {
  event: ProductEventName;
  props?: Record<string, unknown>;
}) {
  useEffect(() => {
    trackProductEvent(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per mount
  }, [event]);
  return null;
}
