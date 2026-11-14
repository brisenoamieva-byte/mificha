import { ORGANIZER_PRICING } from "@/lib/pricing";
import { OrganizerContactActions } from "@/components/marketing/organizer-contact-actions";
import { ORGANIZER_CONTACT } from "@/lib/organizer-contact";

/** Bloque único de registro gratis + contacto (WhatsApp / correo). */
export function OrganizerPricingSection() {
  return (
    <section id="registro" className="scroll-mt-24 border-y border-mf-border bg-mf-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="max-w-2xl">
          <p className="mf-marketing-eyebrow">Registro</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
            {ORGANIZER_PRICING.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-mf-text-secondary sm:text-base">
            {ORGANIZER_PRICING.subtitle}
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-mf-brand">
            {ORGANIZER_PRICING.plans[0]?.priceLabel ?? "Gratis"}
          </p>
          <p className="mt-1 text-sm text-mf-text-muted">
            {ORGANIZER_PRICING.plans[0]?.period}
          </p>
          <p className="mt-4 text-sm leading-7 text-mf-text-secondary">
            {ORGANIZER_PRICING.plans[0]?.description}
          </p>
          <p className="mt-3 text-xs text-mf-text-muted">{ORGANIZER_PRICING.footnote}</p>
        </div>

        <div className="mt-8 max-w-xl rounded-xl border border-mf-border bg-white p-5 sm:p-6">
          <p className="text-sm font-semibold text-mf-text">Escríbenos para activar tu torneo</p>
          <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
            WhatsApp al {ORGANIZER_CONTACT.phoneDisplay} o correo a {ORGANIZER_CONTACT.email}.
          </p>
          <OrganizerContactActions className="mt-4" variant="band" />
        </div>
      </div>
    </section>
  );
}
