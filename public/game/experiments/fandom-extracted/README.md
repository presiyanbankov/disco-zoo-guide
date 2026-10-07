# Exact-pixel extraction prototype — not production

Scope: Pig, Kangaroo, Cockatoo and Bear only. No canonical sprites, data paths,
components, patterns or solver files are modified. No upscaling is performed.

Run `python scripts/extractFandomPrototype.py`; add `--download` only when the
approved references are missing. Python/Pillow are already available. The source
SHA-256 guards reject a changed reference until it is reviewed. References and
attribution live in `assets/reference/fandom/README.md`.

## Extraction

1. Four corners must agree on the exact background RGB. Four-connected flood
   fill starts on matching boundary pixels. No tolerance or global color removal.
2. Source-specific reviewed shadow color/rectangle isolates shadow pixels even
   where the shadow touches feet. All matching components inside that rectangle
   are removed; no largest-component assumption selects the animal.
3. Three signed sources have three separate corner-letter components, all within
   the reviewed `(102,114)-(119,119)` zone. Bear has no visible signature.
4. Exterior fill repeats through removed nuisance pixels, clearing background
   pockets previously sealed by the ground shadow.
5. Pig needs an explicit enclosed-background exception: its curled tail encloses
   a 4x4 background opening at `(89,66)-(93,70)`. Exact-color flood fill seeded
   there removes 16 background pixels and preserves every pink tail pixel.
6. Only alpha changes to 0; RGB is preserved everywhere within the crop. The
   retained bounds are cropped with 2 source-pixel transparent padding per side.
   No resize, resampling, interpolation, smoothing, morphology or AI occurs.

## Validation

`validation.json` records source hashes, integer crop offsets, palettes, counts,
component masks/bounds and output hashes. Every output pixel maps directly to
one source pixel. All original animal-color pixels survive, verified against
reviewed full-source palettes/counts independent of the extraction selection.
Alpha is binary 0/255; zero recolored, lost, added or artificial edge pixels.
Saved PNGs are decoded again and compared byte-for-byte to the in-memory RGBA.

| Animal | Source | Extracted (2px padding) | RGB colors source → animal | Animal pixels | Shadow pixels | Signature pixels |
|---|---|---|---|---|---|---|
| Pig | 120x120 | 76x60 | 7 → 4 | 2496 | 456 | 35 |
| Kangaroo | 120x120 | 92x76 | 9 → 6 | 2384 | 504 | 35 |
| Cockatoo | 120x120 | 76x76 | 10 → 7 | 2256 | 412 | 35 |
| Bear | 150x150 | 124x81 | 6 → 4 | 6660 | 1014 | 0 |

Visual review confirms Pig's curled tail, Kangaroo's ears/legs/tail, Cockatoo's
crest/beak/feet/tail feathers and Bear's ears/muzzle/legs remain intact. The
pixel-coverage assertions include every such animal pixel, including gray eye
highlights, so removed ground colors cannot silently erase these details.

## Review outputs

- `index.html`: current/source/extracted native/extracted card-size columns.
  Open `/game/experiments/fandom-extracted/index.html` on the site server.
  Browser display uses nearest-neighbor (`image-rendering: pixelated`); card
  previews fit within 96x69 desktop and 64x46 phone. Extraction PNGs are unscaled.
  Full reference PNGs are embedded for this isolated review page only.
- `comparison.png`: native-size contact sheet; no assets are resized to make it.
- `desktop.png`, `mobile.png`: full-page browser comparison captures.
- `validation.json`: exact-pixel checks and reproducible crop mapping.

Validation passed for all four outputs. A second run produced identical hashes
for the extracted PNGs, contact sheet, HTML and validation report. Synthetic
checks confirm an enclosed same-color region is preserved unless an explicit
opening is supplied, and disconnected components remain available for review.
Headless Chrome passed at 375, 390, 768 and 1440px: all 16 images load, native
dimensions remain exact, every image uses pixelated browser rendering, light
background controls work, and no overflow/image failures/runtime errors occur.
`browser-checks.json` records actual native/card display dimensions. Production
code and existing asset hashes were unchanged. No build/dependency changes were
required for this isolated Python/static-HTML experiment.

The approach is suitable for extending to reviewed per-animal profiles. It is
**not safe to blindly batch all 30**: shadow palettes/positions may overlap
animal colors, enclosed openings need inspection, and separated details must
remain. No additional animals have been processed.
