from pathlib import Path
import json
import math
import random
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ATLAS = ROOT / "assets" / "maps" / "v032_atlas"
SCALE = 3
TILE = 512


def rgba(hex_color, a=255):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


def canvas(w, h):
    return Image.new("RGBA", (w * SCALE, h * SCALE), (0, 0, 0, 0))


def down(img):
    return img.resize((img.width // SCALE, img.height // SCALE), Image.Resampling.LANCZOS)


def save(img, path, quality=88):
    path.parent.mkdir(parents=True, exist_ok=True)
    down(img).save(path, "WEBP", quality=quality, method=6)


def line(draw, pts, fill, width=1):
    draw.line([(int(x * SCALE), int(y * SCALE)) for x, y in pts], fill=fill, width=max(1, int(width * SCALE)))


def ellipse(draw, cx, cy, rx, ry, fill=None, outline=None, width=1):
    box = ((cx - rx) * SCALE, (cy - ry) * SCALE, (cx + rx) * SCALE, (cy + ry) * SCALE)
    draw.ellipse(box, fill=fill, outline=outline, width=max(1, int(width * SCALE)))


def polygon(draw, pts, fill=None, outline=None):
    draw.polygon([(int(x * SCALE), int(y * SCALE)) for x, y in pts], fill=fill, outline=outline)


def soft_patch(draw, rng, x, y, r, color, alpha):
    pts = []
    steps = 16
    for i in range(steps):
        a = math.tau * i / steps
        wobble = 0.72 + rng.random() * 0.55
        rx = r * wobble * rng.uniform(0.7, 1.4)
        ry = r * wobble * rng.uniform(0.28, 0.62)
        pts.append((x + math.cos(a) * rx, y + math.sin(a) * ry))
    polygon(draw, pts, fill=rgba(color, alpha))


def draw_tile(pack, idx, base, secondary, accent, line_color):
    edge_rng = random.Random(f"{pack}-shared-edge-tile")
    rng = random.Random(f"{pack}-{idx}-tile")
    img = canvas(TILE, TILE)
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle((0, 0, img.width, img.height), fill=rgba(base, 255))

    # Shared mineral wash: organic enough to avoid flat CSS color, quiet enough to tile safely.
    wash = canvas(TILE, TILE)
    wd = ImageDraw.Draw(wash, "RGBA")
    for _ in range(58):
        x, y = edge_rng.randrange(TILE), edge_rng.randrange(TILE)
        r = edge_rng.uniform(20, 74)
        soft_patch(wd, edge_rng, x, y, r, secondary if edge_rng.random() < 0.76 else accent, edge_rng.randrange(3, 8))
    wash = wash.filter(ImageFilter.GaussianBlur(10 * SCALE))
    img.alpha_composite(wash)
    d = ImageDraw.Draw(img, "RGBA")

    for _ in range(2600):
        x, y = edge_rng.randrange(TILE), edge_rng.randrange(TILE)
        c = rgba("#171512" if edge_rng.random() < 0.6 else line_color, edge_rng.randrange(3, 8))
        d.rectangle((x * SCALE, y * SCALE, (x + 1) * SCALE, (y + 1) * SCALE), fill=c)

    # Faint mural-current lines. Shared across variants so edges remain compatible.
    edge_col = rgba(line_color, 16)
    for y in (118, 284, 430):
        phase = y
        pts = []
        for x in range(-36, TILE + 40, 48):
            pts.append((x, y + math.sin((x + phase) * 0.012) * 1.7 + math.sin((x + phase) * 0.006) * 0.9))
        line(d, pts, edge_col, 0.45)

    for _ in range(34):
        x, y = edge_rng.randrange(18, TILE - 18), edge_rng.randrange(18, TILE - 18)
        pts = [(x, y)]
        for step in range(edge_rng.randrange(2, 5)):
            x += edge_rng.randrange(-20, 22)
            y += edge_rng.randrange(-8, 9)
            pts.append((x, y))
        line(d, pts, rgba("#0e0d0b", edge_rng.randrange(8, 17)), edge_rng.uniform(0.3, 0.6))

    # Variant detail only in the deep safe interior; no large motif should reveal tile borders.
    for _ in range(12):
        x, y = rng.randrange(132, TILE - 132), rng.randrange(118, TILE - 118)
        if pack == "sword_tomb":
            line(d, [(x - rng.randrange(24, 68), y + rng.randrange(-4, 6)), (x + rng.randrange(30, 78), y + rng.randrange(-6, 6))], rgba("#b9965a", rng.randrange(14, 28)), rng.uniform(0.55, 0.95))
            if rng.random() < 0.38:
                line(d, [(x - 8, y - 12), (x + 12, y + 14)], rgba("#82392d", rng.randrange(10, 18)), 0.55)
        else:
            line(d, [(x - 34, y + 2), (x - 8, y - 6), (x + 24, y + 3), (x + 50, y - 5)], rgba("#a38a52", rng.randrange(12, 25)), 0.55)

    img = img.filter(ImageFilter.GaussianBlur(0.05 * SCALE))
    return img


def draw_decal(pack, name, kind):
    rng = random.Random(f"{pack}-{name}")
    img = canvas(420, 220)
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = 210, 110
    if pack == "sword_tomb":
        if kind == "slash":
            stain = canvas(420, 220)
            sd = ImageDraw.Draw(stain, "RGBA")
            for i in range(8):
                ellipse(sd, cx + rng.randrange(-92, 92), cy + rng.randrange(-30, 30), rng.randrange(48, 110), rng.randrange(9, 24), fill=rgba("#5e5541", rng.randrange(10, 22)))
            stain = stain.filter(ImageFilter.GaussianBlur(6 * SCALE))
            img.alpha_composite(stain)
            d = ImageDraw.Draw(img, "RGBA")
            for i in range(6):
                y = cy + (i - 2.5) * 13
                pts = []
                for x in range(58, 358, 42):
                    pts.append((x, y + math.sin((x + i * 23) * 0.03) * 5 + rng.randrange(-3, 4)))
                line(d, pts, rgba("#b9965a", 34 - i * 2), 1.0)
            for i in range(3):
                line(d, [(cx - 86 + i * 55, cy - 58), (cx - 48 + i * 50, cy + 58)], rgba("#7b3a30", 28), 0.75)
        elif kind == "dust":
            dust = canvas(420, 220)
            dd = ImageDraw.Draw(dust, "RGBA")
            for i in range(16):
                ellipse(dd, cx + rng.randrange(-138, 138), cy + rng.randrange(-48, 48), rng.randrange(34, 92), rng.randrange(8, 24), fill=rgba("#7a6544", rng.randrange(12, 28)))
            dust = dust.filter(ImageFilter.GaussianBlur(5 * SCALE))
            img.alpha_composite(dust)
            d = ImageDraw.Draw(img, "RGBA")
            for i in range(30):
                x = cx + rng.randrange(-150, 150)
                y = cy + rng.randrange(-55, 55)
                d.rectangle((x * SCALE, y * SCALE, (x + 1) * SCALE, (y + 1) * SCALE), fill=rgba("#c7a96b", rng.randrange(18, 42)))
        else:
            for i in range(9):
                x = 54 + i * 36
                line(d, [(x, cy + rng.randrange(-30, 30)), (x + rng.randrange(10, 22), cy + rng.randrange(-46, 46))], rgba("#a88450", rng.randrange(24, 44)), 0.8)
            img = img.filter(ImageFilter.GaussianBlur(0.3 * SCALE))
    else:
        if kind == "root":
            for i in range(9):
                pts = []
                y = cy + (i - 3) * 14
                for x in range(42, 380, 38):
                    pts.append((x, y + math.sin((x + i * 32) * 0.035) * 13))
                line(d, pts, rgba("#bca45c", 34), 0.85)
            img = img.filter(ImageFilter.GaussianBlur(0.25 * SCALE))
        elif kind == "wet":
            wet = canvas(420, 220)
            wd = ImageDraw.Draw(wet, "RGBA")
            for i in range(13):
                ellipse(wd, cx + rng.randrange(-126, 126), cy + rng.randrange(-44, 44), rng.randrange(42, 96), rng.randrange(10, 26), fill=rgba("#2e6251", rng.randrange(16, 34)))
            wet = wet.filter(ImageFilter.GaussianBlur(5 * SCALE))
            img.alpha_composite(wet)
        else:
            for i in range(12):
                ellipse(d, cx + rng.randrange(-120, 120), cy + rng.randrange(-50, 50), rng.randrange(18, 42), rng.randrange(6, 13), fill=rgba("#954a2e", rng.randrange(18, 38)))
            img = img.filter(ImageFilter.GaussianBlur(0.35 * SCALE))
    img = img.filter(ImageFilter.GaussianBlur(0.1 * SCALE))
    return img


def draw_prop(pack, name, frame=0):
    img = canvas(150, 150)
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = 75, 104
    shadow = rgba("#17100b", 62)
    ellipse(d, cx, cy + 12, 42, 10, fill=shadow)
    if pack == "sword_tomb":
        if name == "broken_blade":
            polygon(d, [(62, 108), (74, 26), (84, 108)], fill=rgba("#a99b76", 205), outline=rgba("#3b3124", 160))
            line(d, [(76, 28), (72, 104)], rgba("#e0c57a", 95), 2)
            polygon(d, [(50, 112), (96, 112), (91, 124), (46, 123)], fill=rgba("#5b4030", 190))
        elif name == "torn_flag":
            line(d, [(58, 118), (62, 38)], rgba("#8d6d3e", 190), 3)
            polygon(d, [(62, 40), (112, 48), (98, 64), (112, 82), (64, 74)], fill=rgba("#7f342d", 178), outline=rgba("#c29b5b", 95))
            line(d, [(70, 52), (94, 66)], rgba("#d8b06d", 75), 1.2)
        else:
            for i in range(5):
                line(d, [(48 + i * 10, 118), (55 + i * 9, 72 + i % 2 * 9)], rgba("#a98c52", 120), 1.4)
    else:
        for i in range(5):
            line(d, [(48 + i * 10, 118), (55 + i * 9, 72 + i % 2 * 9)], rgba("#a98c52", 120), 1.4)
    return img.filter(ImageFilter.GaussianBlur(0.12 * SCALE))


def rng_like(seed, salt, lo, hi):
    return random.Random(seed * 100 + salt).randint(lo, hi)


def draw_event(pack, kind, state):
    img = canvas(190, 210)
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = 95, 144
    alpha = {"idle": 190, "ready": 235, "done": 118}[state]
    glow = canvas(190, 210)
    gd = ImageDraw.Draw(glow, "RGBA")
    glow_col = "#d5ad62" if pack == "sword_tomb" else "#61c89c"
    ellipse(gd, cx, cy + 20, 62, 18, fill=rgba(glow_col, 45 if state != "done" else 20))
    glow = glow.filter(ImageFilter.GaussianBlur(8 * SCALE))
    img.alpha_composite(glow)

    if kind == "broken_sword":
        polygon(d, [(82, 146), (95, 38), (108, 146)], fill=rgba("#b7ad85", alpha), outline=rgba("#352817", 150))
        line(d, [(96, 42), (91, 140)], rgba("#f0cf7c", 82), 2)
        polygon(d, [(58, 150), (130, 150), (122, 172), (52, 170)], fill=rgba("#5a3d2d", alpha))
    elif kind == "vow_stele":
        d.rounded_rectangle((48 * SCALE, 46 * SCALE, 142 * SCALE, 170 * SCALE), radius=15 * SCALE, fill=rgba("#594d38", alpha), outline=rgba("#b89655", 132), width=2 * SCALE)
        for y in (80, 102, 124):
            line(d, [(68, y), (122, y + 3)], rgba("#d1ad66", 70), 1.2)
    else:
        ellipse(d, cx, cy, 52, 16, fill=rgba("#2c6455", alpha), outline=rgba("#c1a45b", 105), width=2)
        ellipse(d, cx, cy - 2, 26, 8, fill=rgba("#78d0aa", 80 if state != "done" else 38))
    if state == "ready":
        ellipse(d, cx, cy + 20, 74, 22, outline=rgba("#f0ca73", 170), width=3)
    return img.filter(ImageFilter.GaussianBlur(0.08 * SCALE))


def build_pack(pack, spec):
    base_dir = ATLAS / f"{pack}_seamless"
    pack_dir = ATLAS / pack
    for idx in range(1, 5):
        save(draw_tile(pack, idx, *spec["tile"]), base_dir / f"tile_{pack}_base_final_{idx:02d}.webp", quality=86)

    for name, kind in spec["decals"]:
        save(draw_decal(pack, name, kind), pack_dir / "decals" / f"decal_{pack}_{name}.webp", quality=86)

    for name, frames in spec["props"]:
        for frame in range(frames):
            save(draw_prop(pack, name, frame), pack_dir / "props" / f"prop_{pack}_{name}_{frame}.webp", quality=86)

    for kind in spec["events"]:
        for state in ("idle", "ready", "done"):
            save(draw_event(pack, kind, state), pack_dir / "events" / f"event_{pack}_{kind}_{state}.webp", quality=86)

    manifest = {
        "id": pack,
        "tileAtlas": f"{pack}_seamless",
        "tileSize": TILE,
        "baseTiles": [f"tile_{pack}_base_final_{i:02d}.webp" for i in range(1, 5)],
        "decals": [f"decal_{pack}_{name}.webp" for name, _ in spec["decals"]],
        "props": [f"prop_{pack}_{name}_{frame}.webp" for name, frames in spec["props"] for frame in range(frames)],
        "events": [f"event_{pack}_{kind}_{state}.webp" for kind in spec["events"] for state in ("idle", "ready", "done")],
        "budget": "V0.3.3 polished WebP atlas template; replace art in-place without changing runtime keys."
    }
    (pack_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (base_dir / "manifest.json").write_text(json.dumps({"id": f"{pack}_seamless", "tileSize": TILE, "baseTiles": manifest["baseTiles"]}, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    build_pack("sword_tomb", {
        "tile": ("#3b3830", "#494336", "#2b3031", "#b38a50"),
        "decals": [("slash_trace_01", "slash"), ("dust_stain_01", "dust"), ("broken_oath_line_01", "line")],
        "props": [("broken_blade", 1), ("torn_flag", 1), ("dry_grass", 3)],
        "events": ["broken_sword", "vow_stele"]
    })
    print("Built V0.3.3 polished sword_tomb scene pack.")


if __name__ == "__main__":
    main()
