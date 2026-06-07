import Link from "next/link";

export default function AcademyPublicNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a] px-6">
      <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center shadow-2xl">
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Academia no disponible
        </h1>
        <p className="mt-3 text-slate-400">
          Esta academia no existe o su landing pública está desactivada.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-[#1B4F8C] px-6 py-3 text-sm font-bold text-white"
        >
          Ir a MiFicha
        </Link>
      </div>
    </div>
  );
}
