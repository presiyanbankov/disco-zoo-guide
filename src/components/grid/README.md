# Animal rescue grids

The server-side `getAnimalGuidePresentation` loads the selected approved animal
and calls `generateAnimalGuideStrategy`, which delegates directly to the existing
owner-written `generateSearchSequence(animal.id, animal.pattern)`. Region lists
and metadata do not run the solver. No solver, data, or domain types are changed.

`PatternGrid` renders approved coordinates without altering the shape.
`SearchOrderGrid` independently renders every returned step immediately on the
5x5 board; cells outside the sequence remain unnumbered. Touch, hover, and
keyboard inspection retain the existing sound, focus, and motion behavior.
Coordinates in data are zero-based; display axes are one-based.

Missing/invalid patterns skip generation. Solver exceptions preserve the rest
of the guide with an unavailable state. Development logs include the original
error and the panel shows its message; production uses a generic fallback.
The grid validates result structure without implementing search logic.

Real guide pages have no mock strategy imports or development demo toggle.
The arbitrary `__fixtures__/DEV_MOCK_STRATEGY.ts` is used only by structural
rendering tests. The unused mock pattern was removed. There is no custom cache,
strategy JSON generation, persistence, or additional dependency.

Integration tests compare rendered cells against the existing solver's output
for all 30 animals, verify independent pattern cells and unnumbered tiles, and
exercise missing patterns, missing strategies, and solver failures. They do not
reproduce the algorithm. Run with the existing compiler and Node test runner:

```powershell
node node_modules/typescript/bin/tsc --outDir .next/solver-integration-check --rootDir src --jsx react-jsx --esModuleInterop --skipLibCheck --moduleResolution node --module commonjs --target es2017 --strict src/components/grid/gridPresentation.test.ts src/components/animals/animalGuidePresentation.test.ts src/components/animals/animalGuideIntegration.test.ts
node --test .next/solver-integration-check/components/grid/gridPresentation.test.js .next/solver-integration-check/components/animals/animalGuidePresentation.test.js .next/solver-integration-check/components/animals/animalGuideIntegration.test.js
```

Shared artwork transitions and environmental effects remain documented in
`../navigation/README.md` and `../audio/README.md`. Actual sprites remain original
placeholder artwork until licensed or owner-supplied replacements are available.
