#!/usr/bin/env python3
"""PROTOTYPE — 3×3 gaze atlas from the circular PNG (fake yaw/pitch, no WebGL).

Frames are a 2D squash + shift of the photo on the red backdrop — honest 'sprite
atlas' stand-in until MICA/DECA exists. Packed left-to-right, top-to-bottom:
pitch {-1,0,1} rows × yaw {-1,0,1} columns.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/assets/pro-pic-circular-musa.png"
OUT_DIR = ROOT / "prototypes/tier-c-eyes/assets"
SIZE = 216
YAW_DEG = 18.0
PITCH_DEG = 12.0
SHIFT_X = 14.0
SHIFT_Y = 10.0
RED = (196, 30, 58, 255)  # #c41e3a


def circular_mask(size: int) -> Image.Image:
    m = Image.new("L", (size, size), 0)
    # draw via pixel formula
    pix = m.load()
    r = size / 2 - 0.5
    c = (size - 1) / 2
    for y in range(size):
        for x in range(size):
            if (x - c) ** 2 + (y - c) ** 2 <= r * r:
                pix[x, y] = 255
    return m.filter(ImageFilter.GaussianBlur(0.6))


def pose_frame(src: Image.Image, mask: Image.Image, yaw: int, pitch: int) -> Image.Image:
    yaw_rad = math.radians(yaw * YAW_DEG)
    pitch_rad = math.radians(pitch * PITCH_DEG)
    sx = max(0.82, abs(math.cos(yaw_rad)))
    sy = max(0.88, abs(math.cos(pitch_rad)))
    nw = max(1, int(SIZE * sx))
    nh = max(1, int(SIZE * sy))
    scaled = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), RED)
    dx = int(round(-yaw * SHIFT_X + (SIZE - nw) / 2))
    dy = int(round(pitch * SHIFT_Y + (SIZE - nh) / 2))
    canvas.paste(scaled, (dx, dy), scaled)
    canvas.putalpha(mask)
    # restore opaque red outside the subject but inside the circle: composite
    # over solid red then re-apply circular mask so the slot stays a red disk.
    bg = Image.new("RGBA", (SIZE, SIZE), RED)
    out = Image.alpha_composite(bg, canvas)
    out.putalpha(mask)
    return out.convert("RGBA")


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    if src.size != (SIZE, SIZE):
        src = src.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    mask = circular_mask(SIZE)
    yaws = (-1, 0, 1)
    pitches = (-1, 0, 1)  # row 0 = look up
    sheet = Image.new("RGBA", (SIZE * 3, SIZE * 3), (0, 0, 0, 0))
    for row, pitch in enumerate(pitches):
        for col, yaw in enumerate(yaws):
            frame = pose_frame(src, mask, yaw, pitch)
            sheet.paste(frame, (col * SIZE, row * SIZE), frame)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT_DIR / "gaze-atlas.png")
    meta = {
        "size": SIZE,
        "cols": 3,
        "rows": 3,
        "yaws": list(yaws),
        "pitches": list(pitches),
        "yawDeg": YAW_DEG,
        "pitchDeg": PITCH_DEG,
        "note": "Row 0 = look up, col 0 = look left. Photo squash, not MICA/DECA.",
    }
    (OUT_DIR / "gaze-atlas.json").write_text(json.dumps(meta, indent=2) + "\n")
    print(f"Wrote {OUT_DIR / 'gaze-atlas.png'}")
    print(f"Wrote {OUT_DIR / 'gaze-atlas.json'}")


if __name__ == "__main__":
    main()
