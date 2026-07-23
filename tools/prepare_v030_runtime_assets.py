from __future__ import annotations

import json
import math
import random
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
GENERATED = ASSETS / "generated" / "runtime-webp"
FORMAL_ATLAS = ASSETS / "generated" / "formal-ui-atlas" / "v0.3.3"
RUNTIME = ASSETS / "runtime" / "webp"
VERSION = "0.3.3-formal-atlas"


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def copy_tree(src: Path, dst: Path, manifest: list[dict], allowed_prefixes: tuple[str, ...] | None = None) -> None:
    ensure_dir(dst)
    for file in sorted(src.glob("*.webp")):
        if allowed_prefixes and not file.stem.startswith(allowed_prefixes):
            continue
        out = dst / file.name
        shutil.copy2(file, out)
        with Image.open(out) as img:
            manifest.append({
                "id": out.stem,
                "type": dst.name,
                "path": out.relative_to(ROOT).as_posix(),
                "size": list(img.size),
                "bytes": out.stat().st_size,
                "preload": dst.name in {"characters", "enemies"}
            })


def copy_webp(src: Path, dst: Path) -> None:
    ensure_dir(dst.parent)
    shutil.copy2(src, dst)


def add_manifest_file(file: Path, manifest: list[dict], asset_type: str, preload: bool) -> None:
    with Image.open(file) as img:
        manifest.append({
            "id": file.stem,
            "type": asset_type,
            "path": file.relative_to(ROOT).as_posix(),
            "size": list(img.size),
            "bytes": file.stat().st_size,
            "preload": preload
        })


def copy_formal_ui(ui_dir: Path, manifest: list[dict]) -> set[str]:
    direct_assets = {
        "hud_scroll",
        "choice_card_frame",
        "lineage_card",
        "dialogue_scroll",
        "pause_panel",
        "result_panel",
        "button_continue",
        "button_minor",
        "resource_soul",
        "resource_fire",
        "title_plaque",
    }
    copied: set[str] = set()
    for stem in sorted(direct_assets):
        src = FORMAL_ATLAS / f"{stem}.webp"
        if not src.exists():
            continue
        dst = ui_dir / src.name
        copy_webp(src, dst)
        copied.add(dst.stem)
        add_manifest_file(dst, manifest, "ui", dst.stem in {
            "hud_scroll",
            "resource_soul",
            "resource_fire",
            "button_continue",
            "button_minor",
        })

    formal_dir = GENERATED / "ui" / "formal"
    mappings = {
        "hud_book.webp": "hud_scroll.webp",
        "choice_card_dunhuang.webp": "choice_card_frame.webp",
        "lineage_card_dunhuang.webp": "lineage_card.webp",
        "pause_panel_dunhuang.webp": "pause_panel.webp",
        "result_panel_dunhuang.webp": "result_panel.webp",
        "resource_soul_plaque.webp": "resource_soul.webp",
        "resource_fire_plaque.webp": "resource_fire.webp",
        "pause_bronze_mirror.webp": "pause_seal.webp",
        "dash_medallion.webp": "godpower_medallion.webp",
    }
    for src_name, dst_name in mappings.items():
        if Path(dst_name).stem in copied:
            continue
        src = formal_dir / src_name
        if not src.exists():
            continue
        dst = ui_dir / dst_name
        copy_webp(src, dst)
        copied.add(dst.stem)
        add_manifest_file(dst, manifest, "ui", dst.stem in {
            "hud_scroll",
            "resource_soul",
            "resource_fire",
            "pause_seal",
            "godpower_medallion"
        })

    for src_name in ("hp_bar.webp", "xp_bar.webp"):
        src = GENERATED / "ui" / src_name
        if not src.exists():
            continue
        dst = ui_dir / src_name
        copy_webp(src, dst)
        copied.add(dst.stem)
        add_manifest_file(dst, manifest, "ui", True)

    return copied


def webp_save(img: Image.Image, path: Path, quality: int = 78) -> None:
    ensure_dir(path.parent)
    img.save(path, "WEBP", quality=quality, method=6)


def parchment_bg(size: tuple[int, int], seed: int, base=(191, 159, 103, 255)) -> Image.Image:
    rng = random.Random(seed)
    w, h = size
    img = Image.new("RGBA", size, base)
    px = img.load()
    for y in range(h):
        for x in range(w):
            n = rng.randint(-10, 10)
            edge = min(x, y, w - 1 - x, h - 1 - y)
            burn = max(0, 18 - edge) * 3
            r, g, b, a = px[x, y]
            px[x, y] = (
                max(0, min(255, r + n - burn)),
                max(0, min(255, g + n - burn)),
                max(0, min(255, b + n - burn)),
                a,
            )
    return img.filter(ImageFilter.GaussianBlur(0.25))


def draw_weathered_rect(draw: ImageDraw.ImageDraw, box, fill, outline, width=3, corner=10):
    draw.rounded_rectangle(box, radius=corner, fill=fill, outline=outline, width=width)
    x0, y0, x1, y1 = box
    for i in range(10):
        x = x0 + 10 + i * (x1 - x0 - 20) / 10
        draw.line([(x, y0 + 2), (x + 8, y0 + random.randint(0, 7))], fill=(90, 72, 45, 75), width=1)


def make_mist_decal(path: Path, seed: int, color=(132, 72, 158)) -> None:
    rng = random.Random(seed)
    w, h = 384, 192
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    for _ in range(12):
        cx = rng.randint(40, w - 40)
        cy = rng.randint(42, h - 38)
        rx = rng.randint(54, 128)
        ry = rng.randint(16, 42)
        draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(*color, rng.randint(22, 48)))
    for _ in range(9):
        y = rng.randint(58, h - 44)
        pts = []
        for x in range(26, w - 20, 34):
            pts.append((x, y + math.sin(x * 0.035 + seed) * rng.randint(4, 14)))
        draw.line(pts, fill=(220, 178, 110, 70), width=3)
    img = img.filter(ImageFilter.GaussianBlur(0.7))
    webp_save(img, path, 78)


def make_crack_decal(path: Path, seed: int) -> None:
    rng = random.Random(seed)
    w, h = 320, 160
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    for _ in range(4):
        x = rng.randint(20, 80)
        y = rng.randint(40, 120)
        pts = [(x, y)]
        for _ in range(5):
            x += rng.randint(28, 62)
            y += rng.randint(-22, 22)
            pts.append((x, y))
        draw.line(pts, fill=(110, 42, 33, 145), width=3)
        draw.line([(px, py + 3) for px, py in pts], fill=(25, 19, 16, 70), width=2)
    webp_save(img, path, 80)


def make_icon(path: Path, kind: str, bg: tuple[int, int, int], fg: tuple[int, int, int]) -> None:
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.ellipse((8, 8, 88, 88), fill=(30, 35, 31, 235), outline=(190, 139, 73, 210), width=3)
    draw.ellipse((16, 16, 80, 80), fill=(*bg, 160), outline=(*fg, 150), width=2)
    if kind == "sword":
        draw.polygon([(48, 16), (56, 49), (48, 78), (40, 49)], fill=(*fg, 230))
        draw.line((32, 58, 64, 38), fill=(238, 226, 178, 210), width=5)
    elif kind == "talisman":
        draw.rounded_rectangle((35, 20, 61, 76), radius=3, fill=(186, 137, 69, 235), outline=(91, 46, 34, 210), width=2)
        draw.line((42, 31, 55, 31), fill=(*fg, 230), width=3)
        draw.line((42, 44, 55, 44), fill=(*fg, 230), width=3)
        draw.line((46, 31, 46, 62), fill=(132, 41, 32, 220), width=2)
    elif kind == "mist":
        for y in (34, 48, 62):
            draw.arc((22, y - 15, 76, y + 15), 190, 350, fill=(*fg, 230), width=6)
    elif kind == "flame":
        draw.polygon([(48, 18), (62, 48), (53, 78), (39, 78), (31, 50)], fill=(*fg, 220))
        draw.polygon([(49, 36), (56, 58), (47, 74), (39, 58)], fill=(245, 190, 84, 225))
    elif kind == "heal":
        draw.ellipse((36, 20, 60, 76), fill=(*fg, 210))
        draw.ellipse((24, 36, 72, 62), fill=(*fg, 175))
        draw.line((48, 28, 48, 68), fill=(238, 226, 178, 220), width=4)
    elif kind == "clue":
        draw.rounded_rectangle((28, 24, 68, 72), radius=4, fill=(112, 91, 60, 225), outline=(*fg, 190), width=2)
        draw.line((37, 36, 59, 36), fill=(224, 199, 137, 210), width=3)
        draw.line((37, 49, 59, 49), fill=(224, 199, 137, 210), width=3)
    elif kind == "shield":
        draw.polygon([(48, 18), (70, 28), (64, 64), (48, 78), (32, 64), (26, 28)], fill=(*fg, 215))
        draw.line((48, 28, 48, 68), fill=(238, 226, 178, 170), width=3)
    elif kind == "speed":
        for y in (34, 48, 62):
            draw.arc((18, y - 14, 78, y + 14), 205, 335, fill=(*fg, 220), width=5)
        draw.polygon([(66, 36), (80, 48), (66, 60)], fill=(*fg, 220))
    elif kind == "burst":
        for a in range(0, 360, 45):
            r1, r2 = 10, 31
            x1 = 48 + math.cos(math.radians(a)) * r1
            y1 = 48 + math.sin(math.radians(a)) * r1
            x2 = 48 + math.cos(math.radians(a)) * r2
            y2 = 48 + math.sin(math.radians(a)) * r2
            draw.line((x1, y1, x2, y2), fill=(*fg, 220), width=4)
        draw.ellipse((36, 36, 60, 60), fill=(238, 226, 178, 210))
    webp_save(img, path, 82)


def make_ui_piece(path: Path, kind: str) -> None:
    sizes = {
        "button_continue": (240, 72),
        "button_minor": (150, 48),
        "resource_soul": (168, 64),
        "resource_fire": (168, 64),
        "pause_seal": (88, 88),
        "choice_card_frame": (300, 384),
        "title_plaque": (280, 86),
        "dialogue_scroll": (720, 220),
        "hud_scroll": (420, 190),
        "godpower_medallion": (150, 150),
    }
    img = Image.new("RGBA", sizes[kind], (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")
    w, h = img.size
    if kind in {"button_continue", "button_minor"}:
        draw_weathered_rect(draw, (8, 8, w - 8, h - 8), (159, 118, 63, 225), (95, 61, 39, 220), 3, 12)
    elif kind.startswith("resource"):
        draw_weathered_rect(draw, (6, 8, w - 6, h - 8), (177, 149, 98, 220), (73, 98, 86, 220), 3, 12)
        color = (62, 198, 151) if kind.endswith("soul") else (210, 83, 48)
        draw.ellipse((18, 20, 46, 48), fill=(*color, 220))
    elif kind == "pause_seal":
        draw.ellipse((8, 8, 80, 80), fill=(123, 58, 39, 235), outline=(188, 139, 73, 230), width=4)
        draw.ellipse((18, 18, 70, 70), outline=(218, 177, 104, 160), width=2)
    elif kind == "choice_card_frame":
        bg = parchment_bg((w, h), 31, (201, 170, 112, 245))
        img.alpha_composite(bg)
        draw = ImageDraw.Draw(img, "RGBA")
        draw_weathered_rect(draw, (10, 10, w - 10, h - 10), (202, 168, 104, 80), (73, 98, 86, 230), 4, 18)
        draw.ellipse((96, 28, 204, 136), fill=(28, 47, 42, 235), outline=(193, 146, 71, 230), width=4)
    elif kind == "title_plaque":
        draw_weathered_rect(draw, (8, 10, w - 8, h - 10), (60, 38, 24, 238), (177, 128, 65, 230), 3, 10)
        draw.polygon([(24, h * 0.5), (52, 20), (w - 52, 20), (w - 24, h * 0.5), (w - 52, h - 20), (52, h - 20)], fill=(76, 44, 27, 180), outline=(216, 166, 77, 170))
        draw.line((48, h * 0.5, w - 48, h * 0.5), fill=(82, 180, 137, 90), width=2)
    elif kind == "dialogue_scroll":
        bg = parchment_bg((w, h), 42, (202, 176, 121, 238))
        img.alpha_composite(bg)
        draw = ImageDraw.Draw(img, "RGBA")
        draw_weathered_rect(draw, (16, 16, w - 16, h - 16), (202, 176, 121, 80), (73, 98, 86, 210), 3, 12)
        draw.rectangle((0, 20, 34, h - 20), fill=(128, 93, 54, 210))
        draw.rectangle((w - 34, 20, w, h - 20), fill=(128, 93, 54, 210))
    elif kind == "hud_scroll":
        bg = parchment_bg((w, h), 51, (199, 170, 113, 238))
        img.alpha_composite(bg)
        draw = ImageDraw.Draw(img, "RGBA")
        draw_weathered_rect(draw, (12, 12, w - 12, h - 12), (202, 176, 121, 55), (73, 98, 86, 210), 3, 14)
    elif kind == "godpower_medallion":
        draw.ellipse((8, 8, w - 8, h - 8), fill=(23, 43, 39, 235), outline=(190, 139, 73, 235), width=5)
        draw.ellipse((24, 24, w - 24, h - 24), fill=(28, 82, 70, 150), outline=(80, 192, 162, 150), width=3)
        for y in (60, 78, 96):
            draw.arc((40, y - 22, 110, y + 22), 200, 345, fill=(225, 230, 188, 220), width=7)
    webp_save(img, path, 78)


def main() -> None:
    if RUNTIME.exists():
        shutil.rmtree(RUNTIME)
    manifest: list[dict] = []
    copy_tree(GENERATED / "characters", RUNTIME / "characters", manifest, ("sword_", "witch_", "alchemist_"))
    copy_tree(GENERATED / "enemies", RUNTIME / "enemies", manifest, ("wraith_", "elite_"))
    copy_tree(GENERATED / "terrain", RUNTIME / "terrain", manifest)

    scene_dir = RUNTIME / "scene" / "qingqiu"
    ensure_dir(scene_dir)
    for i in range(1, 4):
        make_mist_decal(scene_dir / f"decal_mist_pool_{i:02d}.webp", 200 + i)
    for i in range(1, 3):
        make_crack_decal(scene_dir / f"decal_crack_{i:02d}.webp", 300 + i)

    for file in sorted(scene_dir.glob("*.webp")):
        with Image.open(file) as img:
            manifest.append({
                "id": file.stem,
                "type": "scene.qingqiu",
                "path": file.relative_to(ROOT).as_posix(),
                "size": list(img.size),
                "bytes": file.stat().st_size,
                "preload": False
            })

    ui_dir = RUNTIME / "ui"
    formal_names = copy_formal_ui(ui_dir, manifest)
    for kind in (
        "hud_scroll",
        "resource_soul",
        "resource_fire",
        "pause_seal",
        "button_continue",
        "button_minor",
        "title_plaque",
        "choice_card_frame",
        "dialogue_scroll",
        "godpower_medallion",
    ):
        if kind not in formal_names:
            make_ui_piece(ui_dir / f"{kind}.webp", kind)

    icon_dir = ui_dir / "icons"
    icons = {
        "sword": ((30, 80, 82), (122, 213, 238)),
        "talisman": ((88, 65, 46), (219, 151, 74)),
        "mist": ((75, 51, 92), (178, 105, 218)),
        "flame": ((102, 47, 32), (230, 102, 52)),
        "heal": ((36, 94, 74), (103, 198, 140)),
        "clue": ((83, 73, 55), (213, 178, 93)),
        "shield": ((47, 82, 90), (110, 190, 193)),
        "speed": ((42, 86, 69), (117, 205, 164)),
        "burst": ((91, 53, 42), (220, 138, 62)),
    }
    for kind, (bg, fg) in icons.items():
        make_icon(icon_dir / f"attr_{kind}.webp", kind, bg, fg)

    manifest_paths = {item["path"] for item in manifest}
    for file in sorted(ui_dir.glob("*.webp")) + sorted(icon_dir.glob("*.webp")):
        if file.relative_to(ROOT).as_posix() in manifest_paths:
            continue
        with Image.open(file) as img:
            manifest.append({
                "id": file.stem,
                "type": "ui" if file.parent == ui_dir else "ui.icons",
                "path": file.relative_to(ROOT).as_posix(),
                "size": list(img.size),
                "bytes": file.stat().st_size,
                "preload": file.parent == icon_dir or file.stem in {"hud_scroll", "resource_soul", "resource_fire", "pause_seal", "godpower_medallion"}
            })

    total_bytes = sum(item["bytes"] for item in manifest)
    output = {
        "version": VERSION,
        "runtimeRoot": "assets/runtime/webp",
        "memoryPolicy": {
            "preload": "characters, enemies, core HUD and icon assets",
            "lazyLoad": "bosses, chapter-specific panels, non-current map packs",
            "notes": "Use small WebP components and procedural canvas layers; do not load concept keyframes at runtime."
        },
        "totalBytes": total_bytes,
        "assetCount": len(manifest),
        "assets": manifest,
        "scenePacks": {
            "qingqiu": {
                "id": "qingqiu-dream-abyss",
                "name": "闈掍笜姊︽笂",
                "decals": [
                    "decal_mist_pool_01",
                    "decal_mist_pool_02",
                    "decal_mist_pool_03",
                    "decal_crack_01",
                    "decal_crack_02"
                ],
                "props": ["foxfire", "stele", "spiritWell", "shrine", "rift", "grass", "stone", "bone"]
            }
        }
    }
    manifest_path = ASSETS / "asset-manifest.v0.3.json"
    manifest_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"manifest": manifest_path.relative_to(ROOT).as_posix(), "assets": len(manifest), "bytes": total_bytes}, ensure_ascii=False))


if __name__ == "__main__":
    main()

