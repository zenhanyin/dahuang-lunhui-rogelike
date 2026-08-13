from pathlib import Path
import math
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/maps/v033/xuanyuan_ground/props"
EVENT_OUT = ROOT / "assets/maps/v033/xuanyuan_ground/events"
OUT.mkdir(parents=True, exist_ok=True)
EVENT_OUT.mkdir(parents=True, exist_ok=True)

W, H = 512, 256
RNG = random.Random(33033)
KAI_FONT = ImageFont.truetype("C:/Windows/Fonts/simkai.ttf", 58)


def canvas():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def add_ground_shadow(img, cx=256, cy=152, rx=160, ry=36, alpha=42):
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(28, 20, 15, alpha))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(12)))


def rough_poly(draw, points, fill, outline=None, width=1):
    jittered = []
    for x, y in points:
        jittered.append((x + RNG.randint(-3, 3), y + RNG.randint(-3, 3)))
    draw.polygon(jittered, fill=fill)
    if outline:
        draw.line(jittered + [jittered[0]], fill=outline, width=width, joint="curve")


def save(img, name):
    # A tiny blur on the alpha edge makes the prop read as painted on the ground.
    img.save(OUT / name, "WEBP", lossless=True, quality=92, method=6)
    print(name)


def clear_alpha_haze(img, threshold=18):
    pixels = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]
            if a <= threshold:
                pixels[x, y] = (0, 0, 0, 0)


def sword_trace():
    img = canvas()
    add_ground_shadow(img, 252, 144, 190, 28, 30)
    draw = ImageDraw.Draw(img)
    ochre = (194, 151, 75, 145)
    dark = (55, 43, 32, 165)
    teal = (77, 123, 112, 70)
    rust = (129, 53, 38, 100)
    for angle, x, y, length in [(-18, 165, 143, 186), (11, 295, 128, 142), (-9, 236, 162, 108)]:
        rad = math.radians(angle)
        dx, dy = math.cos(rad), math.sin(rad)
        nx, ny = -dy, dx
        p1 = (x - dx * length / 2, y - dy * length / 2)
        p2 = (x + dx * length / 2, y + dy * length / 2)
        draw.line((p1, p2), fill=dark, width=5)
        draw.line((p1[0] + nx * 2, p1[1] + ny * 2, p2[0] + nx * 2, p2[1] + ny * 2), fill=ochre, width=2)
        draw.line((p1[0] - nx * 4, p1[1] - ny * 4, p2[0] - nx * 4, p2[1] - ny * 4), fill=teal, width=2)
        draw.circle((p2[0], p2[1]), 5, fill=ochre)
    for _ in range(18):
        x = RNG.randint(70, 440)
        y = RNG.randint(108, 184)
        draw.ellipse((x - 3, y - 2, x + 4, y + 3), fill=(108, 91, 64, 125))
    draw.line((92, 178, 212, 163, 330, 176, 430, 158), fill=rust, width=3)
    save(img, "prop_xuanyuan_sword_trace_low_v033j_0.webp")


def broken_ring():
    img = canvas()
    add_ground_shadow(img, 258, 148, 142, 34, 34)
    draw = ImageDraw.Draw(img)
    for i in range(20):
        a0 = math.radians(i * 18 + RNG.randint(-4, 4))
        a1 = math.radians((i + 0.72) * 18 + RNG.randint(-3, 3))
        r0, r1 = 82 + RNG.randint(-4, 4), 112 + RNG.randint(-4, 4)
        pts = [
            (256 + math.cos(a0) * r0, 142 + math.sin(a0) * r0 * 0.44),
            (256 + math.cos(a0) * r1, 142 + math.sin(a0) * r1 * 0.44),
            (256 + math.cos(a1) * r1, 142 + math.sin(a1) * r1 * 0.44),
            (256 + math.cos(a1) * r0, 142 + math.sin(a1) * r0 * 0.44),
        ]
        fill = (119 + RNG.randint(-12, 12), 104 + RNG.randint(-10, 10), 76 + RNG.randint(-8, 8), 188)
        rough_poly(draw, pts, fill, (51, 43, 34, 150), 2)
    draw.ellipse((166, 103, 346, 181), outline=(190, 148, 74, 112), width=3)
    draw.arc((178, 110, 334, 174), 190, 352, fill=(67, 126, 110, 96), width=4)
    for _ in range(16):
        x = RNG.randint(120, 392)
        y = RNG.randint(106, 190)
        draw.ellipse((x - 4, y - 2, x + 5, y + 3), fill=(82, 73, 55, 118))
    save(img, "prop_xuanyuan_broken_ring_low_v033j_0.webp")


def cinnabar_scrape():
    img = canvas()
    add_ground_shadow(img, 260, 145, 176, 24, 24)
    draw = ImageDraw.Draw(img)
    for i in range(9):
        x0 = 88 + i * 24 + RNG.randint(-10, 10)
        y0 = 145 + RNG.randint(-24, 18)
        x1 = x0 + RNG.randint(135, 230)
        y1 = y0 + RNG.randint(-24, 24)
        draw.line((x0, y0, x1, y1), fill=(124, 50, 37, RNG.randint(72, 125)), width=RNG.randint(4, 8))
        draw.line((x0 + 3, y0 - 3, x1 - 8, y1 - 2), fill=(190, 139, 70, RNG.randint(35, 70)), width=1)
    for x in range(116, 410, 42):
        y = 136 + RNG.randint(-20, 24)
        draw.arc((x - 18, y - 12, x + 22, y + 14), 210, 520, fill=(196, 154, 79, 90), width=2)
    save(img, "prop_xuanyuan_cinnabar_scrape_low_v033j_0.webp")


def dry_grass():
    img = canvas()
    add_ground_shadow(img, 252, 158, 125, 26, 30)
    draw = ImageDraw.Draw(img)
    for _ in range(34):
        x = RNG.randint(150, 360)
        y = RNG.randint(128, 172)
        height = RNG.randint(24, 58)
        bend = RNG.randint(-26, 26)
        color = RNG.choice([(158, 132, 72, 150), (117, 102, 62, 145), (185, 148, 77, 120)])
        draw.line((x, y, x + bend, y - height), fill=color, width=2)
    for _ in range(16):
        x = RNG.randint(130, 390)
        y = RNG.randint(148, 184)
        draw.ellipse((x - 8, y - 4, x + 10, y + 5), fill=(78, 70, 54, 138))
        draw.arc((x - 10, y - 6, x + 12, y + 6), 190, 350, fill=(181, 143, 73, 96), width=1)
    save(img, "prop_xuanyuan_dry_grass_low_v033j_0.webp")


def event_disk(state, glow_alpha, seal_alpha, name):
    img = canvas()
    draw = ImageDraw.Draw(img)
    add_ground_shadow(img, 256, 154, 112, 26, 30 if state != "done" else 18)
    if glow_alpha:
        draw.ellipse((126, 91, 386, 201), outline=(98, 202, 166, int(glow_alpha * 0.72)), width=3)
        draw.ellipse((158, 107, 354, 187), outline=(224, 176, 82, int(glow_alpha * 0.52)), width=2)
    for i in range(22):
        a0 = math.radians(i * 16.4)
        a1 = math.radians((i + 0.82) * 16.4)
        r0, r1 = 66 + RNG.randint(-2, 2), 92 + RNG.randint(-2, 3)
        pts = [
            (256 + math.cos(a0) * r0, 145 + math.sin(a0) * r0 * 0.42),
            (256 + math.cos(a0) * r1, 145 + math.sin(a0) * r1 * 0.42),
            (256 + math.cos(a1) * r1, 145 + math.sin(a1) * r1 * 0.42),
            (256 + math.cos(a1) * r0, 145 + math.sin(a1) * r0 * 0.42),
        ]
        rough_poly(draw, pts, (93, 82, 65, 210), (42, 34, 27, 160), 1)
    draw.ellipse((184, 111, 328, 181), fill=(62, 54, 43, 216), outline=(177, 138, 74, 150), width=3)
    draw.arc((174, 104, 338, 188), 200, 520, fill=(71, 132, 116, seal_alpha), width=4)
    draw.text((256, 145), "缘", fill=(226, 185, 92, 232 if state != "done" else 145), anchor="mm", font=KAI_FONT)
    if state == "done":
        draw.line((216, 147, 296, 143), fill=(95, 130, 93, 130), width=4)
    clear_alpha_haze(img, 24)
    img.save(EVENT_OUT / name, "WEBP", lossless=True, quality=92, method=6)
    print(name)


if __name__ == "__main__":
    sword_trace()
    broken_ring()
    cinnabar_scrape()
    dry_grass()
    event_disk("idle", 38, 92, "event_xuanyuan_stone_disk_v033j_idle.webp")
    event_disk("ready", 105, 180, "event_xuanyuan_stone_disk_v033j_ready.webp")
    event_disk("done", 18, 58, "event_xuanyuan_stone_disk_v033j_done.webp")
