# ALPHA 09 pet visual theme

Visual-only pass; no commit created.

## Audited surfaces

- `/pets`: dark cards, purple occupied pattern cells, muted empty cells, headings, 5-tile counts, back-link and focus ring. Pattern geometry and 2px gaps preserved.
- Homepage Pet patterns: divider, species label, link and focus ring.
- Rescue setup: collapsed None/selected identity, disclosure focus/chevron, expanded choices, None, selected/hover/disabled states and functional copy. Selected choices have a visible checkmark in addition to aria-pressed.
- Live rescue: pet result button, keyboard hint, PET badges, reported pet board cells, roster tile counts and pet history rows.
- Shared PetArtwork: original purple tiles remain unchanged; unavailable artwork uses the pet palette.
- Mixed animal/pet surfaces: normal animals, Empty results, recommendations, metrics and Start Rescue retain existing tool/region styling. Shared shell/header/footer are unchanged.

## Presentation implementation

`src/styles/pets.css` owns eight shared pet tokens: accent, muted text, border, strong border, dark surface, selected surface, empty cell and occupied cell. Existing pet rules in `alpha09.css` consume these tokens instead of green values. Participant-kind data attributes scope live rescue styles without changing state or event handling.

Production files changed in this pass:
- src/app/layout.tsx
- src/styles/alpha09.css
- src/styles/pets.css (new)
- src/components/pets/PetSelector.tsx
- src/components/rescue/ResultSelector.tsx
- src/components/rescue/RescueBoard.tsx

QA changes: src/components/pets/petPolish.test.tsx, scripts/checkAlpha09Browser.cjs. Evidence: public/game/experiments/pet-theme/.

Original artwork PNGs, extraction code, canonical data, types, patterns and all solvers are unchanged from the start of this pass. Protected-file SHA-256 baseline records 82 files.

Audited component files (including unchanged consumers):
- src/app/pets/page.tsx
- src/app/page.tsx
- src/components/pets/PetSelector.tsx
- src/components/pets/PetArtwork.tsx
- src/components/rescue/ParticipantArtwork.tsx
- src/components/rescue/RescueSetup.tsx
- src/components/rescue/RescueAssistant.tsx
- src/components/rescue/ResultSelector.tsx
- src/components/rescue/RescueBoard.tsx
- src/components/rescue/RescueHero.tsx (shared tool copy; no pet-specific accent required)

Contrast: occupied pattern cells versus empty cells 5.78:1; accent text versus selected surface 8.31:1; muted pet text versus card surface 8.16:1. Selection is also identified by a checkmark, aria-pressed, named tile artwork and PET badges.

## Final validation

Build: passed, 55 pages. Lint: passed. Strict TypeScript compilation including tests: passed. Tests: 86 passed, zero failures. Browser: 150 checks passed at 375, 390, 768 and 1440 px, including keyboard focus, reduced motion, selection constraints and fallback; no runtime exceptions or broken image responses. Screenshots: 41 PNGs, indexed in public/game/experiments/pet-theme/index.html. All 82 protected hashes still match. No packages added and no commit created.
