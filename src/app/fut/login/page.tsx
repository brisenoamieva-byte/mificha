import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Iniciar sesión | MiFicha",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Legacy: un solo login en /fut/entrar. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = firstParam(params.next);
  if (next.startsWith("/")) {
    redirect(`/fut/entrar?next=${encodeURIComponent(next)}`);
  }
  redirect("/fut/entrar");
}
