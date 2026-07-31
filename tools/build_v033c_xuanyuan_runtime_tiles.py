from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/art_direction/v033/xuanyuan_ground_rework/xuanyuan_user_ref_clean_base.png"
OUT_DIR = ROOT / "assets/maps/v033/xuanyuan_ground/base_tiles"
PREVIEW = ROOT / "assets/maps/v033/xuanyuan_ground/preview_xuanyuan_ground_v033c_3x3.webp"
TILE_SIZE = 1024


def edge_harmonize(image: Image.Image, band: int = 96) -> Image.Image:
    """Softly reconcile opposite borders while preserving the center texture."""
    img = image.convert("RGB")
    w, h = img.size
    px = img.load()
    src = img.copy().load()

    for x in range(band):
        t = x / max(1, band - 1)
        for y in range(h):
            left = src[x, y]
            right = src[w - band + x, y]
            mix_left = tuple(round(left[i] * t + right[i] * (1 - t)) for i in range(3))
            mix_right = tuple(round(left[i] * (1 - t) + right[i] * t) for i in range(3))
            px[x, y] = mix_left
            px[w - band + x, y] = mix_right

    src = img.copy().load()
    for y in range(band):
        t = y / max(1, band - 1)
        for x in range(w):
            top = src[x, y]
            bottom = src[x, h - band + y]
            mix_top = tuple(round(top[i] * t + bottom[i] * (1 - t)) for i in range(3))
            mix_bottom = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
            px[x, y] = mix_top
            px[x, h - band + y] = mix_bottom

    return img.filter(ImageFilter.GaussianBlur(0.18))


def tune_for_runtime(image: Image.Image, variant: int) -> Image.Image:
    img = edge_harmonize(image)
    img = ImageEnhance.Color(img).enhance(0.92)
    img = ImageEnhance.Contrast(img).enhance(0.94)
    img = ImageEnhance.Brightness(img).enhance(0.95 + variant * 0.012)
    return img


def make_tiles() -> list[Path]:
    source = Image.open(SOURCE).convert("RGB")
    sw, sh = source.size
    crop_size = min(sw, sh) - 180
    x0 = (sw - crop_size) // 2
    y0 = (sh - crop_size) // 2
    source = source.crop((x0, y0, x0 + crop_size, y0 + crop_size))
    source = source.resize((TILE_SIZE, TILE_SIZE), Image.Resampling.LANCZOS)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    tile = tune_for_runtime(source, 0)
    output = OUT_DIR / "tile_xuanyuan_ground_base_01.webp"
    tile.save(output, "WEBP", quality=86, method=6)
    return [output]


def make_preview(tile_paths: list[Path]) -> None:
    tiles = [Image.open(path).convert("RGB") for path in tile_paths]
    preview = Image.new("RGB", (TILE_SIZE * 3, TILE_SIZE * 3))
    for i in range(9):
        x = (i % 3) * TILE_SIZE
        y = (i // 3) * TILE_SIZE
        preview.paste(tiles[0], (x, y))
    preview.resize((1536, 1536), Image.Resampling.LANCZOS).save(PREVIEW, "WEBP", quality=82, method=6)


def main() -> None:
    tile_paths = make_tiles()
    make_preview(tile_paths)
    for path in tile_paths:
        print(path.relative_to(ROOT).as_posix())
    print(PREVIEW.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()
