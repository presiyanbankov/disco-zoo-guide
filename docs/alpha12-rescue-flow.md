# ALPHA 12: Rescue flow, feedback and UX cleanup

> The current Rarity Focus and completion product decisions are documented in [the product correction](alpha12-product-correction.md); fixed-weight and Review Board sections below describe the earlier pass.

## Strategy

`src/solver/dynamic/rescueStrategy.ts` replaces configurable `rarity-priority` with `{ type: "rarity-focus" }`. Fixed weights: Common 1, Rare 2, Mythical 3, Pet 0. Cell utility is the sum of each participant's surviving-world occupancy probability multiplied by its category weight. Actual any-participant hit probability remains separate from utility.

All configurable state, controls and CSS were removed, including `RarityPriorityControls.tsx`. Rarity Focus is disabled for pet-only setups and live rescues with a factual explanation. Direct solver callers receive `strategy-unavailable`, with no scores/recommendation. Contradiction still takes precedence. When animal tiles are all reported but pet tiles remain, `strategy-complete` invites changing strategy; pets remain in worlds, observations, artwork and board state.

`resolvedParticipantIds` and `resolveTargetStrategy` are pure policy helpers. A participant completes only when no surviving world contains an unopened tile for it. A uniquely determined placement with unopened tiles still needs reporting. An invalid target requires selection; a completed valid target advances to the first unresolved participant in original rescue participant order. No observations/worlds are mutated. No participants remaining leads to normal rescue completion. Manual unresolved targets remain selectable; complete targets are disabled and labeled COMPLETE.

Frontend animal participant order now follows selection order rather than canonical animal-array order; the selected pet remains appended after region-animal selections. The UI updates target strategy separately on reporting, and derives effective target state for restoration after strategy changes. Transition messages use the current effective target.

`src/solver/dynamic/dynamicRescueSolver.ts` only gains the unavailable-policy status/guard and target-policy resolution call. Nine core engine functions are unchanged byte-for-byte: state creation, world generation, filtering, observation application, undo, reset, possible-world lookup, balanced scoring and cell selection. Balanced, Finish Found and Target weights are unchanged. Tie tolerance remains 1e-12 with lowest row-major selection. Protected-file checks cover 71 data/type/static-solver/HQ-animal/pet-art files. No participant limits changed.

## Rescue UX and accessibility

Board hit cells share one neutral hit border/background for animals and pets. The former per-participant `animal-color-*` classes and pet-specific full-cell border/background override are removed. Identity remains in authentic artwork, accessible cell names, roster, result choices and history. Recommended, unopened and empty states remain distinct; terminal states use success/error accents at board-panel level. Pet selection/artwork retains the authentic purple category language.

Status hierarchy is contradiction, completion, active strategy/target, then normal next-cell guidance. Contradiction and completion suppress the competing sidebar strategy banner and irrelevant probability/world metrics. Supporting controls remain secondary to the board.

Completion clearly announces RESCUE COMPLETE, applies a short nonblocking success pulse and offers Next Rescue / Review Board. Next Rescue clears observations/board and all animal/pet selections, preserves the region and strategy mode, and returns to setup without starting anything. Target mode preserves its mode but clears the stale target ID and requires a new selection. Pet-only does not create a region. Focus moves to the animal setup heading when a region remains, or the Pet disclosure otherwise.

Review Board minimizes the completion panel, preserves observations and focuses the final board. A Next Rescue action remains visible. Undo and Reset remain available; either clears the review state.

Contradiction says: `Results don't match any possible layout.` / `Check the last result or undo it.` A short error pulse and small shake support a visible alert and prominent Undo last result. Focus moves to Undo. The redundant neutral Undo is hidden during contradiction; Reset remains secondary. There is no automatic undo. Undo clears error styling/message and focuses the resumed recommendation. Strategy changes do not steal focus from controls.

Result entry retains the anchored desktop dialog, mobile tray, focus trap, Escape and E / 1-3 shortcuts. Completion and recovery controls remain alongside the board, not blocking dialogs. Completion uses semantic status/live messaging; contradiction uses an alert; auto-advance uses a compact role=status transition. Reduced motion disables pulse/shake/transitions while retaining static success/error highlights.

Audited surfaces: setup, live board, strategy/target controls, participant roster, hit cells, history, result selector, status panels, metrics, Undo, Reset, completion, review and recovery states.

## Files

Solver/policy:
- `src/solver/dynamic/rescueStrategy.ts`
- `src/solver/dynamic/dynamicRescueSolver.ts`
- `src/solver/dynamic/rescueStrategy.test.ts`
- `src/solver/dynamic/alpha12.test.ts` (new; 28 cases)
- `src/solver/dynamic/alpha11.test.ts` removed (retired configurable-priority tests)

UI:
- `src/components/rescue/RescueAssistant.tsx`
- `src/components/rescue/RescueBoard.tsx`
- `src/components/rescue/RescueSetup.tsx`
- `src/components/rescue/StrategySelector.tsx`
- `src/components/rescue/RarityPriorityControls.tsx` removed
- `src/styles/rescue.css`
- `src/styles/strategies.css`
- `src/styles/pets.css` (rescue hit/roster border normalization only)
- `src/components/layout/siteVersion.ts` (single ALPHA 12 value)
- `src/components/rescue/alpha12.test.tsx` (new; 7 cases)
- `src/components/rescue/alpha11.test.tsx` removed (retired configurable controls)
- `src/components/rescue/rescueIntegration.test.ts`
- `src/components/rescue/strategyIntegration.test.tsx`

Validation/docs:
- `scripts/checkAlpha12Browser.cjs` (new)
- `scripts/profileAlpha12.ts` (new)
- `scripts/checkAlpha09Browser.cjs` (uniform hit-state expectation)
- `scripts/checkAlpha10Browser.cjs` (fixed helper and automatic-target expectations)
- `scripts/profileAlpha10.ts`, `scripts/profileAlpha11.ts` (current strategy API compatibility)
- `docs/alpha12-rescue-flow.md`
- `public/game/experiments/alpha12/` (screenshots, browser results, raw timings, invariant checks, logs and review gallery)

No canonical data/types/patterns, static solvers, artwork, extraction pipeline, region grouping/unlocks or new content were modified. No dependencies were added. Historical ALPHA 11 browser artifacts remain as records; its configurable-control harness describes the retired milestone and is superseded by ALPHA 12 coverage.

## Validation

Build passes with 55 prerendered pages. Lint and strict TypeScript compilation pass. All 166 current tests pass, including 35 new ALPHA 12 cases (28 solver / 7 UI). Obsolete configurable controls/weights tests were replaced, not retained as tests for nonexistent features. Existing world/filtering/static/pattern/artwork and pet-only regression tests remain.

Browser checks: 415 ALPHA 12 checks + 150 existing UI checks + 473 updated strategy regression checks = 1,038 checks across 375, 390, 768 and 1440px. Tests use real solver recommendations and actual valid placements; no fake production values. Includes pet-only strategy limits, keyboard shortcuts/focus, target selection order/advance/manual changes, normalized hit borders, completion, Next Rescue, Review Board, contradiction/Undo recovery, observation preservation, overflow and reduced-motion terminal effects.

Screenshots: 32 focused rescue-state images and 57 regression images, 89 total. Review `public/game/experiments/alpha12/index.html`. Mobile/desktop states were reviewed together, including normal active, multiple participant hits, auto-advance, contradiction, recovery, pet completion, multi-participant completion and final-board review.

## Performance

Local Node v24.14.0 timings in milliseconds: mean / p95 including world generation/filtering/scoring. Every classic-animal combination across seven regions and every pet species where applicable; three repeats after warm-up, initial states. Target chooses first participant; Finish Found has no hits. Rarity Focus is skipped for pet-only because it is unavailable. Separate policy-only timings and maxima are in `performance.json`. These are local Node measurements, not mobile-browser guarantees.

| Setup | Balanced | Finish Found | Target | Rarity Focus |
|---|---|---|---|---|
| Pet only | 0.044 / 0.084 | 0.035 / 0.044 | 0.036 / 0.082 | Unavailable |
| 1 animal | 0.022 / 0.044 | 0.015 / 0.029 | 0.017 / 0.027 | 0.017 / 0.026 |
| 2 animals | 0.106 / 0.230 | 0.063 / 0.155 | 0.064 / 0.169 | 0.061 / 0.153 |
| 3 animals | 0.462 / 1.117 | 0.291 / 0.738 | 0.290 / 0.764 | 0.288 / 0.797 |
| 1 animal + pet | 0.058 / 0.121 | 0.041 / 0.085 | 0.041 / 0.088 | 0.040 / 0.085 |
| 2 animals + pet | 0.254 / 0.719 | 0.168 / 0.452 | 0.167 / 0.463 | 0.168 / 0.463 |

No measured performance regression requiring infrastructure; no workers, caching frameworks, persistence or alternate world architecture added. Existing world memoization is retained.

No commit created.
