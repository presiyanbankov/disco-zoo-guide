"""Reviewed Fandom tile silhouette extraction; no sprite resizing or recolouring.
Sources are downloaded separately and retained unchanged. This script operates
only on the reviewed first occupied tile of these eight pet pattern diagrams.
"""
from pathlib import Path
import json
from PIL import Image

PROFILES = {
    "rabbit": {"tile_col": 0, "seed": (65, 78)},
    "bird": {"tile_col": 0, "seed": (60, 65)},
    "dog": {"tile_col": 1, "seed": (60, 70)},
    "cat": {"tile_col": 0, "seed": (60, 70)},
    "fish": {"tile_col": 3, "seed": (60, 65)},
    "turtle": {"tile_col": 0, "seed": (60, 70)},
    "lizard": {"tile_col": 0, "seed": (60, 70)},
    "hamster": {"tile_col": 0, "seed": (60, 70)},
}

def extract(name, profile):
    source = Image.open(f"assets/reference/fandom/pets/{name}-pattern.png").convert("RGBA")
    tile_x = profile["tile_col"] * 120
    tile = source.crop((tile_x, 0, tile_x + 124, 124))
    # The reviewed interior excludes the decorative tile frame. These dark
    # source colours include the silhouette's compression variations; lighter
    # purple background/shadow pixels are excluded. Surviving RGB is unchanged.
    candidates = set()
    for y in range(16, 112):
        for x in range(16, 112):
            r, g, b, alpha = tile.getpixel((x, y))
            if alpha == 255 and r < 105 and g < 75 and b < 125:
                candidates.add((x, y))
    # Follow the reviewed animal seed, not an assumed largest component.
    seed = profile["seed"]
    assert seed in candidates, (name, "reviewed seed is not foreground")
    retained = {seed}
    pending = [seed]
    while pending:
        x, y = pending.pop()
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                point = (x + dx, y + dy)
                if point in candidates and point not in retained:
                    retained.add(point)
                    pending.append(point)
    assert retained == candidates, (name, "additional component needs review")
    out = tile.copy()
    for y in range(tile.height):
        for x in range(tile.width):
            if (x, y) not in retained:
                r, g, b, _ = out.getpixel((x, y))
                out.putpixel((x, y), (r, g, b, 0))
    bounds = out.getbbox()
    assert bounds is not None
    crop = (bounds[0] - 2, bounds[1] - 2, bounds[2] + 2, bounds[3] + 2)
    out = out.crop(crop)
    for y in range(out.height):
        for x in range(out.width):
            rgba = out.getpixel((x, y))
            assert rgba[3] in (0, 255)
            if rgba[3]:
                assert rgba == tile.getpixel((x + crop[0], y + crop[1]))
    dest = Path(f"public/game/pets/silhouettes/{name}.png")
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest)
    return {"src": f"/game/pets/silhouettes/{name}.png", "width": out.width, "height": out.height}, {
        "species": name, "sourceDimensions": list(source.size),
        "tile": [tile_x, 0, tile_x + 124, 124], "interior": [16, 16, 112, 112],
        "seed": list(seed), "sourceCrop": list(crop), "outputDimensions": list(out.size),
        "retainedPixels": len(retained), "rgbChanged": 0,
        "resampled": False, "alphaValues": [0, 255],
    }

if __name__ == "__main__":
    manifest, reports = {}, []
    for name, profile in PROFILES.items():
        manifest[name], report = extract(name, profile)
        reports.append(report)
    Path("src/components/pets/petSilhouettes.json").write_text(json.dumps(manifest, indent=2) + "\n")
    output = Path("public/game/experiments/pet-polish")
    output.mkdir(parents=True, exist_ok=True)
    (output / "extraction-validation.json").write_text(json.dumps(reports, indent=2) + "\n")
    print(json.dumps(reports, indent=2))
