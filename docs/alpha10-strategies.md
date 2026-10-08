# ALPHA 10 rescue strategy review

## Solver boundary

Changed: `src/solver/dynamic/dynamicRescueSolver.ts`.
Added: `src/solver/dynamic/rescueStrategy.ts`, `src/solver/dynamic/rescueStrategy.test.ts`.

`RescueStrategy` is the explicit discriminated union balanced / finish-found / target(participantId) / rarity-first. Strategy is passed separately from immutable participants and ordered observations. Missing strategy defaults to Balanced.

`analyzeDynamicRescue` retains the public whole-state entry point. `analyzeRescueWorlds` evaluates already-generated and filtered worlds. The UI memoizes the surviving worlds only by observation state, so mode changes reuse exactly the same distribution. The existing balanced scorer is unchanged. `scoreWorldsByStrategy` counts weighted participant occupancy directly in surviving non-overlapping worlds. No independent-placement approximation is introduced.

With q(P,C) = surviving worlds containing participant P at unopened cell C / total surviving worlds:

| Strategy | Score |
| --- | --- |
| Balanced Search | sum q(P,C) = probability of any participant |
| Finish What You Found | sum q(P,C) * (3 if a named hit exists for P, otherwise 1) |
| Target One | q(target,C); all others have weight zero |
| Rarity First | sum q(P,C) * classic rarity weight: Common 1, Rare 2, Mythical 3; Pet 0 |

`hitProbability` stays actual ANY-participant occupancy probability and is displayed as such. `strategyScore` is separate policy utility, may exceed one, and is never shown as a percentage. The chooser compares policy utility when supplied and otherwise the original hit probability, using the existing absolute EPSILON = 1e-12 and the lowest row-major index within tolerance of the actual maximum.

The six existing world/state functions (generation, filtering, applying an observation, undo, reset and getPossibleWorlds) are byte-for-byte unchanged against the pre-task snapshot. Placement generation, no-overlap, EMPTY/identified-HIT filtering, contradiction semantics and all static solvers remain unchanged.

Only participant cloning gains optional `animalRarity` metadata. The frontend adapter reads the canonical animal rarity; pets have no fabricated rarity. Legacy balanced callers remain compatible, and legacy participants without metadata use weight 1 in rarity scoring. No canonical types or data changed.

## Edge states

- No surviving worlds: contradiction takes precedence over every strategy, including invalid targets.
- Missing/unselected target: target-required, no recommendation, select a target explicitly.
- Target exact placement known but tiles unopened: continue recommending those tiles.
- No unopened target tiles in any surviving world: target-resolved, retain the target, allow another target or mode. No silent switching.
- Rarity mode with only unopened pet tiles: strategy-complete; ask the user to change strategy. Pets still constrain all worlds and can be reported normally while the strategy has remaining animal targets.
- Actual no-unopened-participant state: complete regardless of strategy.
- Undo removes only the last observation. Reset removes observations, preserves participants and the current strategy/target. Priority is derived from the remaining history.

## UI and file inventory

- `src/components/rescue/StrategySelector.tsx` (new): four accessible pressed buttons, explicit artwork/name target buttons, active help and rarity legend.
- `src/components/rescue/RescueAssistant.tsx`: separate strategy and remembered target state; state-keyed surviving-world memo; mode changes preserve observations and participants. New region setup defaults back to Balanced.
- `src/components/rescue/RescueSetup.tsx`: strategy before Start, explicit valid target required to start Target One; original pet/animal selection limits unchanged.
- `src/components/rescue/RescueBoard.tsx`: compact live controls, active strategy feedback, textual FOUND / PRIORITY roster marker, resolved-target message. Mode changes retain control focus; reporting/undo/reset focuses the board, and a resolved target returns focus to its selector.
- `src/components/rescue/rescueParticipants.ts`: maps approved classic rarity to policy metadata; selection validation unchanged.
- `src/styles/strategies.css` (new), `src/app/layout.tsx`: dark region-accent controls, pet-accent target buttons, visible focus and checkmarks, reduced-motion support. Desktop has four mode columns; narrower screens have two. Mobile target choices are compact three-column touch controls.
- `src/components/rescue/strategyIntegration.test.tsx` (new): ten UI/server-rendering integration tests.
- `src/components/rescue/alpha09.test.tsx`: version expectation reads the milestone format rather than freezing the previous milestone.
- `scripts/checkAlpha10Browser.cjs` (new): real-solver comparisons and screenshots at 375/390/768/1440.
- `scripts/checkAlpha09Browser.cjs`: reads the version source for existing regression checks.
- `scripts/profileAlpha10.ts` (new): exhaustive supported-config profiling.
- `src/components/layout/siteVersion.ts`: single ALPHA 10 label, updated only after feature validation passed.

No patterns, pets/animal data, domain types, artwork, extraction pipeline, region grouping, locked content, static animal solver or region solver changed. No dependencies added. No commit created.

## Validation and evidence

35 new solver-strategy tests + 10 new UI integration tests; 131 tests total. Existing tests continue to verify static search and the approved world model. Synthetic policy tests use small manually specified worlds, not a duplicate algorithm.

Browser checks compare UI recommendations, world counts and displayed actual hit probabilities against the real solver. They cover default Balanced, mode changes without observation/participant resets, animal/pet targets, explicit target requirement, found markers, pet priority, target completion, target changes, undo, reset, focus, responsive layout and reduced motion. Existing ALPHA 09 checks cover selection limits, pet artwork/fallback, homepage grouping and keyboard result reporting.

Evidence lives under `public/game/experiments/alpha10/`; source guards cover 79 protected data/type/static-solver/artwork files and the six world/state function bodies.

## Performance

Local v24.14.0 measurements in milliseconds, **mean (p95)**, including world generation/filtering and scoring. Every classic-animal combination in all seven regions, each pet species for pet configurations, three repeats. Initial states, maximum 1,008 surviving worlds. Target measurements use the first selected animal. Finish mode starts with no hits; found-hit behavior is covered by synthetic tests and live browser checks.

| Participants | Balanced | Finish found | Target one | Rarity first |
| --- | ---: | ---: | ---: | ---: |
| 1 animal | 0.036 (0.091) | 0.037 (0.071) | 0.034 (0.061) | 0.028 (0.060) |
| 2 animals | 0.142 (0.355) | 0.087 (0.225) | 0.086 (0.204) | 0.087 (0.240) |
| 3 animals | 0.767 (1.917) | 0.469 (1.278) | 0.444 (1.250) | 0.444 (1.296) |
| 1 animal + pet | 0.089 (0.194) | 0.063 (0.134) | 0.061 (0.138) | 0.062 (0.144) |
| 2 animals + pet | 0.396 (1.081) | 0.278 (0.783) | 0.265 (0.737) | 0.264 (0.748) |

The JSON also reports policy-only timings for live mode changes: highest p95 1.102ms. No workers, database, persistence, or heavy caches were added. Only the local observation-state memo reuses surviving worlds across mode changes.

## Final results

- ALPHA 10 production build: passed (55 pages).
- Lint: passed.
- Strict TypeScript including test sources: passed.
- Tests: 131 passed, zero failures (35 new policy tests, 10 new UI tests).
- Browser: 469 strategy + 150 existing regression checks = 619, passed at 375/390/768/1440. No browser runtime exceptions or failed image requests.
- Screenshots: 57 PNGs, indexed in public/game/experiments/alpha10/index.html.
- Protected hashes: all 79 match; all six world/state function bodies match the pre-task snapshot.
- Version: ALPHA 10 in src/components/layout/siteVersion.ts, updated after feature checks passed and verified again in final production checks.
- No commit created.
