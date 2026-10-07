# Reviewed Fandom animal extraction

All 26 additional animals passed individual source/mask inspection and pixel validation. Together with the four approved prototypes, all 30 supported classic animals now have HQ display assets. No unresolved animals remain.

Open `/game/experiments/fandom-extracted-all/index.html` on the running site for all 30 original/source/HQ comparisons, native-size results and collection-size previews. The five `*-comparison.png` contact sheets contain native-size images only. `diagnostics/` contains the regional extraction inspection sheets. `validation.json` records source URLs, source/output dimensions, palettes, crop bounds, hashes and removal components.

## Extraction and review

- `scripts/fandomExtractionProfiles.json` stores an individually reviewed profile for each animal: immutable source hash, shadow color/rectangle, signature color where present, optional enclosed-background seed, expected animal palette/pixel coverage and anatomical inspection notes.
- Exact-color, exterior-connected flood fill removes background. Reviewed component masks remove ground shadows and signatures. Background removal runs again through those cleared areas. No largest-component selection or global color deletion is used.
- All 30 require reviewed shadow masks. The 12 Farm/Outback sources also require signature removal. Only Pig needs an enclosed-background seed: `(89, 66)`, clearing the 16-pixel tail opening. The additional 26 need no enclosed-background seeds.
- Masking changes alpha only. Cropping translates source pixels without resampling and retains 2px transparent padding. Validation checks every output RGB value against its original source position, binary alpha, all reviewed animal-color pixels, source hashes and decoded saved PNG bytes. No missing animal pixels, recoloring or artificial semi-transparent pixels were detected.
- Repeat extraction produced identical hashes for all 30 HQ PNGs, the presentation manifest and validation records. The original four approved outputs are byte-identical to their HQ copies.

Full source URLs, dimensions and animal-specific inspection notes: [HQ source inventory](../../animals-hq/README.md).

## Integration files

Runtime frontend files added/changed in this pass:

- `src/components/animals/AnimalArtwork.tsx`
- `src/components/animals/animalArtworkPresentation.ts`
- `src/components/animals/hqArtwork.json`
- `src/styles/regions.css`

`src/components/animals/assetPresentation.test.ts` covers all 30 manifest selections, both presentation contexts and fallback behavior. `scripts/extractFandomPrototype.py` now accepts reviewed profiles and destinations; `scripts/extractFandomAnimals.py` validates/publishes assets and regenerates the manifest and review artifacts. Reference/source documentation was updated separately. Earlier working-tree visual changes are not part of this integration pass.

HQ assets are selected in presentation code only. Missing/unreviewed manifest entries use canonical originals; an HQ load failure also falls back to the original. If both fail, an accessible unavailable-artwork state replaces the image. Existing originals, approved patterns, data/types and solver files remain unchanged (40 protected files verified by SHA-256). Production Scale4x selection was removed; earlier upscale experiments remain historical reference files.

## Checks

- Build and lint passed; all 17 frontend presentation/integration tests passed.
- Real collection/guide browser checks passed at 375, 390, 768 and 1440px: five collections plus 30 guides at each width, 140 layouts total. Checked crisp rendering, actual image dimensions, centering, stage containment, page overflow and image loading.
- The comparison page passed at all four widths. Deliberate image failures verified HQ-to-original fallback and the accessible unavailable state. No unexpected browser errors occurred.
- Representative desktop/mobile screenshots are in this directory; `browser-checks.json` contains all layout results.
- All 30 HQ PNGs total 17,951 bytes. Extraction runs offline; the UI performs no image processing. No dependencies, caching infrastructure or runtime upscaling were added. Pixel rendering and restrained sizing preserve the existing motion and responsive layout. Frame-rate performance was not benchmarked.

Reproduce extraction with `python scripts/extractFandomAnimals.py` (without `-O`). Browser QA uses `scripts/checkAnimalArtworkBrowser.cjs` with an existing server and an isolated Chrome remote-debugging session; `HQ_QA_URL` and `HQ_QA_CDP` configure their endpoints.
