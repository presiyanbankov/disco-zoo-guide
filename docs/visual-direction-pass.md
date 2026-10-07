# Visual direction pass

## Changes

All five regions now use original layered SVG landscapes. Farm has large tree
forms and green terrain; Outback has red mesas and a low sun; Savanna has acacias,
golden terrain and a small water reference; Northern has mountains, snowcaps and
pine depth; Polar has snow, angular ice and cold light. Approved screenshot crops
remain reference-only in public/game/regions and the source inventory.

Removed region flavor subtitles, descriptive paragraphs, field-note quotes,
homepage marketing language, collection introduction/disclosure prose, animal
card “View field notes,” and the decorative animal-guide introductory sentence.
Region pages show animal counts and rarity totals. Cards retain identity, index,
rarity/category, authentic sprites and a small navigation arrow. Timeless stays
unknown. Guide instructions and all routing/search functionality remain intact.

## Atmosphere and cost

Farm: pollen, canopy/grass movement and warm light drift. Outback: drifting dust,
low heat-like haze, slow sun glow and vector depth. Savanna: grass movement, dust,
light and depth. Northern: two slow mist planes and mountain/pine depth. Polar:
sparse snow, faint atmospheric light, ice shimmer and vector depth.

Six motes per scene remain unchanged; only four display on phones. Two CSS haze
planes use one visible plane on phones (Farm hides both). New effects animate
transform/opacity only, without animated filters, per-frame JS, canvas, new
packages or permanent will-change. Reduced motion makes them static; hidden-page
styles pause them. Browser sampling counted at most 84 active animations across
the full homepage, including existing effects. This is a bounded animation count,
not an FPS or GPU-performance benchmark. Screenshot PNGs are no longer requested.
Experiment assets are never imported by production pages.

## Sprite experiment

Only Kangaroo, Koala and Cockatoo were processed, each into three transparent
128×92 variants: nearest-neighbor 4×; Scale2x followed by nearest 2×; Scale4x (two
Scale2x passes). The implementation follows the documented full-RGBA equality
rules. All output colors/alpha values exist in the original palette; sources are
unchanged. No AI, blur or added features. xBRZ was researched but not tested.

Scale4x modestly changes diagonal edges, most visibly on Cockatoo. It changes
125 / 180 / 231 pixels relative to nearest for Kangaroo / Koala / Cockatoo.
Existing source softness and low resolution remain; this cannot recover detail.
Production keeps the original sprites, and the other 27 animals are unprocessed.

Open `/game/experiments/sprite-upscale/index.html` on the running site to compare
dark/light backgrounds. `comparison.png` is a standalone contact sheet.
`metrics.json` contains source hashes, dimensions and palette verification.
Method sources and attribution are in the experiment README.

## Verification

- Production build: pass, 39 statically generated pages.
- ESLint: pass.
- Component/integration tests: 15 pass, including all 30 real guide records,
  independent grids, failure handling, original icons and all-five-vector rendering.
- Headless Chrome: 49 layouts (home, five regions, Kangaroo guide at widths
  375, 390, 430, 768, 1024, 1440, 2560). No overflow, broken images, screenshot
  image requests or runtime exceptions. Factual rarity totals and six icons per
  region verified. Desktop home/Northern and phone Polar visually inspected.
- Reduced-motion and hidden-page pause CSS: pass for all new effects.
- Comparison page: all 12 images (three originals + nine variants) load correctly.
- Hashes: src/data, src/types, src/solver and all original animal assets unchanged.
- No dependency additions, solver changes, pattern changes or production upscaling.

## Changed files

- src/app/globals.css
- src/app/layout.tsx
- src/app/page.tsx
- src/app/regions/[regionId]/page.tsx
- src/components/animals/AnimalCard.tsx
- src/components/animals/AnimalCollection.tsx
- src/components/animals/AnimalGuideHero.tsx
- src/components/animals/TimelessSlot.tsx
- src/components/animals/assetPresentation.test.ts
- src/components/effects/RegionAtmosphere.tsx
- src/components/layout/SiteFooter.tsx
- src/components/regions/README.md
- src/components/regions/RegionExplorer.tsx
- src/components/regions/RegionHero.tsx
- src/components/regions/RegionLandscape.tsx
- src/components/regions/regionPresentation.ts
- src/styles/environment.css
- src/styles/regions.css
- public/game/ASSET_SOURCES.md
- public/game/regions/README.md

## Added files

- scripts/compareSpriteUpscale.py
- docs/visual-direction-pass.md
- public/game/experiments/sprite-upscale/README.md
- public/game/experiments/sprite-upscale/index.html
- public/game/experiments/sprite-upscale/metrics.json
- public/game/experiments/sprite-upscale/comparison.png
- public/game/experiments/sprite-upscale/kangaroo-nearest-4x.png
- public/game/experiments/sprite-upscale/kangaroo-scale2x-nearest-4x.png
- public/game/experiments/sprite-upscale/kangaroo-scale4x.png
- public/game/experiments/sprite-upscale/koala-nearest-4x.png
- public/game/experiments/sprite-upscale/koala-scale2x-nearest-4x.png
- public/game/experiments/sprite-upscale/koala-scale4x.png
- public/game/experiments/sprite-upscale/cockatoo-nearest-4x.png
- public/game/experiments/sprite-upscale/cockatoo-scale2x-nearest-4x.png
- public/game/experiments/sprite-upscale/cockatoo-scale4x.png
