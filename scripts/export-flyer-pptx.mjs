import PptxGenJS from "pptxgenjs";
import { join } from "node:path";
import { copyFileSync } from "node:fs";

const root = process.cwd();
const pptx = new PptxGenJS();

// 9:16 editable canvas (Stories / WhatsApp)
pptx.defineLayout({ name: "FLYER_916", width: 5.4, height: 9.6 });
pptx.layout = "FLYER_916";
pptx.author = "MiFicha";
pptx.title = "Flyer WhatsApp · Diagnóstico GPH";

const slide = pptx.addSlide();
slide.background = { color: "000000" };

// --- Fondo estadio (capa 1, redimensionable) ---
slide.addImage({
  path: join(root, "public/marketing/flyer-stadium-bg.jpg"),
  x: 0,
  y: 0,
  w: 5.4,
  h: 9.6,
});

// Velo oscuro superior para contraste de logos
slide.addShape(pptx.shapes.RECTANGLE, {
  x: 0,
  y: 0,
  w: 5.4,
  h: 1.55,
  fill: { color: "000000", transparency: 15 },
  line: { color: "000000", transparency: 100 },
});

// Velo inferior para pie
slide.addShape(pptx.shapes.RECTANGLE, {
  x: 0,
  y: 7.8,
  w: 5.4,
  h: 1.8,
  fill: { color: "000000", transparency: 25 },
  line: { color: "000000", transparency: 100 },
});

// --- Logos ---
// Pastilla negra MiFicha
slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.28,
  y: 0.28,
  w: 0.72,
  h: 0.72,
  fill: { color: "000000" },
  line: { color: "FFFFFF", width: 1.25, transparency: 55 },
  shadow: { type: "outer", color: "000000", blur: 8, opacity: 0.35, offset: 2 },
});

slide.addImage({
  path: join(root, "public/brand/mificha-icon.png"),
  x: 0.38,
  y: 0.38,
  w: 0.52,
  h: 0.52,
});

slide.addText("MiFicha", {
  x: 1.1,
  y: 0.34,
  w: 2.1,
  h: 0.6,
  fontSize: 28,
  fontFace: "Arial",
  bold: true,
  color: "FFFFFF",
  margin: 0,
  valign: "middle",
});

// Divisor
slide.addShape(pptx.shapes.RECTANGLE, {
  x: 3.2,
  y: 0.42,
  w: 0.02,
  h: 0.45,
  fill: { color: "FFFFFF", transparency: 45 },
  line: { color: "FFFFFF", transparency: 100 },
});

// Pastilla blanca GPH
slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 3.4,
  y: 0.32,
  w: 1.7,
  h: 0.65,
  fill: { color: "FFFFFF" },
  shadow: { type: "outer", color: "000000", blur: 8, opacity: 0.3, offset: 2 },
});

slide.addImage({
  path: join(root, "public/partners/gph-logo.png"),
  x: 3.52,
  y: 0.42,
  w: 1.46,
  h: 0.42,
});

// --- Headline ---
slide.addText("La ficha de futbol de tu hijo, lista para visorias", {
  x: 0.28,
  y: 1.25,
  w: 4.5,
  h: 1.15,
  fontSize: 26,
  fontFace: "Arial",
  bold: true,
  color: "FFFFFF",
  margin: 0,
  valign: "top",
});

// --- Card naranja (forma editable) ---
slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.28,
  y: 2.5,
  w: 4.84,
  h: 2.35,
  fill: { color: "F54200" },
  shadow: { type: "outer", color: "F54200", blur: 18, opacity: 0.35, offset: 4 },
});

// Badge -30%
slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.48,
  y: 2.68,
  w: 0.85,
  h: 0.34,
  fill: { color: "FFFFFF" },
});
slide.addText("-30%", {
  x: 0.48,
  y: 2.68,
  w: 0.85,
  h: 0.34,
  fontSize: 14,
  fontFace: "Arial",
  bold: true,
  color: "F54200",
  align: "center",
  valign: "middle",
  margin: 0,
});

// Precio viejo
slide.addText("$2,900", {
  x: 0.48,
  y: 3.12,
  w: 1.1,
  h: 0.35,
  fontSize: 16,
  fontFace: "Arial",
  color: "FFFFFF",
  transparency: 15,
  strike: true,
  margin: 0,
  valign: "middle",
});

// Precio nuevo
slide.addText("$2,030", {
  x: 1.55,
  y: 3.0,
  w: 3.2,
  h: 0.7,
  fontSize: 48,
  fontFace: "Arial",
  bold: true,
  color: "FFFFFF",
  margin: 0,
  valign: "middle",
});

slide.addText("Diagnostico GPH + 12 meses MiFicha", {
  x: 0.48,
  y: 3.75,
  w: 4.4,
  h: 0.38,
  fontSize: 16,
  fontFace: "Arial",
  bold: true,
  color: "FFFFFF",
  margin: 0,
});

slide.addText("Evaluacion presencial · informe en la ficha", {
  x: 0.48,
  y: 4.15,
  w: 4.4,
  h: 0.35,
  fontSize: 13,
  fontFace: "Arial",
  color: "FFFFFF",
  transparency: 8,
  margin: 0,
});

// --- Bullets (cada uno editable) ---
const bullets = [
  "Ficha del jugador",
  "Lista para compartir en visorias",
  "Objetivos claros para entrenar",
];
bullets.forEach((label, i) => {
  const y = 5.05 + i * 0.42;
  slide.addShape(pptx.shapes.OVAL, {
    x: 0.35,
    y: y + 0.08,
    w: 0.18,
    h: 0.18,
    fill: { color: "34D399" },
    line: { color: "34D399", transparency: 100 },
  });
  slide.addText(label, {
    x: 0.65,
    y,
    w: 4.4,
    h: 0.36,
    fontSize: 15,
    fontFace: "Arial",
    bold: true,
    color: "FFFFFF",
    margin: 0,
    valign: "middle",
  });
});

// --- Párrafo GPH ---
slide.addText(
  "El diagnóstico GPH es una sesión presencial que mide al jugador en físico, técnica, coordinación, cognición y reglamento, define su etapa de desarrollo y deja en MiFicha un informe con fortalezas, objetivos claros y seguimiento.",
  {
    x: 0.28,
    y: 6.35,
    w: 4.84,
    h: 1.15,
    fontSize: 11,
    fontFace: "Arial",
    color: "FFFFFF",
    transparency: 18,
    margin: 0,
    valign: "top",
  },
);

// --- Footer ---
slide.addText("Contrata el diagnostico · prueba la plataforma", {
  x: 0.28,
  y: 7.7,
  w: 4.84,
  h: 0.32,
  fontSize: 12,
  fontFace: "Arial",
  color: "FFFFFF",
  transparency: 15,
  align: "center",
  margin: 0,
});

slide.addText("www.mificha.mx", {
  x: 0.28,
  y: 8.05,
  w: 4.84,
  h: 0.55,
  fontSize: 28,
  fontFace: "Arial",
  bold: true,
  color: "FFFFFF",
  align: "center",
  margin: 0,
});

slide.addText("WhatsApp 442 612 1214", {
  x: 0.28,
  y: 8.65,
  w: 4.84,
  h: 0.35,
  fontSize: 13,
  fontFace: "Arial",
  color: "FFFFFF",
  transparency: 20,
  align: "center",
  margin: 0,
});

// Segunda diapositiva: instrucciones
const help = pptx.addSlide();
help.background = { color: "FFFFFF" };
help.addText("Cómo editar este flyer", {
  x: 0.4,
  y: 0.35,
  w: 4.6,
  h: 0.45,
  fontSize: 22,
  bold: true,
  color: "0B1220",
  fontFace: "Arial",
});
help.addText(
  [
    {
      text: "En PowerPoint / Google Slides / Keynote puedes:\n",
      options: { breakLine: true },
    },
    {
      text: "• Clic en cualquier texto para editarlo\n",
      options: { breakLine: true },
    },
    {
      text: "• Arrastrar esquinas para ampliar logos, card o textos\n",
      options: { breakLine: true },
    },
    {
      text: "• Mover cada elemento por separado\n",
      options: { breakLine: true },
    },
    {
      text: "• Cambiar color de la card naranja (#F54200)\n",
      options: { breakLine: true },
    },
    {
      text: "• Reemplazar el fondo (clic derecho → Cambiar imagen)\n",
      options: { breakLine: true },
    },
    {
      text: "• Exportar: Archivo → Exportar → PNG/JPG (o PDF)\n\n",
      options: { breakLine: true },
    },
    {
      text: "Diapositiva 1 = flyer listo para adaptar.\n",
      options: { breakLine: true, bold: true },
    },
    {
      text: "Formato 9:16 (Stories / WhatsApp).",
      options: { breakLine: true },
    },
  ],
  {
    x: 0.4,
    y: 1.0,
    w: 4.6,
    h: 6.5,
    fontSize: 14,
    color: "1F2937",
    fontFace: "Arial",
    valign: "top",
  },
);

const outPptx = join(root, "public/marketing/mificha-flyer-whatsapp-diagnostico.pptx");
const desktop = join(process.env.USERPROFILE || "", "Desktop", "mificha-flyer-whatsapp-diagnostico.pptx");
await pptx.writeFile({ fileName: outPptx });
copyFileSync(outPptx, desktop);
console.log("wrote", outPptx);
console.log("desktop", desktop);
