import type { SupabaseClient } from "@supabase/supabase-js";
import { formatWhatsAppUrl } from "@/lib/public-academy";
import type { TutorChild } from "@/lib/tutor-family";

export type TutorLinkedAcademyContact = {
  name: string;
  slug: string;
  phone: string | null;
};

export type TutorPublicContactLinks = {
  email: string | null;
  emailHref: string | null;
  whatsappHref: string | null;
  academy: {
    name: string;
    href: string;
    whatsappHref: string | null;
  } | null;
};

export function buildTutorContactWhatsAppHref(
  phone: string | null | undefined,
  playerName: string,
  publicCode?: string | null,
) {
  const base = formatWhatsAppUrl(phone ?? null);
  if (!base) return null;
  const text = publicCode
    ? `Hola, vi la ficha de ${playerName} en MiFicha (${publicCode}) y me gustaría contactarlos.`
    : `Hola, vi la ficha de ${playerName} en MiFicha y me gustaría contactarlos.`;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function resolveTutorPublicContact(
  child: TutorChild,
  academy: TutorLinkedAcademyContact | null = null,
): TutorPublicContactLinks | null {
  const profile = child.profile;
  const email =
    profile.show_contact_email && profile.contact_email?.trim()
      ? profile.contact_email.trim()
      : null;
  const whatsappHref =
    profile.show_contact_whatsapp
      ? buildTutorContactWhatsAppHref(
          profile.contact_whatsapp,
          child.player_name,
          child.public_code,
        )
      : null;

  const academyLink =
    profile.show_contact_academy && academy?.slug
      ? {
          name: academy.name || child.linked_academy_name || "Academia",
          href: `/fut/a/${academy.slug}`,
          whatsappHref: buildTutorContactWhatsAppHref(
            academy.phone,
            child.player_name,
            child.public_code,
          ),
        }
      : null;

  if (!email && !whatsappHref && !academyLink) return null;

  return {
    email,
    emailHref: email
      ? `mailto:${email}?subject=${encodeURIComponent(
          `Contacto por ficha de ${child.player_name}${
            child.public_code ? ` (${child.public_code})` : ""
          }`,
        )}`
      : null,
    whatsappHref,
    academy: academyLink,
  };
}

export async function fetchTutorLinkedAcademyContact(
  admin: SupabaseClient,
  academyId: string | null | undefined,
): Promise<TutorLinkedAcademyContact | null> {
  if (!academyId) return null;
  const { data, error } = await admin
    .from("academies")
    .select("name, slug, phone")
    .eq("id", academyId)
    .maybeSingle();
  if (error || !data) return null;
  const slug = String((data as { slug?: string }).slug ?? "").trim();
  if (!slug) return null;
  return {
    name: String((data as { name?: string }).name ?? "").trim() || "Academia",
    slug,
    phone: (data as { phone?: string | null }).phone ?? null,
  };
}
