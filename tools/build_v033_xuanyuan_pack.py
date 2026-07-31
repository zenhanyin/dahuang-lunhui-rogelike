from pathlib import Path
import json
import math
import random
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "maps" / "v033" / "xuanyuan"
SCALE = 3
TILE = 512


def rgba(hex_color, a=255):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


def canvas(w, h):
    return Image.new("RGBA", (w * SCALE, h * SCALE), (0, 0, 0, 0))


def down(img):
    return img.resize((img.width // SCALE, img.height // SCALE), Image.Resampling.LANCZOS)


def save(img, path, quality=86):
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
    for i in range(18):
        a = math.tau * i / 18
        rx = r * rng.uniform(0.5, 1.55)
        ry = r * rng.uniform(0.18, 0.62)
        pts.append((x + math.cos(a) * rx, y + math.sin(a) * ry))
    polygon(draw, pts, fill=rgba(color, alpha))


def wispy_trace(draw, rng, cx, cy, length, color, alpha, width=0.65):
    pts = []
    steps = 8
    angle = rng.uniform(-0.16, 0.16)
    for i in range(steps):
        t = i / (steps - 1)
        x = cx + (t - 0.5) * length * math.cos(angle)
        y = cy + math.sin(t * math.pi * 2 + rng.random()) * rng.uniform(2, 8) + (t - 0.5) * length * math.sin(angle)
        pts.append((x, y))
    line(draw, pts, rgba(color, alpha), width)


def build_base_tile(idx):
    edge_rng = random.Random("xuanyuan-shared-edge-v2")
    rng = random.Random(f"xuanyuan-base-{idx}")
    img = canvas(TILE, TILE)
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle((0, 0, img.width, img.height), fill=rgba("#37362e"))

    wash = canvas(TILE, TILE)
    wd = ImageDraw.Draw(wash, "RGBA")
    for _ in range(32):
        color = edge_rng.choice(["#444236", "#2b3432", "#4c392f", "#5f533b"])
        soft_patch(wd, edge_rng, edge_rng.randrange(TILE), edge_rng.randrange(TILE), edge_rng.uniform(48, 150), color, edge_rng.randrange(2, 5))
    for _ in range(15):
        color = rng.choice(["#41514a", "#57442e", "#2b2b28", "#6a5735"])
        soft_patch(wd, rng, rng.randrange(40, TILE - 40), rng.randrange(40, TILE - 40), rng.uniform(54, 162), color, rng.randrange(3, 8))
    img.alpha_composite(wash.filter(ImageFilter.GaussianBlur(22 * SCALE)))
    d = ImageDraw.Draw(img, "RGBA")

    for _ in range(260):
        x, y = edge_rng.randrange(TILE), edge_rng.randrange(TILE)
        c = edge_rng.choice(["#171410", "#856e47", "#263635"])
        d.rectangle((x * SCALE, y * SCALE, (x + 1) * SCALE, (y + 1) * SCALE), fill=rgba(c, edge_rng.randrange(1, 3)))

    for y in (78, 188, 312, 428):
        pts = []
        for x in range(-48, TILE + 56, 44):
            pts.append((x, y + math.sin((x + y) * 0.014) * 3.2 + math.sin((x + y) * 0.006) * 1.6))
        line(d, pts, rgba("#aa8653", 19), 0.7)

    for _ in range(24):
        x, y = rng.randrange(74, TILE - 74), rng.randrange(62, TILE - 62)
        line(d, [(x - rng.randrange(38, 112), y + rng.randrange(-10, 11)), (x + rng.randrange(42, 128), y + rng.randrange(-10, 11))], rgba("#b9965a", rng.randrange(18, 34)), rng.uniform(0.7, 1.25))
        if rng.random() < 0.55:
            line(d, [(x - rng.randrange(10, 28), y - rng.randrange(12, 34)), (x + rng.randrange(12, 32), y + rng.randrange(16, 42))], rgba("#77352d", rng.randrange(10, 22)), 0.75)

    for _ in range(22):
        wispy_trace(d, rng, rng.randrange(48, TILE - 48), rng.randrange(52, TILE - 52), rng.randrange(58, 170), rng.choice(["#273b38", "#6b5637", "#9b7b49"]), rng.randrange(9, 22), rng.uniform(0.45, 0.9))

    for _ in range(10):
        x, y = rng.randrange(52, TILE - 52), rng.randrange(52, TILE - 52)
        for j in range(rng.randrange(2, 5)):
            wispy_trace(d, rng, x + rng.randrange(-18, 19), y + rng.randrange(-10, 11), rng.randrange(28, 82), "#a7834d", rng.randrange(8, 18), 0.45)

    for _ in range(8):
        x, y = rng.randrange(36, TILE - 36), rng.randrange(40, TILE - 40)
        length = rng.randrange(118, 260)
        col = rng.choice(["#7d372d", "#2f5f54", "#a5844e"])
        for offset in (-7, 0, 7):
            pts = []
            for step in range(9):
                t = step / 8
                px = x + (t - 0.5) * length
                py = y + offset + math.sin(t * math.pi * 2 + rng.random() * 0.6) * rng.uniform(4, 11)
                pts.append((px, py))
            line(d, pts, rgba(col, rng.randrange(7, 17)), rng.uniform(0.45, 0.8))

    for _ in range(12):
        x, y = rng.randrange(42, TILE - 42), rng.randrange(42, TILE - 42)
        angle = rng.uniform(-0.9, 0.9)
        length = rng.randrange(72, 190)
        x2 = x + math.cos(angle) * length
        y2 = y + math.sin(angle) * length * 0.32
        line(d, [(x, y), (x2, y2)], rgba("#c0a15f", rng.randrange(10, 22)), rng.uniform(0.45, 0.9))
        if rng.random() < 0.45:
            line(d, [(x + 6, y + 5), (x2 + 6, y2 + 5)], rgba("#263b39", rng.randrange(8, 15)), 0.45)

    return img.filter(ImageFilter.GaussianBlur(0.04 * SCALE))


def build_decal(kind):
    rng = random.Random(f"xuanyuan-decal-{kind}")
    img = canvas(440, 230)
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = 220, 116
    if kind == "slash_trace_01":
        for i in range(7):
            y = cy + (i - 3) * 12
            pts = [(x, y + math.sin((x + i * 31) * 0.03) * 5 + rng.randrange(-2, 3)) for x in range(54, 390, 40)]
            line(d, pts, rgba("#c09a5d", 42 - i), 1.1)
        for i in range(3):
            line(d, [(cx - 90 + i * 58, cy - 58), (cx - 50 + i * 51, cy + 56)], rgba("#7b3a30", 36), 0.85)
    elif kind == "bronze_rust_01":
        for _ in range(18):
            wispy_trace(d, rng, cx + rng.randrange(-150, 151), cy + rng.randrange(-62, 63), rng.randrange(70, 180), "#36564a", rng.randrange(10, 24), rng.uniform(0.7, 1.25))
        for _ in range(8):
            wispy_trace(d, rng, cx + rng.randrange(-140, 141), cy + rng.randrange(-54, 55), rng.randrange(44, 116), "#9b7447", rng.randrange(7, 16), 0.6)
        img = img.filter(ImageFilter.GaussianBlur(2.2 * SCALE))
    elif kind == "dust_stain_01":
        for _ in range(26):
            wispy_trace(d, rng, cx + rng.randrange(-160, 161), cy + rng.randrange(-68, 69), rng.randrange(66, 170), "#7d6645", rng.randrange(7, 18), rng.uniform(0.55, 1.0))
        img = img.filter(ImageFilter.GaussianBlur(2.8 * SCALE))
    elif kind == "broken_oath_line_01":
        for i in range(10):
            x = 56 + i * 34
            line(d, [(x, cy + rng.randrange(-28, 28)), (x + rng.randrange(10, 25), cy + rng.randrange(-48, 48))], rgba("#a88450", rng.randrange(24, 48)), 0.75)
        img = img.filter(ImageFilter.GaussianBlur(0.25 * SCALE))
    else:
        for i in range(6):
            pts = []
            y = cy + (i - 2) * 18
            for x in range(42, 400, 42):
                pts.append((x, y + math.sin((x + i * 27) * 0.025) * 10))
            line(d, pts, rgba("#1f2f2f", 28), 0.8)
        img = img.filter(ImageFilter.GaussianBlur(1.2 * SCALE))
    return img


def build_prop(kind, frame=0):
    img = canvas(160, 160)
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = 80, 112
    ellipse(d, cx, cy + 12, 45, 10, fill=rgba("#14100b", 60))
    if kind == "broken_blade":
        polygon(d, [(66, 116), (78, 26), (90, 116)], fill=rgba("#aaa17b", 210), outline=rgba("#342819", 150))
        line(d, [(80, 28), (75, 110)], rgba("#efce7d", 88), 2)
        polygon(d, [(50, 120), (106, 120), (98, 132), (46, 130)], fill=rgba("#59402e", 190))
    elif kind == "torn_flag":
        line(d, [(61, 126), (65, 36)], rgba("#8d6d3e", 190), 3)
        polygon(d, [(65, 38), (122, 48), (105, 65), (122, 84), (67, 76)], fill=rgba("#7f342d", 178), outline=rgba("#c29b5b", 96))
        line(d, [(74, 52), (102, 68)], rgba("#d8b06d", 74), 1.2)
    elif kind.startswith("dry_grass"):
        rng = random.Random(f"{kind}-{frame}")
        for i in range(7):
            x = 46 + i * 10
            line(d, [(x, 126), (x + rng.randrange(-8, 9), 76 + rng.randrange(-8, 12))], rgba("#a98c52", 128), 1.4)
    elif kind == "shield_shard":
        polygon(d, [(50, 118), (63, 76), (105, 72), (116, 112), (86, 132)], fill=rgba("#4c5f53", 150), outline=rgba("#b99758", 120))
        line(d, [(66, 88), (105, 105)], rgba("#b99758", 80), 1.2)
    elif kind == "bronze_fragment":
        polygon(d, [(52, 118), (82, 82), (116, 96), (104, 130), (70, 132)], fill=rgba("#4b6c5c", 132), outline=rgba("#c0a067", 92))
        ellipse(d, 86, 106, 20, 7, fill=rgba("#9f7d4c", 54))
    elif kind == "sword_mound":
        ellipse(d, cx, 124, 48, 11, fill=rgba("#705836", 118))
        for x in (60, 78, 98):
            line(d, [(x, 120), (x + 4, 62)], rgba("#b0a37a", 158), 2)
    else:
        pulse = [0, 4, 7, 3][frame % 4]
        ellipse(d, cx, cy - 30, 20 + pulse, 31 + pulse, fill=rgba("#7fd9b7", 70))
        ellipse(d, cx, cy - 35, 8 + pulse * 0.4, 20 + pulse, fill=rgba("#e5c36f", 125))
        line(d, [(cx, cy - 12), (cx, cy - 82)], rgba("#c6a45f", 80), 1.1)
    return img.filter(ImageFilter.GaussianBlur(0.1 * SCALE))


def build_event(kind, state):
    img = canvas(200, 220)
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = 100, 152
    alpha = {"idle": 188, "ready": 236, "done": 118}[state]
    glow = canvas(200, 220)
    gd = ImageDraw.Draw(glow, "RGBA")
    ellipse(gd, cx, cy + 18, 66, 18, fill=rgba("#d5ad62", 48 if state != "done" else 22))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(8 * SCALE)))
    if kind == "broken_sword":
        polygon(d, [(86, 154), (100, 38), (114, 154)], fill=rgba("#b7ad85", alpha), outline=rgba("#352817", 150))
        line(d, [(101, 42), (95, 148)], rgba("#f0cf7c", 82), 2)
        polygon(d, [(58, 158), (138, 158), (128, 180), (52, 178)], fill=rgba("#5a3d2d", alpha))
    else:
        d.rounded_rectangle((56 * SCALE, 58 * SCALE, 144 * SCALE, 174 * SCALE), radius=13 * SCALE, fill=rgba("#564b38", alpha), outline=rgba("#b89655", 132), width=2 * SCALE)
        for y in (82, 106, 130):
            line(d, [(70, y), (130, y + 4)], rgba("#d1ad66", 72), 1.2)
    if state == "ready":
        ellipse(d, cx, cy + 20, 78, 24, outline=rgba("#f0ca73", 172), width=3)
    return img.filter(ImageFilter.GaussianBlur(0.08 * SCALE))


def main():
    files = {
        "baseTiles": [],
        "decals": [],
        "props_static": [],
        "props_animated": [],
        "story_markers": [],
        "events": [],
        "atmosphere": []
    }
    for idx in range(1, 5):
        name = f"tile_xuanyuan_base_{idx:02d}.webp"
        save(build_base_tile(idx), OUT / "base_tiles" / name, quality=86)
        files["baseTiles"].append(f"base_tiles/{name}")

    for kind in ("slash_trace_01", "bronze_rust_01", "dust_stain_01", "broken_oath_line_01", "ink_shadow_line_01"):
        name = f"decal_xuanyuan_{kind}.webp"
        save(build_decal(kind), OUT / "decals" / name, quality=86)
        files["decals"].append(f"decals/{name}")

    for kind in ("broken_blade", "torn_flag", "dry_grass_0", "dry_grass_1", "dry_grass_2", "shield_shard", "bronze_fragment", "sword_mound"):
        name = f"prop_xuanyuan_{kind}.webp"
        save(build_prop(kind), OUT / "props_static" / name, quality=86)
        files["props_static"].append(f"props_static/{name}")

    for frame in range(4):
        name = f"prop_xuanyuan_sword_soul_{frame}.webp"
        save(build_prop("sword_soul", frame), OUT / "props_animated" / name, quality=86)
        files["props_animated"].append(f"props_animated/{name}")

    for kind in ("broken_sword", "vow_stele"):
        states = {}
        for state in ("idle", "ready", "done"):
            name = f"event_xuanyuan_{kind}_{state}.webp"
            save(build_event(kind, state), OUT / "story_markers" / name, quality=86)
            states[state] = f"story_markers/{name}"
            files["story_markers"].append(states[state])
        files["events"].append({"id": kind, "states": states})

    manifest = {
        "id": "xuanyuan",
        "runtimeMapId": "sword_tomb",
        "version": "0.3.3b-xuanyuan-visual-pass",
        "scenePack": "sword_tomb",
        "tileAtlas": "sword_tomb_seamless",
        "tileSize": TILE,
        "style": "Dunhuang mineral fresco, sword tomb, iron gray earth, oxidized bronze, faded cinnabar, old battle scars",
        "budgetKb": {
            "baseTiles": 360,
            "decals": 240,
            "props": 360,
            "events": 240,
            "atmosphere": 160
        },
        "baseTiles": files["baseTiles"],
        "decals": files["decals"],
        "props_static": files["props_static"],
        "props_animated": files["props_animated"],
        "story_markers": files["events"],
        "atmosphere": files["atmosphere"],
        "runtime": {
            "loadStrategy": "current-map-pack-only",
            "drawOrder": "base -> decals -> low props -> drops/projectiles -> actors -> events by world y -> vfx -> ui"
        }
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Built {manifest['version']} at {OUT}")


if __name__ == "__main__":
    main()
