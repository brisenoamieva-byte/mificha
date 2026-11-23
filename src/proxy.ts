import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Canónico: siempre www.mificha.mx.
 * Vercel ya hace 308 en el edge; esto refuerza si alguna ruta llega al apex.
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  if (host === "mificha.mx") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "www.mificha.mx";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Excluye estáticos/Next internals para no añadir latencia innecesaria.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|css|js|map)$).*)",
  ],
};
