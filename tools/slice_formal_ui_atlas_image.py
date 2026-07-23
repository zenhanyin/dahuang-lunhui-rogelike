from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "generated" / "formal-ui-atlas" / "v0.3.3"


CROPS = {
    "hud_scroll": (22, 52, 835, 422),
    "dialogue_scroll": (48, 462, 762, 768),
    "choice_card_frame": (840, 48, 1198, 590),
    "lineage_card": (1182, 74, 1492, 660),
    "pause_panel": (808, 640, 1190, 840),
    "result_panel": (808, 640, 1190, 840),
    "button_continue": (38, 830, 390, 976),
    "button_minor": (465, 828, 820, 976),
    "resource_soul": (975, 868, 1245, 990),
    "resource_fire": (1252, 868, 1500, 990),
}


def remove_green(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            greenish = g > 150 and r < 90 and b < 90 and g > r * 1.8 and g > b * 1.8
            if greenish:
                px[x, y] = (0, 0, 0, 0)
    return rgba


def trim_alpha(img: Image.Image, pad: int = 8) -> Image.Image:
    alpha = img.getchannel("A")
    box = alpha.getbbox()
    if not box:
        return img
    left = max(0, box[0] - pad)
    top = max(0, box[1] - pad)
    right = min(img.width, box[2] + pad)
    bottom = min(img.height, box[3] + pad)
    return img.crop((left, top, right, bottom))


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: slice_formal_ui_atlas_image.py <atlas.png>")
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(src).convert("RGBA")
    records = []
    for name, box in CROPS.items():
        item = trim_alpha(remove_green(sheet.crop(box)))
        out = OUT / f"{name}.webp"
        item.save(out, "WEBP", quality=88, method=6)
        records.append({
            "id": name,
            "path": out.relative_to(ROOT).as_posix(),
            "size": list(item.size),
            "bytes": out.stat().st_size,
        })
    manifest = {
        "version": "0.3.3-formal-ui-atlas",
        "source": str(src),
        "assets": records,
    }
    (OUT / "atlas.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"atlas": (OUT / "atlas.json").relative_to(ROOT).as_posix(), "assets": len(records)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
