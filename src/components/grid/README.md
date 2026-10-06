# Phase 3 grid presentation

## Data ownership

No game-data, type, domain, or solver source files were changed. The owner’s
animal and strategy files remain empty. All 30 preview animal routes therefore
show explicit missing-pattern and missing-strategy states by default.

`AnimalGuideGrids` accepts the existing `AnimalPattern` and `StaticSearchResult`
contracts. `presentOwnerAnimal` is the frontend adapter for future owner-approved
records and excludes hidden, Timeless, and unavailable-region records. Connect
those records at `getAnimalGuidePresentation` when their exports are ready.
There are no solver imports or solver calls in the frontend.

## Rendering contract

- `PatternGrid` displays supplied cells without normalizing, rotating, or
  inventing a shape.
- `SearchOrderGrid` displays every supplied step immediately. Inspection shows
  coordinates only; it does not reveal steps progressively or simulate rescue.
- `GridBoard` provides the common 5×5 tile system, accessible labels, coordinate
  axes, and touch/keyboard inspection for numbered tiles.
- Supplied data is checked for board bounds, duplicate cells, contiguous step
  labels, and matching animal identity. Invalid data receives an explicit
  fallback. These checks do not enumerate placements or assess optimality.
- Input coordinates are zero-based; visual row and column labels are one-based.
  Search step numbers are independent of those coordinate labels.

## Development layout demo

The opt-in control exists only when `NODE_ENV` is `development`. Production pages
have no demo toggle and never select the mock fixtures. The demo opens all eight
illustrative numbers at once, with a persistent “NOT A RESCUE STRATEGY” notice.

`DEV_MOCK_STRATEGY` has a deliberately non-animal ID. Its arbitrary coordinates
are hand-authored layout fixtures, with no probabilities or generated-result
claims. `DEV_MOCK_PATTERN` is a generic illustrative shape, not a real animal
pattern. Both are isolated from canonical data and are absent from default UI.

## Routes and artwork

Animal cards navigate to `/regions/{regionId}/{animalId}`. Routes are generated
only for the six known preview animals per available region. Cross-region IDs,
unknown animals, Timeless placeholders, and locked regions return the same
non-spoiling 404.

Animal pages include region context, rarity, existing original placeholder
artwork, back navigation, and previous/next known animals. Actual game sprites
can be provided through `imagePath`; patterns and strategies are separate props.
No packages or protected game assets were added.

## Verification

Seven focused tests cover supplied-cell preservation, immediate full numbering,
wrong-animal/duplicate/out-of-board fallbacks, mock labeling, and visibility
boundaries for future owner records. Run them with the existing TypeScript
compiler and Node test runner; no additional test packages are required:

```powershell
node node_modules/typescript/bin/tsc --outDir .next/phase3-component-check --rootDir src --jsx react-jsx --esModuleInterop --skipLibCheck --moduleResolution node --module commonjs --target es2017 --strict src/components/grid/gridPresentation.test.ts src/components/animals/animalGuidePresentation.test.ts
node --test .next/phase3-component-check/components/grid/gridPresentation.test.js .next/phase3-component-check/components/animals/animalGuidePresentation.test.js
```

Chrome verified all 30 production animal routes and 84 layout checks across
375, 390, 430, 768, 1024, 1440, 1920, and 2560 pixels. Checks also covered the
opt-in development demo, immediate full numbering, tile targets of at least
44px, keyboard/tap inspection, browser back, reduced motion, and five excluded
routes returning a non-spoiling 404. Desktop and phone screenshots of both
missing-data and demo states were visually reviewed.

Use the dev server's `localhost` URL when trying the layout demo. The existing
development configuration blocks the hot-reload connection from `127.0.0.1`.
No project configuration was changed to bypass that restriction.

Phase 4 adds route/shared-artwork transitions and responsive refinements; see
`../navigation/README.md`. Sound and additional environmental effects remain Phase 5.
