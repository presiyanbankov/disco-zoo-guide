# ALPHA 13 — progress-aware guide

## Architecture

`src/components/progress/progression.ts` is the single progression catalog:
11 Earth destinations and 3 Space destinations, with IDs, names and track-local
ordering. `REGION_GROUPS` derives from it. Implemented guide availability remains
in `REGION_PRESENTATION`; reaching a future destination does not create content.

`SpoilerPreferences` holds `maxEarthRegionId`, `maxSpaceRegionId | null` and
`showTimeless`. Visibility/storage helpers are in `spoilerPreferences.ts`:
`canViewRegion`, `canViewAnimal`, `canViewTimeless`, `getVisibleRegions`,
`revealRegion`, `parsePreferences` and `serializePreferences`.

Local storage key: `disco-zoo-guide.progress`.

```json
{"version":1,"maxEarthRegionId":"farm","maxSpaceRegionId":null,"showTimeless":false}
```

Unknown IDs, wrong field types, unsupported versions and malformed JSON trigger
first-visit setup. Extra fields are discarded. Storage failures retain preferences
for the current visit and display a factual notice. Storage events synchronize
preferences between tabs; clearing storage returns to first-visit setup.

## Experience and integration

- Root `ProgressProvider` initially renders only a neutral loading state. It
  mounts no normal page children until browser preferences have been read and
  validated. New visitors see the full-page welcome form, with conservative
  Farm / no Space / Hide Timeless defaults.
- Accessible radio choices use compact destination rows, two columns on small
  screens and four on desktop. Space is explicitly independent from Earth.
- The header's secondary **Progress** control opens the same form in a native
  modal dialog. It traps focus, supports Escape/Cancel, and restores focus to
  the opening control. Save updates all visibility consumers immediately.
- Homepage explorer hides implemented regions beyond progress using the same
  mystery cards as unavailable destinations. Counts reflect visible available
  regions. Region and animal guide navigation are filtered.
- Direct region and animal routes wrap their main content in `ProgressGuard`.
  Hidden content is replaced by a factual barrier with Reveal, Go back and
  Change progress. Reveal extends only that track; it never enables Timeless.
  Go back uses safe same-origin history or falls back to the homepage.
- Guide metadata is deliberately generic: browser-local preferences cannot
  personalize server metadata, so titles/descriptions never expose hidden
  animal/region names. Normal content is not mounted behind a barrier.
- Rescue region/animal selectors use the shared helpers. Hidden URL context is
  discarded before local setup initialization; visible context remains editable
  and never starts automatically. Settings changes do not replay URL context.
- Reducing progress during an active rescue hides the board and roster behind
  the barrier. State is retained without exposing it: Reveal restores it; Go back
  clears that setup and returns to selection. Solver state/math are unchanged.
- Pet patterns and pet-only rescue remain region-independent.

Timeless preparation is visibility only: `canViewAnimal` recognizes
`rarity: "timeless"`; animal route guards receive rarity, and the guard's separate
Timeless reveal enables only `showTimeless` once its region is visible. No
Timeless records, routes, artwork or solver rules were added. Future content must
still be added through the existing supported-roster/presentation boundary.

## Files

Added: `components/progress/{progression,spoilerPreferences,ProgressProvider,
ProgressSetup,ProgressGuard,progressTestSupport,progress.test}` (TS/TSX),
`styles/progress.css`, `scripts/checkAlpha13Progress.cjs`, this report and browser
evidence under `public/game/experiments/alpha13-progress/`.

Updated: root layout; both guide route pages; AnimalCollection;
AnimalGuideNavigation; SiteHeader/RescueHeaderLink; RegionExplorer;
RegionNavigation/regionPresentation; RescueAssistant/RescueSetup;
rescueSetupContext; four regression-test files to explicitly supply an existing
visitor's full-current-content preferences; and the single siteVersion value.

No packages installed. No `src/types`, `src/data` or solver files changed.
Approved patterns, artwork, strategy math, limits and the square-cell fix remain
unchanged. Protected inventory comparison found only the authorized version
change among its 73 files.

## Validation

- Build passed (55 generated pages; `/rescue` retains query-aware server rendering).
- Lint passed with no warnings; strict TypeScript compilation passed.
- 263 tests passed, including 26 new progress tests.
- 66 targeted browser checks passed at 375, 390, 768 and 1440px: first visit,
  returning visitor, no content flash, storage fallback, track independence,
  direct-route protection/reveal/back, settings reduction, native modal focus/
  Escape, reduced motion, filtered/contextual rescue and pet-only rescue.
- Eight screenshots reviewed: first visit (375/1440), settings (390/768), hidden
  region (390/1440), existing visitor and filtered rescue.

Screenshot/result files are in `public/game/experiments/alpha13-progress/`.
The displayed version is **ALPHA 13**, defined only in
`src/components/layout/siteVersion.ts`. No commit was made.
