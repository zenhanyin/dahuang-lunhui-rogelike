from pathlib import Path
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / "assets" / "generated" / "runtime-webp"
MAPS = ROOT / "assets" / "maps"
OUT = ROOT / "assets" / "maps"


def load(path):
    return Image.open(path).convert("RGBA")


def alpha_bbox(img):
    return img.getchannel("A").getbbox()


def opaque_columns(img, threshold=12):
    alpha = img.getchannel("A")
    cols = []
    for x in range(img.width):
        count = sum(1 for y in range(img.height) if alpha.getpixel((x, y)) > 20)
        if count > threshold:
            cols.append(x)
    return cols


def has_split_subject(img):
    cols = opaque_columns(img)
    if not cols:
        return False
    gaps = 0
    previous = cols[0]
    for x in cols[1:]:
        if x - previous > 18:
            gaps += 1
        previous = x
    return gaps > 0


def check_frames():
    warnings = []
    for folder in ["characters", "enemies", "terrain", "ui"]:
        for path in sorted((RUNTIME / folder).glob("*.webp")):
            img = load(path)
            bbox = alpha_bbox(img)
            if bbox is None:
                warnings.append(f"empty alpha: {path.relative_to(ROOT)}")
                continue
            coverage = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) / (img.width * img.height)
            if folder in ["characters", "enemies"] and coverage < 0.12:
                warnings.append(f"small actor crop: {path.relative_to(ROOT)} coverage={coverage:.2f}")
            if folder in ["characters", "enemies"] and has_split_subject(img):
                warnings.append(f"possible split actor: {path.relative_to(ROOT)}")
    for path in sorted(MAPS.glob("*.webp")):
        img = load(path)
        if path.name in {"wilds-final.webp", "qingqiu-final.webp"} and img.size != (1280, 720):
            warnings.append(f"map backdrop wrong size: {path.relative_to(ROOT)} {img.size}")
    return warnings


def paste_center(canvas, img, cx, cy, target_h):
    scale = target_h / img.height
    target_w = max(1, round(img.width * scale))
    resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    canvas.alpha_composite(resized, (round(cx - target_w / 2), round(cy - target_h)))


def make_preview():
    OUT.mkdir(parents=True, exist_ok=True)
    bg = load(MAPS / "qingqiu-final.webp").resize((1280, 720), Image.Resampling.LANCZOS)
    shade = Image.new("RGBA", bg.size, (0, 0, 0, 55))
    bg.alpha_composite(shade)
    draw = ImageDraw.Draw(bg, "RGBA")

    terrain = [
        ("mist_0.webp", 180, 250, 130),
        ("mist_1.webp", 910, 205, 150),
        ("spirit_pool_0.webp", 550, 500, 105),
        ("rift_0.webp", 860, 520, 90),
        ("stele_0.webp", 1080, 350, 90),
        ("shrine_0.webp", 320, 520, 120),
        ("grass_0.webp", 720, 410, 70),
        ("bone_0.webp", 1030, 600, 58),
        ("foxfire_0.webp", 470, 310, 62),
    ]
    for name, x, y, h in terrain:
        paste_center(bg, load(RUNTIME / "terrain" / name), x, y, h)

    actors = [
        ("characters", "sword_right_1.webp", 620, 410, 105),
        ("characters", "witch_left_1.webp", 440, 470, 110),
        ("enemies", "wraith_left_1.webp", 520, 600, 82),
        ("enemies", "elite_right_1.webp", 900, 410, 92),
        ("enemies", "wraith_right_2.webp", 250, 420, 78),
    ]
    actors.sort(key=lambda item: item[3])
    for folder, name, x, y, h in actors:
        draw.ellipse((x - 26, y - 10, x + 26, y + 6), fill=(0, 0, 0, 82))
        paste_center(bg, load(RUNTIME / folder / name), x, y, h)

    hud = load(RUNTIME / "ui" / "hud_scroll.webp")
    hud = hud.resize((390, round(hud.height * 390 / hud.width)), Image.Resampling.LANCZOS)
    bg.alpha_composite(hud, (18, 18))
    out = OUT / "runtime-composite-preview-v2.png"
    bg.save(out)
    return out


def main():
    warnings = check_frames()
    preview = None
    try:
        preview = make_preview()
        print(f"preview={preview}")
    except PermissionError as exc:
        print(f"preview skipped: {exc}")
    if warnings:
        print("warnings:")
        for warning in warnings:
            print(f"- {warning}")
    else:
        print("warnings: none")


if __name__ == "__main__":
    main()
