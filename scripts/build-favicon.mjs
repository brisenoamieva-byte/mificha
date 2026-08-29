import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "public", "brand", "mificha-favicon.svg");
const appDir = path.join(root, "src", "app");

const svg = fs.readFileSync(source);

/** Rasteriza el SVG a alta densidad para que los bordes no queden suaves. */
function render(size) {
  return sharp(svg, { density: 512 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

/** ICO con PNGs embebidos: cabecera 6 bytes + 16 bytes por entrada. */
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

  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

const icoSizes = [16, 32, 48];
const ico = buildIco(
  await Promise.all(icoSizes.map(async (size) => ({ size, data: await render(size) }))),
);
fs.writeFileSync(path.join(appDir, "favicon.ico"), ico);
console.log(`Wrote favicon.ico (${icoSizes.join(", ")}px)`);

fs.copyFileSync(source, path.join(appDir, "icon.svg"));
console.log("Wrote icon.svg");

for (const [name, size] of [
  ["icon.png", 256],
  ["apple-icon.png", 180],
]) {
  fs.writeFileSync(path.join(appDir, name), await render(size));
  console.log(`Wrote ${name} (${size}px)`);
}
