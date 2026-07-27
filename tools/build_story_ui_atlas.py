from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "runtime" / "webp" / "ui" / "story"
PREVIEW = OUT / "preview_story_ui_atlas.png"


def ensure(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def noise(size: tuple[int, int], seed: int, alpha: int = 24) -> Image.Image:
    rng = random.Random(seed)
    w, h = size
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    px = img.load()
    for y in range(h):
        for x in range(w):
            n = rng.randint(-16, 18)
            px[x, y] = (178 + n, 144 + n // 2, 91 + n // 3, rng.randint(0, alpha))
    return img.filter(ImageFilter.GaussianBlur(0.45))


def parchment(size: tuple[int, int], seed: int, base=(184, 142, 84, 255)) -> Image.Image:
    rng = random.Random(seed)
    w, h = size
    img = Image.new("RGBA", size, base)
    img.alpha_composite(noise(size, seed + 1, 26))
    draw = ImageDraw.Draw(img, "RGBA")
    for _ in range(34):
        x = rng.randint(-90, w + 90)
        y = rng.randint(0, h)
        col = rng.choice([(52, 89, 78, 16), (139, 54, 39, 12), (224, 177, 86, 16), (37, 26, 20, 8)])
        draw.arc((x - 150, y - 22, x + 150, y + 24), 190, 348, fill=col, width=1)
    for _ in range(58):
        x = rng.randint(0, w)
        y = rng.randint(0, h)
        r = rng.randint(1, 3)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(70, 47, 31, rng.randint(5, 13)))
    return img


def soft_shadow(size: tuple[int, int], mask: Image.Image, offset=(0, 18), blur=24) -> Image.Image:
    w, h = size
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    layer = Image.new("RGBA", size, (0, 0, 0, 72))
    shifted = Image.new("L", size, 0)
    shifted.paste(mask, offset)
    shadow.alpha_composite(Image.composite(layer, Image.new("RGBA", size, (0, 0, 0, 0)), shifted).filter(ImageFilter.GaussianBlur(blur)))
    return shadow


def panel_mask(size: tuple[int, int]) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    cut = 58
    pts = [
        (cut, 18), (w - cut, 18), (w - 22, cut), (w - 22, h - cut),
        (w - cut, h - 18), (cut, h - 18), (22, h - cut), (22, cut)
    ]
    d.polygon(pts, fill=255)
    return mask.filter(ImageFilter.GaussianBlur(0.25))


def draw_cloud_band(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], flip=False) -> None:
    x0, y0, x1, y1 = box
    w = x1 - x0
    h = y1 - y0
    for i in range(6):
        t = i / 5
        y = y0 + h * (0.25 + 0.5 * t)
        col = (51, 91, 80, 82 - i * 7) if i % 2 else (132, 54, 42, 64 - i * 5)
        for j in range(3):
            ox = x0 + w * (0.14 + j * 0.26)
            if flip:
                ox = x1 - (ox - x0)
            draw.arc((ox - 86, y - 28, ox + 92, y + 30), 188, 350, fill=col, width=3)


def draw_lotus(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: float, alpha=150) -> None:
    for i in range(10):
        a = i * math.tau / 10
        r1 = 24 * scale
        r2 = 58 * scale
        x = cx + math.cos(a) * r1
        y = cy + math.sin(a) * r1 * 0.56
        x2 = cx + math.cos(a) * r2
        y2 = cy + math.sin(a) * r2 * 0.52
        col = (54, 104, 84, alpha) if i % 2 else (142, 57, 43, alpha)
        draw.polygon([(cx, cy), (x - 10 * scale, y + 12 * scale), (x2, y2), (x + 10 * scale, y + 12 * scale)], fill=col)
    draw.ellipse((cx - 28 * scale, cy - 18 * scale, cx + 28 * scale, cy + 18 * scale), fill=(216, 166, 77, alpha + 20))


def story_panel() -> Image.Image:
    size = (900, 386)
    w, h = size
    mask = panel_mask(size)
    body = parchment(size, 3101, (190, 145, 84, 255))
    img = soft_shadow(size, mask)
    img.alpha_composite(Image.composite(body, Image.new("RGBA", size, (0, 0, 0, 0)), mask))
    draw = ImageDraw.Draw(img, "RGBA")

    # side scroll rods
    for x in (34, w - 62):
        draw.rounded_rectangle((x, 34, x + 28, h - 34), radius=13, fill=(116, 76, 44, 226), outline=(223, 175, 88, 175), width=2)
        draw.rectangle((x + 8, 46, x + 20, h - 46), fill=(218, 178, 105, 62))
        for yy in (22, h - 54):
            draw.ellipse((x - 10, yy, x + 38, yy + 52), fill=(143, 88, 45, 230), outline=(229, 184, 91, 180), width=2)

    # fresco border
    for inset, col, width in [
        (28, (64, 41, 26, 150), 3),
        (38, (218, 168, 79, 170), 2),
        (50, (55, 101, 86, 92), 2),
        (64, (139, 54, 42, 62), 1),
    ]:
        draw.rounded_rectangle((inset, inset, w - inset, h - inset), radius=22, outline=col, width=width)

    draw_cloud_band(draw, (70, 32, w - 70, 92))
    draw_cloud_band(draw, (70, h - 92, w - 70, h - 34), flip=True)
    draw_lotus(draw, w // 2, 44, 0.64, 95)
    draw_lotus(draw, w // 2, h - 42, 0.54, 86)

    # opaque reading area; story text must not compete with the battlefield.
    draw.rounded_rectangle((120, 104, w - 120, h - 92), radius=18, fill=(226, 190, 124, 248), outline=(55, 101, 86, 72), width=2)
    for y in (158, 206, 254):
        draw.arc((134, y - 28, w - 134, y + 28), 190, 350, fill=(55, 101, 86, 24), width=1)
    return img


def story_panel_mobile() -> Image.Image:
    size = (430, 560)
    w, h = size
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((18, 18, w - 18, h - 18), radius=32, fill=255)
    body = parchment(size, 3301, (190, 145, 84, 255))
    img = soft_shadow(size, mask, offset=(0, 14), blur=20)
    img.alpha_composite(Image.composite(body, Image.new("RGBA", size, (0, 0, 0, 0)), mask))
    draw = ImageDraw.Draw(img, "RGBA")
    for inset, col, width in [
        (26, (64, 41, 26, 150), 3),
        (36, (218, 168, 79, 170), 2),
        (48, (55, 101, 86, 92), 2),
        (60, (139, 54, 42, 62), 1),
    ]:
        draw.rounded_rectangle((inset, inset, w - inset, h - inset), radius=26, outline=col, width=width)
    draw_cloud_band(draw, (54, 42, w - 54, 112))
    draw_cloud_band(draw, (54, h - 118, w - 54, h - 48), flip=True)
    draw_lotus(draw, w // 2, 50, 0.54, 90)
    draw_lotus(draw, w // 2, h - 46, 0.48, 82)
    draw.rounded_rectangle((56, 142, w - 56, h - 120), radius=18, fill=(226, 190, 124, 248), outline=(55, 101, 86, 72), width=2)
    for y in range(202, h - 160, 48):
        draw.arc((70, y - 22, w - 70, y + 24), 190, 350, fill=(55, 101, 86, 24), width=1)
    return img


def title_plaque() -> Image.Image:
    size = (390, 88)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    pts = [(48, 12), (342, 12), (380, 44), (342, 76), (48, 76), (10, 44)]
    draw.polygon(pts, fill=(82, 46, 28, 238), outline=(224, 175, 84, 205))
    draw.line((74, 44, 316, 44), fill=(224, 175, 84, 115), width=2)
    draw_cloud_band(draw, (40, 18, 350, 70))
    draw_lotus(draw, 42, 44, 0.28, 150)
    draw_lotus(draw, 348, 44, 0.28, 150)
    return img


def story_button() -> Image.Image:
    size = (220, 66)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rounded_rectangle((4, 5, 216, 61), radius=12, fill=(121, 66, 35, 245), outline=(237, 190, 92, 225), width=2)
    draw.rounded_rectangle((14, 13, 206, 53), radius=8, outline=(55, 105, 87, 120), width=2)
    draw.line((34, 33, 186, 33), fill=(241, 198, 99, 95), width=2)
    draw_lotus(draw, 22, 33, 0.22, 135)
    draw_lotus(draw, 198, 33, 0.22, 135)
    return img


def story_divider() -> Image.Image:
    size = (560, 42)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.line((40, 22, 520, 22), fill=(77, 114, 96, 110), width=2)
    for x in (54, 506):
        draw.arc((x - 36, 7, x + 36, 37), 190, 350, fill=(140, 56, 42, 92), width=2)
    draw_lotus(draw, 280, 22, 0.28, 135)
    return img


def save(img: Image.Image, name: str, quality=84) -> dict:
    ensure(OUT)
    path = OUT / f"{name}.webp"
    img.save(path, "WEBP", quality=quality, method=6)
    return {
        "id": name,
        "path": path.relative_to(ROOT).as_posix(),
        "size": list(img.size),
        "bytes": path.stat().st_size,
    }


def preview(records: list[dict]) -> None:
    canvas = Image.new("RGBA", (1180, 720), (32, 27, 25, 255))
    bg = parchment((1180, 720), 909, (55, 50, 48, 255))
    canvas.alpha_composite(bg)
    x, y = 140, 120
    for item in records:
        img = Image.open(ROOT / item["path"]).convert("RGBA")
        canvas.alpha_composite(img, (x, y))
        y += img.height + 36
        if y > 560:
            x += 640
            y = 130
    canvas.save(PREVIEW)


def main() -> None:
    records = [
        save(story_panel(), "story_panel", 86),
        save(story_panel_mobile(), "story_panel_mobile", 86),
        save(title_plaque(), "story_title_plaque", 84),
        save(story_button(), "story_button", 84),
        save(story_divider(), "story_divider", 84),
    ]
    (OUT / "manifest.json").write_text(json.dumps({"version": "0.3.2-story-ui-atlas", "assets": records}, ensure_ascii=False, indent=2), encoding="utf-8")
    preview(records)
    print(json.dumps({"assets": records, "preview": PREVIEW.relative_to(ROOT).as_posix()}, ensure_ascii=False))


if __name__ == "__main__":
    main()
