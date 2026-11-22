import { getAppBaseUrl } from "@/lib/app-url";
import { BRAND_ICON, BRAND_OG_IMAGE } from "@/lib/brand";
import { LEGAL_ENTITY, LEGAL_ROUTES } from "@/lib/legal";
import {
  VISORIA_EVENT,
  VISORIA_OG_IMAGE,
  VISORIA_PUBLIC_PATH,
} from "@/lib/visoria-event";

/** JSON-LD Organization para el sitio. */
export function organizationJsonLd() {
  const base = getAppBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: LEGAL_ENTITY.brand,
    url: base,
    logo: `${base}${BRAND_ICON}`,
    email: LEGAL_ENTITY.contactEmail,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Querétaro",
      addressRegion: "Querétaro",
      addressCountry: "MX",
    },
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      email: LEGAL_ENTITY.contactEmail,
      contactType: "customer support",
      availableLanguage: ["es"],
    },
    privacyPolicy: `${base}${LEGAL_ROUTES.privacy}`,
    termsOfService: `${base}${LEGAL_ROUTES.terms}`,
    image: `${base}${BRAND_OG_IMAGE}`,
  };
}

/** JSON-LD SportsEvent para las visorías de Querétaro. */
export function visoriaSportsEventJsonLd() {
  const base = getAppBaseUrl();
  const url = `${base}${VISORIA_PUBLIC_PATH}`;

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${VISORIA_EVENT.title} · ${VISORIA_EVENT.organizers}`,
    description:
      "Visorías gratuitas con Club Deportivo Guadalajara y Club Santos Laguna. Registro del tutor en MiFicha.",
    url,
    image: `${base}${VISORIA_OG_IMAGE}`,
    startDate: "2026-11-26T08:45:00-06:00",
    endDate: "2026-11-27T16:00:00-06:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    isAccessibleForFree: true,
    sport: "Soccer",
    location: [
      {
        "@type": "Place",
        name: "San Javier",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Querétaro",
          addressRegion: "Querétaro",
          addressCountry: "MX",
        },
      },
      {
        "@type": "Place",
        name: "Casa de la Juventud",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Querétaro",
          addressRegion: "Querétaro",
          addressCountry: "MX",
        },
      },
    ],
    organizer: {
      "@type": "Organization",
      name: VISORIA_EVENT.organizers,
      url: base,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "MXN",
      availability: "https://schema.org/InStock",
      url,
    },
  };
}
