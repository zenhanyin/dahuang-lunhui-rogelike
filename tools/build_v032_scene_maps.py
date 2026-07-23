from pathlib import Path
import json
import math
import random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "maps" / "v032"


PALETTES = {
    "sword_tomb": {
        "name": "剑冢荒境",
        "base": (69, 62, 52),
        "deep": (35, 33, 34),
        "warm": (128, 94, 45),
        "accent": (196, 158, 83),
        "mist": (64, 73, 79, 110),
    },
    "qingqiu": {
        "name": "青丘残梦",
        "base": (59, 52, 76),
        "deep": (25, 24, 32),
        "warm": (117, 80, 70),
        "accent": (178, 111, 183),
        "mist": (123, 74, 152, 120),
    },
    "herb_marsh": {
        "name": "百草荒泽",
        "base": (62, 70, 49),
        "deep": (29, 34, 28),
        "warm": (139, 83, 45),
        "accent": (91, 163, 128),
        "mist": (74, 118, 92, 100),
    },
    "wilderness": {
        "name": "荒境深处",
        "base": (70, 66, 51),
        "deep": (31, 31, 29),
        "warm": (126, 83, 43),
        "accent": (102, 145, 126),
        "mist": (74, 70, 94, 104),
    },
}


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def save_webp(img, path, quality=82):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=quality, method=6)


def make_base(pack_id, seed):
    rng = random.Random(seed)
    p = PALETTES[pack_id]
    w, h = 1280, 720
    img = Image.new("RGBA", (w, h), p["base"] + (255,))
    px = img.load()
    for y in range(h):
        for x in range(w):
            nx = x / w
            ny = y / h
            t = 0.42 + 0.12 * math.sin(ny * math.tau * 1.15) + 0.08 * math.sin(nx * math.tau * 2.0 + ny * 0.8)
            col = lerp(p["base"], p["deep"], min(0.82, max(0.08, t)))
            noise = rng.randint(-4, 4) if (x + y) % 7 == 0 else 0
            px[x, y] = (
                max(0, min(255, col[0] + noise)),
                max(0, min(255, col[1] + noise)),
                max(0, min(255, col[2] + noise)),
                255,
            )

    draw = ImageDraw.Draw(img, "RGBA")

    # Low-frequency mineral color washes, softened so the scene does not read as vector shapes.
    wash = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash, "RGBA")
    for _ in range(26):
        cx = rng.randint(-120, w + 120)
        cy = rng.randint(-80, h + 80)
        rw = rng.randint(220, 580)
        rh = rng.randint(54, 150)
        color = p["warm"] + (rng.randint(16, 42),)
        wd.ellipse((cx - rw, cy - rh, cx + rw, cy + rh), fill=color)
    img = Image.alpha_composite(img, wash.filter(ImageFilter.GaussianBlur(18)))

    # Dunhuang mural cloud/terrain linework: low alpha, broken, hand-painted.
    for i in range(22):
        y = rng.randint(20, h - 20)
        x0 = rng.randint(-160, w - 120)
        length = rng.randint(260, 620)
        pts = []
        for j in range(9):
            x = x0 + length * j / 8
            yy = y + math.sin(j * 1.35 + i) * rng.randint(8, 24)
            pts.append((x, yy))
        draw.line(pts, fill=p["accent"] + (24,), width=rng.choice([1, 2]))
        if rng.random() < 0.55:
            pts2 = [(x, yy + rng.randint(18, 36)) for x, yy in pts[1:-1]]
            draw.line(pts2, fill=p["warm"] + (22,), width=1)

    # Theme symbols.
    if pack_id == "sword_tomb":
        dust = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        dd = ImageDraw.Draw(dust, "RGBA")
        for _ in range(16):
            x, y = rng.randint(0, w), rng.randint(0, h)
            l = rng.randint(34, 96)
            dd.line((x, y, x + rng.randint(-28, 32), y - l), fill=(174, 142, 78, 54), width=rng.randint(2, 4))
            dd.line((x - 10, y - l * 0.58, x + 12, y - l * 0.58), fill=(174, 142, 78, 48), width=2)
        img = Image.alpha_composite(img, dust.filter(ImageFilter.GaussianBlur(0.45)))
    elif pack_id == "qingqiu":
        mist_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        md = ImageDraw.Draw(mist_layer, "RGBA")
        for _ in range(14):
            cx, cy = rng.randint(-40, w + 40), rng.randint(0, h)
            rw, rh = rng.randint(100, 250), rng.randint(30, 72)
            md.ellipse((cx - rw, cy - rh, cx + rw, cy + rh), fill=p["mist"])
            md.ellipse((cx - rw * .62, cy - rh * .5, cx + rw * .62, cy + rh * .48), fill=(206, 114, 198, 46))
            for k in range(3):
                md.arc((cx - rw * .65, cy - rh * .45 + k * 10, cx + rw * .65, cy + rh * .35 + k * 10), 190, 350, fill=(220, 160, 212, 56), width=2)
        img = Image.alpha_composite(img, mist_layer.filter(ImageFilter.GaussianBlur(1.4)))
    elif pack_id == "herb_marsh":
        herb_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        hd = ImageDraw.Draw(herb_layer, "RGBA")
        for _ in range(26):
            x, y = rng.randint(0, w), rng.randint(0, h)
            for k in range(rng.randint(3, 7)):
                a = -math.pi / 2 + (k - 3) * 0.22
                hd.line((x, y, x + math.cos(a) * rng.randint(18, 38), y + math.sin(a) * rng.randint(20, 42)), fill=(145, 174, 100, 58), width=3)
        img = Image.alpha_composite(img, herb_layer.filter(ImageFilter.GaussianBlur(0.35)))
    else:
        fog_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        fd = ImageDraw.Draw(fog_layer, "RGBA")
        for _ in range(12):
            x, y = rng.randint(0, w), rng.randint(0, h)
            rw, rh = rng.randint(80, 160), rng.randint(22, 46)
            fd.ellipse((x - rw, y - rh, x + rw, y + rh), fill=p["mist"])
        img = Image.alpha_composite(img, fog_layer.filter(ImageFilter.GaussianBlur(2.0)))

    # Paper grain only. Screen-level vignette is drawn in canvas; tile images must stay edge-safe.
    grain = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grain, "RGBA")
    for _ in range(4500):
        x, y = rng.randint(0, w - 1), rng.randint(0, h - 1)
        c = rng.choice([(246, 210, 138, 12), (20, 16, 13, 12), (91, 76, 52, 10)])
        gd.point((x, y), fill=c)
    img = Image.alpha_composite(img, grain)
    return img


def make_transition(pack_id, idx, seed):
    rng = random.Random(seed)
    p = PALETTES[pack_id]
    w, h = 768, 384
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    for _ in range(11):
        cx, cy = rng.randint(-60, w + 60), rng.randint(20, h - 20)
        rw, rh = rng.randint(120, 300), rng.randint(26, 74)
        draw.ellipse((cx - rw, cy - rh, cx + rw, cy + rh), fill=p["mist"])
        draw.arc((cx - rw * .7, cy - rh * .4, cx + rw * .7, cy + rh * .55), 185, 355, fill=p["accent"] + (70,), width=3)
    return img.filter(ImageFilter.GaussianBlur(0.4))


def make_event(pack_id, event_id, seed):
    rng = random.Random(seed)
    p = PALETTES[pack_id]
    img = Image.new("RGBA", (320, 320), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse((70, 230, 250, 284), outline=p["accent"] + (145,), width=5, fill=(18, 16, 14, 70))
    draw.ellipse((96, 242, 224, 270), fill=(10, 8, 8, 65))
    if "foxfire" in event_id:
        for i in range(4):
            x = 160 + math.sin(i * 1.6) * 16
            y = 176 - i * 22
            draw.ellipse((x - 26 + i * 2, y - 35, x + 26 - i * 2, y + 35), fill=(86, 212, 174, 100 - i * 12))
            draw.polygon([(x, y - 54), (x - 25, y + 18), (x + 22, y + 16)], fill=(223, 177, 91, 165 - i * 20))
        draw.text((142, 92), "缘", fill=(235, 211, 130, 230))
    elif "sword" in event_id:
        draw.line((160, 78, 142, 232), fill=(213, 184, 101, 230), width=10)
        draw.line((128, 144, 180, 136), fill=(181, 137, 77, 210), width=8)
        draw.polygon([(160, 54), (146, 84), (174, 80)], fill=(225, 207, 145, 240))
        draw.text((142, 96), "剑", fill=(236, 213, 145, 230))
    elif "cauldron" in event_id:
        draw.ellipse((106, 128, 214, 214), fill=(83, 88, 56, 230), outline=(207, 166, 86, 230), width=5)
        draw.rectangle((120, 116, 200, 150), fill=(96, 74, 44, 230), outline=(212, 163, 75, 230), width=4)
        draw.polygon([(145, 92), (128, 136), (169, 125)], fill=(218, 93, 52, 180))
        draw.text((142, 78), "丹", fill=(238, 205, 127, 230))
    else:
        draw.rounded_rectangle((122, 72, 198, 235), radius=16, fill=(75, 70, 52, 235), outline=(204, 168, 82, 220), width=5)
        draw.line((140, 128, 184, 128), fill=(84, 170, 142, 160), width=3)
        draw.line((138, 158, 182, 166), fill=(84, 170, 142, 160), width=3)
        draw.text((142, 92), "缘", fill=(236, 214, 139, 235))
    for _ in range(18):
        x = rng.randint(80, 240)
        y = rng.randint(80, 245)
        draw.point((x, y), fill=(244, 211, 125, rng.randint(60, 140)))
    return img


def main():
    manifest = {"version": "0.3.2-scene-map", "packs": {}}
    for idx, pack_id in enumerate(PALETTES):
        pack_dir = OUT / pack_id
        base = make_base(pack_id, 3200 + idx * 173)
        save_webp(base, pack_dir / "ground_a.webp", 84)
        manifest["packs"][pack_id] = {
            "name": PALETTES[pack_id]["name"],
            "grounds": [f"assets/maps/v032/{pack_id}/ground_a.webp"],
            "transitions": [],
            "events": {},
        }
        for i in range(3):
            img = make_transition(pack_id, i, 6100 + idx * 197 + i)
            path = pack_dir / f"transition_{i + 1}.webp"
            save_webp(img, path, 78)
            manifest["packs"][pack_id]["transitions"].append(f"assets/maps/v032/{pack_id}/{path.name}")

    event_specs = [
        ("sword_tomb", "event_broken_sword"),
        ("qingqiu", "event_foxfire_vow"),
        ("herb_marsh", "event_herb_cauldron"),
        ("wilderness", "event_memory_stele"),
    ]
    for i, (pack_id, event_id) in enumerate(event_specs):
        img = make_event(pack_id, event_id, 8400 + i * 233)
        path = OUT / pack_id / f"{event_id}.webp"
        save_webp(img, path, 82)
        manifest["packs"][pack_id]["events"][event_id] = f"assets/maps/v032/{pack_id}/{path.name}"

    (OUT / "scene-map-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
