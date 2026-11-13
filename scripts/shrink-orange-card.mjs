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
  return r >= 160 && g <= 140 && b <= 90 && r > g + 50 && r > b + 80;
}
function isTeal(r, g, b) {
  return g > 120 && b > 70 && g > r + 20;
}
function isDarkBlock(r, g, b) {
  // navy filler we painted earlier
  return r < 30 && g < 30 && b < 40;
}

const y0 = Math.floor(height * 0.26);
const y1 = Math.floor(height * 0.72);
const x0 = Math.floor(width * 0.08);
const x1 = Math.floor(width * 0.92);

const colHits = new Array(width).fill(0);
const rowHits = new Array(height).fill(0);
for (let y = y0; y < y1; y++) {
  for (let x = x0; x < x1; x++) {
    const i = (y * width + x) * channels;
    if (isCardOrange(data[i], data[i + 1], data[i + 2])) {
      colHits[x]++;
      rowHits[y]++;
    }
  }
}

const minX = Math.max(8, Math.floor((y1 - y0) * 0.1));
const minY = Math.max(8, Math.floor((x1 - x0) * 0.15));
let left = x0;
while (left < x1 && colHits[left] < minX) left++;
let right = x1 - 1;
while (right > left && colHits[right] < minX) right--;
let top = y0;
while (top < y1 && rowHits[top] < minY) top++;
let bottom = y1 - 1;
while (bottom > top && rowHits[bottom] < minY) bottom--;

let firstTeal = height;
for (let y = Math.floor(height * 0.45); y < height; y++) {
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

const pad = Math.round(3 * s);
left = Math.max(0, left - pad);
right = Math.min(width - 1, right + pad);
top = Math.max(0, top - pad);

const cardW = right - left + 1;
const cardH = Math.round(236 * s);
const radius = Math.round(22 * s);
const gapTop = top + cardH;
const gapBottom = firstTeal - Math.round(12 * s);

// Sample stadium color near sides for gap fill (avoid flat navy slab).
let rSum = 0;
let gSum = 0;
let bSum = 0;
let n = 0;
for (let y = gapTop; y < Math.min(height, gapBottom); y += 2) {
  for (const x of [12, 24, width - 24, width - 12]) {
    const i = (y * width + x) * channels;
    if (isCardOrange(data[i], data[i + 1], data[i + 2])) continue;
    if (isDarkBlock(data[i], data[i + 1], data[i + 2])) continue;
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
    n++;
  }
}
const fill =
  n > 0
    ? {
        r: Math.round(rSum / n),
        g: Math.round(gSum / n),
        b: Math.round(bSum / n),
      }
    : { r: 12, g: 28, b: 48 };

const tx = Math.round(30 * s);
const gapH = Math.max(0, gapBottom - gapTop);
const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="${gapTop}" width="${width}" height="${gapH}" fill="rgb(${fill.r},${fill.g},${fill.b})"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.18" y2="1">
      <stop offset="0%" stop-color="#ff6a22"/>
      <stop offset="55%" stop-color="#f54200"/>
      <stop offset="100%" stop-color="#e03c00"/>
    </linearGradient>
  </defs>
  <rect x="${left}" y="${top}" width="${cardW}" height="${cardH}" rx="${radius}" ry="${radius}" fill="url(#g)"/>
  <text x="${left + tx}" y="${top + Math.round(42 * s)}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(28 * s)}" font-weight="800">-30%</text>
  <text x="${left + tx}" y="${top + Math.round(80 * s)}" fill="rgba(255,255,255,0.9)" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(22 * s)}" font-weight="600">$2,900</text>
  <line x1="${left + tx}" y1="${top + Math.round(72 * s)}" x2="${left + tx + Math.round(86 * s)}" y2="${top + Math.round(66 * s)}" stroke="#ffffff" stroke-width="${Math.max(2, Math.round(2.6 * s))}" stroke-linecap="round"/>
  <text x="${left + tx}" y="${top + Math.round(146 * s)}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(68 * s)}" font-weight="800" letter-spacing="${-1.4 * s}">$2,030</text>
  <text x="${left + tx}" y="${top + Math.round(186 * s)}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(21 * s)}" font-weight="700">Diagnostico GPH + 12 meses MiFicha</text>
  <text x="${left + tx}" y="${top + Math.round(212 * s)}" fill="rgba(255,255,255,0.92)" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(15 * s)}" font-weight="500">Evaluacion presencial · informe en la ficha</text>
</svg>`;

console.log({ left, right, top, cardH, gapTop, gapBottom, firstTeal, fill });

await sharp(src)
  .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
  .jpeg({ quality: 93 })
  .toFile(out);

renameSync(out, src);
console.log("compact card restored");
