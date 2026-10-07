# Derived display assets

Canonical 32x23 source icons and data imagePath values remain untouched.
Collections always use those sources with nearest-neighbor display scaling.

`animals/outback/cockatoo-scale4x.png` is the approved three-sprite experiment's
Scale4x output (two Scale2x passes), copied unchanged for detail-only display at
128x92. Its diagonal silhouette shows the clearest improvement. Kangaroo and
Koala remain on original icons because their improvement was modest. No other
animals have been processed.

Reproduction, exact palette/alpha checks, source hashes and method references:
`../experiments/sprite-upscale/README.md` and `metrics.json`. Original source
attribution: `../ASSET_SOURCES.md`. This is derived game art; reuse permission is
not claimed. Production components never load experiment comparison assets.

## Superseded display selection

These historical variants remain reference-only. Production now selects reviewed Fandom HQ extractions, with canonical originals as fallback. No new upscaling is performed.
