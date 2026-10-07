# Three-sprite comparison — not approved for production

Only Kangaroo, Koala and Cockatoo are processed. Original animal PNGs remain
untouched; no production component references this experiment directory.
Cockatoo Scale4x is copied to `../../derived/animals/outback/` for detail-only
display after approval; cards and the other trials keep the original sources. Open `index.html`
through the site server, or inspect `comparison.png` against dark/light backdrops.

All variants are transparent 128×92 PNGs:
- `*-nearest-4x.png`: current nearest-neighbor reference.
- `*-scale2x-nearest-4x.png`: Scale2x followed by nearest-neighbor 2×.
- `*-scale4x.png`: two Scale2x passes.

Reproduce with `python scripts/compareSpriteUpscale.py` (Pillow). No new runtime
dependencies. `metrics.json` records changed pixels, source hashes and palette
preservation. Every output RGBA value comes from the source. Exact equality
preserves existing partial alpha and colors, but can limit smoothing where the
small source already has softened edges. Upscaling cannot restore missing detail.

Method references: [official Scale2x rules](https://www.scale2x.it/algorithm),
[algorithm usage](https://www.scale2x.it/download),
[Scale4x definition](https://github.com/amadvance/scale2x/blob/master/README).
xBRZ was researched but not installed or tested; these comparisons make no xBRZ claim.

Animal art belongs to the Disco Zoo creators. Source sheets and crop attribution
are recorded in `../../ASSET_SOURCES.md`; reuse permission has not been established.

## Superseded display selection

These historical variants remain reference-only. Production now selects reviewed Fandom HQ extractions, with canonical originals as fallback. No new upscaling is performed.
