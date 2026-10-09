# ALPHA 20 — Constellation

Constellation is Space 03, completing all normal destinations. Six approved
classic records preserve their exact normalized coordinates, including four-column
Chamaeleon/Capricornus and empty middle rows in Corvus/Pegasus. No Timeless records.

## Artwork decision and source inventory

All six HQ candidates remain UNRESOLVED and are explicitly excluded from production.
The canonical image paths currently resolve to 32x23 SVG initial placeholders under
`public/game/animals/constellation/`. These are UI fallbacks, not animal drawings,
source extractions, or HQ assets. Existing artwork resolution, sizing and runtime
unavailable fallback are unchanged. No entries were added to the HQ manifest.

Verified candidates below are RGB PNGs with no alpha, varied tan/olive backgrounds,
and ground shadows; no visible signatures were observed. Background noise and
ambiguous edges prevent certification of zero lost animal pixels. Hosting does
not establish official provenance or reuse permission. All require a later manual
pixel-level restoration review; temporary masking experiments were not copied.

| Subject / file page | Verified original | Native size | Unique RGB colors |
| --- | --- | --- | --- |
| [Chamaeleon](https://discozoo.fandom.com/wiki/File:Chamaeleon.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/1/1d/Chamaeleon.png/revision/latest?format=original) | 163x150 | 4038 |
| [Corvus](https://discozoo.fandom.com/wiki/File:Corvus.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/f/f3/Corvus.png/revision/latest?format=original) | 148x133 | 2070 |
| [Lynx](https://discozoo.fandom.com/wiki/File:Lynx.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/b/b8/Lynx.png/revision/latest?format=original) | 141x119 | 1384 |
| [Pisces](https://discozoo.fandom.com/wiki/File:Pisces.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/5/5d/Pisces.png/revision/latest?format=original) | 149x149 | 2779 |
| [Capricornus](https://discozoo.fandom.com/wiki/File:Capricornus.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/1/13/Capricornus.png/revision/latest?format=original) | 139x134 | 2659 |
| [Pegasus](https://discozoo.fandom.com/wiki/File:Pegasus.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/4/4a/Pegasus.png/revision/latest?format=original) | 144x124 | 2537 |

## Integration and validation

Minimal RegionId addition and six ANIMALS records. Existing REGION_PRESENTATION
adds availability; no parallel registry. ConstellationLandscape plus region and
atmosphere CSS provide a groundless indigo starfield, faint lines/orbital arcs,
and sparse points, reusing the existing motion/reduced-motion and particle budget.
Routes, collection, context links, Rescue filtering and solver calls derive from
those records. No solver edits. Full visibility produces 11 Earth/3 Space cards
and zero mystery cards; lower endpoints retain spoiler-hidden cards normally.

Full-progress fixtures now include Constellation. Generic unsupported-route tests
use an unknown ID instead. Numbering assertions derive from regionPosition;
existing Moon/Mars-limited fixtures retain their intentional hidden destinations.

Focused automated tests cover approved data, all four Space endpoints, direct
barriers, lowering visibility, context without autostart, fallback asset files,
static and region searches, dynamic policies and Pegasus's Mythical tier.
Targeted browser script: scripts/checkConstellationBrowser.cjs (390/1440).
Single version source: src/components/layout/siteVersion.ts.

## Files changed in this pass

- src/types/game.ts; src/data/animals.ts
- src/components/regions/regionPresentation.ts; RegionLandscape.tsx; ConstellationLandscape.tsx
- src/styles/regions.css; src/styles/environment.css
- src/components/progress/progressTestSupport.tsx; progress.test.tsx
- src/components/regions/regionSupport.test.ts; constellation.test.tsx
- src/components/rescue/alpha09.test.tsx
- scripts/checkRegionSupportBrowser.cjs; scripts/checkConstellationBrowser.cjs
- src/components/layout/siteVersion.ts
- public/game/animals/constellation/{chamaeleon,corvus,lynx,pisces,capricornus,pegasus}.svg
- public/game/experiments/alpha20-constellation/{region-390,region-1440,animal-1440,explorer-1440}.png
- docs/alpha20-constellation.md

Validation: 66 focused automated tests passed (six Constellation tests), strict
compilation passed, 40 browser assertions passed at 390/1440px, four screenshots
reviewed. No commits, solver changes, existing pattern edits or HQ extraction.
Final ALPHA 20 production build and npm lint both passed.
