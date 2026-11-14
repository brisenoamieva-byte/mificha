import type { MarketingImageKey } from "@/lib/marketing-assets";

export interface PitchSlide {
  id: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  highlight?: string;
  /** cover = foto a pantalla completa · split = texto + foto · cta = cierre con foto de fondo */
  variant?: "cover" | "default" | "cta" | "split";
  stats?: { value: string; label: string }[];
  imageKey?: MarketingImageKey;
}
