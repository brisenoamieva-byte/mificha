import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeFichaPreview } from "@/components/marketing/home-ficha-preview";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MARKETING_MEDIA } from "@/lib/marketing-assets";

export function HomeHero() {
  return (
    <MarketingPageHero
      eyebrow="Ficha digital del jugador"
      title="Participa, compite y comparte tu juego"
      description="Ficha verificada por tu academia. Padres reciben el link automáticamente; scouts descubren talento por categoría — sin presión, con progreso claro."
      photo={MARKETING_MEDIA.heroHome}
      photoPriority
      actions={
        <>
          <Link href="/signup" className="mf-btn-primary">
            Registrar colegio
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/explorar" className="mf-btn-accent">
            Explorar talento
          </Link>
        </>
      }
      stats={[
        { value: "~1 min", label: "Convocados + minutos" },
        { value: "Sin app", label: "Padres abren el link" },
        { value: "100", label: "Progreso verificado", accent: true },
      ]}
      aside={<HomeFichaPreview />}
    />
  );
}
