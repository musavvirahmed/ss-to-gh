#!/usr/bin/env python3
"""Bake tier-C eye cutout + eyes-config.json from Site content avatar.

Reads avatar path from content/site.yaml, punches eye sockets in the circular
profile PNG, and writes musa-no-eyes.png + eyes-config.json to public/assets/
for Cloudflare Pages. Socket geometry is a build artifact, not a CMS field.

Optional iris patches (A1 prototype) land in prototypes/tier-c-eyes/assets/
when the private hi-res bake source exists.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLISH_DIR = ROOT / "public/assets"
PROTOTYPE_DIR = ROOT / "prototypes/tier-c-eyes/assets"
HI = ROOT / "prototypes/tier-d-portrait/_private/profile-picture-i-facebook.jpg"
PATCH_PX = 64

# Pixel coords on the 216×216 circular PNG (viewer's left / right).
# Tuned from a darkness scan of the iris blobs + 8× nearest crops.
EYES = {
    "left": {
        "socket": {"cx": 103.2, "cy": 85.8, "rx": 4.6, "ry": 4.0},
        "iris": {"cx": 103.2, "cy": 85.8, "r": 4.6},
    },
    "right": {
        "socket": {"cx": 140.2, "cy": 86.6, "rx": 4.4, "ry": 3.9},
        "iris": {"cx": 140.2, "cy": 86.6, "r": 4.4},
    },
}


def load_avatar_from_site_content(root: Path) -> tuple[Path, str]:
    """Return (absolute public path, site-relative avatar string)."""
    site_yaml = root / "content" / "site.yaml"
    avatar_rel: str | None = None
    for line in site_yaml.read_text().splitlines():
        stripped = line.strip()
        if stripped.startswith("avatar:"):
            avatar_rel = stripped.split(":", 1)[1].strip()
            if avatar_rel.startswith("/"):
                avatar_rel = avatar_rel[1:]
            break
    if not avatar_rel:
        raise SystemExit("avatar not found in content/site.yaml")
    src = root / "public" / avatar_rel
    if not src.is_file():
        raise SystemExit(f"avatar file not found: {src}")
    return src, avatar_rel


def ellipse_alpha(h: int, w: int, cx: float, cy: float, rx: float, ry: float, feather: float) -> np.ndarray:
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    inner = 1.0 - feather / max(rx, ry)
    alpha = np.clip((d - inner) / max(1e-6, 1.0 - inner), 0.0, 1.0)
    # 0 inside hole (transparent), 1 outside
    return alpha


def circular_patch(im: Image.Image, cx: float, cy: float, r: float, out_px: int) -> Image.Image:
    pad = int(math.ceil(r)) + 2
    box = (int(cx - pad), int(cy - pad), int(cx + pad), int(cy + pad))
    crop = im.crop(box).convert("RGBA")
    arr = np.array(crop)
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    pcx = cx - box[0]
    pcy = cy - box[1]
    d = np.sqrt((xx - pcx) ** 2 + (yy - pcy) ** 2)
    feather = max(1.2, r * 0.12)
    alpha = np.clip((r - d) / feather, 0.0, 1.0)
    arr[:, :, 3] = (alpha * 255).astype(np.uint8)
    patch = Image.fromarray(arr)
    return patch.resize((out_px, out_px), Image.Resampling.LANCZOS)


def sample_disk(rgb: np.ndarray, cx: float, cy: float, r: float) -> list[int]:
    yy, xx = np.mgrid[0 : rgb.shape[0], 0 : rgb.shape[1]]
    m = ((xx - cx) ** 2 + (yy - cy) ** 2) <= r * r
    if not m.any():
        return [80, 50, 35]
    mean = rgb[m].mean(axis=0)
    return [int(round(c)) for c in mean]


def main() -> None:
    src_path, avatar_rel = load_avatar_from_site_content(ROOT)
    im = Image.open(src_path).convert("RGBA")
    arr = np.array(im)
    rgb = arr[:, :, :3]
    a = arr[:, :, 3].astype(np.float32)
    h, w = a.shape

    hole = np.ones((h, w), dtype=np.float32)
    for spec in EYES.values():
        s = spec["socket"]
        hole = np.minimum(
            hole,
            ellipse_alpha(h, w, s["cx"], s["cy"], s["rx"], s["ry"], feather=0.9),
        )
    a *= hole
    out = np.dstack([rgb, np.clip(a, 0, 255).astype(np.uint8)])

    PUBLISH_DIR.mkdir(parents=True, exist_ok=True)
    cutout_path = PUBLISH_DIR / "musa-no-eyes.png"
    Image.fromarray(out).save(cutout_path)

    sclera_pts = []
    for spec in EYES.values():
        iris = spec["iris"]
        # visible sclera sits to the viewer's left of each iris (subject looking right)
        sx = iris["cx"] - iris["r"] * 1.05
        sy = iris["cy"] + iris["r"] * 0.15
        sclera_pts.append(sample_disk(rgb, sx, sy, 1.2))

    config = {
        "size": im.size[0],
        "source": avatar_rel,
        "sclera": [int(round(sum(c) / len(c))) for c in zip(*sclera_pts)],
        "eyes": {},
    }
    for name, spec in EYES.items():
        s, iris = spec["socket"], spec["iris"]
        config["eyes"][name] = {
            "cx": s["cx"],
            "cy": s["cy"],
            "rx": s["rx"],
            "ry": s["ry"],
            "irisR": iris["r"],
            "pupilR": round(iris["r"] * 0.42, 2),
            "restDx": round(iris["cx"] - s["cx"], 2),
            "restDy": round(iris["cy"] - s["cy"], 2),
            "irisColor": sample_disk(rgb, iris["cx"], iris["cy"], max(1.5, iris["r"] * 0.55)),
            "lim": 0.55,
            "patch": f"assets/iris-{name}.png",
        }

    config_path = PUBLISH_DIR / "eyes-config.json"
    config_path.write_text(json.dumps(config, indent=2) + "\n")

    hi = Image.open(HI).convert("RGBA") if HI.exists() else im
    scale = hi.size[0] / im.size[0]
    PROTOTYPE_DIR.mkdir(parents=True, exist_ok=True)
    for name, spec in EYES.items():
        iris = spec["iris"]
        patch = circular_patch(
            hi,
            iris["cx"] * scale,
            iris["cy"] * scale,
            iris["r"] * scale * 1.18,
            PATCH_PX,
        )
        dest = PROTOTYPE_DIR / f"iris-{name}.png"
        patch.save(dest)
        print(f"Wrote {dest}")

    print(f"Wrote {cutout_path}")
    print(f"Wrote {config_path}")


if __name__ == "__main__":
    main()
