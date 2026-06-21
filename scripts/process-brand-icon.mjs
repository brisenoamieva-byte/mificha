import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const input = process.argv[2];

if (!input || !fs.existsSync(input)) {
  console.error("Usage: node scripts/process-brand-icon.mjs <input.png>");
  process.exit(1);
}

function isBrandPixel(r, g, b) {
  const max = Math.max(r, g, b);
  if (max < 40) return false;

  const isGreenAccent = g > 120 && g > r + 25 && g > b + 15;
  const isNavy = b > 70 && b >= g && r < 110;

  return isGreenAccent || isNavy;
}

function shouldMakeTransparent(r, g, b) {
  return !isBrandPixel(r, g, b);
}

async function buildTransparentIcon(sourcePath) {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (shouldMakeTransparent(r, g, b)) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim()
    .png();
}

async function writePng(pipeline, targetPath, size) {
  await pipeline
    .clone()
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(targetPath);
  console.log(`Wrote ${targetPath} (${size}px)`);
}

const iconPipeline = await buildTransparentIcon(input);

const brandDir = path.join(root, "public", "brand");
fs.mkdirSync(brandDir, { recursive: true });

await writePng(iconPipeline, path.join(brandDir, "mificha-icon.png"), 512);
await writePng(iconPipeline, path.join(root, "src", "app", "icon.png"), 256);
await writePng(iconPipeline, path.join(root, "src", "app", "apple-icon.png"), 180);

console.log("Brand icon processed.");
