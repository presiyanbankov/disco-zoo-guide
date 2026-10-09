# ALPHA 12 square rescue cells

Hit artwork was a normal flex child of an auto-sized grid track. Its intrinsic
height could override the cell's aspect ratio, and percentage max-height had no
definite containing height. Animal artwork also inherited a collection-specific
16px top margin.

The board now wraps animal/pet hit artwork in an absolute, full-cell flex box.
Cells have zero minimum height and hidden overflow. Animal images retain auto
dimensions, contain fitting, pixel rendering and bounded width/height; their
board-specific margin is zero. Pet tiles use their existing proportional sizing
inside the same definite container. No artwork, data, solver or flow changes.

`boardContainment.test.tsx` covers Jade Rabbit, Sasquatch, Giraffe and all eight
pets, from initial hits through completion. `scripts/checkRescueSquares.cjs`
checks every cell's square geometry, consistent row height, contained images and
preserved aspect ratios at 375, 390, 768 and 1440px. It exercises unopened,
active-hit, completed and contradiction boards with retained hit artwork.

Screenshots and measured geometry are stored under
`public/game/experiments/alpha12-square-cells/`.

Validation: production build, lint and strict TypeScript compilation passed;
224 tests passed (11 added). Browser QA passed 324 geometry audits covering all
11 participants at all four widths, with no runtime errors. Saved 36 screenshots;
representative mobile, tablet and desktop screenshots were visually inspected.
The previous protected-file inventory confirms all 73 solver/data/type/artwork/
version hashes remain unchanged. No commit was made.
