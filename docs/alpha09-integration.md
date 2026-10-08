# ALPHA 09 implementation

## Owner-reviewed changes

`src/types/game.ts` adds only `PetSpecies`; `src/data/pets.ts` adds the eight
approved patterns. Only `dynamicRescueSolver.ts` and its tests changed under
`src/solver`. Static solvers, 42 approved classic patterns, HQ assets and the
extraction pipeline are untouched. No dependencies were added.

## Presentation

`regionPresentation.ts` defines Earth (11 destinations) and Space (3).
Farm-Jungle are available Earth 01-06; Moon is Space 01. Five Earth and two
Space mystery cards stay locked and non-navigable. Existing route IDs remain.
RegionHero, RegionNavigation and rescue choices use group-local numbering.

`RescueHero.tsx` is the primary homepage feature, followed by Earth, Space and
Pets. Its decorative nonnumeric board never fabricates a solver probability.
`alpha09.css` adds sparse cosmic treatment, restrained motion and responsive
pet cards. Reduced motion disables hero animations. Mobile version visibility
and tablet decorative overflow were corrected during browser QA.

`/pets` shows eight species and exact pattern grids; no cosmetic collections.
Standalone full-colour artwork remains unresolved; the pet/setup polish adds original purple source tile crops for all eight species with accessible fallbacks:
see `alpha09-assets.md`. No Fandom asset extraction was forced through.

## Participants and setup

`rescueParticipants.ts` adapts IDs to `animal:<region>:<id>` and `pet:<id>`.
Its validation requires at least one classic region animal, a single region,
unique participants, at most one pet, and at most three total. Optional pet
selection defaults to None. Three animals disable pets; a selected pet disables
a third animal without dropping selections. Region change clears animals, pet,
state and observations. Reset keeps participants; undo removes the last result.

The dynamic solver generalizes animals/worlds/observations to participants and
identified hits. Kind is metadata only. World enumeration, overlap rejection,
observation filtering, occupied-world/total-world scoring, epsilon 1e-12,
row-major ties, contradiction and conservative completion math are unchanged.
Same-region and animal/pet count rules are validated outside geometric scoring.
No pet bonuses, rarity weights, caching, workers or future objectives were added.

Desktop anchored results/mobile bottom tray include the selected pet. E and
1-3 report empty/identified hits. Focus trap, restoration and Escape remain.

`SITE_VERSION` in `src/components/layout/siteVersion.ts` is the single ALPHA 09
source, rendered by SiteHeader on desktop and mobile.

## Validation commands and evidence

- Build: `npm run build`
- Lint: `npm run lint`
- Strict compilation: `node node_modules/typescript/bin/tsc --noEmit`
- Tests: `node node_modules/tsx/dist/cli.mjs --test` with all source test paths
- Performance: `node node_modules/tsx/dist/cli.mjs scripts/profileAlpha09.ts`
- Browser: `node scripts/checkAlpha09Browser.cjs` (CDP 9242; app default 3000,
  override `ALPHA09_QA_URL`)

Review artifacts: `public/game/experiments/alpha09/`. Profiling covers every
supported selection and every pet, three runs each (4,389 initial analyses).
P95 is below 1.4 ms in all five categories; rare timing outliers up to 263 ms
are retained in the report. These are local Node timings, not mobile benchmarks.
Earlier animal-only browser/profile scripts were adapted to participant IDs.

## Final results

- Production build: passed, 55 generated pages.
- ESLint: passed, zero warnings/errors.
- Strict TypeScript compilation (including tests): passed.
- Full regression suite: 80 tests passed.
- Production Chrome QA: 72 checks passed across 375/390/768/1440, zero runtime
  or image errors. Includes selection limits, pet hits, undo/reset, region
  clearing, mobile tray, keyboard focus/shortcuts, hero navigation, version
  visibility and reduced motion. Twenty screenshots retained.
- Protected-path Git diff: empty; whitespace diff check passes.

| Selection | Runs | Mean ms | P95 ms | Maximum ms |
| --- | ---: | ---: | ---: | ---: |
| 1 animal(s) | 126 | 0.071 | 0.143 | 1.249 |
| 2 animal(s) | 315 | 0.161 | 0.394 | 0.707 |
| 3 animal(s) | 420 | 1.205 | 1.384 | 262.969 |
| 1 animal(s) + pet | 1008 | 0.092 | 0.202 | 0.631 |
| 2 animal(s) + pet | 2520 | 0.377 | 0.917 | 90.518 |

## Production file inventory

Added:
- src/app/pets/page.tsx
- src/components/pets/PetArtwork.tsx
- src/components/rescue/ParticipantArtwork.tsx
- src/components/rescue/RescueHero.tsx
- src/components/rescue/rescueParticipants.ts
- src/data/pets.ts
- src/styles/alpha09.css
- public/game/pets/artwork-pending.svg

Changed:
- src/app/layout.tsx
- src/app/page.tsx
- src/app/rescue/page.tsx
- src/components/layout/siteVersion.ts
- src/components/regions/RegionExplorer.tsx
- src/components/regions/RegionHero.tsx
- src/components/regions/RegionNavigation.tsx
- src/components/regions/regionPresentation.ts
- src/components/rescue/RescueAssistant.tsx
- src/components/rescue/RescueBoard.tsx
- src/components/rescue/RescueSetup.tsx
- src/components/rescue/ResultSelector.tsx
- src/solver/dynamic/dynamicRescueSolver.ts
- src/types/game.ts

Test/tooling changes: new alpha09.test.tsx, checkAlpha09Browser.cjs and
profileAlpha09.ts; migrated dynamicRescueSolver.test.ts, rescueIntegration.test.ts,
regionSupport.test.ts, checkDynamicRescueBrowser.cjs and profileDynamicRescue.cjs.
Documentation: this report and alpha09-assets.md.
