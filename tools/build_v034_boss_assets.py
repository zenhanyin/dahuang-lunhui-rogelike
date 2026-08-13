from pathlib import Path
from shutil import copy2

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(
    r"C:\Users\Administrator\.codex\generated_images\019f83f5-c11c-75e0-8d28-c87682ead39a\call_m0pMEk4ZDXsu4QGSYfgOwzV9.png"
)
ARCHIVE = ROOT / "assets" / "art_direction" / "v034" / "boss"
OUT = ROOT / "assets" / "runtime" / "webp" / "bosses"


def remove_chroma(img):
    rgba = img.convert("RGBA")
    data = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = data[x, y]
            # The generated sheet uses a flat green key. Keep oxidized bronze/teal
            # armor by only removing highly saturated green pixels.
            if g > 165 and r < 110 and b < 120 and g - max(r, b) > 70:
                data[x, y] = (r, g, b, 0)
    return rgba


def trim_alpha(img, padding=18):
    alpha = img.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return img
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(img.width, right + padding)
    bottom = min(img.height, bottom + padding)
    return img.crop((left, top, right, bottom))


def fit_height(img, target_h=300):
    if img.height <= target_h:
        return img
    ratio = target_h / img.height
    return img.resize((round(img.width * ratio), target_h), Image.Resampling.LANCZOS)


def save_webp(img, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=82, method=6, lossless=False)


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    copy2(SOURCE, ARCHIVE / "boss_chapter_red_flame_sheet_source.png")

    sheet = remove_chroma(Image.open(SOURCE))
    cell_w = sheet.width / 3
    cell_h = sheet.height / 2
    names = [
        ("right", 0, 0),
        ("right", 1, 1),
        ("right", 2, 2),
        ("left", 0, 0),
        ("left", 1, 1),
        ("left", 2, 2),
    ]
    for direction, frame, col in names:
        row = 0 if direction == "right" else 1
        crop = sheet.crop(
            (
                round(col * cell_w),
                round(row * cell_h),
                round((col + 1) * cell_w),
                round((row + 1) * cell_h),
            )
        )
        sprite = fit_height(trim_alpha(crop), 300)
        save_webp(sprite, OUT / f"chapter_red_flame_{direction}_{frame}.webp")

    manifest = OUT / "manifest.json"
    files = [f"chapter_red_flame_{direction}_{frame}.webp" for direction in ("right", "left") for frame in range(3)]
    manifest.write_text(
        "{\n"
        '  "version": "0.3.4a-boss-formal-asset-pass",\n'
        '  "style": "Dunhuang fresco, cinnabar flame, oxidized bronze, 2D sprite",\n'
        '  "source": "assets/art_direction/v034/boss/boss_chapter_red_flame_sheet_source.png",\n'
        '  "frames": [\n'
        + ",\n".join(f'    "{file}"' for file in files)
        + "\n  ],\n"
        '  "runtimeNotes": "Six transparent WebP frames for chapter Boss validation. Attack/death frames are still pending."\n'
        "}\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
