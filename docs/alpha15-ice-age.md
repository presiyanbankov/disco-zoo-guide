# ALPHA 15 — Ice Age

Ice Age is Earth 08. The six approved records preserve exact names, IDs, rarities
and pattern coordinates: Wooly Rhino, Giant Sloth, Dire Wolf (Common); Saber Tooth,
Mammoth (Rare); Akhlut (Mythical). There are now 54 classic animals in nine supported
regions. No Timeless content was added.

## Artwork source inventory and extraction

| Animal ID | Source | Source dimensions | Output dimensions | Exception |
| --- | --- | --- | --- | --- |
| wooly-rhino | [Fandom PNG](https://static.wikia.nocookie.net/discozoo/images/1/1b/Wooly_Rhino.png/revision/latest?format=original) | 150×150 | 142×88 | No enclosed seed needed |
| giant-sloth | [Fandom PNG](https://static.wikia.nocookie.net/discozoo/images/1/1a/Giant_Sloth.png/revision/latest?format=original) | 150×150 | 130×100 | No enclosed seed needed |
| dire-wolf | [Fandom PNG](https://static.wikia.nocookie.net/discozoo/images/3/32/Dire_Wolf.png/revision/latest?format=original) | 150×150 | 148×100 | No enclosed seed needed |
| saber-tooth | [Fandom PNG](https://static.wikia.nocookie.net/discozoo/images/3/35/Saber_Tooth.png/revision/latest?format=original) | 150×150 | 136×81 | No enclosed seed needed |
| mammoth | [Fandom PNG](https://static.wikia.nocookie.net/discozoo/images/a/a5/Mammoth.png/revision/latest?format=original) | 150×150 | 124×100 | Seed (23,90): 360px trunk/tusk opening |
| akhlut | [Fandom PNG](https://static.wikia.nocookie.net/discozoo/images/2/25/Akhlut.png/revision/latest?format=original) | 150×150 | 148×100 | No enclosed seed needed |

Unchanged reference PNGs: `assets/reference/fandom/{id}.png`.
Native cleaned display PNGs: `public/game/animals-hq/ice-age/{id}.png`.
Profiles: `scripts/fandomExtractionProfiles.json`; pixel validation/hashes/source
URLs: `assets/reference/fandom/ice-age-validation.json`.
All six sources and outputs were visually reviewed. Exact-color exterior flood
fill and individually reviewed shadow bounds modify alpha only. Mammoth's seed
was inspected in the background enclosed by trunk/tusk: exactly 360px cleared.
All palette-defined animal pixels survived, including pale fur/teeth, limbs,
tail tips, tusks, trunk, horns and white markings. No visible signatures were
present. Binary alpha, zero recoloring/resampling, and 2px padding are validated.
These are public Fandom-hosted game-looking references; official export provenance
and reuse permission are not established. Existing fan attribution is retained.

Canonical paths are `/game/animals/ice-age/{id}.png`, resolved through the existing
HQ manifest. Existing artwork failure behavior is preserved: try canonical source,
then accessible artwork-unavailable state. No substitute tiny sprites are fabricated.
No extraction was unresolved.

## Presentation and integration

The new vector landscape has a rocky glacial valley, glacier walls, snow channels,
sparse pines, frozen watering hole, cold mist and sparse drifting particles.
Existing restrained layer animation and reduced-motion rules are reused.
Generic routes, navigation, explorer, Rescue setup and contextual links consume the
existing supported-region presentation and canonical animal data. No parallel
registry, Ice Age-specific solver policy, or new spoiler exception was added.
Existing visibility endpoints already included Ice Age. Jurassic-only visibility
blocks Ice Age guides and Rescue context; revealing updates Earth only, and lowering
visibility hides it again. All four dynamic policies, static animal search and region
search work through the approved patterns/rarities. Akhlut supplies Mythical metadata.
Solver files, previous 48 animal records and existing artwork are unchanged.

Expansion-sensitive tests now derive animal/region/mystery counts from presentation
and progression metadata. Old browser fixtures no longer classify Jurassic as
unavailable or expect seven selectable regions. Full-visibility test fixtures use
Ice Age. Static-param tests cover every supported region and all canonical routes.

## Changed files

- Domain: `src/types/game.ts` (one RegionId member), `src/data/animals.ts` (six appended records).
- Presentation: `src/components/regions/{regionPresentation.ts,RegionLandscape.tsx,IceAgeLandscape.tsx}`,
  `src/styles/{regions.css,environment.css}`, `src/components/animals/hqArtwork.json`.
- Extraction: `scripts/{extractFandomAnimals.py,fandomExtractionProfiles.json}`, six references,
  six HQ outputs and `ice-age-validation.json`.
- Tests: `src/components/regions/{iceAge.test.tsx,regionSupport.test.ts,regionSearchIntegration.test.ts}`,
  `src/components/animals/{assetPresentation.test.ts,animalGuidePresentation.test.ts}`,
  `src/components/progress/{progress.test.tsx,progressTestSupport.tsx}`,
  `src/components/rescue/{alpha09.test.tsx,rescueIntegration.test.ts}`.
- Browser QA: `scripts/{checkIceAgeBrowser.cjs,checkRegionSupportBrowser.cjs,checkDynamicRescueBrowser.cjs}`.
- Version: `src/components/layout/siteVersion.ts` — ALPHA 15 after validation.
- This report; three screenshots in `public/game/experiments/alpha15-ice-age/`.

## Validation

73 focused tests passed (six Ice Age tests), strict TypeScript compilation passed,
lint passed, production build passed. Focused Chrome checks at 390 and 1440 passed
30 assertions: region/animal rendering, six HQ loads, overflow, region/animal
contextual Rescue preselection without auto-start, hidden contexts/routes and reveal.
Three screenshots reviewed: region at both widths and Mammoth guide at desktop.
No dependencies added. No commit created.
