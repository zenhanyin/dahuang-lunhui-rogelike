from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "assets/maps/v033/xuanyuan_ground/events",
    ROOT / "assets/maps/v033/xuanyuan_ground/props",
]


def is_key_green(pixel):
    r, g, b, a = pixel
    if a == 0:
        return True
    if g > 64 and g - r > 20 and g - b > 12 and g > max(r, b) * 1.12:
        return True
    # The rejected green-screen sheets were saved as WebP first, so the edge color
    # often arrives as olive/blue compression bands rather than pure key green.
    if g > 42 and g >= r - 8 and g >= b - 10 and (g - r > 6 or g - b > 6):
        return True
    if b > 90 and g > 64 and b - r > 35:
        return True
    return False


def clean(path):
    with Image.open(path) as source:
        image = source.convert("RGBA").copy()
    width, height = image.size
    pixels = image.load()
    remove = [[False] * width for _ in range(height)]
    queue = deque()

    def enqueue(x, y):
        if remove[y][x] or not is_key_green(pixels[x, y]):
            return
        remove[y][x] = True
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue(nx, ny)

    changed = 0
    for y in range(height):
        for x in range(width):
            if remove[y][x]:
                pixels[x, y] = (0, 0, 0, 0)
                changed += 1

    # Feather only the outer alpha edge so props sit into the ground instead of cutting out.
    original_alpha = image.getchannel("A")
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            if remove[y][x]:
                continue
            edge_neighbors = sum(
                1
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
                if remove[ny][nx]
            )
            if edge_neighbors:
                r, g, b, a = pixels[x, y]
                softened = max(0, min(a, int(original_alpha.getpixel((x, y)) * (0.68 + 0.08 * (4 - edge_neighbors)))))
                pixels[x, y] = (r, g, b, softened)

    if changed:
        image.save(path, "WEBP", lossless=True, quality=92, method=6)
    return changed


def main():
    results = []
    for folder in TARGETS:
        for path in sorted(folder.glob("*.webp")):
            changed = clean(path)
            results.append((path.relative_to(ROOT).as_posix(), changed))
    for name, changed in results:
        print(f"{changed:7d} {name}")


if __name__ == "__main__":
    main()
