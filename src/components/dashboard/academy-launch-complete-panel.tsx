import Link from "next/link";
import { CheckCircle2, ExternalLink, MessageCircle, Printer } from "lucide-react";

interface AcademyLaunchCompletePanelProps {
  academySlug: string;
}

export function AcademyLaunchCompletePanel({
  academySlug,
}: AcademyLaunchCompletePanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/60">
      <div className="border-b border-emerald-100 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          MiFicha activo en tu academia
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          Siguiente: comparte con padres
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Tu plantel ya captura stats. Imprime QR o manda WhatsApp desde Plantel.
        </p>
      </div>

      <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
        <Link
          href="/dashboard/plantel/imprimir"
          className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-200"
        >
          <Printer className="h-4 w-4 text-emerald-700" />
          QR imprimibles
        </Link>
        <Link
          href="/dashboard/plantel"
          className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-200"
        >
          <MessageCircle className="h-4 w-4 text-green-700" />
          WhatsApp desde plantel
        </Link>
        <Link
          href={`/a/${academySlug}`}
          target="_blank"
          className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-200"
        >
          <ExternalLink className="h-4 w-4 text-[#1B4F8C]" />
          Ver landing pública
        </Link>
      </div>
    </section>
  );
}
