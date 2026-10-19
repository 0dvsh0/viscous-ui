"""Generate the social preview and app icons.

This is a one-off asset script, not part of the deploy build. It needs Pillow:
    python -m pip install pillow
Run from the repository root:
    python scripts/generate-assets.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
ICONS = ASSETS / "icons"
ASSETS.mkdir(exist_ok=True)
ICONS.mkdir(exist_ok=True)

FG = "#f4f4f4"
MUTED = "#9a9a9a"
SUBTLE = "#6b6b6b"
BG = "#0a0a0a"


def font(name, size):
    candidates = [
        Path("C:/Windows/Fonts") / name,
        Path("/usr/share/fonts/truetype/dejavu") / name,
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def round_rect(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def logo_layer(size, scale=1.0):
    """Two blobs, blurred and thresholded to mimic the SVG goo filter."""
    layer = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(layer)
    r1 = int(size * 0.29 * scale)
    r2 = int(size * 0.19 * scale)
    d.ellipse((int(size * 0.09), int(size * 0.25), int(size * 0.09) + 2 * r1, int(size * 0.25) + 2 * r1), fill=255)
    d.ellipse((int(size * 0.46), int(size * 0.16), int(size * 0.46) + 2 * r2, int(size * 0.16) + 2 * r2), fill=255)
    layer = layer.filter(ImageFilter.GaussianBlur(size * 0.035))
    return layer.point(lambda p: 255 if p > 132 else 0)


def make_og():
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)

    # faint grid
    for x in range(0, w, 64):
        d.line((x, 0, x, h), fill="#151515", width=1)
    for y in range(0, h, 64):
        d.line((0, y, w, y), fill="#151515", width=1)

    # glow + logo
    glow = Image.new("RGB", (w, h), BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse((740, 70, 1160, 490), fill="#2a2a2a")
    gd.ellipse((900, 260, 1130, 490), fill="#3a3a3a")
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    img = Image.blend(img, glow, 0.7)
    d = ImageDraw.Draw(img)

    logo = logo_layer(280, 0.92)
    white = Image.new("RGB", (280, 280), FG)
    img.paste(white, (850, 100), logo)

    # wordmark
    f_brand = font("segoeuib.ttf", 92)
    f_mono = font("consola.ttf", 24)
    f_title = font("segoeuib.ttf", 50)
    f_body = font("segoeui.ttf", 25)
    d.text((80, 132), "Viscous", font=f_brand, fill=FG)
    d.text((415, 178), "/ui", font=f_brand, fill=MUTED)
    d.text((84, 258), "Interfaces that flow like ink.", font=f_title, fill=FG)
    d.text((86, 342), "Gooey, physically-inspired React components.", font=f_body, fill=MUTED)
    d.text((86, 382), "One SVG filter. Native semantics. CSS-only motion.", font=f_body, fill=MUTED)

    # chips
    x = 86
    for label in ["MIT", "ACCESSIBLE", "NO RUNTIME", "21 COMPONENTS"]:
        tw = d.textlength(label, font=f_mono)
        round_rect(d, (x, 462, x + tw + 28, 502), 20, "#161616")
        d.text((x + 14, 471), label, font=f_mono, fill=FG)
        x += tw + 42

    d.text((86, 566), "github.com/0dvsh0/viscous-ui", font=f_mono, fill=SUBTLE)
    d.text((1010, 566), "v1.0.0", font=f_mono, fill=SUBTLE)

    img.save(ASSETS / "og.png", optimize=True)
    print("wrote", ASSETS / "og.png")


def make_icon(size, path, padding=0.16):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    round_rect(d, (0, 0, size, size), int(size * 0.22), BG)
    inner = int(size * (1 - padding * 2))
    logo = logo_layer(inner, 1.0)
    white = Image.new("RGB", (inner, inner), FG)
    img.paste(white, (int(size * padding), int(size * padding)), logo)
    img.save(path, optimize=True)
    print("wrote", path)


make_og()
make_icon(180, ICONS / "apple-touch-icon.png")
make_icon(192, ICONS / "icon-192.png")
make_icon(512, ICONS / "icon-512.png")
