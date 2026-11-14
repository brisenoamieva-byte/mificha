import { Mail, MessageCircle } from "lucide-react";
import {
  ORGANIZER_CONTACT,
  organizerMailtoHref,
  organizerWhatsAppHref,
} from "@/lib/organizer-contact";
import { cn } from "@/lib/utils";

type OrganizerContactActionsProps = {
  className?: string;
  /** `hero` = primario WhatsApp; `band` = cierre de página. */
  variant?: "hero" | "band";
};

export function OrganizerContactActions({
  className,
  variant = "hero",
}: OrganizerContactActionsProps) {
  const whatsapp = organizerWhatsAppHref();
  const mailto = organizerMailtoHref();

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <a
        href={whatsapp}
        className="mf-btn-primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        WhatsApp {ORGANIZER_CONTACT.phoneDisplay}
      </a>
      <a href={mailto} className={variant === "hero" ? "mf-btn-accent" : "mf-btn-secondary"}>
        <Mail className="h-4 w-4" aria-hidden />
        Correo
      </a>
    </div>
  );
}
