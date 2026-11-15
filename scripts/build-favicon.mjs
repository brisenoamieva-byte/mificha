/**
 * Unifica favicon / app icons al escudo MiFicha (public/brand/mificha-icon.png).
 * Uso: node scripts/build-favicon.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const shieldPath = path.join(root, "public", "brand", "mificha-icon.png");
const appDir = path.join(root, "src", "app");
const brandDir = path.join(root, "public", "brand");

const CANVAS = { r: 244, g: 247, b: 251 };

/** Escudo centrado sobre canvas redondeado (misma marca en todos los tamaños). */
async function renderAppIcon(size, { padRatio = 0.14, radiusRatio = 0.22 } = {}) {
  const radius = Math.round(size * radiusRatio);
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;

  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="rgb(${CANVAS.r},${CANVAS.g},${CANVAS.b})"/>
    </svg>`,
  );

  const shield = await sharp(shieldPath)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp(background)
    .composite([{ input: shield, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** ICO con PNGs embebidos. */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([
    header,
    ...entries,
    ...images.map((image) => image.data),
  ]);
}

const icon512 = await renderAppIcon(512);
const icon256 = await renderAppIcon(256);
const icon180 = await renderAppIcon(180);

fs.writeFileSync(path.join(appDir, "icon.png"), icon256);
fs.writeFileSync(path.join(appDir, "apple-icon.png"), icon180);
fs.writeFileSync(path.join(brandDir, "mificha-app-icon.png"), icon512);
console.log("Wrote icon.png (256), apple-icon.png (180), mificha-app-icon.png (512)");

const icoSizes = [16, 32, 48];
const ico = buildIco(
  await Promise.all(
    icoSizes.map(async (size) => ({
      size,
      data: await renderAppIcon(size, { padRatio: 0.12, radiusRatio: 0.2 }),
    })),
  ),
);
fs.writeFileSync(path.join(appDir, "favicon.ico"), ico);
console.log(`Wrote favicon.ico (${icoSizes.join(", ")}px)`);

const png64 = icon256.toString("base64");
const svgEmbedded = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" role="img" aria-label="MiFicha">
  <title>MiFicha</title>
  <image
    width="64"
    height="64"
    href="data:image/png;base64,${png64}"
    xlink:href="data:image/png;base64,${png64}"
  />
</svg>
`;

fs.writeFileSync(path.join(brandDir, "mificha-favicon.svg"), svgEmbedded);
fs.writeFileSync(path.join(appDir, "icon.svg"), svgEmbedded);
console.log("Wrote mificha-favicon.svg and icon.svg (escudo unificado)");
