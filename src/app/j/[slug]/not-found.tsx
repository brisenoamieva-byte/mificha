import Link from "next/link";

export default function PublicPlayerNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1B4F8C] to-[#0F2D52] px-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">Ficha no disponible</h1>
        <p className="mt-3 text-slate-600">
          Este jugador no existe o su perfil no es público.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-[#1B4F8C] px-5 py-3 text-sm font-semibold text-white"
        >
          Ir a MiFicha
        </Link>
      </div>
    </div>
  );
}
