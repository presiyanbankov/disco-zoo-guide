# ALPHA 14: Jurassic

Jurassic is Earth 07, using the existing progression, supported-region presentation,
generic guide routes and canonical animal records. No parallel region registry was
introduced. The previous 42 animals, pets and solver implementations are unchanged.

## Content and artwork

Six approved records: Diplodocus, Stegosaurus and Raptor (Common), T-Rex and
Triceratops (Rare), Dragon (Mythical). T-Rex uses ID `t-rex`. Approved coordinates
retain all disconnected cells, empty rows and gaps.

| Animal | Source size | Extracted size | Review |
| --- | --- | --- | --- |
| Diplodocus | 150x150 | 136x124 | Neck, tail, feet and highlights preserved |
| Stegosaurus | 150x150 | 136x112 | Three enclosed plate-notch seeds: (81,51)/36px, (105,63)/42px, (99,70)/36px |
| Raptor | 150x150 | 136x112 | Thin arms, pale toes and long tail preserved |
| T-Rex | 150x150 | 136x124 | Tiny arms, teeth, tail and highlights preserved |
| Triceratops | 150x150 | 136x106 | Pale horns, frill and leg details preserved |
| Dragon | 150x150 | 136x112 | Wing membrane and curled tail preserved; no extra seed required |

All six passed the existing deterministic extractor: exact-color exterior flood
fill, individually reviewed exact-color shadow masks, alpha-only edits, no
resampling/recoloring, binary alpha and 2px transparent padding. Removing the shadow
opened the other foot/tail background pockets. No visible signature was present.
The reviewed foreground palettes validate every retained source animal pixel;
palettes are validation criteria, not global color-deletion masks.

Original references: `assets/reference/fandom/{id}.png`.
Display output: `public/game/animals-hq/jurassic/{id}.png`.
Source URLs, hashes, full masks, palettes, pixel counts and dimensions are recorded
in `assets/reference/fandom/jurassic-validation.json` and
`scripts/fandomExtractionProfiles.json`. Fandom hosting does not establish official
export provenance or reuse permission. Existing fan attribution remains unchanged.

Canonical image paths follow `/game/animals/jurassic/{id}.png`; the existing HQ
manifest resolves them to reviewed display assets. As with Jungle/Moon, no tiny
canonical crop is fabricated. A failed HQ request attempts the canonical path,
then the existing accessible artwork-unavailable fallback.

## Integration

Dedicated vector landscape: basalt, volcanic ridges, broad vegetation, watering
hole and restrained fissure light. Existing sparse particle/mist infrastructure
and reduced-motion rules are reused. No screenshot imagery is used.

Existing spoiler helpers independently gate Jurassic availability. Jungle-limited
users cannot access the collection or contextual Rescue preselection. Revealing
Jurassic updates Earth visibility; lowering it blocks the guides again. Space and
Timeless preferences are unchanged.

Animal static search, region search (10 steps), dynamic possible worlds and all
four strategies consume canonical patterns/rarities without solver modifications.
The new tests explicitly verify Dragon is the active Mythical Rarity Focus tier.

## Changed files

- `src/types/game.ts`, `src/data/animals.ts`: one region ID and six records.
- `src/components/regions/regionPresentation.ts`, `RegionLandscape.tsx`, new
  `JurassicLandscape.tsx`: availability and environmental presentation.
- `src/styles/regions.css`, `environment.css`: Jurassic accents and atmosphere.
- `src/components/animals/hqArtwork.json`: six reviewed display entries.
- `scripts/fandomExtractionProfiles.json`, `extractFandomAnimals.py`: reviewed
  profiles; remove fixed 42-profile limit and permit Jurassic in the existing pipeline.
- `src/components/progress/progressTestSupport.tsx`: full-visibility fixture includes Jurassic.
- `src/components/regions/jurassic.test.tsx`: new focused integration tests.
- Updated expansion assertions in `regionSupport.test.ts`,
  `animals/animalGuidePresentation.test.ts`, `animals/assetPresentation.test.ts`,
  `progress/progress.test.tsx`, `rescue/alpha09.test.tsx`, `rescue/rescueIntegration.test.ts`.
- `scripts/checkJurassicBrowser.cjs`: focused 390/1440 browser validation.
- `src/components/layout/siteVersion.ts`: single ALPHA 14 label.
- This report, six source references, six HQ PNGs, pixel-validation inventory,
  and three screenshots under `public/game/experiments/alpha14-jurassic/`.

No solver files, existing patterns/artwork, routes or spoiler helpers were edited.
No dependencies were added. No commit was created.

## Validation

Focused component/integration suite: 65 tests. Browser review: 26 assertions at
390 and 1440, covering Jurassic guides, HQ loading, layout overflow, contextual
setup without autostart, hidden region/animal routes, blocked hidden query context
and explicit reveal. Three screenshots reviewed: region at both widths and desktop
Raptor. Production build, repository lint and strict TypeScript compilation run.
