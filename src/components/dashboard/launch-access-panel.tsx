import { Sparkles } from "lucide-react";
import { LAUNCH_COPY } from "@/lib/launch-mode";

export function LaunchAccessPanel() {
  return (
    <section className="rounded-xl border border-[#1B4F8C]/20 bg-[#1B4F8C]/5 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-white p-2 text-[#1B4F8C] shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1B4F8C]">
            {LAUNCH_COPY.badge}
          </span>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            {LAUNCH_COPY.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {LAUNCH_COPY.description}
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {LAUNCH_COPY.footnote}
          </p>
        </div>
      </div>
    </section>
  );
}
