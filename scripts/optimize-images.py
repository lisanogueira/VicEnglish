"""
Gera as versões otimizadas das fotos da Vic + a imagem de compartilhamento (Open Graph).

Uso:  python scripts/optimize-images.py
Requer: Pillow >= 11 (com suporte a AVIF).

Para trocar a foto: substitua assets/img/source/vic-original.png e ajuste os
recortes em CROPS (coordenadas em pixels da imagem original).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/img/source/vic-original.png"
OUT = ROOT / "assets/img"
FONTS = ROOT / "assets/fonts"

# nome -> (caixa de recorte (x0, y0, x1, y1), larguras geradas)
CROPS = {
    "vic-hero": ((0, 30, 1066, 1363), (480, 760, 1066)),   # 4:5, corpo + rosto
    "vic-portrait": ((190, 150, 850, 1030), (440, 660)),   # 3:4, rosto
}

MAGENTA = (229, 0, 125)
INK = (21, 21, 21)
PAPER = (255, 249, 247)


def export(img: Image.Image, name: str, widths) -> None:
    for w in widths:
        h = round(img.height * w / img.width)
        r = img.resize((w, h), Image.LANCZOS)
        r.save(OUT / f"{name}-{w}.avif", quality=58, speed=4)
        r.save(OUT / f"{name}-{w}.webp", quality=78, method=6)
    # JPEG só na maior largura, como fallback universal
    img.resize((widths[-1], round(img.height * widths[-1] / img.width)), Image.LANCZOS) \
       .save(OUT / f"{name}.jpg", quality=80, optimize=True, progressive=True)


def font(file: str, size: int, weight=None, width=None) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(str(FONTS / file), size)
    if weight is not None:
        f.set_variation_by_axes([weight, width] if width is not None else [weight])
    return f


def og_image(photo: Image.Image) -> None:
    W, H = 1200, 630
    og = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(og)

    # Coluna da foto à direita, com faixa magenta atrás
    d.rectangle((W - 450, 0, W, H), fill=MAGENTA)
    p = photo.crop((110, 60, 960, 1180))
    p = p.resize((round(p.width * H / p.height), H), Image.LANCZOS)
    og.paste(p, (W - 420, 0))

    archivo = lambda s, wg, wd: font("archivo-var.woff2", s, wg, wd)
    d.text((72, 92), "LET'S", font=archivo(64, 800, 125), fill=INK)
    d.text((66, 160), "TALK", font=archivo(184, 900, 125), fill=None,
           stroke_width=3, stroke_fill=MAGENTA)
    d.text((76, 372), "with Vic", font=font("instrument-serif-italic.woff2", 76), fill=MAGENTA)
    d.text((78, 500), "Aulas de conversação em inglês · 100% online",
           font=font("instrument-sans-var.woff2", 28, 500, 100), fill=INK)
    og.save(OUT / "og-image.jpg", quality=86, optimize=True)


def touch_icon() -> None:
    icon = Image.new("RGB", (180, 180), MAGENTA)
    d = ImageDraw.Draw(icon)
    d.text((90, 92), "talk", font=font("archivo-var.woff2", 50, 900, 112),
           fill=PAPER, anchor="mm")
    icon.save(ROOT / "apple-touch-icon.png", optimize=True)


def main() -> None:
    src = Image.open(SRC).convert("RGB")
    for name, (box, widths) in CROPS.items():
        export(src.crop(box), name, widths)
    og_image(src)
    touch_icon()
    for f in sorted(OUT.glob("*.*")):
        print(f"{f.name:28} {f.stat().st_size / 1024:7.1f} KB")


if __name__ == "__main__":
    main()
