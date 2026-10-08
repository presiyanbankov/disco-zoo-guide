# ALPHA 09 pet/setup polish

UI-only pass. No solver, canonical pet/classic data, domain types, participant
rules, static strategies or classic HQ/extraction-pipeline files were written.

## Presentation

- PetSelector is a native keyboard-accessible details/summary disclosure, closed
  by default. The compact row says Pet and None/current species. Opening exposes
  None and eight species. Choosing closes it and restores summary focus.
- Existing disabling rules remain: three animals prevent pet selection; a pet
  allows two animals. No choice is silently removed, and pet-only start remains
  disabled. Region change and rescue state handling are unchanged.
- Setup Start Rescue has a 58px minimum height, greater width/text weight,
  restrained contrast/depth, and visible keyboard focus. Mobile uses full width.
- Homepage and overview heading now say Pet patterns. The animal-count instruction
  reflects the existing one-to-two limit when a pet is selected.
- Pattern cards retain exact coordinates with square 22/24px cells and 2px gaps,
  avoiding stretched fractional-width columns.
- All eight species use reviewed extracted silhouettes with restrained pixelated
  display. Missing/failed artwork retains an accessible fallback.

## Source file inventory

Changed:
- src/components/rescue/RescueSetup.tsx
- src/components/pets/PetArtwork.tsx
- src/app/page.tsx
- src/app/pets/page.tsx
- src/styles/alpha09.css
- src/components/rescue/rescueIntegration.test.ts (CTA class assertion only)
- scripts/checkAlpha09Browser.cjs (disclosure/CTA/artwork checks)
- docs/alpha09-assets.md
- docs/alpha09-integration.md (artwork-status note)

Added:
- src/components/pets/PetSelector.tsx
- src/components/pets/petSilhouettes.json
- src/components/pets/petPolish.test.tsx
- scripts/extractPetSilhouettes.py
- this report

Eight source diagrams: assets/reference/fandom/pets/<species>-pattern.png.
Eight production icons: public/game/pets/silhouettes/<species>.png.
Species: rabbit, bird, dog, cat, fish, turtle, lizard, hamster.
See alpha09-assets.md for exact source URLs, dimensions and extraction notes.
Review artifacts: public/game/experiments/pet-polish/.

## Final validation

- Build: passed, 55 generated pages.
- Lint: passed without warnings/errors.
- Strict TypeScript compilation: passed.
- Full tests: 85 passed, including five new focused UI/artwork tests.
- Production browser QA: 113 checks passed at 375, 390, 768 and 1440 pixels,
  with zero unexpected runtime/image errors. Includes collapsed default, native
  keyboard disclosure, collapse/focus after choice, preserved selection limits,
  no pet-only start, compact row height, Start Rescue size and keyboard activation,
  wording, actual pattern-cell spacing, image loads and forced-error fallback,
  contextual animal-count wording, existing result entry, undo/reset, region clearing and reduced motion.
- Screenshot review: expanded mobile choices, collapsed desktop setup and
  mobile pattern cards inspected.
- Eight extraction validations: zero surviving RGB changes, no resampling,
  binary alpha only. All source/native-output silhouettes inspected.

No dependency added and no version change in this polish pass.
