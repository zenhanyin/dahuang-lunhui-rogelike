from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps, ImageStat


ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "assets" / "maps" / "v033" / "xuanyuan_ground"
BASE_DIR = PACK / "base_tiles"
OUT_REPORT = ROOT / "docs" / "v0.3.3j-2-xuanyuan-tile-seam-review.json"
PREVIEW = PACK / "preview_xuanyuan_ground_v033j2_3x3.webp"
TILE_SIZE = 1024
EDGE_LOCK = 132


def save_webp(img: Image.Image, path: Path, quality: int = 84) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(suffix=".webp", dir=str(path.parent))
    os.close(fd)
    tmp_path = Path(tmp_name)
    try:
        img.save(tmp_path, "WEBP", quality=quality, method=1)
        os.replace(tmp_path, path)
    finally:
        if tmp_path.exists():
            tmp_path.unlink()


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB").resize((TILE_SIZE, TILE_SIZE), Image.Resampling.LANCZOS)


def edge_lock_mask(size: int = TILE_SIZE, edge: int = EDGE_LOCK) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    inner = Image.new("L", (size - edge * 2, size - edge * 2), 255)
    mask.paste(inner, (edge, edge))
    return mask.filter(ImageFilter.GaussianBlur(edge * 0.42))


def match_luma(source: Image.Image, target: Image.Image) -> Image.Image:
    src = source.convert("RGB")
    tgt = target.convert("RGB")
    src_stat = ImageOps.grayscale(src).resize((1, 1), Image.Resampling.BILINEAR).getpixel((0, 0))
    tgt_stat = ImageOps.grayscale(tgt).resize((1, 1), Image.Resampling.BILINEAR).getpixel((0, 0))
    factor = max(0.72, min(1.22, tgt_stat / max(1, src_stat)))
    return ImageEnhance.Brightness(src).enhance(factor)


def make_variant(base: Image.Image, candidate: Image.Image, index: int) -> Image.Image:
    # Preserve the outer band from the approved base tile. Only the middle carries variation,
    # so all four runtime tiles can stitch safely in every direction.
    candidate = match_luma(candidate, base)
    candidate = ImageEnhance.Contrast(candidate).enhance(0.94)
    candidate = ImageEnhance.Color(candidate).enhance(0.88)

    if index == 2:
        candidate = ImageOps.mirror(candidate)
    elif index == 3:
        candidate = ImageOps.flip(candidate)
    elif index == 4:
        candidate = candidate.rotate(180)

    mask = edge_lock_mask()
    mixed = Image.composite(candidate, base, mask)
    return Image.blend(base, mixed, 0.58)


def edge_strip(img: Image.Image, side: str, width: int = 18) -> Image.Image:
    if side == "left":
        return img.crop((0, 0, width, img.height))
    if side == "right":
        return img.crop((img.width - width, 0, img.width, img.height))
    if side == "top":
        return img.crop((0, 0, img.width, width))
    if side == "bottom":
        return img.crop((0, img.height - width, img.width, img.height))
    raise ValueError(side)


def rms_delta(a: Image.Image, b: Image.Image) -> float:
    diff = ImageChops.difference(a.convert("RGB"), b.convert("RGB"))
    stat = ImageStat.Stat(diff)
    return sum(stat.rms) / len(stat.rms)


def seam_scores(tiles: list[Image.Image]) -> dict[str, float]:
    horizontal = []
    vertical = []
    for left in tiles:
        for right in tiles:
            horizontal.append(rms_delta(edge_strip(left, "right"), edge_strip(right, "left")))
    for top in tiles:
        for bottom in tiles:
            vertical.append(rms_delta(edge_strip(top, "bottom"), edge_strip(bottom, "top")))
    return {
        "horizontalAvg": round(sum(horizontal) / len(horizontal), 3),
        "horizontalMax": round(max(horizontal), 3),
        "verticalAvg": round(sum(vertical) / len(vertical), 3),
        "verticalMax": round(max(vertical), 3),
    }


def build_preview(tiles: list[Image.Image]) -> None:
    size = 512
    order = [0, 1, 2, 3, 0, 1, 2, 3, 0]
    preview = Image.new("RGB", (size * 3, size * 3))
    for idx, tile_index in enumerate(order):
        tile = tiles[tile_index].resize((size, size), Image.Resampling.LANCZOS)
        preview.paste(tile, ((idx % 3) * size, (idx // 3) * size))
    save_webp(preview, PREVIEW, 82)


def update_manifest(files: list[str], report: dict[str, object]) -> None:
    manifest_path = PACK / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["version"] = "0.3.3j-2-xuanyuan-seam-reviewed"
    manifest["baseTiles"] = [f"base_tiles/{name}" for name in files]
    manifest["baseTileCandidates"] = [
        "base_tiles/tile_xuanyuan_ground_base_v033e_01.webp",
        "base_tiles/tile_xuanyuan_ground_base_v033e_02.webp",
        "base_tiles/tile_xuanyuan_ground_base_v033e_03.webp",
        "base_tiles/tile_xuanyuan_ground_base_v033e_04.webp",
    ]
    manifest["preview"] = PREVIEW.name
    manifest["seamReview"] = {
        "version": "0.3.3j-2",
        "report": "docs/v0.3.3j-2-xuanyuan-tile-seam-review.json",
        "strategy": "edge-locked variants generated from the approved Xuanyuan base tile",
        "scores": report["scores"],
        "runtimeEnabled": True,
    }
    manifest["notes"] = [
        "Generated from the confirmed Xuanyuan Dunhuang keyframe direction.",
        "V0.3.3j-2 uses four edge-locked base tile variants: the outer band stays consistent, the middle carries low-frequency fresco/crack/sword-line variation.",
        "Decal/prop/event assets stay in transparent WebP layers; no CSS placeholder resources are intentionally used.",
        "Event stone disk remains small; ready state uses subtle near-ground aura and an atlas prompt for readable interaction feedback.",
        "Candidate v033e source tiles remain archived as candidates, not direct runtime tiles."
    ]
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    source_files = [
        BASE_DIR / "tile_xuanyuan_ground_base_v033e_01.webp",
        BASE_DIR / "tile_xuanyuan_ground_base_v033e_02.webp",
        BASE_DIR / "tile_xuanyuan_ground_base_v033e_03.webp",
        BASE_DIR / "tile_xuanyuan_ground_base_v033e_04.webp",
    ]
    base = load_rgb(source_files[0])
    candidates = [load_rgb(path) for path in source_files]
    variants = [base]
    for index, candidate in enumerate(candidates[1:], start=2):
        variants.append(make_variant(base, candidate, index))

    out_files = []
    for index, tile in enumerate(variants, start=1):
        name = f"tile_xuanyuan_ground_base_v033j2_{index:02d}.webp"
        save_webp(tile, BASE_DIR / name, 84)
        out_files.append(name)

    final_tiles = [load_rgb(BASE_DIR / name) for name in out_files]
    report = {
        "version": "0.3.3j-2",
        "sourceTiles": [str(path.relative_to(ROOT)).replace("\\", "/") for path in source_files],
        "runtimeTiles": [f"assets/maps/v033/xuanyuan_ground/base_tiles/{name}" for name in out_files],
        "strategy": {
            "edgeLockPx": EDGE_LOCK,
            "centerBlend": 0.58,
            "goal": "keep infinite stitching stable while adding same-style center variation"
        },
        "scores": seam_scores(final_tiles),
        "thresholds": {
            "horizontalMax": 18.0,
            "verticalMax": 18.0
        },
        "accepted": True
    }
    scores = report["scores"]
    report["accepted"] = scores["horizontalMax"] <= 18.0 and scores["verticalMax"] <= 18.0
    OUT_REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    build_preview(final_tiles)
    update_manifest(out_files, report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not report["accepted"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
