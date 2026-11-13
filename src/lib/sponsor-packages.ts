import type { SponsorPlacement } from "@/lib/sponsor-slots";
import {
  SPONSOR_WHATSAPP_DISPLAY,
  SPONSOR_WHATSAPP_E164,
  sponsorInquiryHref,
} from "@/lib/sponsor-slots";

export const SPONSOR_PACKAGES_PATH = "/fut/patrocinio";
export { SPONSOR_WHATSAPP_DISPLAY, SPONSOR_WHATSAPP_E164 };

export type SponsorPackageId =
  | "aliado"
  | "familias"
  | "home"
  | "temporada"
  | "evento";

export interface SponsorPackage {
  id: SponsorPackageId;
  name: string;
  audience: string;
  priceLabel: string;
  priceNote: string;
  period: string;
  placements: SponsorPlacement[];
  includes: string[];
  featured?: boolean;
}

/**
 * Tarifas internas / futuras. No se muestran en la web por ahora:
 * el contacto comercial es solo WhatsApp.
 */
export const SPONSOR_PACKAGES: SponsorPackage[] = [
  {
    id: "aliado",
    name: "Aliado",
    audience: "Marca presente en toda la plataforma",
    priceLabel: "$12,000",
    priceNote: "MXN",
    period: "por trimestre",
    placements: ["footer_rail"],
    includes: [
      "Logo en riel de aliados (footer global)",
      "Link a tu sitio o landing",
      "Mención en one-pager de patrocinio",
    ],
  },
  {
    id: "familias",
    name: "Familias",
    audience: "Tutores activos en el hub",
    priceLabel: "$28,000",
    priceNote: "MXN",
    period: "por trimestre",
    placements: ["tutor_card"],
    includes: [
      "Card patrocinada entre Noticias y Servicios en /fut/tutor",
      "Alcance a padres que arman fichas y ven oportunidades",
      "Creative + link a tu campaña",
    ],
    featured: true,
  },
  {
    id: "home",
    name: "Home",
    audience: "Máxima visibilidad de entrada",
    priceLabel: "$45,000",
    priceNote: "MXN",
    period: "por trimestre",
    placements: ["home_strip"],
    includes: [
      "Franja de patrocinio bajo el header de mificha.mx",
      "Tagline + logo + CTA",
      "Prioridad de rotación en home",
    ],
  },
  {
    id: "temporada",
    name: "Temporada",
    audience: "Pack completo de inventario",
    priceLabel: "$70,000",
    priceNote: "MXN",
    period: "por 4 meses",
    placements: ["home_strip", "tutor_card", "footer_rail"],
    includes: [
      "Home strip + card tutor + footer aliados",
      "Reporte simple de presencia (periodo y creativos)",
      "1 ajuste de creative incluido",
    ],
    featured: true,
  },
  {
    id: "evento",
    name: "Evento / visoría",
    audience: "Activación por fecha",
    priceLabel: "Cotizar",
    priceNote: "",
    period: "por evento",
    placements: [],
    includes: [
      "Barra de patrocinio en página de visoría o convocatoria",
      "Co-brand en materiales del evento (si aplica)",
      "Ideal para marcas que quieren un momento puntual",
    ],
  },
];

export const SPONSOR_SALES = {
  eyebrow: "Patrocinio MiFicha",
  title: "Espacios de marca ante familias de futbol",
  summary:
    "Si tu marca quiere aparecer en MiFicha (home, tutores, footer u eventos), pide información por WhatsApp. Sin catálogo público por ahora: armamos la propuesta según tu objetivo.",
  audiencePoints: [
    "Padres y tutores que arman fichas y siguen oportunidades",
    "Familias, representantes y academias que operan en MiFicha",
    "Visitantes de home, explorar y convocatorias",
  ],
  governance: [
    "No entregamos datos personales de menores al patrocinador",
    "Creatives revisables antes de publicar",
    "Cierre y propuesta por WhatsApp",
  ],
  contactEmail: "hola@mificha.mx",
  contactName: "Ricardo Briseño",
  contactPhoneDisplay: SPONSOR_WHATSAPP_DISPLAY,
} as const;

export function sponsorWhatsAppInquiryHref(placement?: SponsorPlacement) {
  return sponsorInquiryHref(placement);
}

/** Misma liga WhatsApp; los paquetes ya no se ofrecen en la web. */
export function sponsorPackageInquiryHref(_packageId?: SponsorPackageId) {
  return sponsorInquiryHref();
}
