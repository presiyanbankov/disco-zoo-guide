# ALPHA 12 product correction

This report supersedes the fixed rarity weighting and Review Board sections of the earlier ALPHA 12 report. Version stays ALPHA 12. No commit created.

## Product decisions

The user's main task is to complete a rescue: choose guaranteed participants, follow the next-cell recommendation, report the game result, recover mistakes, then start the next rescue. Navigation should consistently lead to that task. Strategy is a supporting policy choice, not a competing feature. Completion should leave the board visible and present the next useful action.

## Rarity Focus semantics

`rarityFocusParticipantIds(state, worlds)` uses surviving worlds and the existing conservative participant-completion rule. It gathers unresolved normal animals, then selects every participant in the highest remaining tier: Mythical, then Rare, then Common. Scoring is `P(cell belongs to any active-tier participant)` over uniform surviving worlds. Multiple same-tier participants score together; none is chosen arbitrarily. Already-opened cells remain excluded. No-overlap means active participant occupancy counts are a union, with at most one contribution per world/cell.

Pets contribute nothing while any normal animal is unresolved. After all normal animals complete, unresolved pets become cleanup participants and the same policy continues recommending their unopened tiles through complete rescue. No strategy change or stalled zero-score state is required.

A true pet-only rescue still reports `strategy-unavailable` if Rarity Focus is called directly. The UI omits Rarity Focus for pet-only selection, leaving Balanced Search, Finish What You Found and Target One. If setup becomes pet-only while Rarity Focus was selected, it returns to Balanced Search without deleting participants. Any animal + pet always exposes Rarity Focus. Empty setup keeps the four prospective choices until participants are chosen.

User copy: `Prioritize Mythical, then Rare, then Common. Pets don't affect priority.` No numeric rarity weights remain in production UI. Live feedback shows the current tier, e.g. `Priority: Mythical`, and then `Finishing pet`. All active-tier participants get a compact PRIORITY marker; it is not a single selected animal.

The entire `dynamicRescueSolver.ts` is unchanged in this correction. World generation, filtering, no-overlap, contradiction, undo/reset, epsilon 1e-12, lowest-row-major ties, Balanced and Finish Found formulas, Target strict scoring and auto-advance all remain intact. Canonical data/types, static/region solvers, patterns, artwork, participant limits, pet-only support, region grouping/unlocks and version are untouched. Hash checks protect 73 files including the full dynamic engine and version source.

## Completion and board hierarchy

Review Board and its UI state are removed. The completed board remains visible. Completion is RESCUE COMPLETE, a short factual confirmation, a stronger Next Rescue button, then the board. The existing restrained success pulse and reduced-motion static highlight remain. Strategy controls are hidden after complete rescue because there is no next recommendation to configure.

Next Rescue still clears participants and observations, preserves useful region/strategy mode and returns to setup without automatically starting. The completed board retains Undo/Reset for correcting an entered result. An untouched board now omits Undo/Reset entirely until an observation exists, removing dead controls and shortening its composition. Contradiction keeps its focused primary Undo action and secondary Reset; recovery behavior is unchanged.

Strategy cards become compact discrete buttons with one selected description. This preserves obvious checked selection and keyboard focus while reducing repeated descriptions and leaving Start Rescue/the board dominant. The live sidebar now reports active tier/cleanup instead of repeating generic intent.

## Global navigation

`SiteHeader` uses the new client `RescueHeaderLink`, with a separately testable `RescueHeaderAction`. Off /rescue it is a high-contrast link to /rescue, preserving URL semantics, prefetching, new-tab behavior and route transitions. Explore regions remains secondary; Sound and ALPHA 12 remain quieter.

Desktop uses Rescue Assistant. Mobile and tablet use compact Rescue. Touch height is at least 44px. Mobile is a two-row grid: brand/Rescue/Sound first, secondary exploration and version below. On 768-1023px tablets, compact label, icon-only Sound and nowrap brand/version prevent wrapping. Visual review caught and corrected the tablet wrapping even though initial overflow assertions passed.

On /rescue the primary treatment becomes a checked current-page marker with aria-current=page and a current-page accessible label. It is intentionally not a redundant current-route link/button. Normal route CTA retains hover/focus styling. Reduced motion disables its transitions.

## Files

Production:
- `src/solver/dynamic/rescueStrategy.ts` (tier membership and policy inclusion)
- `src/components/rescue/RescueAssistant.tsx` (applicable setup policy and live tier IDs)
- `src/components/rescue/RescueBoard.tsx` (completion simplification, useful recovery controls, active tier feedback)
- `src/components/rescue/StrategySelector.tsx` (applicable options, intent copy, compact controls)
- `src/components/layout/SiteHeader.tsx`
- `src/components/layout/RescueHeaderLink.tsx` (new)
- `src/styles/rescue.css`, `src/styles/strategies.css`

Tests/review:
- `src/solver/dynamic/rarityTiers.test.ts` (new; 10 cases)
- `src/components/rescue/productFlow.test.tsx` (new; 45 cases)
- `src/solver/dynamic/alpha12.test.ts`, `src/solver/dynamic/rescueStrategy.test.ts` (retired weighted expectations updated)
- `src/components/rescue/alpha12.test.tsx`, `src/components/rescue/strategyIntegration.test.tsx`
- `scripts/checkAlpha12ProductBrowser.cjs` (new, comprehensive current-flow QA)
- `docs/alpha12-product-correction.md`
- `public/game/experiments/alpha12-product/` (60 screenshots, side-by-side gallery, test/browser results, performance and protected hashes)

## Validation and visual review

Build passes: 55 prerendered pages. Lint passes without warnings. Strict TypeScript compilation passes. All 213 current tests pass, including 55 new product cases. Tests explicitly prove that a diffuse Mythical outranks guaranteed lower-rarity tiles, tier progression, pooling of two Rares, pet exclusion during animal search, pet cleanup and deterministic ties. Every supported animal + pet UI combination is checked for Rarity Focus availability.

All 819 current product browser checks pass across four widths: 375, 390, 768 and 1440px. It checks global navigation from home/region/animal routes, active header state, real keyboard activation/focus, applicable pet-only options, normal setup, live tier feedback, complete Northern Skunk/Moose/Sasquatch progression, animal-to-pet cleanup, Target auto-advance/manual changes, contradictions/recovery, completion/Next Rescue, reduced motion, normalized board identity and overflow.

60 screenshots, grouped side-by-side by state and width in `public/game/experiments/alpha12-product/index.html`. Reviewed desktop home/region/animal headers, setup, animal+pet Rarity Focus, pet-only setup, live tiers, cleanup and completion, plus mobile/tablet header, setup, active board, contradiction/recovery and completion. The review prompted the additional tablet wrapping fix and hiding initial dead Undo/Reset controls. The board and next action remain the focal points.

Historical fixed-weight/Review Board browser artifacts are prior-milestone records; this product suite supersedes those assertions.

## Performance

Local Node v24.14.0, initial states, every animal combination across seven regions and every pet where applicable, three repeats after warm-up. Mean / p95 in milliseconds, including generation/filtering/scoring; policy-only values are in performance.json. Pet-only Rarity Focus is intentionally not applicable. These local measurements are not mobile-browser guarantees.

| Setup | Balanced | Finish Found | Target | Rarity Focus |
|---|---|---|---|---|
| Pet only | 0.043 / 0.099 | 0.031 / 0.065 | 0.033 / 0.079 | Not applicable |
| 1 animal | 0.035 / 0.061 | 0.022 / 0.039 | 0.024 / 0.042 | 0.028 / 0.046 |
| 2 animals | 0.107 / 0.271 | 0.064 / 0.156 | 0.067 / 0.179 | 0.066 / 0.158 |
| 3 animals | 0.452 / 1.194 | 0.264 / 0.610 | 0.258 / 0.691 | 0.288 / 0.865 |
| 1 animal + pet | 0.054 / 0.110 | 0.035 / 0.067 | 0.035 / 0.064 | 0.035 / 0.065 |
| 2 animals + pet | 0.208 / 0.546 | 0.136 / 0.347 | 0.135 / 0.360 | 0.134 / 0.345 |

No infrastructure or caching changes. No dependencies installed. ALPHA 12 remains ALPHA 12; no commit created.
