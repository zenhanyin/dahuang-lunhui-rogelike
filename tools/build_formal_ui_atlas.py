from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "generated" / "formal-ui-atlas" / "v0.3.3"


def ensure(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save(img: Image.Image, name: str, quality: int = 84) -> dict:
    ensure(OUT)
    path = OUT / f"{name}.webp"
    img.save(path, "WEBP", quality=quality, method=6)
    return {
        "id": name,
        "path": path.relative_to(ROOT).as_posix(),
        "size": list(img.size),
        "bytes": path.stat().st_size,
    }


def noise_layer(size: tuple[int, int], seed: int, alpha: int = 34) -> Image.Image:
    rng = random.Random(seed)
    w, h = size
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    px = img.load()
    for y in range(h):
        for x in range(w):
            n = rng.randint(-18, 18)
            base = 170 + n
            px[x, y] = (base, max(0, base - 12), max(0, base - 44), rng.randint(0, alpha))
    return img.filter(ImageFilter.GaussianBlur(0.35))


def parchment(size: tuple[int, int], seed: int, base=(177, 134, 76, 242)) -> Image.Image:
    rng = random.Random(seed)
    w, h = size
    img = Image.new("RGBA", size, base)
    draw = ImageDraw.Draw(img, "RGBA")
    img.alpha_composite(noise_layer(size, seed + 11, 32))
    for _ in range(46):
        x = rng.randint(-80, w + 80)
        y = rng.randint(0, h)
        color = rng.choice([(57, 86, 74, 34), (122, 49, 36, 25), (217, 171, 88, 28)])
        draw.arc((x - 180, y - 28, x + 180, y + 28), 188, 350, fill=color, width=rng.choice([1, 1, 2]))
    for _ in range(70):
        x = rng.randint(0, w)
        y = rng.randint(0, h)
        r = rng.randint(1, 3)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(72, 48, 30, rng.randint(8, 22)))
    return img


def rounded_mask(size: tuple[int, int], radius: int, cut: int = 0) -> Image.Image:
    w, h = size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    if cut:
        pts = [(cut, 0), (w - cut, 0), (w, cut), (w, h), (0, h), (0, cut)]
        draw.polygon(pts, fill=255)
    else:
        draw.rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    return mask


def masked_panel(size: tuple[int, int], seed: int, radius=26, cut=0, base=(179, 134, 74, 245)) -> Image.Image:
    w, h = size
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    body = parchment(size, seed, base)
    mask = rounded_mask(size, radius, cut)
    img.alpha_composite(Image.composite(body, Image.new("RGBA", size, (0, 0, 0, 0)), mask))
    draw = ImageDraw.Draw(img, "RGBA")
    for i, color in enumerate([(65, 42, 26, 170), (213, 158, 72, 205), (71, 103, 89, 120), (125, 53, 39, 105)]):
        inset = 5 + i * 5
        if cut:
            c = max(0, cut - inset)
            draw.line([(c + inset, inset), (w - c - inset, inset), (w - inset, c + inset), (w - inset, h - inset), (inset, h - inset), (inset, c + inset), (c + inset, inset)], fill=color, width=2 if i < 2 else 1)
        else:
            draw.rounded_rectangle((inset, inset, w - inset, h - inset), radius=max(2, radius - inset), outline=color, width=2 if i < 2 else 1)
    return img


def add_corner_clouds(draw: ImageDraw.ImageDraw, w: int, h: int, color=(61, 98, 85, 110)) -> None:
    for sx in (1, -1):
        ox = 28 if sx == 1 else w - 28
        for i in range(4):
            y = 28 + i * 12
            x0 = ox + sx * i * 9
            draw.arc((x0 - sx * 84, y - 18, x0 + sx * 18, y + 22), 180 if sx == 1 else 0, 360 if sx == 1 else 180, fill=color, width=3)
    for sx in (1, -1):
        ox = 36 if sx == 1 else w - 36
        y = h - 32
        for i in range(5):
            draw.arc((ox + sx * i * 16 - sx * 80, y - 18, ox + sx * i * 16 + sx * 8, y + 18), 190 if sx == 1 else 10, 345 if sx == 1 else 170, fill=(139, 51, 38, 90), width=2)


def hud_scroll() -> Image.Image:
    img = masked_panel((500, 236), 101, radius=30, cut=28, base=(166, 128, 75, 230))
    draw = ImageDraw.Draw(img, "RGBA")
    add_corner_clouds(draw, 500, 236)
    draw.rectangle((0, 24, 22, 212), fill=(68, 45, 27, 155))
    draw.rectangle((478, 24, 500, 212), fill=(68, 45, 27, 155))
    draw.line((96, 96, 450, 96), fill=(66, 97, 85, 110), width=3)
    draw.line((96, 142, 450, 142), fill=(66, 97, 85, 95), width=3)
    draw.line((96, 188, 450, 188), fill=(111, 61, 37, 86), width=2)
    return img


def choice_card() -> Image.Image:
    img = masked_panel((360, 456), 202, radius=38, cut=42, base=(184, 139, 78, 246))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse((120, 34, 240, 154), fill=(34, 47, 42, 230), outline=(211, 160, 76, 220), width=5)
    draw.ellipse((138, 52, 222, 136), outline=(79, 148, 125, 120), width=3)
    draw.arc((48, 158, 312, 238), 196, 344, fill=(64, 102, 88, 108), width=3)
    draw.arc((54, 248, 306, 324), 196, 344, fill=(64, 102, 88, 92), width=2)
    draw.line((56, 344, 304, 344), fill=(92, 53, 32, 95), width=1)
    add_corner_clouds(draw, 360, 456, (63, 101, 86, 92))
    return img


def lineage_card() -> Image.Image:
    img = masked_panel((360, 480), 303, radius=42, cut=42, base=(184, 139, 78, 246))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.arc((64, 52, 296, 190), 188, 352, fill=(64, 102, 88, 110), width=3)
    draw.line((44, 214, 316, 214), fill=(97, 55, 35, 102), width=1)
    draw.arc((48, 276, 312, 358), 196, 344, fill=(64, 102, 88, 88), width=2)
    draw.line((58, 390, 302, 390), fill=(92, 53, 32, 95), width=1)
    add_corner_clouds(draw, 360, 480, (120, 50, 38, 88))
    return img


def scroll_box(name: str, size: tuple[int, int], seed: int) -> Image.Image:
    w, h = size
    img = masked_panel(size, seed, radius=22, cut=20, base=(169, 126, 72, 238))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rectangle((0, 24, 34, h - 24), fill=(70, 47, 30, 170))
    draw.rectangle((w - 34, 24, w, h - 24), fill=(70, 47, 30, 170))
    draw.line((44, 50, w - 44, 50), fill=(70, 105, 90, 112), width=3)
    draw.line((44, h - 50, w - 44, h - 50), fill=(70, 105, 90, 112), width=3)
    for y in range(94, h - 70, 44):
        draw.arc((56, y - 24, w - 56, y + 28), 190, 350, fill=(70, 105, 90, 54), width=2)
    add_corner_clouds(draw, w, h, (133, 52, 39, 80))
    return img


def button(name: str, size: tuple[int, int], seed: int, dark=False) -> Image.Image:
    base = (91, 57, 35, 238) if dark else (175, 115, 55, 240)
    img = masked_panel(size, seed, radius=12, cut=0, base=base)
    draw = ImageDraw.Draw(img, "RGBA")
    w, h = size
    draw.line((16, h // 2, w - 16, h // 2), fill=(224, 174, 84, 78), width=2)
    draw.rectangle((10, 10, w - 10, h - 10), outline=(246, 202, 103, 120), width=1)
    return img


def resource_frame(kind: str) -> Image.Image:
    img = masked_panel((180, 68), 707 if kind == "soul" else 708, radius=14, cut=10, base=(65, 47, 34, 235))
    draw = ImageDraw.Draw(img, "RGBA")
    color = (64, 209, 160, 230) if kind == "soul" else (222, 88, 48, 230)
    draw.ellipse((22, 18, 54, 50), fill=color, outline=(232, 191, 91, 150), width=2)
    draw.ellipse((28, 22, 44, 38), fill=(255, 245, 186, 70))
    return img


def title_plaque() -> Image.Image:
    img = masked_panel((300, 86), 808, radius=8, cut=28, base=(62, 37, 24, 242))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.line((44, 43, 256, 43), fill=(210, 160, 76, 130), width=2)
    draw.polygon([(38, 43), (64, 20), (236, 20), (262, 43), (236, 66), (64, 66)], outline=(210, 160, 76, 160), fill=(80, 45, 27, 110))
    return img


def main() -> None:
    ensure(OUT)
    assets = [
        save(hud_scroll(), "hud_scroll"),
        save(choice_card(), "choice_card_frame"),
        save(lineage_card(), "lineage_card"),
        save(scroll_box("dialogue_scroll", (780, 270), 404), "dialogue_scroll"),
        save(scroll_box("result_panel", (720, 320), 505), "result_panel"),
        save(scroll_box("pause_panel", (580, 220), 606), "pause_panel"),
        save(button("button_continue", (250, 76), 901), "button_continue"),
        save(button("button_minor", (168, 54), 902, dark=True), "button_minor"),
        save(resource_frame("soul"), "resource_soul"),
        save(resource_frame("fire"), "resource_fire"),
        save(title_plaque(), "title_plaque"),
    ]
    manifest = {"version": "0.3.3-formal-ui-atlas", "assets": assets}
    (OUT / "atlas.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"atlas": (OUT / "atlas.json").relative_to(ROOT).as_posix(), "assets": len(assets)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
