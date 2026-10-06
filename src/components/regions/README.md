# Phase 2 frontend

## Routes and composition

`RegionExplorer` links to `/regions/[regionId]`. The route statically generates
only Farm, Outback, Savanna, Northern, and Polar; other region IDs return the
non-spoiling 404 page. Region pages compose `RegionHero`, `AnimalCollection`,
`TimelessSlot`, and `RegionNavigation`, with shared site header/footer components.

Phase 3 now links animal cards to individual animal routes. See
`../grid/README.md` for the pattern/search-grid contracts and development demo.

## Presentation and owner data

`regionPresentation.ts` contains frontend copy and the explicitly available
region list. It does not define game mechanics.

`../animals/DEV_MOCK_ANIMALS.ts` is a development-only frontend roster with a
visible alpha-preview disclosure on every region page. Names and rarity labels
were cross-checked against the linked Pocket Gamer reference. The owner's
`src/data/animals.ts` and `src/data/regions.ts` remain empty and untouched.

The frontend consumes existing types from `src/types/game.ts` without modifying
them. When canonical animal records are supplied, replace the sample-roster
boundary in the region route. Respect `hidden`, current-region visibility, and
the Timeless exclusion before passing records to the collection. Remove the
sample notice only when owner-reviewed data is actually connected.

No mock patterns, search steps, solver calls, Timeless identities, pets, or
locked-region animal records were added.

## Artwork and styling

`RegionLandscape` and `AnimalArtwork` are original vector placeholders, not
original game sprites. `AnimalArtwork` accepts an `imagePath` for a replacement
sprite. See `public/game/animals/README.md` for asset locations.

`src/styles/regions.css` provides the responsive layouts. Common animals appear
in three columns on desktop, rare animals in two, and mythical animals receive
a wide card. Phone layouts use two compact cards plus a wider third common
card. The Timeless slot has no identity-dependent inputs.

The ambient effects use existing CSS animation infrastructure, with reduced
motion support. No packages were added. Phase 4 adds shared artwork transitions;
see `../navigation/README.md`. Phase 5 adds optional sound and environmental
effects; see `../audio/README.md`.

## Verification

- Production build and TypeScript checks pass.
- ESLint passes with the pre-existing unused-parameter warning in the solver stub.
- Headless Chrome checked `/` and all five region routes at 375, 390, 430, 768,
  1024, 1440, 1920, and 2560 pixels: no horizontal overflow.
- Each region renders six cards grouped 3 common / 2 rare / 1 mythical, plus
  the unknown Timeless slot and a visible sample-roster disclosure.
- Region navigation, browser back, keyboard focus, and reduced motion pass.
- At Phase 2, locked, invalid, and unimplemented animal routes returned the
  non-spoiling 404. Phase 3 now makes the 30 known animal routes available.
- Desktop Farm and phone Farm/Polar screenshots were visually reviewed.
