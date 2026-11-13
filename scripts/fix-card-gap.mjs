import sharp from "sharp";
import { renameSync } from "node:fs";

const src = "public/marketing/mificha-flyer-whatsapp-diagnostico.jpg";
const out = "public/marketing/mificha-flyer-whatsapp-diagnostico.tmp.jpg";

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const s = width / 720;

function isCardOrange(r, g, b) {
  return r >= 170 && g <= 140 && b <= 90 && r > g + 50 && r > b + 80;
}
function isTeal(r, g, b) {
  return g > 120 && b > 70 && g > r + 20;
}

let top = height;
let bottom = 0;
let left = width;
let right = 0;
for (let y = Math.floor(height * 0.25); y < Math.floor(height * 0.65); y++) {
  for (let x = Math.floor(width * 0.08); x < Math.floor(width * 0.92); x++) {
    const i = (y * width + x) * channels;
    if (isCardOrange(data[i], data[i + 1], data[i + 2])) {
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
}

let firstTeal = height;
for (let y = bottom; y < height; y++) {
  let c = 0;
  for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.4); x++) {
    const i = (y * width + x) * channels;
    if (isTeal(data[i], data[i + 1], data[i + 2])) c++;
  }
  if (c > 8) {
    firstTeal = y;
    break;
  }
}

const gapTop = bottom + 1;
const gapBottom = firstTeal - Math.round(10 * s);
const gapH = Math.max(0, gapBottom - gapTop);

const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gap" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a1830"/>
      <stop offset="100%" stop-color="#081426"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${gapTop}" width="${width}" height="${gapH}" fill="url(#gap)"/>
</svg>`;

console.log({ top, bottom, left, right, firstTeal, gapTop, gapH });

await sharp(src)
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .jpeg({ quality: 93 })
  .toFile(out);

renameSync(out, src);
console.log("gap fixed");
