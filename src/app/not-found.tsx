import Link from "next/link";
import { BrandLogoLink } from "@/components/ui/brand-logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mf-canvas px-6">
      <div className="w-full max-w-md mf-card p-8 text-center">
        <BrandLogoLink className="justify-center" />
        <h1 className="mt-8 text-2xl font-semibold tracking-[-0.02em] text-mf-text">
          Página no encontrada
        </h1>
        <p className="mt-3 text-sm leading-6 text-mf-text-secondary">
          La ruta que buscas no existe o ya no está disponible.
        </p>
        <Link href="/" className="mf-btn-primary mt-6 inline-flex">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
