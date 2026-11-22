/**
 * Exporta kit de marca profesional desde public/brand/mificha-icon.png
 * Uso: node scripts/export-brand-kit.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "public", "brand", "mificha-icon.png");
const kitRoot = path.join(root, "docs", "brand", "kit");

const BRAND = "#1B4F8C";
const BRAND_DARK = "#0F2D52";
const MINT = "#34D399";
const CANVAS = "#F4F7FB";

if (!fs.existsSync(source)) {
  console.error("Missing", source);
  process.exit(1);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function exportPngSizes(inputPath, outDir, basename, sizes) {
  for (const size of sizes) {
    const out = path.join(outDir, `${basename}-${size}.png`);
    await sharp(inputPath)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log("Wrote", out);
  }
}

async function whiteVersion(inputPath, outPath, size) {
  // Convert navy to white, keep mint green
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 20) continue;
    const isGreen = g > 120 && g > r + 25 && g > b + 15;
    if (isGreen) {
      // keep mint
      data[i] = 52;
      data[i + 1] = 211;
      data[i + 2] = 153;
    } else {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outPath);
  console.log("Wrote", outPath);
}

async function appIcon(size, outPath) {
  const pad = Math.round(size * 0.14);
  const radius = Math.round(size * 0.22);
  const inner = size - pad * 2;
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${CANVAS}"/>
    </svg>`,
  );
  const shield = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp(bg)
    .composite([{ input: shield, gravity: "centre" }])
    .png()
    .toFile(outPath);
  console.log("Wrote", outPath);
}

async function lockup({ mode, outPng, width = 1600, height = 480 }) {
  const isDark = mode === "dark";
  const isWhite = mode === "white";
  const bg = isDark ? BRAND_DARK : isWhite ? "#FFFFFF" : "transparent";
  const textFill = isDark || bg === "transparent" ? "#FFFFFF" : BRAND;
  // For transparent lockup on light: navy text; for dark bg: white text
  const fill =
    mode === "on-dark" ? "#FFFFFF" : mode === "on-light" ? BRAND : textFill;
  const actualBg =
    mode === "on-dark"
      ? BRAND_DARK
      : mode === "on-light"
        ? "#FFFFFF"
        : "none";

  const iconSize = Math.round(height * 0.62);
  let iconBuf;
  if (mode === "on-dark") {
    const tmp = path.join(kitRoot, "_tmp-white-icon.png");
    await whiteVersion(source, tmp, iconSize);
    iconBuf = fs.readFileSync(tmp);
  } else {
    iconBuf = await sharp(source)
      .resize(iconSize, iconSize, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${
    actualBg !== "none"
      ? `<rect width="100%" height="100%" fill="${actualBg}"/>`
      : ""
  }
  <text x="${Math.round(width * 0.38)}" y="${Math.round(height * 0.62)}"
    font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${Math.round(
      height * 0.38,
    )}" fill="${fill}">
    <tspan font-weight="400">Mi</tspan><tspan font-weight="700">Ficha</tspan>
  </text>
</svg>`;

  const textLayer = Buffer.from(svg);
  const composed = await sharp(textLayer)
    .composite([
      {
        input: iconBuf,
        left: Math.round(width * 0.06),
        top: Math.round((height - iconSize) / 2),
      },
    ])
    .png()
    .toFile(outPng);
  console.log("Wrote", outPng, composed);
}

function writeReadme() {
  const readme = `# Kit de marca MiFicha

Exportado desde el escudo oficial del producto (\`public/brand/mificha-icon.png\`).

## Contenido

### \`01-escudo/\`
Monograma MF (azul + punto mint). Fondo transparente.

| Archivo | Uso |
|---|---|
| \`mificha-escudo.svg\` | **Vector color** (impresiones, Canva, Figma) |
| \`mificha-escudo-blanco.svg\` | **Vector** blanco + mint (fondos oscuros) |
| \`mificha-escudo-256.png\` … \`2048.png\` | Raster alta resolución |
| \`mificha-escudo-blanco-2048.png\` | Raster blanco + mint |
| \`mificha-escudo-master.png\` | Master PNG del producto |

### \`02-app-icon/\`
Escudo sobre canvas claro redondeado (perfil IG, PWA, App Store).

| Archivo | Uso |
|---|---|
| \`mificha-app-icon-1024.png\` | Perfil Instagram / App Store |
| \`mificha-app-icon-2048.png\` | Máxima resolución |

### \`03-lockup/\`
Escudo + wordmark **Mi** (regular) + **Ficha** (bold).

| Archivo | Uso |
|---|---|
| \`mificha-lockup-horizontal.svg\` | Vector sin fondo |
| \`…-on-light.svg\` / \`.png\` | Fondos claros |
| \`…-on-dark.svg\` / \`.png\` | Fondos oscuros |

### Colores

| Token | Hex |
|---|---|
| Brand | \`#1B4F8C\` |
| Brand dark | \`#0F2D52\` |
| Accent mint | \`#34D399\` |
| Canvas app icon | \`#F4F7FB\` |

## Reglas rápidas

1. No redibujar el monograma: usar estos archivos.
2. No quitar el punto mint.
3. Wordmark: Mi + **Ficha**.
4. Manual completo: [\`../manual-identidad-mificha.md\`](../manual-identidad-mificha.md)

## Regenerar

\`\`\`bash
node scripts/export-brand-kit.mjs
\`\`\`
`;
  fs.writeFileSync(path.join(kitRoot, "README.md"), readme, "utf8");
}

ensureDir(kitRoot);
const escudoDir = path.join(kitRoot, "01-escudo");
const appDir = path.join(kitRoot, "02-app-icon");
const lockupDir = path.join(kitRoot, "03-lockup");
ensureDir(escudoDir);
ensureDir(appDir);
ensureDir(lockupDir);

// Copy master + sizes
fs.copyFileSync(source, path.join(escudoDir, "mificha-escudo-master.png"));
await exportPngSizes(source, escudoDir, "mificha-escudo", [256, 512, 1024, 2048]);
await whiteVersion(source, path.join(escudoDir, "mificha-escudo-blanco-2048.png"), 2048);

await appIcon(512, path.join(appDir, "mificha-app-icon-512.png"));
await appIcon(1024, path.join(appDir, "mificha-app-icon-1024.png"));
await appIcon(2048, path.join(appDir, "mificha-app-icon-2048.png"));

await lockup({
  mode: "on-light",
  outPng: path.join(lockupDir, "mificha-lockup-horizontal-on-light.png"),
});
await lockup({
  mode: "on-dark",
  outPng: path.join(lockupDir, "mificha-lockup-horizontal-on-dark.png"),
});

// Clean SVG via Python contour / vtracer pipeline
try {
  execFileSync("python", ["scripts/_build_clean_svg.py"], {
    cwd: root,
    stdio: "inherit",
  });
  execFileSync("python", ["scripts/_finalize_svg.py"], {
    cwd: root,
    stdio: "inherit",
  });
} catch (err) {
  console.warn("SVG build failed; PNG kit still exported.", err.message);
}

function writeLockupSvg(mode, outPath) {
  const iconHref =
    mode === "on-dark"
      ? "../01-escudo/mificha-escudo-blanco.svg"
      : "../01-escudo/mificha-escudo.svg";
  const fill = mode === "on-dark" ? "#FFFFFF" : BRAND;
  const bg =
    mode === "on-dark"
      ? `<rect width="100%" height="100%" fill="${BRAND_DARK}"/>`
      : mode === "on-light"
        ? `<rect width="100%" height="100%" fill="#FFFFFF"/>`
        : "";
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="1600" height="480" viewBox="0 0 1600 480" role="img" aria-label="MiFicha">
  ${bg}
  <image x="96" y="91" width="298" height="298"
    href="${iconHref}" xlink:href="${iconHref}"/>
  <text x="460" y="300" font-family="Inter, Segoe UI, Arial, Helvetica, sans-serif"
    font-size="168" fill="${fill}">
    <tspan font-weight="400">Mi</tspan><tspan font-weight="700">Ficha</tspan>
  </text>
</svg>
`;
  fs.writeFileSync(outPath, svg, "utf8");
  console.log("Wrote", outPath);
}

writeLockupSvg(
  "on-light",
  path.join(lockupDir, "mificha-lockup-horizontal-on-light.svg"),
);
writeLockupSvg(
  "on-dark",
  path.join(lockupDir, "mificha-lockup-horizontal-on-dark.svg"),
);
writeLockupSvg(
  "transparent",
  path.join(lockupDir, "mificha-lockup-horizontal.svg"),
);

// Cleanup temps
for (const f of ["_tmp-white-icon.png"]) {
  const p = path.join(kitRoot, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

writeReadme();
console.log("\nBrand kit ready at", kitRoot);
