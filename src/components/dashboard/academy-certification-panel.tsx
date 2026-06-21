import Link from "next/link";
import { Award, CheckCircle2, Circle } from "lucide-react";
import {
  CERTIFIED_ACADEMY_LABEL,
  type CertificationRequirement,
} from "@/lib/academy-certification";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { cn } from "@/lib/utils";

interface AcademyCertificationPanelProps {
  requirements: CertificationRequirement[];
  certified: boolean;
}

export function AcademyCertificationPanel({
  requirements,
  certified,
}: AcademyCertificationPanelProps) {
  if (certified) {
    return (
      <section className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <Award className="h-4 w-4" />
          {CERTIFIED_ACADEMY_LABEL}
        </div>
        <p className="mt-2 text-sm text-amber-900/80">
          Tu academia aparece en{" "}
          <Link href="/explorar" className="font-semibold underline">
            /explorar
          </Link>{" "}
          y en la red certificada de <BrandWordmark />.
        </p>
      </section>
    );
  }

  const pending = requirements.filter((item) => !item.done);
  const doneCount = requirements.length - pending.length;

  return (
    <section className="overflow-hidden rounded-xl border border-mf-border bg-mf-surface">
      <div className="border-b border-mf-border-subtle bg-mf-canvas px-5 py-4">
        <p className="text-sm font-semibold text-mf-text">
          Certificación en la red <BrandWordmark />
        </p>
        <p className="mt-1 text-sm text-mf-text-secondary">
          Completa estos requisitos para aparecer en /explorar como academia
          certificada ({doneCount}/{requirements.length}).
        </p>
      </div>
      <ol className="divide-y divide-mf-border-subtle">
        {requirements.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              {item.done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
              )}
              <p className="text-sm text-mf-text">{item.label}</p>
            </div>
            {!item.done ? (
              <Link
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 rounded-lg bg-[#1B4F8C] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#164278]",
                )}
              >
                Completar
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
