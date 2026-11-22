"""Build clean professional SVG from official MiFicha icon PNG."""
from __future__ import annotations

from pathlib import Path

import numpy as np
import vtracer
from PIL import Image, ImageFilter
from skimage import measure, morphology

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/brand/mificha-icon.png"
OUT_DIR = ROOT / "docs/brand/kit/01-escudo"
BRAND = "#1B4F8C"
MINT = "#34D399"
SCALE = 4  # upsample before contour for smoother paths


def classify(arr: np.ndarray):
    a = arr[:, :, 3]
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    opaque = a > 180
    green = opaque & (g > 140) & (g > r + 25) & (g > b + 15)
    navy = opaque & ~green & (b > 70) & (r < 110)
    navy = morphology.remove_small_holes(navy, max_size=64)
    navy = morphology.remove_small_objects(navy, max_size=64)
    green = morphology.remove_small_objects(green, max_size=40)
    # light close to heal AA gaps without blobbing
    navy = morphology.binary_closing(navy, morphology.disk(1))
    return navy, green


def upsample_mask(mask: np.ndarray, scale: int) -> np.ndarray:
    h, w = mask.shape
    img = Image.fromarray((mask.astype(np.uint8) * 255), mode="L")
    img = img.resize((w * scale, h * scale), Image.NEAREST)
    # slight blur + rethreshold softens stair-steps
    img = img.filter(ImageFilter.MaxFilter(3))
    img = img.filter(ImageFilter.MinFilter(3))
    return np.array(img) > 127


def contour_to_path(contour: np.ndarray, simplify: float, scale: float) -> str:
    pts = np.fliplr(contour) / scale  # (x,y) in original coords
    if not np.allclose(pts[0], pts[-1]):
        pts = np.vstack([pts, pts[0]])
    approx = measure.approximate_polygon(pts, tolerance=simplify)
    if len(approx) < 4:
        return ""
    # drop near-duplicate closing point noise
    cmds = [f"M{approx[0, 0]:.2f} {approx[0, 1]:.2f}"]
    for x, y in approx[1:]:
        cmds.append(f"L{x:.2f} {y:.2f}")
    cmds.append("Z")
    return " ".join(cmds)


def mint_circle(green: np.ndarray) -> str:
    gys, gxs = np.where(green)
    cx = float(gxs.mean())
    cy = float(gys.mean())
    r = ((gxs.max() - gxs.min()) + (gys.max() - gys.min())) / 4.0
    return f'  <circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{MINT}"/>'


def build_svg(navy: np.ndarray, green: np.ndarray, fill: str, out: Path):
    h, w = navy.shape
    big = upsample_mask(navy, SCALE)
    # sort contours by area descending so largest shapes come first
    contours = measure.find_contours(big.astype(float), 0.5)
    scored = []
    for c in contours:
        # area proxy
        scored.append((len(c), c))
    scored.sort(key=lambda t: t[0], reverse=True)

    paths = []
    for _, c in scored:
        # simplify in original pixel units
        d = contour_to_path(c, simplify=1.8, scale=SCALE)
        if d:
            paths.append(f'  <path fill="{fill}" d="{d}"/>')

    paths.append(mint_circle(green))
    svg = (
        f'<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
        f'viewBox="0 0 {w} {h}" role="img" aria-label="MiFicha">\n'
        f"  <title>MiFicha</title>\n"
        + "\n".join(paths)
        + "\n</svg>\n"
    )
    out.write_text(svg, encoding="utf-8")
    print("Wrote", out.name, "bytes", out.stat().st_size, "shapes", len(paths))


def build_vtracer_color(navy: np.ndarray, green: np.ndarray, out: Path, fill: str):
    h, w = navy.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    nh = fill.lstrip("#")
    nr, ng, nb = int(nh[0:2], 16), int(nh[2:4], 16), int(nh[4:6], 16)
    rgba[navy] = [nr, ng, nb, 255]
    rgba[green] = [52, 211, 153, 255]
    # upsample for cleaner trace
    img = Image.fromarray(rgba).resize((w * 2, h * 2), Image.NEAREST)
    tmp = OUT_DIR / "_vtrace_src.png"
    img.save(tmp)
    vtracer.convert_image_to_svg_py(
        str(tmp),
        str(out),
        colormode="color",
        hierarchical="stacked",
        mode="polygon",
        filter_speckle=12,
        color_precision=4,
        layer_difference=48,
        corner_threshold=40,
        length_threshold=4.0,
        max_iterations=10,
        splice_threshold=40,
        path_precision=2,
    )
    # normalize viewBox to 512
    text = out.read_text(encoding="utf-8")
    text = text.replace(f'width="{w * 2}"', f'width="{w}"')
    text = text.replace(f'height="{h * 2}"', f'height="{h}"')
    if "viewBox" not in text:
        text = text.replace(
            f'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}">',
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w * 2} {h * 2}">',
        )
    out.write_text(text, encoding="utf-8")
    print("Wrote", out.name, "bytes", out.stat().st_size)
    tmp.unlink(missing_ok=True)


def main():
    arr = np.array(Image.open(SRC).convert("RGBA"))
    navy, green = classify(arr)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Contour draft kept only as intermediate; official file comes from vtracer + finalize
    build_svg(navy, green, BRAND, OUT_DIR / "_contour-draft.svg")
    build_vtracer_color(navy, green, OUT_DIR / "mificha-escudo-traced.svg", BRAND)

    for name in (
        "_binary.png",
        "_binary-1024.png",
        "_navy_mask.png",
        "_contour-draft.svg",
        "mificha-escudo-preview.png",
        "mificha-escudo-blanco-preview.png",
        "mificha-escudo-traced-preview.png",
        "_qa-color.png",
        "_qa-white.png",
    ):
        p = OUT_DIR / name
        if p.exists():
            p.unlink()


if __name__ == "__main__":
    main()
