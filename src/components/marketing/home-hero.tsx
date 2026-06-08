import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeFichaPreview } from "@/components/marketing/home-ficha-preview";
import { MarketingPageHero } from "@/components/marketing/marketing-page-hero";
import { MARKETING_IMAGES } from "@/lib/marketing-assets";

export function HomeHero() {
  return (
    <MarketingPageHero
      eyebrow="Ficha digital del jugador"
      title="Stats verificados por tu academia"
      description="Captura el partido en 60 segundos. Comparte la ficha con padres por QR. Scouts la ven en el directorio."
      photoSrc={MARKETING_IMAGES.heroHome}
      photoAlt="Entrenador registrando stats post-partido en cancha escolar"
      photoPriority
      actions={
        <>
          <Link href="/signup" className="mf-btn-primary">
            Registrar colegio
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/explorar" className="mf-btn-secondary">
            Explorar talento
          </Link>
        </>
      }
      stats={[
        { value: "60 s", label: "Captura post-partido" },
        { value: "0", label: "App para padres" },
        { value: "100", label: "Passport Score" },
      ]}
      aside={<HomeFichaPreview />}
    />
  );
}
