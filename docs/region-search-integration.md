# Static region search integration

The region search solver is separate from the unchanged animal solver. It reuses
`generatePlacements()` from `src/solver/static/generatePlacements.ts`.

## Probability model

`scoreRegionCells()` assigns each surviving animal weight `1 / activeAnimals`.
Each of that animal's remaining placements receives
`animalWeight / remainingPlacements`. Cell scores sum those placement weights.

After each selected cell is assumed empty, `applyRegionMiss()` removes all
placements containing it and removes animals with no surviving placements.
The next iteration recomputes equal animal weights and placement weights from
the surviving state. Placements are never pooled into a uniformly weighted list.

`chooseRegionCell()` excludes clicked cells and compares every available score
to the actual maximum. It selects the lowest row-major index within an absolute
`1e-12` tolerance of that maximum. Comparing against the maximum avoids chained
near-ties. This tolerance absorbs floating-point noise on the 25-cell board.

Each step records its number, cell index, pre-miss hit probability and pre-miss
active animal count. The input records and existing placement arrays are not
mutated. No caching, persistence or precomputed strategy files were added.

## Frontend boundary

The server region page passes its visible classic animal collection to
`getRegionSearchPresentation()`, which validates patterns and calls
`generateRegionSearchSequence()`. Missing/invalid patterns or solver failures
retain the blank unavailable grid; development failures are logged and exposed.

`RegionSearch` renders all steps immediately using the existing shared grid.
Unselected cells remain blank. Focusing or tapping a numbered cell inspects
existing solver statistics; it does not report a hit or advance a rescue state.
Existing region styles, factual copy, routing, animation and artwork are retained.

## Changed files in this pass

- Added `src/solver/static/regionSolver.ts` and `regionSolver.test.ts`.
- Added `src/components/regions/regionSearchPresentation.ts` and
  `regionSearchIntegration.test.ts`.
- Updated `src/components/regions/RegionSearch.tsx` and `regionSupport.test.ts`.
- Updated `src/app/regions/[regionId]/page.tsx`.
- Added `scripts/checkRegionSearchBrowser.cjs` and this document.
- Generated browser reports/screenshots under
  `public/game/experiments/region-search/`.

No existing solver files, canonical data, domain types or HQ assets changed.
New region interfaces are local to the new solver file. No dependencies added.

## Verification

40 tests pass: 15 focused region solver tests, 2 new region integration tests,
and 23 existing frontend tests. Coverage includes equal animal weighting,
manual cell scores, reweighting after misses, elimination, epsilon ties,
determinism, nonmutation, complete placement coverage for all seven regions,
and single-animal agreement with the existing solver for all 42 animals.
Integration tests compare supplied steps with their rendered cells, assert
blank unselected cells and verify unavailable states.

Production build succeeds (53 pages); lint and strict test compilation pass.
Chrome checks pass for 196 region/animal layouts at 375, 390, 768 and 1440 pixels:
real region numbering, keyboard-focus statistics, animal pattern/search grids,
unclipped HQ sprites, no horizontal overflow and original/unavailable artwork
fallbacks. Homepage navigation and comparison-page layout also pass at each
width. Browser report records zero unexpected errors. Mobile and desktop search
screenshots were visually inspected.

| Region | Sequence length |
| --- | ---: |
| Farm | 11 |
| Outback | 11 |
| Savanna | 11 |
| Northern | 15 |
| Polar | 14 |
| Jungle | 11 |
| Moon | 12 |

Full browser evidence: `public/game/experiments/region-search/browser-checks.json`.
Search screenshots: `<region>-search-390.png` and `<region>-search-1440.png`
in the same directory.
