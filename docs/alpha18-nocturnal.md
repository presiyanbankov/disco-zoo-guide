# ALPHA 18 - Nocturnal

Nocturnal is Earth 11. Added Badger, Bat, Kiwi (Common), Flying Squirrel,
Kakapo (Rare), and Ghost (Mythical). Approved normalized coordinates are
preserved, including Badger's empty column and Kakapo's empty row. Pattern
confidence remains medium-high: no observed disagreement, but independent
visual corroboration was incomplete. Existing records are unchanged.

## Artwork inventory

Original files: `assets/reference/fandom/<id>.png`.
Display files: `public/game/animals-hq/nocturnal/<id>.png`.

| ID | Original source | Source size | Display size | Reviewed shadow box |
| --- | --- | --- | --- | --- |
| badger | [PNG](https://static.wikia.nocookie.net/discozoo/images/f/ff/Badger.png/revision/latest?format=original) | 180x112 | 136x76 | 30,91,158,103 |
| bat | [PNG](https://static.wikia.nocookie.net/discozoo/images/a/ad/Bat.png/revision/latest?format=original) | 157x121 | 130x70 | 31,102,149,114 |
| kiwi | [PNG](https://static.wikia.nocookie.net/discozoo/images/e/ea/Kiwi.png/revision/latest?format=original) | 160x128 | 124x94 | 19,108,135,120 |
| flying-squirrel | [PNG](https://static.wikia.nocookie.net/discozoo/images/6/62/Flying_Squirrel.png/revision/latest?format=original) | 162x100 | 136x70 | 22,82,140,94 |
| kakapo | [PNG](https://static.wikia.nocookie.net/discozoo/images/4/45/Kakapo.png/revision/latest?format=original) | 152x138 | 124x112 | 24,118,131,130 |
| ghost | [PNG](https://static.wikia.nocookie.net/discozoo/images/a/ab/Ghost.png/revision/latest?format=original) | 156x140 | 124x100 | 23,126,138,138 |

Each source was inspected individually. Exact-color exterior flood fill and
reviewed bounded shadow removal use the unchanged extraction engine. No
enclosed-background seeds were needed; no visible signatures were present.
All six passed retained-pixel validation: zero lost/added/recolored animal
pixels, no resampling, binary alpha only, and 2px transparent padding.
Source/output hashes and dimensions are in
`assets/reference/fandom/nocturnal-validation.json`; profiles are in
`scripts/fandomExtractionProfiles.json`. Fandom hosting does not establish
official provenance or reuse permission. Existing fan attribution remains.

## Integration and files

- `src/types/game.ts`: one RegionId addition; `src/data/animals.ts`: six appended records.
- `src/components/animals/hqArtwork.json`: six display entries; existing fallback remains HQ -> canonical image -> accessible unavailable artwork. No substitute tiny sprites were fabricated.
- `src/components/regions/NocturnalLandscape.tsx`, `RegionLandscape.tsx`, `regionPresentation.ts`, and `src/styles/{regions,environment}.css`: moonlit deciduous forest, layered silhouettes, partly screened small moon, low mist and sparse warm fireflies. Existing particle budget and reduced-motion behavior remain.
- `scripts/extractFandomAnimals.py`: supported extraction region; `scripts/fandomExtractionProfiles.json`: six reviewed profiles.
- `src/components/progress/{progress.test.tsx,progressTestSupport.tsx}`, `src/components/regions/regionSupport.test.ts`, `src/components/rescue/alpha09.test.tsx`, and `scripts/checkRegionSupportBrowser.cjs`: remove stale unimplemented-Nocturnal/full-visibility assumptions.
- `src/components/regions/nocturnal.test.tsx` and `scripts/checkNocturnalBrowser.cjs`: focused feature validation.
- `src/components/layout/siteVersion.ts`: single ALPHA 18 label.

Existing progression, routes, contextual Rescue links and visibility helpers
consume canonical availability. Full Earth visibility now has no Earth mystery
cards; lower visibility still hides later regions. Space remains independent,
with Mars and Constellation unimplemented. Direct region/animal barriers,
reveal, lowering visibility, and contextual query protection were checked.
Static, region and dynamic strategies consume the new patterns and rarity;
Ghost naturally participates in Mythical Rarity Focus. No solver files changed.
No Timeless records, new dependencies, or commits.

## Validation

- Focused automated suite: 77 passed, including 8 new Nocturnal tests.
- Strict TypeScript compilation and lint: passed.
- Production build: passed, 90 prerendered pages.
- Browser checks: 36 assertions passed at 390 and 1440px.
- Four screenshots reviewed: region mobile/desktop, desktop animal guide,
  and full Earth/Space explorer, under `public/game/experiments/alpha18-nocturnal/`.
- Source/asset hashes, all six real animal routes, exact pattern rendering,
  real strategies, HQ loading, no overflow, hidden route guarding, Rescue
  context without auto-start, reveal and visibility reduction are covered.
