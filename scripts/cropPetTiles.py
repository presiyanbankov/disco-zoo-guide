"""Native source-tile crops only: no masking, recolouring, or resampling."""
from pathlib import Path
import hashlib
import json
from PIL import Image

# First occupied tile, reviewed in each species' Fandom pattern diagram.
TILE_COLUMNS = {"rabbit": 0, "bird": 0, "dog": 1, "cat": 0,
                "fish": 3, "turtle": 0, "lizard": 0, "hamster": 0}
manifest, report = {}, []
for species, col in TILE_COLUMNS.items():
    source_path = Path(f"assets/reference/fandom/pets/{species}-pattern.png")
    source = Image.open(source_path)
    # Trim only the outside sheet gutter; retain the purple tile and its bevel.
    box = (col * 120 + 4, 4, col * 120 + 120, 120)
    tile = source.crop(box)
    assert tile.size == (116, 116)
    output = Path(f"public/game/pets/tiles/{species}.png")
    output.parent.mkdir(parents=True, exist_ok=True)
    tile.save(output)
    saved = Image.open(output)
    assert saved.mode == source.mode
    assert saved.tobytes() == source.crop(box).tobytes()
    manifest[species] = {"src": f"/game/pets/tiles/{species}.png", "width": 116, "height": 116}
    report.append({"species": species, "sourceDimensions": list(source.size),
                   "sourceSha256": hashlib.sha256(source_path.read_bytes()).hexdigest(),
                   "crop": list(box), "outputDimensions": list(saved.size),
                   "allSourcePixelsIdentical": True, "recoloured": False,
                   "resampled": False, "alphaModified": False})
Path("src/components/pets/petTiles.json").write_text(json.dumps(manifest, indent=2) + "\n")
review = Path("public/game/experiments/pet-tiles")
review.mkdir(parents=True, exist_ok=True)
(review / "pixel-validation.json").write_text(json.dumps(report, indent=2) + "\n")
print("Verified eight 116x116 source-identical tile crops.")
