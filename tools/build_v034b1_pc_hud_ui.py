import json
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "runtime" / "webp" / "ui" / "formal_v034b1"
OUT.mkdir(parents=True, exist_ok=True)


def load(path: str) -> Image.Image:
    return Image.open(ROOT / path).convert("RGBA")


def fit_alpha(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    bbox = im.getbbox()
    src = im.crop(bbox) if bbox else im
    src.thumbnail(size, Image.Resampling.LANCZOS)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    out.alpha_composite(src, ((size[0] - src.width) // 2, (size[1] - src.height) // 2))
    return out


def parchment(size: tuple[int, int], seed: int, base=(177, 135, 78, 238)) -> Image.Image:
    rng = random.Random(seed)
    w, h = size
    img = Image.new("RGBA", size, base)
    px = img.load()
    for y in range(h):
        for x in range(w):
            n = rng.randint(-13, 12)
            r = max(0, min(255, base[0] + n))
            g = max(0, min(255, base[1] + n))
            b = max(0, min(255, base[2] + n // 2))
            px[x, y] = (r, g, b, base[3])
    img = img.filter(ImageFilter.GaussianBlur(0.25))
    d = ImageDraw.Draw(img, "RGBA")
    for _ in range(52):
        x = rng.randint(-90, w + 90)
        y = rng.randint(0, h)
        color = rng.choice([(54, 95, 83, 28), (126, 54, 39, 24), (224, 174, 86, 20)])
        d.arc((x - 180, y - 24, x + 180, y + 24), 188, 350, fill=color, width=1)
    return img


def crop_from_hud(box: tuple[int, int, int, int]) -> Image.Image:
    hud = load("assets/runtime/webp/ui/hud_scroll_pc_v034a10.webp")
    return hud.crop(box)


def compose_hud() -> Image.Image:
    # Wider, lower-information PC HUD. Text is expected only inside the center parchment.
    w, h = 560, 244
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    body = parchment((w - 88, h - 74), 341, (188, 150, 92, 226))
    mask = Image.new("L", body.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, body.width - 1, body.height - 1), radius=18, fill=255)
    im.alpha_composite(Image.composite(body, Image.new("RGBA", body.size, (0, 0, 0, 0)), mask), (44, 42))

    d = ImageDraw.Draw(im, "RGBA")
    d.rounded_rectangle((48, 44, w - 49, h - 41), radius=18, outline=(101, 55, 35, 130), width=2)
    d.rounded_rectangle((58, 55, w - 59, h - 52), radius=13, outline=(54, 112, 96, 100), width=1)
    d.line((156, 112, w - 102, 112), fill=(54, 112, 96, 20), width=1)
    d.line((156, 158, w - 102, 158), fill=(54, 112, 96, 18), width=1)
    d.line((156, 197, w - 102, 197), fill=(129, 58, 42, 16), width=1)

    left_pillar = crop_from_hud((0, 0, 88, 368)).resize((74, h), Image.Resampling.LANCZOS)
    right_pillar = crop_from_hud((725, 0, 813, 368)).resize((74, h), Image.Resampling.LANCZOS)
    top = crop_from_hud((150, 0, 663, 96)).resize((w - 104, 70), Image.Resampling.LANCZOS)
    bottom = crop_from_hud((140, 252, 680, 368)).resize((w - 108, 76), Image.Resampling.LANCZOS)
    crest = crop_from_hud((326, 0, 496, 118)).resize((118, 82), Image.Resampling.LANCZOS)
    lotus = crop_from_hud((330, 254, 492, 368)).resize((114, 74), Image.Resampling.LANCZOS)

    im.alpha_composite(left_pillar, (0, 0))
    im.alpha_composite(right_pillar, (w - 74, 0))
    im.alpha_composite(top, (52, 8))
    im.alpha_composite(bottom, (54, h - 74))
    im.alpha_composite(crest, ((w - crest.width) // 2, 0))
    im.alpha_composite(lotus, ((w - lotus.width) // 2, h - 72))

    # Quiet inner text field: this is the actual HUD safe area.
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay, "RGBA")
    od.rounded_rectangle((132, 62, 492, 211), radius=10, fill=(230, 207, 155, 214))
    od.rounded_rectangle((132, 62, 492, 211), radius=10, outline=(79, 112, 95, 20), width=1)
    im = Image.alpha_composite(im, overlay)
    return im


def paste_sprite(atlas: Image.Image, sprites: dict, name: str, im: Image.Image, box: tuple[int, int, int, int]) -> None:
    x, y, w, h = box
    atlas.alpha_composite(fit_alpha(im, (w, h)), (x, y))
    sprites[name] = {"x": x, "y": y, "w": w, "h": h}


def button_disc(size: int, label_safe=False) -> Image.Image:
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im, "RGBA")
    cx = cy = size // 2
    for i, alpha in enumerate((88, 62, 36)):
        r = size // 2 - 5 - i * 8
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(68, 181, 154, alpha), width=3)
    d.ellipse((9, 9, size - 10, size - 10), fill=(43, 30, 24, 232), outline=(230, 176, 84, 210), width=3)
    d.ellipse((18, 18, size - 19, size - 19), outline=(75, 160, 139, 160), width=2)
    if label_safe:
        d.ellipse((25, 25, size - 26, size - 26), fill=(44, 82, 70, 205))
    return im


def resource_frame(kind: str) -> Image.Image:
    w, h = 176, 58
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im, "RGBA")
    d.rounded_rectangle((8, 7, w - 9, h - 8), radius=11, fill=(64, 43, 31, 224), outline=(228, 174, 82, 204), width=2)
    d.rounded_rectangle((18, 13, w - 18, h - 14), radius=7, fill=(186, 149, 91, 214), outline=(76, 124, 102, 100), width=1)
    color = (62, 216, 166, 235) if kind == "soul" else (225, 91, 52, 235)
    d.ellipse((15, 11, 61, 57), fill=(42, 31, 23, 235), outline=(224, 174, 82, 210), width=2)
    d.ellipse((23, 18, 52, 47), fill=color)
    d.ellipse((29, 22, 43, 34), fill=(255, 238, 178, 72))
    # Right text safe area: x 76-158. No ornament crosses it.
    d.line((76, 21, 158, 21), fill=(90, 69, 43, 110), width=1)
    d.line((76, 38, 158, 38), fill=(90, 69, 43, 82), width=1)
    return im


def plaque(size: tuple[int, int], dark=True) -> Image.Image:
    w, h = size
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(im, "RGBA")
    fill = (69, 40, 27, 235) if dark else (176, 128, 68, 232)
    d.rounded_rectangle((6, 6, w - 7, h - 7), radius=9, fill=fill, outline=(226, 170, 82, 210), width=2)
    d.polygon([(32, h // 2), (58, 16), (w - 58, 16), (w - 32, h // 2), (w - 58, h - 16), (58, h - 16)],
              outline=(213, 158, 76, 130), fill=None)
    d.line((72, h // 2, w - 72, h // 2), fill=(72, 151, 130, 130), width=2)
    return im


def build_quick_panel() -> Image.Image:
    w, h = 190, 64
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im, "RGBA")
    d.rounded_rectangle((9, 9, w - 10, h - 10), radius=8, fill=(55, 31, 23, 236), outline=(224, 171, 86, 210), width=2)
    d.rounded_rectangle((17, 16, w - 18, h - 17), radius=5, fill=(95, 57, 36, 172), outline=(64, 150, 128, 76), width=1)
    d.polygon([(20, h // 2), (38, 18), (w - 38, 18), (w - 20, h // 2), (w - 38, h - 18), (38, h - 18)],
              outline=(231, 179, 89, 118), fill=None)
    d.ellipse((13, h // 2 - 7, 27, h // 2 + 7), fill=(33, 76, 62, 210), outline=(225, 177, 92, 160), width=1)
    d.ellipse((w - 28, h // 2 - 7, w - 14, h // 2 + 7), fill=(33, 76, 62, 210), outline=(225, 177, 92, 160), width=1)
    d.line((62, h // 2, w - 62, h // 2), fill=(75, 164, 142, 120), width=2)
    return im


def bar(size: tuple[int, int], color: tuple[int, int, int], track=False) -> Image.Image:
    w, h = size
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(im, "RGBA")
    d.rounded_rectangle((1, 1, w - 2, h - 2), radius=h // 2, fill=(31, 20, 14, 210), outline=(201, 154, 76, 120))
    if not track:
        d.rounded_rectangle((3, 3, w - 4, h - 4), radius=max(2, h // 2 - 2), fill=(*color, 235))
        d.line((9, 4, w - 10, 4), fill=(255, 236, 174, 72), width=1)
    return im


def build_atlas() -> dict:
    atlas = Image.new("RGBA", (1024, 512), (0, 0, 0, 0))
    sprites: dict[str, dict[str, int]] = {}
    paste_sprite(atlas, sprites, "resource_soul_wide", resource_frame("soul"), (0, 0, 176, 58))
    paste_sprite(atlas, sprites, "resource_fire_wide", resource_frame("fire"), (184, 0, 176, 58))
    paste_sprite(atlas, sprites, "pause_seal", button_disc(68), (372, 0, 68, 68))
    paste_sprite(atlas, sprites, "level_badge", load("assets/runtime/webp/ui/formal_v034a8/ui_formal_atlas.webp").crop((408, 0, 478, 70)), (448, 0, 70, 70))
    paste_sprite(atlas, sprites, "dash_seal", button_disc(94, True), (528, 0, 94, 94))
    paste_sprite(atlas, sprites, "title_plaque_wide", plaque((320, 70)), (0, 96, 320, 70))
    paste_sprite(atlas, sprites, "build_quick", build_quick_panel(), (336, 104, 190, 64))
    paste_sprite(atlas, sprites, "chapter_alert", plaque((420, 80)), (528, 104, 420, 80))
    paste_sprite(atlas, sprites, "hud_hp_fill", bar((280, 12), (190, 61, 45)), (0, 64, 280, 12))
    paste_sprite(atlas, sprites, "hud_xp_fill", bar((280, 12), (65, 157, 126)), (0, 78, 280, 12))
    old = load("assets/runtime/webp/ui/formal_v034a8/ui_formal_atlas.webp")
    for name, box in {
        "boss_name_plaque": (536, 360, 392, 74),
        "boss_bar_track": (536, 444, 358, 18),
        "boss_bar_fill": (536, 470, 358, 18),
        "enemy_hp_track": (840, 246, 88, 12),
        "enemy_hp_fill": (840, 266, 88, 12),
        "elite_hp_fill": (840, 286, 88, 12),
        "boss_hp_fill_small": (840, 306, 118, 14),
        "selected_badge": (0, 176, 92, 38),
        "start_confirm_mobile": (104, 176, 260, 58),
        "card_select_glow": (0, 240, 320, 272),
        "story_marker_idle_halo": (344, 240, 150, 94),
        "story_marker_ready_halo": (504, 240, 172, 104),
        "story_marker_done_halo": (688, 240, 132, 84),
    }.items():
        x, y, w, h = box
        old_x, old_y, w, h = {
            "boss_name_plaque": (312, 92, 392, 74),
            "boss_bar_track": (312, 176, 358, 18),
            "boss_bar_fill": (312, 202, 358, 18),
            "enemy_hp_track": (720, 96, 88, 12),
            "enemy_hp_fill": (720, 116, 88, 12),
            "elite_hp_fill": (720, 136, 88, 12),
            "boss_hp_fill_small": (720, 156, 118, 14),
        }.get(name, (x, y, w, h))
        paste_sprite(atlas, sprites, name, old.crop((old_x, old_y, old_x + w, old_y + h)), box)
    atlas.save(OUT / "ui_runtime_atlas.webp", "WEBP", quality=90, method=6)
    atlas.save(OUT / "ui_runtime_atlas_preview.png")
    return sprites


def main() -> None:
    hud = compose_hud()
    hud.save(OUT / "hud_panel_pc.webp", "WEBP", quality=90, method=6)
    hud.save(OUT / "hud_panel_pc_preview.png")
    sprites = build_atlas()
    manifest = {
        "version": "0.3.4b1-ui-pass2-runtime-ui",
        "size": [1024, 512],
        "image": "ui_runtime_atlas.webp",
        "hud": {
            "image": "hud_panel_pc.webp",
            "size": [560, 244],
            "safe": {
                "brand": [150, 66, 410, 42],
                "bars": [150, 116, 360, 58],
                "stats": [150, 182, 360, 26]
            }
        },
        "sprites": sprites,
        "textSafe": {
            "resource_number": [76, 12, 82, 34],
            "chapter_alert": [112, 14, 232, 50],
            "build_quick": [36, 11, 106, 32],
            "dash_label": [24, 31, 46, 30],
            "pause_label": [19, 17, 30, 30]
        }
    }
    (OUT / "ui_runtime_atlas.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"out": str(OUT.relative_to(ROOT)), "sprites": len(sprites)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
