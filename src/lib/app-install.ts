/** Ruta pública para instalar / re-descargar la app MiFicha (PWA). */
export const APP_INSTALL_PATH = "/fut/app" as const;

export const APP_INSTALL = {
  title: "Descargar app MiFicha",
  eyebrow: "App gratis · Android e iPhone",
  lead:
    "Instálala en tu celular desde el navegador. Queda como ícono en la pantalla de inicio, igual que una app de la tienda.",
  androidTitle: "Android",
  androidSteps: [
    "Abre mificha.mx en Chrome",
    "Toca el menú ⋮ (arriba a la derecha)",
    "Elige Instalar app o Añadir a pantalla de inicio",
  ],
  iosTitle: "iPhone",
  iosSteps: [
    "Abre mificha.mx en Safari (no en Chrome)",
    "Toca Compartir (el cuadrado con flecha)",
    "Elige Añadir a pantalla de inicio → Añadir",
  ],
  installCta: "Instalar MiFicha ahora",
  installedNote: "Ya está instalada. Ábrela desde el ícono en tu pantalla de inicio.",
  storeNote:
    "Todavía no está en Play Store ni App Store: la vía oficial es instalarla desde esta página.",
} as const;
