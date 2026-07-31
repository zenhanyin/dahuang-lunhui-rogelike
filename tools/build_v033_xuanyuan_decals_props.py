from pathlib import Path
import json

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "assets" / "art_direction" / "v033" / "xuanyuan_ground_rework"
DECAL_SRC = SRC_DIR / "xuanyuan_ground_decal_sheet.png"
PROP_SRC = SRC_DIR / "xuanyuan_low_props_events_sheet.png"
OUT = ROOT / "assets" / "maps" / "v033" / "xuanyuan_ground"


def feathered_rect(w, h, inset=10, blur=8, opacity=255):
    mask = Image.new("L", (w, h), 0)
    px = mask.load()
    for y in range(h):
        for x in range(w):
            edge = min(x, y, w - 1 - x, h - 1 - y)
            value = 255 if edge >= inset else int(255 * edge / max(1, inset))
            px[x, y] = int(value * opacity / 255)
    return mask.filter(ImageFilter.GaussianBlur(blur))


def soft_oval(w, h, opacity=210):
    mask = Image.new("L", (w, h), 0)
    px = mask.load()
    cx = (w - 1) / 2
    cy = (h - 1) / 2
    for y in range(h):
        for x in range(w):
            dx = (x - cx) / max(1, cx)
            dy = (y - cy) / max(1, cy)
            d = (dx * dx + dy * dy) ** 0.5
            v = max(0, 1 - d)
            px[x, y] = int((v ** 0.42) * opacity)
    return mask.filter(ImageFilter.GaussianBlur(7))


def save_piece(src, box, out_path, size=None, mode="decal"):
    piece = src.crop(box).convert("RGBA")
    if size:
        piece = piece.resize(size, Image.Resampling.LANCZOS)
    piece = ImageEnhance.Color(piece).enhance(0.9)
    piece = ImageEnhance.Contrast(piece).enhance(0.95)
    w, h = piece.size
    if mode == "decal":
        mask = soft_oval(w, h, 190)
        piece.putalpha(mask)
    else:
        mask = feathered_rect(w, h, inset=14, blur=7, opacity=235)
        piece.putalpha(mask)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    piece.save(out_path, "WEBP", quality=82, method=6)
    return out_path


def build_decals():
    src = Image.open(DECAL_SRC).convert("RGB")
    out_dir = OUT / "decals"
    cell = src.width // 4
    names = [
        "sword_array_scratches",
        "bronze_cloud_stain",
        "blood_oath_mark",
        "round_array_trace",
        "oxidized_crack",
        "gold_crack_burst",
        "blue_cloud_residue",
        "red_sword_drag",
        "buried_swords_trace",
        "dry_crack_trace",
        "wheel_array_trace",
        "old_cloud_line",
    ]
    files = []
    for idx, name in enumerate(names):
        col = idx % 3
        row = idx // 3
        x = col * cell + 28
        y = row * cell + 28
        path = save_piece(
            src,
            (x, y, x + cell - 56, y + cell - 56),
            out_dir / f"decal_xuanyuan_{name}.webp",
            size=(360, 260),
            mode="decal",
        )
        files.append(str(path.relative_to(OUT)).replace("\\", "/"))
    return files


def build_props():
    src = Image.open(PROP_SRC).convert("RGB")
    out_dir = OUT / "props"
    specs = [
        ("broken_sword_long_a", (30, 35, 620, 150), (360, 70)),
        ("broken_sword_long_b", (670, 35, 1218, 150), (340, 70)),
        ("bronze_guard_a", (24, 208, 342, 374), (230, 120)),
        ("armor_plate", (34, 430, 320, 620), (230, 150)),
        ("sword_slab", (52, 715, 710, 910), (390, 118)),
        ("broken_slab_a", (846, 415, 1194, 596), (250, 130)),
        ("painted_cloth", (715, 565, 1020, 745), (240, 135)),
        ("stone_tablet", (905, 735, 1210, 1195), (210, 320)),
        ("sword_array_core_dark", (55, 958, 325, 1210), (170, 170)),
        ("sword_array_core_green", (362, 956, 620, 1210), (170, 170)),
        ("sword_array_core_gold", (640, 956, 890, 1210), (170, 170)),
    ]
    files = []
    for name, box, size in specs:
        path = save_piece(src, box, out_dir / f"prop_xuanyuan_{name}.webp", size=size, mode="prop")
        files.append(str(path.relative_to(OUT)).replace("\\", "/"))
    return files


def build_preview(decal_files, prop_files):
    base = Image.open(OUT / "base_tiles" / "tile_xuanyuan_ground_base_01.webp").convert("RGBA")
    canvas = Image.new("RGBA", (1024, 768))
    for y in range(0, 768, 512):
        for x in range(0, 1024, 512):
            canvas.alpha_composite(base, (x, y))
    placements = [
        (decal_files[1], 90, 72),
        (decal_files[2], 585, 95),
        (decal_files[4], 350, 290),
        (decal_files[8], 78, 510),
        (prop_files[0], 560, 250),
        (prop_files[3], 120, 315),
        (prop_files[5], 710, 515),
        (prop_files[9], 460, 535),
    ]
    for rel, x, y in placements:
        img = Image.open(OUT / rel).convert("RGBA")
        canvas.alpha_composite(img, (x, y))
    canvas.convert("RGB").save(OUT / "preview_xuanyuan_ground_decals_props.webp", "WEBP", quality=82, method=6)


def build():
    decals = build_decals()
    props = build_props()
    build_preview(decals, props)
    data = json.loads((OUT / "manifest.json").read_text(encoding="utf-8"))
    data["decals"] = decals
    data["props"] = props
    data["propsPreview"] = "preview_xuanyuan_ground_decals_props.webp"
    (OUT / "manifest.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"decals": len(decals), "props": len(props), "out": str(OUT)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    build()
