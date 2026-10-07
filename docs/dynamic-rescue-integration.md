# Dynamic rescue assistant — ALPHA 08

## Solver changes

Added:
- `src/solver/dynamic/dynamicRescueSolver.ts`
- `src/solver/dynamic/dynamicRescueSolver.test.ts`

The existing dynamic placeholder remains unused and unchanged. No existing static
animal solver or region solver file changed. Canonical data, domain types,
approved pattern coordinates, HQ artwork and extraction tooling are unchanged.

### State and API

State consists of selected animals and an ordered observation history. Creation
requires 1–3 distinct animals from one region and valid board coordinates;
patterns are defensively copied. The UI only supplies visible classic animals
from the seven supported regions.

The pure API exposes `createDynamicRescueState`, `applyObservation`,
`undoObservation`, `resetObservations`, `getPossibleWorlds` and
`analyzeDynamicRescue`. World generation, observation filtering and scoring
remain separate exported functions for review and future objectives.

### World generation and filtering

`generateRescueWorlds` uses the unchanged existing `generatePlacements` helper.
It enumerates assignments recursively, rejecting a placement whenever any of
its cells is already occupied. Every accepted world has exactly one placement
per guaranteed animal. There is no independent-animal probability approximation.

`filterRescueWorlds` applies every observation to the complete world. EMPTY
requires every animal to exclude that cell. A named hit requires the specified
animal to contain it and every other animal to exclude it. Multiple hits must
all be included in the same placement.

### Scoring, ties and invalid states

Each surviving valid world has equal weight. For an unopened cell:

`hitProbability = occupiedWorldCount / survivingWorldCount`

Already-opened cells never enter the score list. The maximum hit probability
wins; probabilities within an absolute `1e-12` tolerance of the maximum are tied,
and the lowest row-major index wins. No rarity weighting or completion bonus is
used. Scoring is independent of generation and filtering.

Zero valid worlds return `status: "contradiction"`, zero count, empty scores and
no recommendation. This includes an impossible initial assignment. Invalid API
configuration (bad selection, out-of-board cell, unselected hit animal) produces
an explicit validation error; the UI prevents those inputs and displays setup
errors if creation fails.

Completion is conservative: **no unopened animal cell exists in any surviving
world**. A uniquely determined placement still recommends its unopened cells
with probability one. Undo removes the last observation; reset clears the
history. Both recompute from the original selected animals.

### Performance

No world caching, workers, persistence or optimization framework was added.
React `useMemo` only avoids re-evaluating an unchanged session during rendering.

The profiling script measures the complete initial analysis of every supported
combination three times: 287 combinations, 861 runs, Node v24.14.0 on this machine.

| Selected animals | Runs | Mean | P95 | Maximum | Maximum valid worlds |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 126 | 0.066 ms | 0.222 ms | 0.986 ms | 20 |
| 2 | 315 | 0.142 ms | 0.374 ms | 0.853 ms | 180 |
| 3 | 420 | 0.532 ms | 1.373 ms | 2.376 ms | 1,008 |

These are local runtime measurements, not device-wide performance guarantees.
Full results: `public/game/experiments/dynamic-rescue/performance.json`.

## UI changes

Added:
- `src/app/rescue/page.tsx`
- `src/components/rescue/RescueAssistant.tsx`
- `src/components/rescue/RescueSetup.tsx`
- `src/components/rescue/RescueBoard.tsx`
- `src/components/rescue/ResultSelector.tsx`
- `src/components/rescue/rescueIntegration.test.ts`
- `src/styles/rescue.css`
- `src/components/layout/siteVersion.ts`

Updated:
- `src/app/page.tsx`: homepage entry links to the available assistant.
- `src/app/layout.tsx`: imports the isolated rescue stylesheet.
- `src/components/layout/SiteHeader.tsx`: assistant navigation and shared version.

The route is `/rescue`. Region switching clears selection. A fourth animal is
disabled, and selection is limited to the current region. All choices use the
existing HQ artwork component and its original/unavailable fallback.

The large live board distinguishes unopened cells, the recommendation, opened
empty cells and named animal hits. A short animation marks each new recommendation.
Metrics show probability, possible worlds and result count. The roster tracks
reported animal tiles, with an optional ordered result history.

Desktop reporting uses a viewport-constrained panel anchored near the chosen
cell. Mobile reporting uses a fixed bottom tray with large buttons. Both have
explicit Empty and named animal choices, Escape dismissal, trapped dialog focus
and focus restoration. E reports empty; 1–3 report the corresponding animals.
Board buttons work with Tab/Enter. All motion respects reduced-motion preference.

Undo and reset remain available during contradictions and completion. A
contradiction disables further reporting and provides recovery instructions.
Changing animals returns to setup; reset retains the selected animals.

`ALPHA 08` is defined only in `siteVersion.ts` and rendered through `SiteHeader`.
Tests and browser tooling consume that same value; future labels require one
value change. The existing subtle header treatment is retained.

## Validation and review artifacts

- Production build passes: 54 static pages, including `/rescue`.
- Lint and strict test compilation pass.
- 67 tests pass: 21 new dynamic solver tests, 6 new UI integration tests,
  and the existing 40 static-guide/region/frontend tests.
- Dynamic tests cover all requested invariants, manually verifiable synthetic
  worlds, all 42 single-animal patterns, and real three-animal rescues in all
  seven supported regions.
- Chrome checks cover 28 region/width combinations and 84 started rescues with
  1, 2 and 3 selected animals at 375, 390, 768 and 1440 pixels. Checks verify
  solver-derived recommendations/counts, selection limits, same-region selection,
  EMPTY/hit updates, opened-cell exclusion, undo/reset, contradiction recovery,
  conservative completion, HQ presentation, no horizontal overflow, mobile tray
  anchoring, desktop E/1–3, Tab/Enter, focus trapping/restoration, Escape,
  homepage route navigation, reduced motion and the centralized version.
- Browser results contain zero unexpected runtime or image errors. Mobile and
  desktop setup, live-board and result-selector screenshots were inspected.
- Protected-file hashes match the task's starting state.

Added tooling:
- `scripts/profileDynamicRescue.cjs`
- `scripts/checkDynamicRescueBrowser.cjs`

Browser report and 31 screenshots:
`public/game/experiments/dynamic-rescue/`.
Representative screenshots: `setup-390.png`, `setup-1440.png`,
`farm-live-1440.png`, `farm-selector-390.png`, `farm-selector-1440.png` and
`contradiction-desktop.png`.

No dependencies were added. No future expected-completion scoring, pets,
Timeless data, locked-region content or actual spawn-rate weighting was added.
