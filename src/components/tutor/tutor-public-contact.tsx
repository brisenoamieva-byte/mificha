import { Mail, MessageCircle, School } from "lucide-react";
import type { TutorPublicContactLinks } from "@/lib/tutor-public-contact";

export function TutorPublicContactCard({
  contact,
  playerName,
}: {
  contact: TutorPublicContactLinks;
  playerName: string;
}) {
  return (
    <section className="rounded-2xl border border-mf-border bg-white px-5 py-5 shadow-[0_18px_40px_-28px_rgba(15,45,82,0.35)] sm:px-6 print:hidden">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mf-gph">
        Contacto
      </p>
      <h2 className="mt-1 text-lg font-semibold text-mf-gph-ink">
        Hablar sobre {playerName}
      </h2>
      <p className="mt-1 text-sm leading-6 text-mf-text-secondary">
        Canales que el tutor activó en esta ficha.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {contact.whatsappHref ? (
          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mf-btn-gph"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp del tutor
          </a>
        ) : null}
        {contact.emailHref ? (
          <a href={contact.emailHref} className="mf-btn-gph-ghost">
            <Mail className="h-4 w-4" aria-hidden />
            Correo del tutor
          </a>
        ) : null}
        {contact.academy ? (
          <>
            {contact.academy.whatsappHref ? (
              <a
                href={contact.academy.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mf-btn-gph-ghost"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp academia
              </a>
            ) : null}
            <a href={contact.academy.href} className="mf-btn-gph-ghost">
              <School className="h-4 w-4" aria-hidden />
              {contact.academy.name}
            </a>
          </>
        ) : null}
      </div>
    </section>
  );
}
