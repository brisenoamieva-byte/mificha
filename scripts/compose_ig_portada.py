"""Instagram portada nítida: render 2× + JPEG 4:4:4 + logo oficial."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(r"C:\Users\brise\.cursor\projects\d-mificha\assets")
OUT_DIR = ROOT / "public" / "marketing" / "instagram"

PITCH_CANDIDATES = [
    ROOT / "public" / "marketing" / "instagram" / "stadium-unsplash-src.jpg",
    ROOT / "public" / "marketing" / "instagram" / "mificha-stadium-bg-hires.jpg",
    ASSETS / "mificha-stadium-pitch-hires.jpg",
    ASSETS / "mificha-stadium-bg-4k.jpg",
    ROOT / "public" / "marketing" / "flyer-stadium-bg.jpg",
    ASSETS / "mificha-pitch-single-goal-only.jpg",
]
BALL = ASSETS / "mificha-soccer-ball-cut.jpg"
LOGO = ROOT / "public" / "brand" / "mificha-icon.png"

SCALE = 2
SIZE = 1080 * SCALE  # 2160
FINAL = 1080
NAVY = (15, 45, 82)
MINT = (52, 211, 153)
WHITE = (255, 255, 255)


def font(path: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def cover(im: Image.Image, size: int, bias_top: float = 0.12) -> Image.Image:
    w, h = im.size
    scale = max(size / w, size / h)
    nw, nh = int(w * scale), int(h * scale)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - size) // 2
    top = max(0, min(nh - size, (nh - size) // 2 + int(size * bias_top)))
    return im.crop((left, top, left + size, top + size))


def extract_ball(path: Path, diameter: int) -> Image.Image:
    src = Image.open(path).convert("RGBA")
    w, h = src.size
    side = int(min(w, h) * 0.72)
    cx, cy = w // 2, int(h * 0.52)
    box = (cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)
    crop = src.crop(box).resize((diameter, diameter), Image.Resampling.LANCZOS)
    mask = Image.new("L", (diameter, diameter), 0)
    md = ImageDraw.Draw(mask)
    inset = int(diameter * 0.04)
    md.ellipse((inset, inset, diameter - inset - 1, diameter - inset - 1), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(max(1, SCALE)))
    out = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    out.paste(crop, (0, 0))
    out.putalpha(mask)
    return out


def white_logo(path: Path, target_h: int) -> Image.Image:
    logo = Image.open(path).convert("RGBA")
    # Scale from native 512 — never upscale past source
    scale = min(1.0, target_h / logo.height) if logo.height >= target_h else target_h / logo.height
    nh = max(1, int(logo.height * scale))
    nw = max(1, int(logo.width * scale))
    logo = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    px = logo.load()
    for y in range(logo.height):
        for x in range(logo.width):
            r, g, b, a = px[x, y]
            if a < 20:
                continue
            is_green = g > 120 and g > r + 25 and g > b + 15
            if is_green:
                px[x, y] = (52, 211, 153, a)
            else:
                px[x, y] = (255, 255, 255, a)
    return logo


def save_sharp_jpeg(im: Image.Image, path: Path) -> None:
    # subsampling=0 => 4:4:4 — crítico para tipografía nítida
    im.save(path, format="JPEG", quality=98, subsampling=0, optimize=True)


def main() -> None:
    pitch_path = next(p for p in PITCH_CANDIDATES if p.exists())
    photo = cover(Image.open(pitch_path).convert("RGB"), SIZE, bias_top=0.12)
    photo = ImageEnhance.Contrast(photo).enhance(1.06)
    photo = ImageEnhance.Brightness(photo).enhance(0.9)
    photo = ImageEnhance.Color(photo).enhance(0.95)
    canvas = photo.convert("RGBA")

    # Scrim top-left for text
    grade = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grade)
    for y in range(int(SIZE * 0.58)):
        tv = 1 - y / (SIZE * 0.58)
        for step in range(0, int(SIZE * 0.72), 4):
            th = 1 - step / (SIZE * 0.72)
            a = int(180 * max(tv * 0.9, th * 0.55))
            if a > 0:
                gd.rectangle((step, y, step + 4, y + 1), fill=(8, 22, 42, a))
    canvas = Image.alpha_composite(canvas, grade)

    footer_h = int(SIZE * 0.155)
    footer_top = SIZE - footer_h
    foot = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    fd = ImageDraw.Draw(foot)
    fd.rectangle((0, footer_top, SIZE, SIZE), fill=(*NAVY, 255))
    fade = 100 * SCALE // 2
    for i in range(fade):
        a = int(255 * (i / fade))
        fd.line([(0, footer_top - fade + i), (SIZE, footer_top - fade + i)], fill=(*NAVY, a))
    canvas = Image.alpha_composite(canvas, foot)

    if BALL.exists():
        ball = extract_ball(BALL, diameter=int(SIZE * 0.24))
        shadow = Image.new("RGBA", (ball.width + 50, 40), (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.ellipse((8, 8, ball.width + 30, 32), fill=(0, 0, 0, 110))
        shadow = shadow.filter(ImageFilter.GaussianBlur(8))
        bx = SIZE - ball.width - 80
        by = footer_top - ball.height + 36
        canvas.alpha_composite(shadow, (bx - 8, by + ball.height - 30))
        canvas.alpha_composite(ball, (bx, by))

    draw = ImageDraw.Draw(canvas)
    # 2× font sizes
    font1 = font(r"C:\Windows\Fonts\seguibl.ttf", 164)
    font2 = font(r"C:\Windows\Fonts\seguibl.ttf", 152)
    font_sub = font(r"C:\Windows\Fonts\segoeui.ttf", 48)
    font_mi = font(r"C:\Windows\Fonts\segoeuisl.ttf", 80)
    font_fi = font(r"C:\Windows\Fonts\segoeuib.ttf", 80)

    x, y = 112, 240
    last_line_bottom = y
    for text, fnt in (
        ("Tu hijo juega.", font1),
        ("¿Dónde está", font2),
        ("su ficha?", font2),
    ):
        # Soft shadow (scaled)
        for ox, oy in ((0, 4), (0, 8)):
            draw.text((x + ox, y + oy), text, font=fnt, fill=(0, 0, 0, 110))
        draw.text((x, y), text, font=fnt, fill=WHITE)
        last_line_bottom = draw.textbbox((x, y), text, font=fnt)[3]
        y = last_line_bottom + 16

    # Mint rule under the headline block (not mid-word)
    rule_y = last_line_bottom + 36
    draw.rounded_rectangle((x, rule_y, x + 264, rule_y + 10), radius=4, fill=MINT)
    draw.text(
        (x, rule_y + 48),
        "Ficha digital gratis  ·  Llenamos la base de México",
        font=font_sub,
        fill=(220, 228, 236, 255),
    )

    logo = white_logo(LOGO, int(SIZE * 0.072))
    mi, fi = "Mi", "Ficha"
    mi_b = draw.textbbox((0, 0), mi, font=font_mi)
    fi_b = draw.textbbox((0, 0), fi, font=font_fi)
    mi_w = mi_b[2] - mi_b[0]
    mi_h = mi_b[3] - mi_b[1]
    fi_w = fi_b[2] - fi_b[0]
    fi_h = fi_b[3] - fi_b[1]
    gap = 32
    lock_w = logo.width + gap + mi_w + fi_w
    lx = (SIZE - lock_w) // 2
    ly = footer_top + (footer_h - logo.height) // 2
    canvas.alpha_composite(logo, (lx, ly))
    draw = ImageDraw.Draw(canvas)
    tx = lx + logo.width + gap
    ty = ly + (logo.height - max(mi_h, fi_h)) // 2 - 4
    draw.text((tx, ty), mi, font=font_mi, fill=WHITE)
    draw.text((tx + mi_w, ty), fi, font=font_fi, fill=WHITE)

    hi = canvas.convert("RGB")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Master 2160
    save_sharp_jpeg(hi, OUT_DIR / "mificha-ig-post-portada-2160.jpg")
    hi.save(OUT_DIR / "mificha-ig-post-portada-2160.png", optimize=True)

    # Feed 1080 from 2× downscale
    feed = hi.resize((FINAL, FINAL), Image.Resampling.LANCZOS)
    save_sharp_jpeg(feed, OUT_DIR / "mificha-ig-post-portada.jpg")
    save_sharp_jpeg(feed, OUT_DIR / "mificha-ig-post-01-pauta.jpg")
    feed.save(OUT_DIR / "mificha-ig-post-portada.png", optimize=True)

    for name in (
        "mificha-ig-post-portada.jpg",
        "mificha-ig-post-portada.png",
        "mificha-ig-post-portada-2160.jpg",
    ):
        p = OUT_DIR / name
        print(p.name, p.stat().st_size, Image.open(p).size)


if __name__ == "__main__":
    main()
