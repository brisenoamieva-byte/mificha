import { CRACKS_TRYOUTS_PATH } from "@/lib/cracks-tryouts";
import { GPH_LOGO } from "@/lib/gph-alliance";

export type SponsorPlacement = "home_strip" | "tutor_card" | "footer_rail";

const SPONSOR_SALES_PATH = "/fut/patrocinio";

/** WhatsApp comercial MiFicha (Ricardo) — solicitud de info de patrocinio. */
export const SPONSOR_WHATSAPP_DISPLAY = "442 155 6155";
export const SPONSOR_WHATSAPP_E164 = "524421556155";

export interface SponsorBrand {
  id: string;
  name: string;
  tagline: string;
  href: string;
  logoPath: string;
}

/** Marcas activas en MiFicha (logos homologados en /public/sponsors). */
export const SPONSOR_BRANDS: Record<string, SponsorBrand> = {
  ctm: {
    id: "ctm",
    name: "CTM México",
    tagline: "Aliado institucional",
    href: SPONSOR_SALES_PATH,
    logoPath: "/sponsors/ctm-mexico.png",
  },
  cracks: {
    id: "cracks",
    name: "CRACKS",
    tagline: "Tu camino a ser profesional",
    href: CRACKS_TRYOUTS_PATH,
    logoPath: "/sponsors/cracks.png",
  },
  gph: {
    id: "gph",
    name: "GPH",
    tagline: "Diagnóstico y especialización",
    href: "/fut/evaluaciones",
    logoPath: GPH_LOGO,
  },
  gabi: {
    id: "gabi",
    name: "gabi",
    tagline: "Patrocinador MiFicha",
    href: "https://gabi.mx",
    logoPath: "/sponsors/gabi.png",
  },
};

export interface SponsorSlotDefinition {
  placement: SponsorPlacement;
  eyebrow: string;
  availableLabel: string;
  /** Orden de marcas en este espacio. Vacío = disponible para venta. */
  brandIds: string[];
}

/**
 * Inventario de espacios.
 * home_strip / footer: vitrina de aliados.
 * tutor_card: un aliado destacado (o vacío = CTA de venta).
 */
export const SPONSOR_SLOTS: Record<SponsorPlacement, SponsorSlotDefinition> = {
  home_strip: {
    placement: "home_strip",
    eyebrow: "Patrocinadores",
    availableLabel: "Tu marca en la home de MiFicha",
    brandIds: ["gabi", "gph", "ctm", "cracks"],
  },
  tutor_card: {
    placement: "tutor_card",
    eyebrow: "Patrocinado",
    availableLabel: "Espacio para marca aliada en el hub de tutores",
    brandIds: ["gabi", "gph"],
  },
  footer_rail: {
    placement: "footer_rail",
    eyebrow: "Aliados",
    availableLabel: "Suma tu marca",
    brandIds: ["gabi", "gph", "ctm", "cracks"],
  },
};

export function getSponsorSlot(placement: SponsorPlacement) {
  return SPONSOR_SLOTS[placement];
}

export function getSponsorBrandsFor(placement: SponsorPlacement): SponsorBrand[] {
  return SPONSOR_SLOTS[placement].brandIds
    .map((id) => SPONSOR_BRANDS[id])
    .filter(Boolean);
}

export function listActiveSponsorBrands(): SponsorBrand[] {
  const seen = new Set<string>();
  const brands: SponsorBrand[] = [];
  for (const slot of Object.values(SPONSOR_SLOTS)) {
    for (const id of slot.brandIds) {
      if (seen.has(id) || !SPONSOR_BRANDS[id]) continue;
      seen.add(id);
      brands.push(SPONSOR_BRANDS[id]);
    }
  }
  return brands;
}

/** CTA comercial: WhatsApp (sin catálogo de paquetes en web). */
export function sponsorInquiryHref(placement?: SponsorPlacement) {
  const slotBit = placement ? ` (espacio: ${placement})` : "";
  const text = `Hola Ricardo, quiero información sobre patrocinio en MiFicha${slotBit}.`;
  return `https://wa.me/${SPONSOR_WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
}
