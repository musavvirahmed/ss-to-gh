#!/usr/bin/env python3
"""PROTOTYPE helper — pixelated C shades (no AA); intentional glints only; +8px right."""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path

from PIL import Image

SIZE = 216
MID = (121.7, 86.2)
DX = 8
DY = 2
FACTOR = 5
ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / "assets"
FACE = ROOT / "public" / "assets" / "pro-pic-circular-musa.png"
REF3 = OUT / "refs" / "yaw-trio.png"
BOX_BOT = (109, 430, 512, 505)
GLINTS = [
    (18, 3), (19, 3), (19, 4), (20, 4),
    (58, 3), (59, 3), (59, 4), (60, 4),
]


def threshold_black(crop: Image.Image) -> Image.Image:
    w, h = crop.size
    px = crop.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 200 and (r + g + b) / 3 < 100:
                op[x, y] = (0, 0, 0, 255)
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out


def block_down(img: Image.Image, factor: int) -> Image.Image:
    w, h = img.size
    nw, nh = max(1, w // factor), max(1, h // factor)
    px = img.load()
    out = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
    op = out.load()
    for gy in range(nh):
        for gx in range(nw):
            black = cell = 0
            for yy in range(gy * factor, min(h, (gy + 1) * factor)):
                for xx in range(gx * factor, min(w, (gx + 1) * factor)):
                    cell += 1
                    if px[xx, yy][3] >= 128:
                        black += 1
            if black >= max(2, cell // 6):
                op[gx, gy] = (0, 0, 0, 255)
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out


def fill_holes_black(img: Image.Image) -> Image.Image:
    w, h = img.size
    px = img.load()
    exterior = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if px[x, y][3] < 128:
                exterior[y][x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if px[x, y][3] < 128 and not exterior[y][x]:
                exterior[y][x] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not exterior[ny][nx] and px[nx, ny][3] < 128:
                exterior[ny][nx] = True
                q.append((nx, ny))
    for y in range(h):
        for x in range(w):
            if px[x, y][3] < 128 and not exterior[y][x]:
                px[x, y] = (0, 0, 0, 255)
    return img


def main() -> None:
    if not REF3.is_file():
        raise SystemExit(f"Missing {REF3}")
    im3 = Image.open(REF3).convert("RGBA")
    native = fill_holes_black(block_down(threshold_black(im3.crop(BOX_BOT)), FACTOR))
    px = native.load()
    w, h = native.size
    for x, y in GLINTS:
        if 0 <= x < w and 0 <= y < h and px[x, y][3] > 128:
            px[x, y] = (255, 255, 255, 255)
    native.save(OUT / "_native-C.png")

    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    x0 = int(round(MID[0] + DX - w / 2))
    y0 = int(round(MID[1] + DY - h / 2))
    canvas.alpha_composite(native, (x0, y0))
    canvas.save(OUT / "shades-C.png", optimize=True)

    face = Image.open(FACE).convert("RGBA")
    preview = face.copy()
    preview.alpha_composite(canvas)
    preview.save(OUT / "preview-C.png")

    meta = {
        "size": SIZE,
        "eyes_mid": list(MID),
        "winner": "C",
        "dx": DX,
        "dy": DY,
        "notes": "pixelated (nearest); no AA; intentional 2x2 glints only; +8px right",
        "variants": {
            "C": {
                "name": "front-facing pixel",
                "file": "assets/shades-C.png",
                "paste": [x0, y0],
                "size": [w, h],
            }
        },
    }
    (OUT / "shades-meta.json").write_text(json.dumps(meta, indent=2) + "\n")
    print("C", (w, h), "at", (x0, y0))


if __name__ == "__main__":
    main()
