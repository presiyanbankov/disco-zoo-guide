# Jungle + Moon integration

Seven unlocked regions are now presented in the requested order: 01 Farm, 02 Outback, 03 Savanna, 04 Northern, 05 Polar, 06 Jungle, 07 Moon. Other regions remain a mystery card and return non-spoiling 404s. The guide has 42 classic animals and 12 additional shareable animal routes.

## Owner-controlled changes

- `src/types/game.ts`: only added `"jungle"` and `"moon"` to `RegionId`.
- `src/data/animals.ts`: appended the 12 approved names, rarities, region IDs and exact coordinates from `docs/jungle-moon-research.md`. Reserved canonical paths use `/game/animals/<region>/<id>.png`; reviewed display paths are selected separately.
- The entire existing Farm–Polar record prefix is unchanged. All solver files are SHA-256 identical to the baseline. All 60 existing original/HQ PNGs are also identical. No changes to `src/data/regions.ts`, domain logic, scoring, dynamic calculator or Timeless data.

## HQ extraction

Every source is an unchanged 150×150 opaque PNG under `assets/reference/fandom/<id>.png`, pinned by SHA-256 in `scripts/fandomExtractionProfiles.json`. Each of the 12 profiles was staged, validated and visually inspected before being marked reviewed and published. No signatures were visible or removed from these sources.

All require reviewed source-space ground-shadow rectangles. Phoenix additionally uses seed `(x:88,y:21)` to clear exactly 36 enclosed background pixels. Moonkey uses seed `(x:107,y:100)` to clear exactly 504 enclosed tail-opening pixels. Background beneath other animals' limbs connects outward through the removed shadow and needs no seed.

| Production file under `public/game/animals-hq/` | Dimensions |
|---|---|
| jungle/monkey.png | 118×100 |
| jungle/toucan.png | 136×124 |
| jungle/gorilla.png | 112×112 |
| jungle/panda.png | 136×88 |
| jungle/tiger.png | 136×88 |
| jungle/phoenix.png | 136×124 |
| moon/moonkey.png | 118×88 |
| moon/lunar-tick.png | 124×81 |
| moon/tribble.png | 100×87 |
| moon/moonicorn.png | 112×136 |
| moon/luna-moth.png | 136×100 |
| moon/jade-rabbit.png | 76×136 |

All passed: zero missing animal pixels, zero RGB changes, no resizing/resampling, binary alpha with no artificial edge transparency, 2px transparent padding and identical decoded PNG pixels. Explicit anatomical inspection covered tails, ears, horns, feathers, antennae, limbs and eye highlights. Repeat extraction produced identical hashes for all 42 HQ files. No unresolved animals. New HQ PNGs total 9,137 bytes.

Full source URLs, colors, rectangles and per-animal notes: `public/game/animals-hq/README.md`. Machine-readable validation: `public/game/experiments/fandom-extracted-all/validation.json`.

## Frontend changes

Changed:

- `src/app/page.tsx`: supported region/animal counts derive from current visible records.
- `src/app/layout.tsx`: supported-region metadata.
- `src/app/regions/[regionId]/page.tsx`: Region Search before the collection; static routes include both new regions automatically.
- `src/components/regions/regionPresentation.ts`: two explicitly supported/unlocked entries, preserving seven-region display order.
- `src/components/regions/RegionExplorer.tsx`: derived region count.
- `src/components/regions/RegionLandscape.tsx`: dispatches new vector environments.
- `src/components/animals/animalGuidePresentation.ts`: accepts reviewed HQ-only artwork at the server presentation boundary without changing canonical paths.
- `src/components/animals/hqArtwork.json`: 12 added display mappings.
- `src/styles/regions.css`: Jungle/Moon colors and responsive Region Search layout.
- `src/styles/environment.css`: sparse firefly/spore movement, mist and cosmic dust using existing CSS layers and reduced-motion behavior.

Added:

- `src/components/regions/JungleMoonLandscapes.tsx`: layered canopy, vegetation, vines, stream/ruin references; separate lunar terrain, craters, rocks, stars and distant planetary disk. SVG vectors only, no screenshot layers.
- `src/components/regions/RegionSearch.tsx`: a shared, accessible 5×5 pending shell with the approved factual copy. Every cell is empty/subdued. Coordinate-axis labels are not search recommendations. No guessed solver contract, scoring, fake numbers or sequence is supplied.
- `src/components/regions/regionSupport.test.ts`: approved-document comparisons, navigation order, region-page placement, all 12 route renders, pending cells, HQ selection/fallback and non-spoiling 404s.

Existing artwork error handling remains intact: HQ → canonical original → accessible unavailable state. No tiny originals were supplied for the 12 new animals, so an HQ load failure ultimately displays the unavailable state; missing both files at build/render time also preserves the page. The browser verified that the animal's real pattern and search guide survive this failure.

Existing region navigation and animal route generators consume the shared supported-region list; the routing structure and static animal solver integration needed no changes. No new dependencies, runtime image processing, per-frame JavaScript, scoring or solver logic were added.

## Tooling/documentation changes

- `scripts/extractFandomAnimals.py`: supports 42 reviewed profiles/seven regions; comparison pages gracefully handle absent original sprites.
- `scripts/fandomExtractionProfiles.json`: 12 individually reviewed profiles.
- `scripts/checkAnimalArtworkBrowser.cjs`: all seven collections/42 guides, pending region grids, approved pattern cells, real owner-generated steps, image dimensions and homepage order. Actual scrolling exercises lazy loading.
- `scripts/checkRegionSupportBrowser.cjs`: trusted route clicks, reduced-motion checks, locked-region 404s, new-animal image failure and collection/search screenshots at all requested widths.
- Updated `assetPresentation.test.ts` and `animalGuidePresentation.test.ts` for 42 animals and seven regions.
- Updated source/reference documentation and generated review HTML, contact sheets, validation JSON and screenshots. The original four-animal extractor's masking algorithm was not changed.

## Checks and review artifacts

- `npm run build`: passed, 53 generated static pages.
- `npm run lint`: passed without warnings/errors.
- All 23 frontend/integration tests passed; solver algorithms were neither reproduced nor modified. Tests directly compare the new canonical coordinates with the approved research document and verify every animal page's pattern/search grids independently.
- Browser: 196 collection/guide layouts (7 collections + 42 guides × 375, 390, 768, 1440), plus homepage and comparison checks at each width. No overflow, clipping, incorrect sprite dimensions/centering, unexpected broken images or browser exceptions.
- Additional browser checks: trusted homepage → Jungle → Moon → Moonkey navigation, reduced-motion disabling for both new environments, unsupported-region 404s and missing Moonkey artwork fallback with the guide intact. All passed.

Open `/game/experiments/fandom-extracted-all/index.html` for all 42 source/HQ comparisons. Jungle/Moon native contact sheets are in the same directory. `public/game/experiments/jungle-moon/` contains the individual extraction-inspection sheets, collection/search screenshots at all four widths and additional browser results. Main viewport/hero screenshots and the 196-layout report remain in `public/game/experiments/fandom-extracted-all/`.

Test compilation (run after a build, which clears temporary compiled tests):

```powershell
node node_modules/typescript/bin/tsc --outDir .next/region-component-check --rootDir src --jsx react-jsx --esModuleInterop --resolveJsonModule --skipLibCheck --moduleResolution node --module commonjs --target es2021 --strict src/components/grid/gridPresentation.test.ts src/components/animals/animalGuidePresentation.test.ts src/components/animals/animalGuideIntegration.test.ts src/components/animals/assetPresentation.test.ts src/components/regions/regionSupport.test.ts
node --test .next/region-component-check/components/grid/gridPresentation.test.js .next/region-component-check/components/animals/animalGuidePresentation.test.js .next/region-component-check/components/animals/animalGuideIntegration.test.js .next/region-component-check/components/animals/assetPresentation.test.js .next/region-component-check/components/regions/regionSupport.test.js
```

Extraction is reproducible with `python scripts/extractFandomAnimals.py` (without `-O`). Browser scripts require an existing site server and isolated Chrome CDP session; `HQ_QA_URL`/`HQ_QA_CDP` override defaults `http://localhost:3108`/`http://localhost:9241`. Each closes its own isolated browser. Region Search remains pending until the owner supplies a real function and output contract.
