from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "runtime" / "webp" / "ui" / "formal_v034a6"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def load(path: str) -> Image.Image:
    return Image.open(ROOT / path).convert("RGBA")


def fit(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    out = im.copy()
    out.thumbnail(size, Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    layer.alpha_composite(out, ((size[0] - out.width) // 2, (size[1] - out.height) // 2))
    return layer


def crop_alpha(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def paste_sprite(atlas: Image.Image, sprites: dict, name: str, im: Image.Image, box: tuple[int, int, int, int]) -> None:
    x, y, w, h = box
    atlas.alpha_composite(fit(crop_alpha(im), (w, h)), (x, y))
    sprites[name] = {"x": x, "y": y, "w": w, "h": h}


def paper_box(size: tuple[int, int], tone: str = "paper") -> Image.Image:
    w, h = size
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if tone == "dark":
        fill = (67, 38, 25, 226)
        inner = (33, 21, 17, 184)
    else:
        fill = (210, 179, 119, 235)
        inner = (118, 74, 42, 132)
    d.rounded_rectangle((6, 6, w - 7, h - 7), radius=10, fill=fill, outline=(225, 181, 91, 210), width=2)
    d.rounded_rectangle((13, 13, w - 14, h - 14), radius=7, outline=inner, width=1)
    d.line((28, h // 2, w - 30, h // 2), fill=(68, 145, 121, 110), width=1)
    for px, py in ((15, 15), (w - 16, 15), (15, h - 16), (w - 16, h - 16)):
        d.ellipse((px - 4, py - 4, px + 4, py + 4), fill=(50, 104, 86, 210), outline=(232, 187, 91, 210))
    return im


def plaque(size: tuple[int, int]) -> Image.Image:
    w, h = size
    im = paper_box(size, "dark")
    d = ImageDraw.Draw(im)
    d.polygon([(26, h // 2), (52, 15), (w - 52, 15), (w - 26, h // 2), (w - 52, h - 15), (52, h - 15)],
              outline=(219, 165, 78, 170), fill=None)
    d.line((74, h // 2, w - 74, h // 2), fill=(74, 158, 133, 150), width=2)
    return im


def bar(size: tuple[int, int], color: tuple[int, int, int], track: bool = False) -> Image.Image:
    w, h = size
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((1, 1, w - 2, h - 2), radius=h // 2, fill=(27, 18, 13, 208), outline=(201, 154, 76, 120))
    if not track:
        d.rounded_rectangle((3, 3, w - 4, h - 4), radius=max(2, h // 2 - 2), fill=(*color, 230))
        d.line((8, 4, w - 9, 4), fill=(255, 236, 174, 76), width=1)
    return im


def halo(size: tuple[int, int], color: tuple[int, int, int], ready: bool = False) -> Image.Image:
    w, h = size
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i, alpha in enumerate((74, 48, 28, 16)):
        pad_x = 7 + i * 9
        pad_y = 14 + i * 5
        d.ellipse((pad_x, pad_y, w - pad_x, h - pad_y), outline=(*color, alpha + (28 if ready else 0)), width=2)
    d.ellipse((w * 0.36, h * 0.33, w * 0.64, h * 0.67), fill=(*color, 36 if ready else 18))
    return im.filter(ImageFilter.GaussianBlur(0.35))


def main() -> None:
    atlas = Image.new("RGBA", (1024, 512), (0, 0, 0, 0))
    sprites: dict[str, dict[str, int]] = {}

    soul = load("assets/runtime/webp/ui/resource_soul.webp")
    fire = load("assets/runtime/webp/ui/resource_fire.webp")
    minor = load("assets/runtime/webp/ui/button_minor.webp")
    title = load("assets/runtime/webp/ui/title_plaque.webp")
    old_controls = load("assets/runtime/webp/ui/hud_atlas/hud_controls_atlas.webp")

    paste_sprite(atlas, sprites, "resource_soul_wide", soul, (0, 0, 156, 58))
    paste_sprite(atlas, sprites, "resource_fire_wide", fire, (164, 0, 156, 58))
    paste_sprite(atlas, sprites, "pause_seal", old_controls.crop((208, 0, 260, 52)), (332, 0, 68, 68))
    paste_sprite(atlas, sprites, "level_badge", old_controls.crop((268, 0, 324, 56)), (408, 0, 70, 70))
    paste_sprite(atlas, sprites, "dash_seal", old_controls.crop((332, 0, 404, 72)), (488, 0, 94, 94))

    paste_sprite(atlas, sprites, "title_plaque_wide", title, (0, 92, 296, 64))
    paste_sprite(atlas, sprites, "boss_name_plaque", plaque((392, 74)), (312, 92, 392, 74))
    paste_sprite(atlas, sprites, "boss_bar_track", bar((358, 18), (130, 48, 36), True), (312, 176, 358, 18))
    paste_sprite(atlas, sprites, "boss_bar_fill", bar((358, 18), (200, 76, 48), False), (312, 202, 358, 18))
    paste_sprite(atlas, sprites, "hud_hp_fill", bar((240, 12), (190, 61, 45), False), (0, 64, 240, 12))
    paste_sprite(atlas, sprites, "hud_xp_fill", bar((240, 12), (65, 157, 126), False), (0, 78, 240, 12))

    paste_sprite(atlas, sprites, "enemy_hp_track", bar((88, 12), (112, 186, 128), True), (720, 96, 88, 12))
    paste_sprite(atlas, sprites, "enemy_hp_fill", bar((88, 12), (109, 185, 127), False), (720, 116, 88, 12))
    paste_sprite(atlas, sprites, "elite_hp_fill", bar((88, 12), (218, 87, 118), False), (720, 136, 88, 12))
    paste_sprite(atlas, sprites, "boss_hp_fill_small", bar((118, 14), (218, 83, 62), False), (720, 156, 118, 14))

    paste_sprite(atlas, sprites, "selected_badge", minor, (0, 176, 92, 38))
    paste_sprite(atlas, sprites, "start_confirm_mobile", minor, (104, 176, 260, 58))
    paste_sprite(atlas, sprites, "card_select_glow", halo((320, 390), (236, 198, 96), True), (0, 240, 320, 272))
    paste_sprite(atlas, sprites, "story_marker_idle_halo", halo((150, 94), (201, 168, 86), False), (344, 240, 150, 94))
    paste_sprite(atlas, sprites, "story_marker_ready_halo", halo((172, 104), (104, 209, 172), True), (504, 240, 172, 104))
    paste_sprite(atlas, sprites, "story_marker_done_halo", halo((132, 84), (132, 152, 120), False), (688, 240, 132, 84))

    atlas.save(OUT_DIR / "ui_formal_atlas.webp", "WEBP", quality=88, method=6)
    atlas.save(OUT_DIR / "ui_formal_atlas_preview.png")
    (OUT_DIR / "ui_formal_atlas.json").write_text(
        json.dumps({"version": "0.3.4a-6-formal-ui", "size": [1024, 512], "sprites": sprites}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
