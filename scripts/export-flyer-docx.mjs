import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const flyerJpg = readFileSync(
  join(root, "public/marketing/mificha-flyer-whatsapp-diagnostico.jpg"),
);
const mifichaIcon = readFileSync(join(root, "public/brand/mificha-icon.png"));
const gphLogo = readFileSync(join(root, "public/partners/gph-logo.png"));
const stadiumBg = readFileSync(join(root, "public/marketing/flyer-stadium-bg.jpg"));

const orange = "F54200";
const dark = "0B1220";

function h(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, bold: true, size: 28, color: dark, font: "Calibri" })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, color: orange, font: "Calibri" })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        size: 22,
        font: "Calibri",
        color: dark,
        ...opts,
      }),
    ],
  });
}

function mono(text) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 20, font: "Consolas", color: "1F2937" })],
  });
}

function labelValue(label, value) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, font: "Calibri" }),
      new TextRun({ text: value, size: 22, font: "Calibri" }),
    ],
  });
}

const offerCell = (children) =>
  new TableCell({
    width: { size: 9000, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: orange },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
    },
    children,
  });

const doc = new Document({
  creator: "MiFicha",
  title: "Flyer WhatsApp · Diagnóstico GPH",
  description: "Base editable para adaptar el flyer de WhatsApp",
  sections: [
    {
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 },
        },
      },
      children: [
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: "MiFicha × GPH",
              bold: true,
              size: 20,
              color: orange,
              font: "Calibri",
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: "Flyer WhatsApp — base para adaptar",
              bold: true,
              size: 36,
              color: dark,
              font: "Calibri",
            }),
          ],
        }),
        p(
          "Aquí tienes el JPG actual, los logos, el fondo del estadio y todo el copy final acordado. Puedes editar tipografía, espaciados y composición en Word / PowerPoint / Canva / Figma.",
        ),

        h("1) Vista actual (JPG)"),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new ImageRun({
              type: "jpg",
              data: flyerJpg,
              transformation: { width: 360, height: 640 },
              altText: {
                title: "Flyer actual",
                description: "Versión actual del flyer WhatsApp",
                name: "flyer",
              },
            }),
          ],
        }),
        p("Archivo fuente: public/marketing/mificha-flyer-whatsapp-diagnostico.jpg"),
        p("Tamaño: 1080 × 1920 (9:16) · ideal WhatsApp / Stories."),

        h("2) Copy final (editable)"),
        h2("Headline"),
        mono("La ficha de futbol de tu hijo, lista para visorias"),
        h2("Oferta"),
        mono("-30%"),
        mono("$2,900  →  $2,030"),
        mono("Diagnostico GPH + 12 meses MiFicha"),
        mono("Evaluacion presencial · informe en la ficha"),
        h2("Bullets"),
        mono("• Ficha del jugador"),
        mono("• Lista para compartir en visorias"),
        mono("• Objetivos claros para entrenar"),
        h2("Párrafo diagnóstico GPH"),
        p(
          "El diagnóstico GPH es una sesión presencial que mide al jugador en físico, técnica, coordinación, cognición y reglamento, define su etapa de desarrollo y deja en MiFicha un informe con fortalezas, objetivos claros y seguimiento.",
        ),
        h2("Pie"),
        mono("Contrata el diagnostico · prueba la plataforma"),
        mono("www.mificha.mx"),
        mono("WhatsApp 442 612 1214"),

        h("3) Bloque oferta (referencia visual)"),
        new Table({
          width: { size: 9000, type: WidthType.DXA },
          rows: [
            new TableRow({
              children: [
                offerCell([
                  new Paragraph({
                    spacing: { before: 160, after: 80 },
                    children: [
                      new TextRun({
                        text: "  -30%  ",
                        bold: true,
                        size: 20,
                        color: orange,
                        font: "Calibri",
                        highlight: "white",
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 40 },
                    children: [
                      new TextRun({
                        text: "  $2,900   ",
                        size: 22,
                        color: "FFFFFF",
                        font: "Calibri",
                        strike: true,
                      }),
                      new TextRun({
                        text: "$2,030",
                        bold: true,
                        size: 56,
                        color: "FFFFFF",
                        font: "Calibri",
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 40 },
                    children: [
                      new TextRun({
                        text: "  Diagnostico GPH + 12 meses MiFicha",
                        bold: true,
                        size: 24,
                        color: "FFFFFF",
                        font: "Calibri",
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 160 },
                    children: [
                      new TextRun({
                        text: "  Evaluacion presencial · informe en la ficha",
                        size: 20,
                        color: "FFFFFF",
                        font: "Calibri",
                      }),
                    ],
                  }),
                ]),
              ],
            }),
          ],
        }),

        h("4) Logos y fondo (para pegar)"),
        h2("MiFicha icon"),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new ImageRun({
              type: "png",
              data: mifichaIcon,
              transformation: { width: 96, height: 96 },
              altText: {
                title: "MiFicha",
                description: "Icono MiFicha",
                name: "mificha",
              },
            }),
          ],
        }),
        p("Ruta: public/brand/mificha-icon.png"),
        h2("GPH logo"),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new ImageRun({
              type: "png",
              data: gphLogo,
              transformation: { width: 220, height: 50 },
              altText: {
                title: "GPH",
                description: "Logo GPH",
                name: "gph",
              },
            }),
          ],
        }),
        p("Ruta: public/partners/gph-logo.png"),
        h2("Fondo estadio"),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new ImageRun({
              type: "jpg",
              data: stadiumBg,
              transformation: { width: 270, height: 480 },
              altText: {
                title: "Estadio",
                description: "Fondo del flyer",
                name: "stadium",
              },
            }),
          ],
        }),
        p("Ruta: public/marketing/flyer-stadium-bg.jpg"),

        h("5) Specs rápidos"),
        labelValue("Formato", "9:16 · 1080×1920 px"),
        labelValue("Naranja GPH/card", "#F54200"),
        labelValue("Verde bullets", "#34D399"),
        labelValue("Fondo logos", "Negro (#000), no azul"),
        labelValue("WhatsApp", "442 612 1214"),
        labelValue("URL", "www.mificha.mx"),
        labelValue("Link click flyer web", "https://www.mificha.mx/fut/flyer"),

        h("6) Criterios de diseño (acordados)"),
        p("• No decir “ficha gratis”: es “Ficha del jugador” (la arma el tutor en la plataforma)."),
        p("• No poner “FUTBOL PILOTO ABIERTO” arriba."),
        p("• Futbol / visorias / diagnostico sin acento en el flyer (estilo actual)."),
        p("• Card naranja limpia (sin textura/manchas) y sin hueco vacío abajo."),
        p("• Logos grandes y con buen contraste; MiFicha sobre negro."),
        p("• Márgenes arriba/abajo equilibrados."),
        p("• El párrafo GPH va en tipografía pequeña, secundario a los bullets."),

        h("7) Archivos HTML de referencia"),
        p(
          "También puedes abrir/editar el layout en: public/marketing/flyer-whatsapp.html",
        ),
        p("Ese HTML es la fuente limpia del JPG actual."),
      ],
    },
  ],
});

const outDir = join(root, "public/marketing");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "mificha-flyer-whatsapp-diagnostico.docx");
const buffer = await Packer.toBuffer(doc);
writeFileSync(outPath, buffer);
console.log("wrote", outPath);
