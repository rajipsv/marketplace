"""Regenerate app icons from the brand initial. Run after changing the brand name:
    python scripts/generate-icons.py G
Writes public/icons/*.png, src/app/apple-icon.png and src/app/favicon.ico.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

LETTER = (sys.argv[1] if len(sys.argv) > 1 else "G")[:1].upper()
SAFFRON, INK, IVORY = (242, 163, 58), (42, 26, 5), (255, 249, 240)
ROOT = Path(__file__).resolve().parent.parent
FONTS = ["C:/Windows/Fonts/georgiab.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", "/Library/Fonts/Georgia Bold.ttf"]


def font(size):
    for f in FONTS:
        if Path(f).exists():
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def icon(size, maskable=False, round_=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if maskable:  # full-bleed background; glyph kept inside the 80% safe zone
        d.rectangle([0, 0, size, size], fill=SAFFRON)
        glyph = int(size * 0.46)
    elif round_:
        d.ellipse([0, 0, size - 1, size - 1], fill=SAFFRON)
        glyph = int(size * 0.62)
    else:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=SAFFRON)
        glyph = int(size * 0.6)
    f = font(glyph)
    box = d.textbbox((0, 0), LETTER, font=f)
    w, h = box[2] - box[0], box[3] - box[1]
    d.text(((size - w) / 2 - box[0], (size - h) / 2 - box[1]), LETTER, font=f, fill=INK)
    return img


(ROOT / "public/icons").mkdir(parents=True, exist_ok=True)
icon(192).save(ROOT / "public/icons/icon-192.png")
icon(512).save(ROOT / "public/icons/icon-512.png")
icon(512, maskable=True).save(ROOT / "public/icons/maskable-512.png")
apple = Image.new("RGB", (180, 180), IVORY)
apple.paste(icon(180, round_=False), (0, 0), icon(180, round_=False))
apple.save(ROOT / "src/app/apple-icon.png")
icon(256).save(ROOT / "src/app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print(f"Icons generated for '{LETTER}'")
