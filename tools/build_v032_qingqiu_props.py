from pathlib import Path
import json
import math
import random

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BASE_TILE = ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu_seamless" / "tile_qingqiu_base_seamless_01.webp"
TILE_OUT = ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu_seamless"
DECAL_OUT = ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu" / "decals"
PROP_OUT = ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu" / "props"
EVENT_OUT = ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu" / "events"
SIZE = 512


def ensure(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save_webp(img: Image.Image, path: Path, quality=82) -> None:
    ensure(path.parent)
    img.save(path, "WEBP", quality=quality, method=6)


def trim_alpha(img: Image.Image, padding=8) -> Image.Image:
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    return img.crop((max(0, l - padding), max(0, t - padding), min(img.width, r + padding), min(img.height, b + padding)))


def edge_fade(img: Image.Image, fade: int) -> Image.Image:
    w, h = img.size
    mask = Image.new("L", (w, h), 255)
    px = mask.load()
    for y in range(h):
        for x in range(w):
            d = min(x, y, w - 1 - x, h - 1 - y)
            if d < fade:
                px[x, y] = int(255 * (d / fade))
    mask = mask.filter(ImageFilter.GaussianBlur(max(2, fade // 5)))
    alpha = img.getchannel("A")
    img.putalpha(Image.composite(alpha, Image.new("L", (w, h), 0), mask))
    return img


def add_grain(img: Image.Image, seed: int, strength=10) -> Image.Image:
    rng = random.Random(seed)
    w, h = img.size
    grain = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gp = grain.load()
    for y in range(h):
        for x in range(w):
            if rng.random() < 0.022:
                gp[x, y] = (232, 194, 122, rng.randint(2, strength))
            elif rng.random() < 0.02:
                gp[x, y] = (24, 18, 24, rng.randint(2, strength + 2))
    return Image.alpha_composite(img, grain)


def make_tile_variant(index: int, seed: int) -> Image.Image:
    rng = random.Random(seed)
    base = Image.open(BASE_TILE).convert("RGBA").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")

    # Keep strong motifs away from the outer band so variants remain compatible.
    for _ in range(28):
        x = rng.randint(86, SIZE - 86)
        y = rng.randint(86, SIZE - 86)
        rw = rng.randint(48, 130)
        rh = rng.randint(18, 58)
        color = rng.choice([
            (48, 93, 88, rng.randint(10, 20)),
            (91, 64, 116, rng.randint(10, 22)),
            (151, 113, 74, rng.randint(8, 16)),
            (105, 48, 54, rng.randint(6, 13)),
        ])
        draw.ellipse((x - rw, y - rh, x + rw, y + rh), fill=color)

    for i in range(9):
        x0 = rng.randint(64, SIZE - 170)
        y0 = rng.randint(76, SIZE - 76)
        pts = []
        for j in range(6):
            x = x0 + j * rng.randint(22, 38)
            y = y0 + math.sin(j * 1.4 + seed) * rng.randint(4, 12)
            pts.append((x, y))
        draw.line(pts, fill=(201, 160, 91, rng.randint(10, 24)), width=1)

    overlay = overlay.filter(ImageFilter.GaussianBlur(0.65))
    tile = Image.alpha_composite(base, edge_fade(overlay, 64))
    tile = ImageEnhance.Contrast(tile).enhance(0.98 + index * 0.01)
    tile = ImageEnhance.Color(tile).enhance(0.98 + index * 0.025)
    return add_grain(tile, seed, 7)


def make_tile_preview(paths: list[Path]) -> Image.Image:
    tiles = [Image.open(p).convert("RGBA") for p in paths]
    preview = Image.new("RGBA", (SIZE * 3, SIZE * 3), (0, 0, 0, 255))
    order = [0, 1, 2, 1, 2, 0, 2, 0, 1]
    for i, idx in enumerate(order):
        x = (i % 3) * SIZE
        y = (i // 3) * SIZE
        preview.alpha_composite(tiles[idx], (x, y))
    return preview


def make_line_decal(name: str, size: tuple[int, int], seed: int, palette: str) -> Image.Image:
    rng = random.Random(seed)
    w, h = size
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    colors = {
        "vow": [(200, 158, 92, 42), (121, 52, 59, 32), (56, 112, 104, 22)],
        "teal": [(38, 112, 105, 52), (198, 160, 92, 28), (85, 60, 111, 22)],
        "gold": [(218, 174, 88, 54), (180, 121, 66, 26), (48, 95, 88, 22)],
    }[palette]
    for i in range(10):
        y = rng.randint(h // 5, h - h // 5)
        x0 = rng.randint(-w // 6, w // 3)
        pts = []
        for j in range(9):
            x = x0 + j * rng.randint(w // 14, w // 9)
            yy = y + math.sin(j * 1.1 + i + seed * 0.01) * rng.randint(5, 18)
            pts.append((x, yy))
        draw.line(pts, fill=rng.choice(colors), width=rng.choice([1, 1, 2]))
    for _ in range(16):
        x = rng.randint(0, w)
        y = rng.randint(0, h)
        draw.arc((x - 28, y - 10, x + 42, y + 18), rng.randint(0, 120), rng.randint(180, 320), fill=rng.choice(colors), width=1)
    return add_grain(edge_fade(img.filter(ImageFilter.GaussianBlur(0.28)), 46), seed, 8)


def draw_shadow(draw: ImageDraw.ImageDraw, cx: int, cy: int, rx: int, ry: int) -> None:
    draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(12, 9, 10, 72))


def make_foxfire_frame(kind: str, frame: int, seed: int) -> Image.Image:
    rng = random.Random(seed + frame)
    w, h = {"small": (96, 128), "medium": (132, 156), "cluster": (192, 150)}[kind]
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    if kind == "cluster":
        centers = [(58, 104, 28), (100, 84, 36), (136, 106, 24)]
    else:
        centers = [(w // 2, h - 28, 30 if kind == "small" else 42)]
    for cx, cy, r in centers:
        draw_shadow(draw, cx, cy + 10, int(r * 0.95), int(r * 0.16))
        sway = math.sin(frame * 0.9 + seed * 0.01) * r * 0.2
        glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow, "RGBA")
        glow_draw.ellipse(
            (cx - r * 1.15, cy - r * 1.85, cx + r * 1.15, cy + r * 0.45),
            fill=(67, 164, 132, 44),
        )
        glow_draw.ellipse(
            (cx - r * 0.72, cy - r * 1.34, cx + r * 0.72, cy + r * 0.18),
            fill=(218, 171, 82, 36),
        )
        img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(max(2, int(r * 0.16)))))
        for i in range(3):
            offset = (i - 1) * r * 0.22
            tip = (cx + sway * (0.35 + i * 0.2) + offset * 0.25, cy - r * (1.68 + 0.14 * i))
            left = (cx - r * (0.38 + i * 0.06) + offset, cy - r * (0.42 + i * 0.08))
            right = (cx + r * (0.38 - i * 0.04) + offset, cy - r * (0.38 + i * 0.1))
            base = (cx + offset * 0.18, cy + r * 0.18)
            color = [(49, 135, 118, 120), (80, 184, 143, 138), (238, 186, 91, 150)][i]
            draw.pieslice((left[0], tip[1], right[0], base[1]), 200, 340, fill=color)
            draw.line([left, tip, right], fill=(232, 194, 122, 54), width=1)
        draw.arc((cx - r * 0.62, cy - r * 0.08, cx + r * 0.62, cy + r * 0.34), 190, 350, fill=(161, 92, 154, 78), width=2)
        for _ in range(3):
            sx = cx + rng.randint(-int(r * 0.75), int(r * 0.75))
            sy = cy - rng.randint(int(r * 0.4), int(r * 1.45))
            draw.ellipse((sx - 1, sy - 1, sx + 2, sy + 2), fill=(241, 205, 123, 92))
    img = img.filter(ImageFilter.GaussianBlur(0.18))
    return trim_alpha(add_grain(img, seed + frame, 8), 10)


def make_grass(index: int, seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = Image.new("RGBA", (160, 104), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    draw_shadow(draw, 78, 78, 48, 10)
    for i in range(18):
        x = rng.randint(32, 124)
        y = rng.randint(68, 88)
        height = rng.randint(22, 48)
        bend = rng.randint(-22, 22)
        color = rng.choice([(101, 133, 91, 150), (172, 145, 78, 118), (61, 104, 91, 130)])
        draw.line((x, y, x + bend, y - height), fill=color, width=rng.choice([2, 3]))
    return trim_alpha(add_grain(img.filter(ImageFilter.GaussianBlur(0.2)), seed, 8), 8)


def make_fox_mask(index: int, seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = Image.new("RGBA", (160, 120), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    draw_shadow(draw, 80, 86, 48, 10)
    cx, cy = 78 + rng.randint(-7, 7), 65 + rng.randint(-4, 4)
    draw.polygon([(cx - 46, cy - 10), (cx - 20, cy - 34), (cx, cy - 18), (cx + 22, cy - 34), (cx + 48, cy - 8), (cx + 18, cy + 26), (cx - 20, cy + 26)], fill=(190, 163, 107, 185))
    draw.line((cx - 38, cy - 3, cx - 8, cy + 4, cx + 32, cy - 4), fill=(123, 47, 49, 128), width=4)
    draw.arc((cx - 18, cy - 6, cx + 18, cy + 24), 190, 340, fill=(49, 99, 91, 140), width=2)
    crack_x = cx + rng.randint(-18, 20)
    draw.line((crack_x, cy - 24, crack_x + 8, cy - 3, crack_x - 6, cy + 18), fill=(61, 39, 34, 130), width=2)
    return trim_alpha(add_grain(img.filter(ImageFilter.GaussianBlur(0.25)), seed, 7), 8)


def make_ribbon(index: int, seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = Image.new("RGBA", (210, 110), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    draw_shadow(draw, 105, 78, 66, 8)
    y = 58 + rng.randint(-10, 10)
    pts = []
    for i in range(9):
        x = 20 + i * 22
        pts.append((x, y + math.sin(i * 1.15 + seed) * rng.randint(5, 14)))
    draw.line(pts, fill=(151, 58, 64, 112), width=8)
    draw.line([(x, yy - 4) for x, yy in pts], fill=(210, 164, 86, 62), width=2)
    return trim_alpha(add_grain(img.filter(ImageFilter.GaussianBlur(0.32)), seed, 7), 8)


def make_event(kind: str, state: str, seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = Image.new("RGBA", (220, 260), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    ready = state == "ready"
    done = state == "done"
    alpha_mul = 0.55 if done else 1.0
    draw_shadow(draw, 110, 218, 70, 16)
    if kind == "foxfire_vow":
        for frame_center in [(86, 172, 34), (120, 148, 42), (148, 176, 28)]:
            cx, cy, r = frame_center
            flame_alpha = int((160 if ready else 125) * alpha_mul)
            draw.ellipse((cx - r * 0.55, cy - r * 1.55, cx + r * 0.55, cy + r * 0.18), fill=(79, 184, 140, int(flame_alpha * 0.56)))
            draw.pieslice((cx - r * 0.55, cy - r * 1.62, cx + r * 0.55, cy + r * 0.18), 205, 338, fill=(79, 184, 140, flame_alpha))
            draw.pieslice((cx - r * 0.32, cy - r * 1.12, cx + r * 0.36, cy + r * 0.04), 205, 338, fill=(230, 178, 82, int(150 * alpha_mul)))
        draw.line((54, 208, 92, 197, 128, 216, 168, 202), fill=(184, 98, 179, int(82 * alpha_mul)), width=3)
    else:
        body_alpha = int(210 * alpha_mul)
        draw.rounded_rectangle((74, 60, 146, 212), radius=24, fill=(55, 64, 57, body_alpha), outline=(201, 160, 83, int(142 * alpha_mul)), width=3)
        draw.line((82, 112, 138, 112), fill=(201, 160, 83, int(92 * alpha_mul)), width=2)
        draw.line((90, 138, 132, 138), fill=(201, 160, 83, int(80 * alpha_mul)), width=2)
        if ready:
            draw.rounded_rectangle((68, 54, 152, 218), radius=28, outline=(86, 184, 140, 70), width=3)
    if ready:
        draw.line((62, 222, 158, 217), fill=(247, 217, 128, 96), width=3)
    return trim_alpha(add_grain(img.filter(ImageFilter.GaussianBlur(0.25)), seed, 7), 10)


def make_contact_sheet(paths: list[Path], out: Path) -> None:
    thumbs = []
    for path in paths:
        im = Image.open(path).convert("RGBA")
        im.thumbnail((150, 120), Image.Resampling.LANCZOS)
        cell = Image.new("RGBA", (180, 150), (38, 33, 35, 255))
        cell.alpha_composite(im, ((180 - im.width) // 2, 12))
        ImageDraw.Draw(cell).text((8, 128), path.stem[:24], fill=(230, 200, 132, 255))
        thumbs.append(cell)
    cols = 4
    rows = math.ceil(len(thumbs) / cols)
    sheet = Image.new("RGBA", (cols * 180, rows * 150), (24, 22, 24, 255))
    for i, thumb in enumerate(thumbs):
        sheet.alpha_composite(thumb, ((i % cols) * 180, (i // cols) * 150))
    sheet.save(out)


def main() -> None:
    for path in [TILE_OUT, DECAL_OUT, PROP_OUT, EVENT_OUT]:
        ensure(path)

    tile_paths = [BASE_TILE]
    for i, seed in enumerate([2241, 2242], start=2):
        tile = make_tile_variant(i, seed)
        path = TILE_OUT / f"tile_qingqiu_base_seamless_{i:02d}.webp"
        save_webp(tile, path, 86)
        tile_paths.append(path)
    make_tile_preview(tile_paths).save(TILE_OUT / "preview_3x3_mixed_tiles.png")

    decal_specs = [
        ("decal_qingqiu_old_vow_trace_02.webp", (768, 320), 3302, "vow"),
        ("decal_qingqiu_ink_teal_vein_01.webp", (640, 288), 3303, "teal"),
        ("decal_qingqiu_gold_mural_lines_01.webp", (640, 256), 3304, "gold"),
    ]
    decal_paths = []
    for name, size, seed, palette in decal_specs:
        path = DECAL_OUT / name
        save_webp(make_line_decal(name, size, seed, palette), path, 84)
        decal_paths.append(path)

    prop_paths = []
    for kind in ["small", "medium", "cluster"]:
        for frame in range(4):
            path = PROP_OUT / f"prop_qingqiu_foxfire_{kind}_{frame}.webp"
            save_webp(make_foxfire_frame(kind, frame, 4100 + frame + len(prop_paths)), path, 82)
            prop_paths.append(path)
    for i in range(5):
        path = PROP_OUT / f"prop_qingqiu_grass_low_{i}.webp"
        save_webp(make_grass(i, 4300 + i), path, 80)
        prop_paths.append(path)
    for i in range(3):
        path = PROP_OUT / f"prop_qingqiu_fox_mask_shard_{i}.webp"
        save_webp(make_fox_mask(i, 4400 + i), path, 82)
        prop_paths.append(path)
    for i in range(4):
        path = PROP_OUT / f"prop_qingqiu_ground_ribbon_{i}.webp"
        save_webp(make_ribbon(i, 4500 + i), path, 80)
        prop_paths.append(path)

    event_paths = []
    for kind in ["foxfire_vow", "old_vow_stele"]:
        for state in ["idle", "ready", "done"]:
            path = EVENT_OUT / f"event_qingqiu_{kind}_{state}.webp"
            save_webp(make_event(kind, state, 4600 + len(event_paths)), path, 84)
            event_paths.append(path)

    make_contact_sheet(prop_paths + event_paths, PROP_OUT / "preview_qingqiu_props_events.png")

    manifest = {
        "version": "0.3.2b-qingqiu-props",
        "tiles": [f"assets/maps/v032_atlas/qingqiu_seamless/{p.name}" for p in tile_paths],
        "decals": [f"assets/maps/v032_atlas/qingqiu/decals/{p.name}" for p in decal_paths],
        "props": [f"assets/maps/v032_atlas/qingqiu/props/{p.name}" for p in prop_paths],
        "events": [f"assets/maps/v032_atlas/qingqiu/events/{p.name}" for p in event_paths],
        "rules": [
            "ground tile variants share edge-safe quiet margins",
            "props and events are transparent WebP and drawn in world space",
            "event readiness must be communicated by asset state, not floating text"
        ]
    }
    (ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu" / "props-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
