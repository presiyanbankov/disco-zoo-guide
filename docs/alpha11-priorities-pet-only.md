# ALPHA 11: Rarity Priority and pet-only rescues

## Scoring and compatibility

`src/solver/dynamic/rescueStrategy.ts` defines `PriorityValue = 1 | 2 | 3 | 4`, readonly `RarityPriorityConfig`, and the `rarity-priority` strategy carrying its configuration. Defaults: Common 1, Rare 2, Mythical 3, Pet 1. The factory copies its configuration.

Each unopened cell receives `sum(P(cell belongs to participant) * configured category priority)` over uniform surviving worlds. UI values and solver weights are identical. Actual hit probability remains separate from weighted strategy score.

Balanced, Finish What You Found, and Target One weight branches are unchanged. The full dynamic world-generation/filtering engine is unchanged, including no-overlap, contradiction, completion, undo/reset, opened-cell exclusion and deterministic 1e-12 tie tolerance. Static animal/region solvers, canonical records, patterns, types, artwork and region grouping were not edited. Protected-file hash checks cover 82 files, plus the three existing weight branches.

## Setup and interaction

Pet-only rescues use the existing one-participant solver. A region is unnecessary when zero animals and one pet are selected. Empty setup remains invalid. Animal rescues require a region, same-region animals, at most three total participants, at most one pet and at most two animals with a pet. Duplicate participants remain invalid.

A user can select a pet before selecting a region. Selecting a region preserves the pet and clears region-animal selections as before. Removing all animals leaves a valid pet-only setup; removing its pet disables Start. Pet-only active rescues display `Pet rescue`.

Rarity Priority has four compact radio groups, each with four numeric choices and a visible selected checkmark. Each group has a single keyboard tab stop; arrow keys wrap, Home/End select endpoints. Focus remains visible. Mobile rows use one column, controls have 44px touch targets, and motion respects reduced-motion preferences. Pet controls retain the established violet theme.

During rescue, changing a priority immediately recomputes scoring over already-memoized surviving worlds. It preserves observations, participants and world counts. The live summary uses `C1 / R2 / M3 / P1` values. Undo removes only the latest observation; reset clears observations while keeping strategy/configuration and participants. Target still requires explicit selection and safely handles pet targets and resolved targets.

## Files

Production changes:
- `src/solver/dynamic/rescueStrategy.ts`
- `src/components/rescue/RarityPriorityControls.tsx` (new)
- `src/components/rescue/RescueAssistant.tsx`
- `src/components/rescue/RescueSetup.tsx`
- `src/components/rescue/RescueBoard.tsx`
- `src/components/rescue/StrategySelector.tsx`
- `src/components/rescue/rescueParticipants.ts`
- `src/components/pets/PetSelector.tsx`
- `src/styles/strategies.css`
- `src/app/rescue/page.tsx`
- `src/components/layout/siteVersion.ts` (single ALPHA 11 label)

Tests and validation:
- `src/solver/dynamic/alpha11.test.ts` (48 new solver tests)
- `src/components/rescue/alpha11.test.tsx` (8 new UI tests)
- `src/solver/dynamic/rescueStrategy.test.ts`
- `src/components/rescue/strategyIntegration.test.tsx`
- `src/components/rescue/alpha09.test.tsx`
- `scripts/checkAlpha11Browser.cjs` (new)
- `scripts/profileAlpha11.ts` (new)
- `scripts/checkAlpha09Browser.cjs`
- `scripts/checkAlpha10Browser.cjs`
- `scripts/profileAlpha10.ts` (configuration API compatibility only)

## Validation

187 tests, including 56 new ALPHA 11 tests. Build, lint and strict TypeScript compilation pass. Browser validation comprises 641 new checks, 150 existing UI checks and 469 existing strategy checks: 1,260 checks total at 375, 390, 768 and 1440px. It includes keyboard navigation, visible focus, reduced motion, pet-only completion/contradiction recovery, setup limits, transitions to animal-plus-pet, live configuration changes and recommendations verified against the real solver. No fake strategy values are used.

Screenshots/results: `public/game/experiments/alpha11/`, including regression suites in subdirectories. `index.html` is a review gallery. Raw profiling: `performance.json`.

## Performance

Local Node v24.14.0 timings in milliseconds: **mean / p95**, including world generation, filtering and scoring. Every classic-animal combination across seven regions and every pet species where applicable; three repeats after policy warm-up. Pet-only runs cover eight species once each per repeat. These are initial-state measurements: Finish Found has no hits yet, Target uses the first selected participant, and Rarity Priority uses defaults. Desktop Node measurements are not mobile-browser guarantees.

| Setup | Balanced | Finish Found | Target | Rarity Priority |
|---|---|---|---|---|
| Pet only | 0.090 / 0.328 | 0.037 / 0.061 | 0.077 / 0.174 | 0.054 / 0.180 |
| 1 animal | 0.041 / 0.072 | 0.031 / 0.053 | 0.032 / 0.068 | 0.027 / 0.046 |
| 2 animals | 0.168 / 0.471 | 0.105 / 0.332 | 0.095 / 0.279 | 0.095 / 0.255 |
| 3 animals | 0.793 / 1.992 | 0.482 / 1.183 | 0.476 / 1.152 | 0.477 / 1.411 |
| 1 animal + pet | 0.109 / 0.237 | 0.073 / 0.152 | 0.073 / 0.156 | 0.071 / 0.151 |
| 2 animals + pet | 0.443 / 1.254 | 0.302 / 0.828 | 0.296 / 0.873 | 0.299 / 0.881 |

No workers, persistence or additional caching frameworks were introduced. Existing local world memoization remains intact. No dependencies were added. No commit was created.
