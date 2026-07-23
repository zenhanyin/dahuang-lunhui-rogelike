from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MAPS = ROOT / "assets" / "maps"


def make_runtime_map(name: str, crop: tuple[int, int, int, int], tint: tuple[int, int, int, int]) -> None:
    src = Image.open(MAPS / f"{name}-final.webp").convert("RGBA")
    base = src.crop(crop).resize((1280, 720), Image.Resampling.BICUBIC)
    base = ImageEnhance.Contrast(base).enhance(0.88)
    base = ImageEnhance.Color(base).enhance(0.9)
    wash = Image.new("RGBA", base.size, tint)
    base = Image.alpha_composite(base, wash)

    vignette = Image.new("L", base.size, 0)
    px = vignette.load()
    cx, cy = base.width / 2, base.height / 2
    max_d = (cx * cx + cy * cy) ** 0.5
    for y in range(base.height):
        for x in range(base.width):
            d = (((x - cx) ** 2 + (y - cy) ** 2) ** 0.5) / max_d
            px[x, y] = int(max(0, min(120, (d - 0.34) * 180)))
    shade = Image.new("RGBA", base.size, (12, 8, 7, 0))
    shade.putalpha(vignette.filter(ImageFilter.GaussianBlur(22)))
    base = Image.alpha_composite(base, shade)
    base.save(MAPS / f"{name}-runtime.webp", "WEBP", quality=84, method=6)


make_runtime_map("qingqiu", (170, 112, 1110, 615), (42, 28, 52, 38))
make_runtime_map("wilds", (170, 112, 1110, 615), (52, 39, 22, 34))
