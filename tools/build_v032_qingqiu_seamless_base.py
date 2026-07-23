from pathlib import Path
import json

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SRC = Path(r"C:\Users\Administrator\.codex\generated_images\019f83f5-c11c-75e0-8d28-c87682ead39a\call_iLnapyr0TCHfohd20dln70yL.png")
OUT = ROOT / "assets" / "maps" / "v032_atlas" / "qingqiu_seamless"
SIZE = 512


def save_webp(img: Image.Image, path: Path, quality=86) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=quality, method=6)


def seam_mask(size: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    band = 36
    c = size // 2
    draw.rectangle((c - band, 0, c + band, size), fill=190)
    draw.rectangle((0, c - band, size, c + band), fill=190)
    return mask.filter(ImageFilter.GaussianBlur(20))


def make_repeat_safe(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA").resize((SIZE, SIZE), Image.Resampling.LANCZOS)

    # Offset potential seams to the center, soften center cross, then offset back.
    shifted = ImageChops.offset(img, SIZE // 2, SIZE // 2)
    softened = shifted.filter(ImageFilter.GaussianBlur(1.2))
    shifted = Image.composite(softened, shifted, seam_mask(SIZE))
    img = ImageChops.offset(shifted, -SIZE // 2, -SIZE // 2)

    # Average opposite outer pixels to avoid hairline seams.
    px = img.load()
    for y in range(SIZE):
        avg = tuple(round((px[0, y][i] + px[SIZE - 1, y][i]) / 2) for i in range(4))
        px[0, y] = avg
        px[SIZE - 1, y] = avg
    for x in range(SIZE):
        avg = tuple(round((px[x, 0][i] + px[x, SIZE - 1][i]) / 2) for i in range(4))
        px[x, 0] = avg
        px[x, SIZE - 1] = avg
    return img


def make_preview(tile: Image.Image, count: int) -> Image.Image:
    preview = Image.new("RGBA", (SIZE * count, SIZE * count), (0, 0, 0, 255))
    for y in range(count):
        for x in range(count):
            preview.paste(tile, (x * SIZE, y * SIZE))
    return preview


def main() -> None:
    if not SRC.exists():
        raise FileNotFoundError(SRC)
    OUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SRC).convert("RGBA")
    tile = make_repeat_safe(source)
    save_webp(tile, OUT / "tile_qingqiu_base_seamless_01.webp")
    make_preview(tile, 3).save(OUT / "preview_3x3_same_tile.png")
    make_preview(tile, 5).resize((1280, 1280), Image.Resampling.LANCZOS).save(OUT / "preview_5x5_same_tile.png")
    manifest = {
        "version": "0.3.2a-qingqiu-seamless-base",
        "tileSize": SIZE,
        "tile": "assets/maps/v032_atlas/qingqiu_seamless/tile_qingqiu_base_seamless_01.webp",
        "preview3x3": "assets/maps/v032_atlas/qingqiu_seamless/preview_3x3_same_tile.png",
        "preview5x5": "assets/maps/v032_atlas/qingqiu_seamless/preview_5x5_same_tile.png",
        "note": "Base tile only; decals and props should carry large Qingqiu features."
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
