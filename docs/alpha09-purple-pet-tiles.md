# ALPHA 09 original purple pet tiles

The final visual adjustment restores the original Fandom/Disco Zoo purple tile
appearance in every PetArtwork usage. Cards, controls and surrounding site
styling are unchanged. No solver, data, types, patterns, rules or classic assets
were modified. No commit made.

## Files

Changed: src/components/pets/PetArtwork.tsx; src/styles/alpha09.css;
src/components/pets/petPolish.test.tsx; scripts/checkAlpha09Browser.cjs;
docs/alpha09-assets.md; docs/alpha09-integration.md.

Added: src/components/pets/petTiles.json; scripts/cropPetTiles.py;
public/game/pets/tiles/{rabbit,bird,dog,cat,fish,turtle,lizard,hamster}.png;
this report; review outputs in public/game/experiments/pet-tiles/.

## Source pixels

All eight output images are native 116x116 square crops. The reviewed first
occupied tile uses sheet column 1 for Dog, column 3 for Fish and column 0 for
other species. Exact zero-based crop box: (column*120+4, 4, column*120+120, 120).
Every saved PNG's pixel buffer equals the source crop byte-for-byte after
lossless PNG decoding, including original alpha. No background removal, colour
change, resampling, AI tool, reconstruction or new edge pixels. The purple fill,
bevel, shadow and silhouettes remain intact. Full PNG files differ from their
source sheets because they are smaller crops, not because pixels were changed.

Source PNGs/hashes remain unchanged. pixel-validation.json records each source
hash, rectangle, dimensions and equality result. The production wrapper has no
custom green fill, border, rounded clipping, padding or filter. Existing icon
sizes remain normalized across all contexts, with crisp pixelated rendering.

Earlier transparent derivatives are retained as unused historical artifacts.

## Validation

- Build passed: 55 generated pages.
- Lint passed without warnings/errors.
- Strict test/production compilation passed.
- All 85 regression tests passed.
- All 117 production browser checks passed at 375, 390, 768 and 1440 pixels,
  including unstyled tile-wrapper checks, source dimensions, image loading and
  fallback, disclosure/selection rules, result entry, keyboard/focus and reduced
  motion. Mobile pets and desktop selector screenshots were visually inspected.
- Every pixel in all eight saved crops matches its source rectangle.
- Hashes confirm all 56 protected solver/data/type/classic HQ files and all eight
  original reference sheets unchanged. Whitespace diff check passed.

No commit created.
