from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(
    r"C:\Users\Administrator\.codex\generated_images\019f83f5-c11c-75e0-8d28-c87682ead39a\call_vue2gbnreiwknN8aKgVrl25a.png"
)
BUILD_ROOT = ROOT.parent / "v033f_build" / "xuanyuan_ground"
OUT = BUILD_ROOT / "props"

PROPS = [
    ("xuanyuan_buried_sword_grass_v033f", 0, 0),
    ("xuanyuan_sword_cluster_v033f", 1, 0),
    ("xuanyuan_cracked_stone_disk_v033f", 2, 0),
    ("xuanyuan_bronze_mural_shard_v033f", 3, 0),
    ("xuanyuan_cinnabar_oath_cloth_v033f", 0, 1),
    ("xuanyuan_collapsed_ritual_base_v033f", 1, 1),
    ("xuanyuan_inscription_slab_v033f", 2, 1),
    ("xuanyuan_low_array_ring_v033f", 3, 1),
    ("xuanyuan_dry_grass_clump_v033f", 0, 2),
    ("xuanyuan_broken_scabbard_v033f", 1, 2),
    ("xuanyuan_cloud_mural_shard_v033f", 2, 2),
    ("xuanyuan_battlefield_rubble_v033f", 3, 2),
]


def remove_green(source):
    image = source.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            green_strength = g - max(r, b)
            if g > 120 and green_strength > 34:
                pixels[x, y] = (r, g, b, 0)
            elif g > 82 and green_strength > 16:
                keep = max(0, min(255, int((34 - green_strength) / 18 * 255)))
                pixels[x, y] = (r, min(g, max(r, b) + 8), b, min(a, keep))
            elif g > max(r, b) + 8:
                pixels[x, y] = (r, min(g, max(r, b) + 6), b, a)
    return image


def trim_alpha(image, pad=18):
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return image
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(image.width, right + pad)
    bottom = min(image.height, bottom + pad)
    return image.crop((left, top, right, bottom))


def feather(image):
    alpha = image.getchannel("A")
    softened = ImageChops.multiply(alpha, alpha.point(lambda value: min(255, int(value * 1.08))))
    image.putalpha(softened)
    return image


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SRC).convert("RGBA")
    cell_w = sheet.width // 4
    cell_h = sheet.height // 3
    written = []
    for name, col, row in PROPS:
        crop = sheet.crop((col * cell_w, row * cell_h, (col + 1) * cell_w, (row + 1) * cell_h))
        prop = feather(trim_alpha(remove_green(crop)))
        output = OUT / f"prop_{name}_0.webp"
        prop.save(output, "WEBP", quality=86, method=6)
        written.append(output)

    preview_w = 960
    preview_h = 720
    preview = Image.new("RGBA", (preview_w, preview_h), (34, 30, 24, 255))
    for index, path in enumerate(written):
        prop = Image.open(path).convert("RGBA")
        max_w = 190
        max_h = 150
        scale = min(max_w / prop.width, max_h / prop.height)
        resized = prop.resize((max(1, int(prop.width * scale)), max(1, int(prop.height * scale))), Image.LANCZOS)
        x = 35 + (index % 4) * 230 + (max_w - resized.width) // 2
        y = 35 + (index // 4) * 220 + (max_h - resized.height) // 2
        preview.alpha_composite(resized, (x, y))
    preview.save(BUILD_ROOT / "preview_xuanyuan_low_props_v033f.webp", "WEBP", quality=88, method=6)
    print("\n".join(str(path) for path in written))


if __name__ == "__main__":
    main()
