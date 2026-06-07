import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogoLink } from "@/components/ui/brand-logo";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-col bg-mf-canvas">
      <header className="border-b border-mf-border bg-mf-surface px-4 py-3 sm:px-6">
        <BrandLogoLink />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h1 className="text-[1.75rem] font-semibold tracking-[-0.02em] text-mf-text">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-mf-text-secondary">{subtitle}</p>
          </div>

          <div className="mf-card p-6 sm:p-8">{children}</div>

          <div className="mt-6 text-center text-sm text-mf-text-secondary">{footer}</div>
        </div>
      </main>
    </div>
  );
}
