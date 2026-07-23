from __future__ import annotations

import json
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "runtime" / "webp" / "ui" / "nineslice"


def ensure(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def paper(size: tuple[int, int], seed: int, base: tuple[int, int, int, int]) -> Image.Image:
    rng = random.Random(seed)
    w, h = size
    img = Image.new("RGBA", size, base)
    px = img.load()
    for y in range(h):
        for x in range(w):
            n = rng.randint(-10, 10)
            r, g, b, a = px[x, y]
            px[x, y] = (max(0, min(255, r + n)), max(0, min(255, g + n - 2)), max(0, min(255, b + n - 7)), a)
    return img.filter(ImageFilter.GaussianBlur(0.25))


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def ornamented_frame(
    name: str,
    size: tuple[int, int],
    slice_px: int,
    seed: int,
    body=(184, 145, 88, 242),
    dark=False,
) -> dict:
    ensure(OUT)
    w, h = size
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    base = paper(size, seed, (68, 46, 29, 238) if dark else body)
    mask = rounded_mask(size, max(18, slice_px // 2))
    img.alpha_composite(Image.composite(base, Image.new("RGBA", size, (0, 0, 0, 0)), mask))
    draw = ImageDraw.Draw(img, "RGBA")

    mineral = (58, 103, 88, 150)
    cinnabar = (139, 49, 38, 138)
    gold = (218, 169, 82, 210)
    bronze = (84, 54, 34, 190)

    for offset, color, width in (
        (5, bronze, 3),
        (10, gold, 2),
        (17, mineral, 2),
        (24, cinnabar, 1),
    ):
        draw.rounded_rectangle(
            (offset, offset, w - offset - 1, h - offset - 1),
            radius=max(4, slice_px // 2 - offset // 2),
            outline=color,
            width=width,
        )

    # Keep ornate motifs inside the non-stretched corners and edges.
    def arc_box(x0: int, y0: int, x1: int, y1: int) -> tuple[int, int, int, int]:
        return (min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1))

    for sx in (1, -1):
        cx = 32 if sx == 1 else w - 32
        for i in range(4):
            y = 28 + i * 9
            draw.arc(arc_box(cx - sx * 66, y - 18, cx + sx * 18, y + 20), 180 if sx == 1 else 0, 360 if sx == 1 else 180, fill=mineral, width=3)
    for sx in (1, -1):
        cx = 34 if sx == 1 else w - 34
        y = h - 31
        for i in range(4):
            draw.arc(arc_box(cx + sx * i * 15 - sx * 70, y - 17, cx + sx * i * 15 + sx * 12, y + 17), 190 if sx == 1 else 10, 345 if sx == 1 else 170, fill=cinnabar, width=2)

    for x, y in ((slice_px // 2, slice_px // 2), (w - slice_px // 2, slice_px // 2), (slice_px // 2, h - slice_px // 2), (w - slice_px // 2, h - slice_px // 2)):
        draw.ellipse((x - 9, y - 9, x + 9, y + 9), fill=(35, 65, 55, 210), outline=gold, width=2)
        draw.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(235, 199, 113, 180))

    path = OUT / f"{name}.webp"
    img.save(path, "WEBP", quality=88, method=6)
    return {
        "id": name,
        "path": path.relative_to(ROOT).as_posix(),
        "size": [w, h],
        "slice": slice_px,
        "bytes": path.stat().st_size,
    }


def button_frame(name: str, size: tuple[int, int], slice_px: int, seed: int, dark=False) -> dict:
    asset = ornamented_frame(name, size, slice_px, seed, body=(178, 113, 56, 244), dark=dark)
    path = ROOT / asset["path"]
    img = Image.open(path).convert("RGBA")
    draw = ImageDraw.Draw(img, "RGBA")
    w, h = img.size
    draw.line((slice_px, h // 2, w - slice_px, h // 2), fill=(244, 202, 111, 72), width=2)
    draw.rectangle((slice_px - 10, slice_px - 8, w - slice_px + 10, h - slice_px + 8), outline=(250, 219, 136, 96), width=1)
    img.save(path, "WEBP", quality=88, method=6)
    asset["bytes"] = path.stat().st_size
    return asset


def main() -> None:
    ensure(OUT)
    assets = [
        ornamented_frame("panel_9", (240, 180), 54, 3101, body=(188, 151, 94, 244)),
        ornamented_frame("hud_9", (260, 190), 58, 3102, body=(177, 139, 83, 232)),
        ornamented_frame("card_9", (220, 280), 62, 3103, body=(190, 148, 88, 244)),
        ornamented_frame("lineage_9", (230, 300), 64, 3104, body=(190, 148, 88, 244)),
        ornamented_frame("dialogue_9", (260, 180), 58, 3105, body=(190, 158, 101, 244)),
        ornamented_frame("resource_9", (150, 74), 28, 3106, body=(73, 49, 32, 236), dark=True),
        button_frame("button_9", (128, 68), 24, 3107),
        button_frame("button_dark_9", (128, 58), 22, 3108, dark=True),
        ornamented_frame("plaque_9", (180, 72), 30, 3109, body=(84, 47, 28, 242), dark=True),
    ]
    manifest = {"version": "0.3.1-ui-nineslice", "borderImage": True, "assets": assets}
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"version": manifest["version"], "assets": len(assets), "out": OUT.relative_to(ROOT).as_posix()}, ensure_ascii=False))


if __name__ == "__main__":
    main()
