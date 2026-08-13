from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "runtime" / "webp" / "vfx" / "dunhuang"


def glow(size, draw_fn, blur=10):
    base = Image.new("RGBA", size, (0, 0, 0, 0))
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    draw_fn(d)
    halo = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(halo)
    base.alpha_composite(layer)
    return base


def save(img, name):
    path = OUT / name
    img.save(path, "WEBP", quality=86, method=6)
    return path


def ellipse_ring(size, name, main, accent, cracks=False, flames=False):
    w, h = size
    cx, cy = w / 2, h / 2

    def draw(d):
        for i, alpha in enumerate((48, 78, 118)):
            rx = w * (0.33 + i * 0.045)
            ry = h * (0.22 + i * 0.035)
            d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), outline=(*main, alpha), width=3 + i)
        for i in range(20):
            a = i / 20 * math.tau
            r0x, r0y = w * 0.22, h * 0.13
            r1x, r1y = w * (0.38 + (i % 3) * 0.025), h * (0.24 + (i % 2) * 0.025)
            x0, y0 = cx + math.cos(a) * r0x, cy + math.sin(a) * r0y
            x1, y1 = cx + math.cos(a) * r1x, cy + math.sin(a) * r1y
            d.line((x0, y0, x1, y1), fill=(*accent, 135), width=2)
        if cracks:
            for i in range(11):
                a = -0.35 + i * 0.065
                x0 = cx - w * 0.30 + i * w * 0.06
                y0 = cy + math.sin(i * 1.7) * h * 0.10
                pts = [(x0, y0)]
                for j in range(4):
                    pts.append((x0 + (j + 1) * w * 0.055, y0 + math.sin(i + j) * h * 0.07 + j * h * 0.015))
                d.line(pts, fill=(*accent, 150), width=2)
                d.line(pts, fill=(*main, 66), width=5)
        if flames:
            for i in range(9):
                a = i / 9 * math.tau
                x = cx + math.cos(a) * w * 0.28
                y = cy + math.sin(a) * h * 0.16
                d.polygon(
                    [
                        (x, y - h * 0.05),
                        (x + math.cos(a + 0.7) * w * 0.045, y + h * 0.02),
                        (x + math.cos(a - 0.6) * w * 0.035, y + h * 0.055),
                    ],
                    fill=(*main, 122),
                )

    return save(glow(size, draw, 12), name)


def vertical_flare(size, name):
    w, h = size
    cx, cy = w / 2, h / 2
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i in range(9):
        a = -0.6 + i * 0.15
        x = cx + math.sin(a) * w * 0.22
        d.line((x, cy + h * 0.34, cx + math.sin(a * 2) * w * 0.08, cy - h * 0.36), fill=(217, 91, 43, 95), width=8 - min(i, 5))
        d.line((x, cy + h * 0.30, cx + math.sin(a * 2) * w * 0.08, cy - h * 0.30), fill=(246, 204, 123, 130), width=2)
    for i in range(3):
        rx = w * (0.24 + i * 0.07)
        ry = h * (0.14 + i * 0.04)
        d.ellipse((cx - rx, cy + h * 0.18 - ry, cx + rx, cy + h * 0.18 + ry), outline=(69, 172, 145, 78), width=3)
    return save(glow(size, lambda gd: gd.bitmap((0, 0), img), 8), name)


def death_bloom(size, name):
    w, h = size
    cx, cy = w / 2, h / 2

    def draw(d):
        for i in range(24):
            a = i / 24 * math.tau
            r0 = w * 0.12
            r1 = w * (0.28 + (i % 4) * 0.035)
            d.line(
                (cx + math.cos(a) * r0, cy + math.sin(a) * r0 * 0.45, cx + math.cos(a) * r1, cy + math.sin(a) * r1 * 0.42),
                fill=(240, 178, 92, 138),
                width=3,
            )
        for i in range(4):
            rx = w * (0.18 + i * 0.065)
            ry = h * (0.12 + i * 0.045)
            d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), outline=(205, 58, 37, 128 - i * 20), width=5)
        for i in range(12):
            a = i / 12 * math.tau
            x = cx + math.cos(a) * w * 0.25
            y = cy + math.sin(a) * h * 0.16
            d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=(80, 184, 150, 110))

    return save(glow(size, draw, 14), name)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files = [
        ellipse_ring((512, 280), "vfx_boss_entry.webp", (218, 86, 43), (246, 201, 117), cracks=True, flames=True),
        ellipse_ring((420, 240), "vfx_boss_rupture_warning.webp", (199, 62, 42), (237, 185, 89), cracks=True, flames=False),
        ellipse_ring((460, 260), "vfx_boss_rupture_burst.webp", (228, 74, 38), (255, 220, 139), cracks=True, flames=True),
        ellipse_ring((520, 280), "vfx_boss_shockwave.webp", (78, 178, 149), (236, 180, 84), cracks=False, flames=True),
        vertical_flare((360, 420), "vfx_boss_phase_flare.webp"),
        death_bloom((520, 340), "vfx_boss_death.webp"),
    ]
    manifest = {
        "version": "0.3.4a-5-boss-vfx",
        "style": "Dunhuang cinnabar flame and bronze-green ritual marks, transparent WebP",
        "files": [p.name for p in files],
        "runtimeNotes": "Lightweight Boss-only VFX atlas. Keeps canvas fallback available, but Boss actions prefer these assets."
    }
    (OUT / "boss_vfx_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"created": [str(p.relative_to(ROOT)) for p in files]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
