/**
 * Instagram portada / pauta — nítida (render 2× + JPEG sin chroma subsampling).
 * Uso: node scripts/compose-ig-portada.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "marketing", "instagram");
const SIZE = 2160; // 2×; se baja a 1080 al final
const FINAL = 1080;
const NAVY = "#0F2D52";
const MINT = "#34D399";
const WHITE = "#FFFFFF";

const pitchCandidates = [
  path.join(root, "public", "marketing", "flyer-stadium-bg.jpg"),
  path.join(
    "C:",
    "Users",
    "brise",
    ".cursor",
    "projects",
    "d-mificha",
    "assets",
    "mificha-pitch-single-goal-only.jpg",
  ),
];
const ballPath = path.join(
  "C:",
  "Users",
  "brise",
  ".cursor",
  "projects",
  "d-mificha",
  "assets",
  "mificha-soccer-ball-cut.jpg",
);
const logoPath = path.join(
  root,
  "docs",
  "brand",
  "kit",
  "01-escudo",
  "mificha-escudo-2048.png",
);
const logoFallback = path.join(root, "public", "brand", "mificha-icon.png");

function findPitch() {
  for (const p of pitchCandidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("No pitch/stadium background found");
}

async function coverCrop(input, size, biasTop = 0.12) {
  const meta = await sharp(input).metadata();
  const w = meta.width;
  const h = meta.height;
  const scale = Math.max(size / w, size / h);
  const nw = Math.round(w * scale);
  const nh = Math.round(h * scale);
  const left = Math.max(0, Math.floor((nw - size) / 2));
  const top = Math.max(
    0,
    Math.min(nh - size, Math.floor((nh - size) / 2 + size * biasTop)),
  );
  return sharp(input)
    .resize(nw, nh, { kernel: sharp.kernel.lanczos3 })
    .extract({ left, top, width: size, height: size })
    .modulate({ brightness: 0.9, saturation: 0.95 })
    .linear(1.08, -(128 * 0.08))
    .png()
    .toBuffer();
}

async function circularBall(diameter) {
  if (!fs.existsSync(ballPath)) return null;
  const inset = Math.round(diameter * 0.04);
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}">
      <circle cx="${diameter / 2}" cy="${diameter / 2}" r="${
        diameter / 2 - inset
      }" fill="white"/>
    </svg>`,
  );
  // Square crop around ball center, then circular mask
  const meta = await sharp(ballPath).metadata();
  const side = Math.floor(Math.min(meta.width, meta.height) * 0.72);
  const left = Math.floor(meta.width / 2 - side / 2);
  const top = Math.floor(meta.height * 0.52 - side / 2);
  return sharp(ballPath)
    .extract({ left, top, width: side, height: side })
    .resize(diameter, diameter, { kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

function textOverlaySvg() {
  // Vector text at 2× — sharp when downscaled
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0.85">
      <stop offset="0%" stop-color="#08162A" stop-opacity="0.78"/>
      <stop offset="55%" stop-color="#08162A" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#08162A" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#scrim)"/>
  <!-- footer -->
  <rect y="${SIZE - Math.round(SIZE * 0.155)}" width="${SIZE}" height="${Math.round(
    SIZE * 0.155,
  )}" fill="${NAVY}"/>
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${NAVY}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${NAVY}" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <rect y="${SIZE - Math.round(SIZE * 0.155) - 100}" width="${SIZE}" height="100" fill="url(#fade)"/>

  <g font-family="Segoe UI, Arial, Helvetica, sans-serif" fill="${WHITE}">
    <text x="112" y="280" font-size="164" font-weight="800">Tu hijo juega.</text>
    <text x="112" y="420" font-size="152" font-weight="800">¿Dónde está</text>
    <text x="112" y="560" font-size="152" font-weight="800">su ficha?</text>
  </g>
  <rect x="112" y="600" width="264" height="10" rx="4" fill="${MINT}"/>
  <text x="112" y="670" font-family="Segoe UI, Arial, Helvetica, sans-serif"
    font-size="48" font-weight="400" fill="#DCE4EC">
    Ficha digital gratis  ·  Llenamos la base de México
  </text>
</svg>`);
}

async function main() {
  const pitch = findPitch();
  const logoSrc = fs.existsSync(logoPath) ? logoPath : logoFallback;
  console.log("pitch", pitch);
  console.log("logo", logoSrc);

  const photo = await coverCrop(pitch, SIZE, 0.12);
  const overlay = await sharp(textOverlaySvg()).png().toBuffer();

  const logoH = Math.round(SIZE * 0.072);
  // White version of escudo for dark footer
  const logoRaw = await sharp(logoSrc)
    .resize(logoH, logoH, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = logoRaw;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 20) continue;
    const isGreen = g > 120 && g > r + 25 && g > b + 15;
    if (isGreen) {
      data[i] = 52;
      data[i + 1] = 211;
      data[i + 2] = 153;
    } else {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
  const logoWhite = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const wordmark = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="520" height="${logoH}">
  <text y="${Math.round(logoH * 0.72)}" font-family="Segoe UI, Arial, Helvetica, sans-serif"
    font-size="${Math.round(logoH * 0.72)}" fill="${WHITE}">
    <tspan font-weight="400">Mi</tspan><tspan font-weight="700">Ficha</tspan>
  </text>
</svg>`);
  const wordmarkPng = await sharp(wordmark).png().toBuffer();
  const wordMeta = await sharp(wordmarkPng).metadata();

  const gap = 32;
  const lockW = info.width + gap + wordMeta.width;
  const footerTop = SIZE - Math.round(SIZE * 0.155);
  const lx = Math.round((SIZE - lockW) / 2);
  const ly = footerTop + Math.round((Math.round(SIZE * 0.155) - logoH) / 2);

  const composites = [
    { input: overlay, left: 0, top: 0 },
    { input: logoWhite, left: lx, top: ly },
    {
      input: wordmarkPng,
      left: lx + info.width + gap,
      top: ly + Math.round((logoH - wordMeta.height) / 2),
    },
  ];

  const ball = await circularBall(Math.round(SIZE * 0.24));
  if (ball) {
    const ballMeta = await sharp(ball).metadata();
    const bx = SIZE - ballMeta.width - 80;
    const by = SIZE - Math.round(SIZE * 0.155) - ballMeta.height + 36;
    // soft shadow
    const shadow = await sharp({
      create: {
        width: ballMeta.width + 60,
        height: 50,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${
              ballMeta.width + 60
            }" height="50">
              <ellipse cx="${(ballMeta.width + 60) / 2}" cy="25" rx="${
                ballMeta.width / 2
              }" ry="14" fill="black" fill-opacity="0.45"/>
            </svg>`,
          ),
          left: 0,
          top: 0,
        },
      ])
      .blur(8)
      .png()
      .toBuffer();
    composites.push(
      { input: shadow, left: bx - 10, top: by + ballMeta.height - 36 },
      { input: ball, left: bx, top: by },
    );
  }

  const hiRes = await sharp(photo)
    .composite(composites)
    .png()
    .toBuffer();

  fs.mkdirSync(outDir, { recursive: true });

  // Master 2160 (nitidez máxima para zoom / descarga)
  const masterJpg = await sharp(hiRes)
    .jpeg({ quality: 98, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
  const masterPng = hiRes;

  // Feed 1080 — downscale from 2× + 4:4:4 (texto nítido)
  const feedJpg = await sharp(hiRes)
    .resize(FINAL, FINAL, { kernel: sharp.kernel.lanczos3 })
    .jpeg({ quality: 98, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
  const feedPng = await sharp(hiRes)
    .resize(FINAL, FINAL, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 6 })
    .toBuffer();

  const files = [
    ["mificha-ig-post-portada.jpg", feedJpg],
    ["mificha-ig-post-01-pauta.jpg", feedJpg],
    ["mificha-ig-post-portada.png", feedPng],
    ["mificha-ig-post-portada-2160.jpg", masterJpg],
    ["mificha-ig-post-portada-2160.png", masterPng],
  ];
  for (const [name, buf] of files) {
    const out = path.join(outDir, name);
    fs.writeFileSync(out, buf);
    console.log("Wrote", out, buf.length);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
