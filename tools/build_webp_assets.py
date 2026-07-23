from pathlib import Path
import math
import random
from PIL import Image
from PIL import ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "generated" / "processed"
OUT = ROOT / "assets" / "generated" / "runtime-webp"
MAP_OUT = ROOT / "assets" / "maps"


def ensure_dirs():
    for name in ["characters", "enemies", "terrain", "ui", "maps"]:
        (OUT / name).mkdir(parents=True, exist_ok=True)


def trim_alpha(img, padding=8):
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return img
    l, t, r, b = bbox
    l = max(0, l - padding)
    t = max(0, t - padding)
    r = min(img.width, r + padding)
    b = min(img.height, b + padding)
    return img.crop((l, t, r, b))


def clear_white_grid(img):
    data = img.load()
    for y in range(img.height):
      for x in range(img.width):
        r, g, b, a = data[x, y]
        if a > 180 and r > 226 and g > 226 and b > 226:
            data[x, y] = (255, 255, 255, 0)
    return img


def save_webp(img, path, quality=78):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=quality, method=4, lossless=False)


def crop_grid(source, cols, rows, mapping, out_dir, quality=78):
    sheet = Image.open(source).convert("RGBA")
    sheet = clear_white_grid(sheet)
    cell_w = sheet.width / cols
    cell_h = sheet.height / rows
    for row, col, name in mapping:
        left = round(col * cell_w) + 3
        top = round(row * cell_h) + 3
        right = round((col + 1) * cell_w) - 3
        bottom = round((row + 1) * cell_h) - 3
        frame = sheet.crop((left, top, right, bottom))
        frame = trim_alpha(frame, 10)
        save_webp(frame, out_dir / f"{name}.webp", quality)


def crop_grid_edges(source, x_edges, y_edges, mapping, out_dir, quality=78):
    sheet = Image.open(source).convert("RGBA")
    sheet = clear_white_grid(sheet)
    for row, col, name in mapping:
        left = x_edges[col] + 4
        top = y_edges[row] + 4
        right = x_edges[col + 1] - 4
        bottom = y_edges[row + 1] - 4
        frame = sheet.crop((left, top, right, bottom))
        frame = trim_alpha(frame, 10)
        save_webp(frame, out_dir / f"{name}.webp", quality)


def build_motion():
    mapping = []
    for i in range(4):
        mapping.append((0, i, f"sword_right_{i}"))
    for i, col in enumerate([4, 5, 6]):
        mapping.append((0, col, f"sword_left_{i}"))
    mapping.append((0, 4, "sword_left_3"))
    for i in range(4):
        mapping.append((1, i, f"witch_right_{i}"))
    for i, col in enumerate([4, 5, 6]):
        mapping.append((1, col, f"witch_left_{i}"))
    mapping.append((1, 4, "witch_left_3"))
    for i in range(4):
        mapping.append((2, i, f"alchemist_right_{i}"))
    for i, col in enumerate([4, 5, 6]):
        mapping.append((2, col, f"alchemist_left_{i}"))
    mapping.append((2, 4, "alchemist_left_3"))
    for i in range(3):
        mapping.append((3, i, f"wraith_right_{i}"))
        mapping.append((4, i, f"elite_right_{i}"))
    for i, col in enumerate([4, 5, 6]):
        mapping.append((3, col, f"wraith_left_{i}"))
        mapping.append((4, col, f"elite_left_{i}"))
    x_edges = [14, 210, 408, 605, 795, 999, 1195, 1401]
    y_edges = [11, 186, 350, 517, 671, 831, 998]
    crop_grid_edges(SRC / "sprite-motion-atlas.png", x_edges, y_edges, mapping, OUT / "characters")
    for src_name in ["wraith", "elite"]:
        for direction in ["left", "right"]:
            for i in range(3):
                p = OUT / "characters" / f"{src_name}_{direction}_{i}.webp"
                target = OUT / "enemies" / p.name
                target.write_bytes(p.read_bytes())
    repair_partial_left_frames()


def repair_partial_left_frames():
    for folder in ["characters", "enemies"]:
        for prefix in ["sword", "witch", "alchemist", "wraith", "elite"]:
            src = OUT / folder / f"{prefix}_left_1.webp"
            dst = OUT / folder / f"{prefix}_left_2.webp"
            if src.exists() and dst.exists() and dst.stat().st_size < src.stat().st_size * 0.55:
                dst.write_bytes(src.read_bytes())


def build_scene():
    sheet = Image.open(SRC / "scene-props-atlas.png").convert("RGBA")
    crops = {
        "foxfire_0": (38, 18, 160, 192),
        "foxfire_1": (198, 18, 330, 192),
        "foxfire_2": (360, 18, 492, 192),
        "foxfire_3": (525, 18, 650, 192),
        "spirit_pool_0": (685, 16, 940, 190),
        "spirit_pool_1": (944, 18, 1190, 190),
        "spirit_pool_2": (1200, 16, 1490, 190),
        "mist_0": (30, 214, 300, 365),
        "mist_1": (316, 214, 570, 365),
        "mist_2": (585, 214, 790, 365),
        "rift_0": (805, 210, 1015, 365),
        "rift_1": (1028, 210, 1238, 365),
        "rift_2": (1248, 210, 1505, 365),
        "stele_0": (36, 370, 220, 620),
        "shrine_0": (252, 375, 548, 620),
        "rock_0": (628, 405, 815, 606),
        "rock_1": (872, 405, 1112, 606),
        "rock_2": (1228, 420, 1458, 596),
        "grass_0": (30, 628, 238, 790),
        "grass_1": (298, 628, 528, 790),
        "grass_2": (595, 628, 810, 790),
        "bone_0": (994, 646, 1168, 792),
        "bone_1": (1228, 646, 1456, 800),
        "portal_0": (455, 792, 805, 1010),
        "portal_1": (765, 785, 1125, 1010),
    }
    for name, box in crops.items():
        save_webp(trim_alpha(sheet.crop(box), 8), OUT / "terrain" / f"{name}.webp", 80)


def build_ui():
    ui = Image.open(SRC / "ui-atlas.png").convert("RGBA")
    crops = {
        "hud_scroll": (20, 18, 790, 390),
        "choice_card_red": (842, 32, 1036, 376),
        "choice_card_green": (1064, 32, 1260, 376),
        "choice_card_blue": (1288, 32, 1484, 376),
        "hp_bar": (386, 636, 856, 722),
        "xp_bar": (386, 726, 856, 810),
        "boss_banner": (1068, 778, 1490, 890),
        "tooltip": (850, 774, 1060, 895),
        "seal_frame": (48, 420, 360, 711),
    }
    for name, box in crops.items():
        save_webp(trim_alpha(ui.crop(box), 8), OUT / "ui" / f"{name}.webp", 82)


def build_map_backdrops():
    MAP_OUT.mkdir(parents=True, exist_ok=True)
    specs = {
        "wilds": {
            "base": ((84, 64, 36), (42, 58, 42), (20, 22, 22)),
            "accent": (213, 162, 76, 46),
            "wash": (116, 75, 38, 38)
        },
        "qingqiu": {
            "base": ((36, 48, 39), (53, 42, 74), (21, 22, 30)),
            "accent": (217, 139, 216, 42),
            "wash": (74, 52, 110, 48)
        }
    }
    w, h = 1280, 720
    for name, spec in specs.items():
        rng = random.Random(913 if name == "wilds" else 1741)
        img = Image.new("RGBA", (w, h), spec["base"][2] + (255,))
        px = img.load()
        for y in range(h):
            for x in range(w):
                grain = (rng.random() - 0.5) * 0.015
                t = (x / w * 0.52) + (y / h * 0.42) + grain
                if t < 0.5:
                    k = t / 0.5
                    a, b = spec["base"][0], spec["base"][1]
                else:
                    k = (t - 0.5) / 0.5
                    a, b = spec["base"][1], spec["base"][2]
                px[x, y] = tuple(round(a[i] * (1 - k) + b[i] * k) for i in range(3)) + (255,)
        draw = ImageDraw.Draw(img, "RGBA")

        for i in range(18):
            x = rng.randint(-90, w + 40)
            y = rng.randint(-40, h + 40)
            rr = rng.randint(70, 230)
            color = spec["wash"]
            draw.ellipse((x - rr, y - rr // 4, x + rr, y + rr // 4), fill=color)

        for i in range(15):
            y = int((i * 83 + 37) % (h + 160) - 70)
            points = []
            for x in range(-90, w + 100, 48):
                yy = y + int(11 * math.sin((x + i * 31) * 0.017))
                points.append((x, yy))
            draw.line(points, fill=spec["accent"], width=2)

        mountain = (28, 31, 29, 92)
        for i in range(8):
            base_x = rng.randint(-80, w + 60)
            base_y = rng.choice([rng.randint(70, 190), rng.randint(h - 170, h - 40)])
            peak = rng.randint(38, 96)
            spread = rng.randint(84, 170)
            pts = [(base_x - spread, base_y), (base_x - spread // 2, base_y - peak // 2), (base_x, base_y - peak), (base_x + spread // 2, base_y - peak // 3), (base_x + spread, base_y)]
            draw.polygon(pts, fill=mountain)
            draw.line(pts, fill=(213, 162, 76, 46), width=2)

        for i in range(26):
            x = rng.randint(0, w)
            y = rng.randint(0, h)
            draw.line((x, y, x + rng.randint(18, 62), y + rng.randint(-8, 12)), fill=(38, 25, 18, 42), width=1)

        vignette = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        vdraw = ImageDraw.Draw(vignette, "RGBA")
        for i in range(22):
            alpha = int(4 + i * 4)
            vdraw.rectangle((i * 8, i * 5, w - i * 8, h - i * 5), outline=(24, 13, 10, alpha), width=10)
        img.alpha_composite(vignette)
        filename = "wilds-final.webp" if name == "wilds" else "qingqiu-final.webp"
        save_webp(img, MAP_OUT / filename, 82)


def main():
    ensure_dirs()
    build_motion()
    build_scene()
    build_ui()
    build_map_backdrops()


if __name__ == "__main__":
    main()
