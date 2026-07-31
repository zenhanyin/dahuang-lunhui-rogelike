from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu" / "events"
SCALE = 3


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/STKAITI.TTF",
        "C:/Windows/Fonts/simkai.ttf",
        "C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
    ]
    for item in candidates:
        p = Path(item)
        if p.exists():
            return ImageFont.truetype(str(p), size * SCALE)
    return ImageFont.load_default()


def canvas(w, h):
    return Image.new("RGBA", (w * SCALE, h * SCALE), (0, 0, 0, 0))


def downsample(img):
    return img.resize((img.width // SCALE, img.height // SCALE), Image.Resampling.LANCZOS)


def save(img, name):
    OUT.mkdir(parents=True, exist_ok=True)
    downsample(img).save(OUT / name, "WEBP", quality=88, method=6)


def ellipse_box(cx, cy, rx, ry):
    return ((cx - rx) * SCALE, (cy - ry) * SCALE, (cx + rx) * SCALE, (cy + ry) * SCALE)


def draw_under(name, palette):
    w, h = 340, 156
    img = canvas(w, h)
    draw = ImageDraw.Draw(img, "RGBA")
    cx, cy = w // 2, 90
    teal, gold, dark = palette

    glow = canvas(w, h)
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse(ellipse_box(cx, cy, 126, 38), fill=(*teal, 46))
    gd.ellipse(ellipse_box(cx, cy, 78, 22), fill=(*gold, 30))
    glow = glow.filter(ImageFilter.GaussianBlur(12 * SCALE))
    img.alpha_composite(glow)

    for i, (rx, ry, alpha, width) in enumerate([(132, 39, 150, 3), (98, 27, 112, 2), (58, 15, 86, 1)]):
        draw.ellipse(ellipse_box(cx, cy, rx, ry), outline=(*gold, alpha), width=width * SCALE)
        if i < 2:
            draw.arc(ellipse_box(cx, cy, rx + 12, ry + 5), 196, 344, fill=(*teal, alpha), width=width * SCALE)

    for x in (cx - 92, cx + 92):
        draw.line((x * SCALE, (cy - 4) * SCALE, cx * SCALE, (cy - 30) * SCALE), fill=(*gold, 72), width=1 * SCALE)
    draw.ellipse(ellipse_box(cx, cy + 3, 40, 9), fill=(*dark, 56))
    save(img, name)


def draw_badge(name, text, palette):
    w, h = 132, 170
    img = canvas(w, h)
    cx, cy = w // 2, 62
    teal, gold, red, shadow = palette

    glow = canvas(w, h)
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse(ellipse_box(cx, cy + 2, 49, 48), fill=(*teal, 82))
    gd.ellipse(ellipse_box(cx, 134, 40, 12), fill=(*gold, 34))
    glow = glow.filter(ImageFilter.GaussianBlur(10 * SCALE))
    img.alpha_composite(glow)

    draw = ImageDraw.Draw(img, "RGBA")
    draw.line((cx * SCALE, 106 * SCALE, cx * SCALE, 144 * SCALE), fill=(*gold, 160), width=2 * SCALE)
    draw.rounded_rectangle((44 * SCALE, 138 * SCALE, 88 * SCALE, 151 * SCALE), radius=6 * SCALE, fill=(*shadow, 72))
    draw.ellipse(ellipse_box(cx, 149, 32, 7), fill=(16, 12, 9, 72))

    draw.ellipse(ellipse_box(cx, cy, 43, 43), fill=(*shadow, 232), outline=(*gold, 238), width=3 * SCALE)
    draw.ellipse(ellipse_box(cx, cy, 33, 33), outline=(*teal, 188), width=2 * SCALE)
    draw.arc(ellipse_box(cx, cy, 52, 52), 215, 325, fill=(*gold, 170), width=2 * SCALE)
    draw.arc(ellipse_box(cx, cy, 54, 54), 35, 145, fill=(*red, 132), width=2 * SCALE)
    draw.arc(ellipse_box(cx, cy + 2, 29, 23), 202, 338, fill=(*gold, 80), width=1 * SCALE)

    f = font(34, bold=True)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((cx * SCALE - tw / 2) + SCALE, (cy * SCALE - th / 2 - 2 * SCALE) + SCALE), text, font=f, fill=(43, 24, 15, 188))
    draw.text((cx * SCALE - tw / 2, cy * SCALE - th / 2 - 2 * SCALE), text, font=f, fill=(247, 219, 136, 255))
    save(img, name)


def draw_prompt():
    w, h = 292, 74
    img = canvas(w, h)
    draw = ImageDraw.Draw(img, "RGBA")
    bg = (55, 34, 23)
    gold = (221, 171, 86)
    teal = (63, 151, 132)
    red = (118, 54, 38)
    draw.rounded_rectangle((7 * SCALE, 9 * SCALE, (w - 7) * SCALE, (h - 10) * SCALE), radius=10 * SCALE, fill=(*bg, 224), outline=(*gold, 228), width=2 * SCALE)
    draw.line((34 * SCALE, 37 * SCALE, 92 * SCALE, 37 * SCALE), fill=(*teal, 142), width=2 * SCALE)
    draw.line(((w - 92) * SCALE, 37 * SCALE, (w - 34) * SCALE, 37 * SCALE), fill=(*teal, 142), width=2 * SCALE)
    for x in (19, w - 19):
        direction = -7 if x > w / 2 else 7
        draw.polygon([(x * SCALE, 37 * SCALE), ((x + direction) * SCALE, 28 * SCALE), ((x + direction) * SCALE, 46 * SCALE)], fill=(*red, 190))
    text = "靠近记入轮回"
    f = font(23, bold=True)
    bbox = draw.textbbox((0, 0), text, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((w * SCALE - tw) / 2 + SCALE, (h * SCALE - th) / 2 + SCALE), text, font=f, fill=(35, 20, 12, 190))
    draw.text(((w * SCALE - tw) / 2, (h * SCALE - th) / 2), text, font=f, fill=(248, 223, 151, 255))
    save(img, "event_marker_prompt_ready.webp")


def main():
    draw_under("event_marker_under_idle.webp", ((70, 150, 125), (205, 154, 78), (33, 25, 18)))
    draw_under("event_marker_under_ready.webp", ((76, 183, 152), (236, 194, 96), (42, 27, 14)))
    draw_under("event_marker_under_done.webp", ((76, 125, 101), (157, 136, 84), (22, 25, 20)))
    draw_badge("event_marker_badge_idle.webp", "缘", ((62, 151, 132), (217, 165, 78), (120, 56, 38), (31, 25, 18)))
    draw_badge("event_marker_badge_ready.webp", "缘", ((76, 196, 160), (239, 198, 94), (139, 61, 39), (33, 24, 16)))
    draw_badge("event_marker_badge_done.webp", "记", ((76, 126, 102), (165, 142, 88), (83, 66, 48), (22, 24, 20)))
    draw_prompt()
    print(f"Wrote story marker atlas to {OUT}")


if __name__ == "__main__":
    main()
