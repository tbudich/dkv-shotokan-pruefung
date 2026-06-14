#!/usr/bin/env python3
"""Generate the app/PWA icon set from the Shotokan tiger + a "SHOTOKAN" wordmark.

Design: red brand band (#b91c1c) — the app's theme_color — with the Shotokan tiger
emblem (white tiger in a red circle) seated on a white circular badge, so the
emblem's own red circle never touches the red field (no clashing reds), and the
white "SHOTOKAN" wordmark below.

Source art:  branding/shotokan-tiger.png  — the "Shotokan no Tora" emblem extracted
from the official PO PDF (pdfs/PO-Shotokan-9Kyu-bis-8Dan.pdf). The traditional
Shotokan tiger, not a protected federation logo.

Requires: Pillow.

    python3 scripts/gen-icons.py

Outputs (overwrite) into public/:
    pwa-192.png, pwa-512.png, pwa-512-maskable.png, apple-touch-icon.png
and rewrites public/favicon.svg.
"""
from __future__ import annotations

import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIGER = os.path.join(ROOT, "branding", "shotokan-tiger.png")
PUBLIC = os.path.join(ROOT, "public")

RED = (185, 28, 28, 255)        # #b91c1c — matches theme_color / background band
WHITE = (255, 255, 255, 255)

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]


def load_font(px: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, px)
    raise SystemExit("No bold sans-serif font found; checked: " + ", ".join(FONT_CANDIDATES))


def tiger_disc(size: int) -> Image.Image:
    """The tiger emblem cropped to its inscribed red circle (transparent outside)."""
    src = Image.open(TIGER).convert("RGBA")
    # Square the source on its shorter side, centred, then circular-mask it.
    side = min(src.size)
    left = (src.width - side) // 2
    top = (src.height - side) // 2
    src = src.crop((left, top, left + side, top + side))

    ss = size * 4  # supersample for a smooth circle edge
    src = src.resize((ss, ss), Image.LANCZOS)
    mask = Image.new("L", (ss, ss), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, ss - 1, ss - 1], fill=255)
    src.putalpha(mask)
    return src.resize((size, size), Image.LANCZOS)


def letter_spaced(draw, xy, text, font, fill, spacing):
    """Draw center-anchored text with extra tracking."""
    widths = [draw.textlength(c, font=font) for c in text]
    total = sum(widths) + spacing * (len(text) - 1)
    cx, top = xy
    x = cx - total / 2
    for c, w in zip(text, widths):
        draw.text((x, top), c, font=font, fill=fill)
        x += w + spacing


def compose(size: int, *, corner: bool, maskable: bool, opaque: bool) -> Image.Image:
    """Build one square icon.

    corner   -> rounded-corner red field (browser/PWA standard icons)
    maskable -> keep all content inside the inner 80% safe zone
    opaque   -> flatten onto solid red (no transparency, for apple-touch-icon)
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Red field.
    if corner:
        draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=RED)
    else:
        draw.rectangle([0, 0, size - 1, size - 1], fill=RED)

    # Safe content area (maskable keeps everything within the central 80%).
    inset = size * 0.10 if maskable else size * 0.06
    area = size - 2 * inset

    # White badge in the upper part of the content area.
    disc_d = area * 0.62
    disc_cx = size / 2
    disc_cy = inset + disc_d / 2 + area * 0.02
    draw.ellipse(
        [disc_cx - disc_d / 2, disc_cy - disc_d / 2, disc_cx + disc_d / 2, disc_cy + disc_d / 2],
        fill=WHITE,
    )

    # Tiger emblem inside the badge (with a white ring around its red circle).
    tig = int(disc_d * 0.82)
    emblem = tiger_disc(tig)
    img.alpha_composite(emblem, (int(disc_cx - tig / 2), int(disc_cy - tig / 2)))

    # "SHOTOKAN" wordmark below the badge.
    font = load_font(int(area * 0.155))
    spacing = area * 0.012
    text_cy = disc_cy + disc_d / 2 + (size - (disc_cy + disc_d / 2) - inset) / 2
    ascent, descent = font.getmetrics()
    top = text_cy - (ascent + descent) / 2
    letter_spaced(draw, (size / 2, top), "SHOTOKAN", font, WHITE, spacing)

    if opaque:
        bg = Image.new("RGB", (size, size), RED[:3])
        bg.paste(img, (0, 0), img)
        return bg
    return img


def write_favicon() -> None:
    """Emblem-only favicon (text is unreadable at 16px): red rounded square,
    white disc, the tiger emblem embedded as a crisp PNG."""
    import base64
    from io import BytesIO

    emblem = tiger_disc(256)
    buf = BytesIO()
    emblem.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    d = 40  # emblem diameter within the 64-unit viewBox
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">\n'
        '  <rect width="64" height="64" rx="14" fill="#b91c1c"/>\n'
        '  <circle cx="32" cy="32" r="24" fill="#ffffff"/>\n'
        f'  <image x="{32 - d / 2:.1f}" y="{32 - d / 2:.1f}" width="{d}" height="{d}" '
        f'href="data:image/png;base64,{b64}"/>\n'
        "</svg>\n"
    )
    out = os.path.join(PUBLIC, "favicon.svg")
    with open(out, "w") as f:
        f.write(svg)
    print(f"wrote {os.path.relpath(out, ROOT)}")


def main() -> None:
    targets = [
        ("pwa-192.png", 192, dict(corner=True, maskable=False, opaque=False)),
        ("pwa-512.png", 512, dict(corner=True, maskable=False, opaque=False)),
        ("pwa-512-maskable.png", 512, dict(corner=False, maskable=True, opaque=False)),
        ("apple-touch-icon.png", 180, dict(corner=False, maskable=False, opaque=True)),
    ]
    for name, size, kw in targets:
        out = os.path.join(PUBLIC, name)
        compose(size, **kw).save(out)
        print(f"wrote {os.path.relpath(out, ROOT)} ({size}x{size})")

    write_favicon()


if __name__ == "__main__":
    main()
