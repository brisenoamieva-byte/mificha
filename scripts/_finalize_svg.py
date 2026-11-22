"""Promote best SVG variant and build white version."""
from pathlib import Path
import re

OUT = Path(__file__).resolve().parents[1] / "docs/brand/kit/01-escudo"
traced = OUT / "mificha-escudo-traced.svg"
official = OUT / "mificha-escudo.svg"
white_out = OUT / "mificha-escudo-blanco.svg"

text = traced.read_text(encoding="utf-8")
# Ensure valid XML + accessible title inside <svg>
if "<title>" not in text:
    text = text.replace(
        "<svg ",
        '<svg role="img" aria-label="MiFicha" ',
        1,
    )
    text = re.sub(
        r"(<svg[^>]*>)",
        r'\1\n  <title>MiFicha</title>',
        text,
        count=1,
    )

official.write_text(text, encoding="utf-8")
print("Wrote", official.name, "bytes", official.stat().st_size)


def to_white_if_navy(m: re.Match) -> str:
    h = m.group(1).lstrip("#")
    if len(h) != 6:
        return m.group(0)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    if g > 150 and g > r + 20 and g > b + 10:
        return m.group(0)  # keep mint
    if b >= r and b > 60 and r < 130:
        return 'fill="#FFFFFF"'
    if max(r, g, b) < 90:
        return 'fill="#FFFFFF"'
    return m.group(0)


white = re.sub(r'fill="(#[0-9A-Fa-f]{6})"', to_white_if_navy, text)
white_out.write_text(white, encoding="utf-8")
print("Wrote", white_out.name, "bytes", white_out.stat().st_size)

# Drop redundant traced duplicate + temps
for name in (
    "mificha-escudo-traced.svg",
    "_contour-draft.svg",
    "_qa-color.png",
    "_qa-white.png",
):
    p = OUT / name
    if p.exists():
        p.unlink()
