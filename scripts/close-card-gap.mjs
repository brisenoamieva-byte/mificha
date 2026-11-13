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

let cardBottom = 0;
for (let y = Math.floor(height * 0.25); y < Math.floor(height * 0.65); y++) {
  for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x++) {
    const i = (y * width + x) * channels;
    if (isCardOrange(data[i], data[i + 1], data[i + 2])) {
      if (y > cardBottom) cardBottom = y;
    }
  }
}

let firstTeal = height;
for (let y = cardBottom; y < height; y++) {
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

const desiredGap = Math.round(28 * s);
const targetTop = cardBottom + desiredGap;
const shift = firstTeal - targetTop;

console.log({ cardBottom, firstTeal, desiredGap, shift });

if (shift < 8) {
  console.log("gap already small");
  process.exit(0);
}

const lowerH = height - firstTeal;
const lower = await sharp(src)
  .extract({ left: 0, top: firstTeal, width, height: lowerH })
  .toBuffer();

const filler = await sharp({
  create: {
    width,
    height: shift,
    channels: 3,
    background: { r: 8, g: 18, b: 34 },
  },
})
  .jpeg()
  .toBuffer();

await sharp(src)
  .composite([
    { input: filler, top: targetTop, left: 0 },
    { input: lower, top: targetTop, left: 0 },
    // bottom strip left empty after shift — fill with dark
    {
      input: await sharp({
        create: {
          width,
          height: shift,
          channels: 3,
          background: { r: 4, g: 8, b: 16 },
        },
      })
        .png()
        .toBuffer(),
      top: height - shift,
      left: 0,
    },
  ])
  .jpeg({ quality: 93 })
  .toFile(out);

renameSync(out, src);
console.log("content pulled up");
