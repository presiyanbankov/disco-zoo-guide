# ALPHA 16 — City

City is Earth 09. Six appended canonical records preserve approved geometry:
Raccoon, Pigeon, Rat (Common); Squirrel, Opossum (Rare); Sewer Turtle (Mythical).
IDs are lowercase/hyphenated, including `sewer-turtle`. No Timeless data added.

## Source inventory and extraction

| Animal ID | Fandom original candidate | Source dimensions | Output dimensions | Review |
| --- | --- | --- | --- | --- |
| raccoon | [PNG](https://static.wikia.nocookie.net/discozoo/images/7/7c/Raccoon.png/revision/latest?format=original) | 150×150 | 136×76 | No enclosed seed required |
| pigeon | [PNG](https://static.wikia.nocookie.net/discozoo/images/9/9e/Pigeon.png/revision/latest?format=original) | 150×150 | 100×112 | No enclosed seed required |
| rat | [PNG](https://static.wikia.nocookie.net/discozoo/images/8/8b/Rat.png/revision/latest?format=original) | 150×150 | 136×64 | No enclosed seed required |
| squirrel | [PNG](https://static.wikia.nocookie.net/discozoo/images/4/41/Squirrel.png/revision/latest?format=original) | 150×150 | 112×100 | No enclosed seed required |
| opossum | [PNG](https://static.wikia.nocookie.net/discozoo/images/b/b1/Opossum.png/revision/latest?format=original) | 150×150 | 148×70 | No enclosed seed required |
| sewer-turtle | [PNG](https://static.wikia.nocookie.net/discozoo/images/a/a5/Sewer_Turtle.png/revision/latest?format=original) | 150×150 | 148×88 | Reviewed seed (56,78), 138px neck opening |

Original references: `assets/reference/fandom/{id}.png`.
Outputs: `public/game/animals-hq/city/{id}.png`.
Profiles, source hashes, exact shadow boxes and palette coverage:
`scripts/fandomExtractionProfiles.json`. Per-pixel validation and source URLs:
`assets/reference/fandom/city-validation.json`.
All six sources and outputs individually inspected. Exact-color exterior fill and
reviewed ground-shadow masks modify alpha only. Sewer Turtle seed (56,78) was
visually inspected within its neck opening: exactly 138 background pixels removed.
No other enclosed seed needed. No signature visible. Pale markings, thin feet,
striped/curled/narrow tails, ears, yellow highlights and extremities survive.
All outputs have binary alpha and 2px padding: zero missing/added animal pixels,
zero recoloring, zero artificial semitransparent pixels and no resampling.
Fandom hosting does not establish official export provenance or reuse permission.
Existing attribution retained. No unresolved extraction.
Canonical paths `/game/animals/city/{id}.png` resolve through the existing HQ manifest.
No tiny substitute sprites fabricated: failed HQ requests retain existing canonical
attempt then accessible artwork-unavailable fallback.

## Presentation and integration

Dedicated vector urban evening: block skyline, staggered rooftops, utility lines,
street lamps, sparse amber windows, charcoal/brick/slate surfaces and shallow haze.
Existing restrained parallax reused; new window-light variation pauses when hidden
and respects reduced motion. No screenshots or animal silhouettes in the environment.
Generic explorer, navigation, region/animal routes and Rescue consume supported
presentation and canonical records. No competing registry or solver policy added.
City already existed in spoiler progression; Ice Age-only visibility blocks routes
and Rescue context, reveal updates Earth, lowering visibility hides City again.
Region-only and Raccoon query context preselect setup without auto-start.
Static animal search, region search and all dynamic policies pass; Sewer Turtle
naturally supplies Mythical metadata to tiered Rarity Focus. No solver file changed.

## Files changed for this milestone

- `src/types/game.ts`: City RegionId member only.
- `src/data/animals.ts`: six City records appended; prior 54 records untouched.
- `src/components/animals/hqArtwork.json`: six display entries.
- `scripts/fandomExtractionProfiles.json`, `scripts/extractFandomAnimals.py`: reviewed profiles and supported extraction region.
- `src/components/regions/regionPresentation.ts`, `RegionLandscape.tsx`, new `CityLandscape.tsx`.
- `src/styles/regions.css`, `src/styles/environment.css`: City palette/atmosphere.
- `src/components/progress/progressTestSupport.tsx`, `src/components/regions/regionSupport.test.ts`,
  `scripts/checkRegionSupportBrowser.cjs`: full-visibility endpoints and future-unavailable fixture.
- `src/components/animals/animalGuidePresentation.test.ts`: replace rarity-based tile-count
  assumption with exact canonical-coordinate preservation; approved two-cell Sewer Turtle exposed it.
- New `src/components/regions/city.test.tsx`, `scripts/checkCityBrowser.cjs`.
- `src/components/layout/siteVersion.ts`: ALPHA 16 after validation.
- Six reference PNGs, six HQ PNGs, `city-validation.json`, this report,
  three screenshots under `public/game/experiments/alpha16-city/`.

Animal/region/mystery totals remain derived; no new hardcoded totals introduced.
City-unavailable fixtures now use Mountain. Historical Ice Age-specific checks kept.
No dependencies added; no commit created.

## Validation

75 focused tests passed, including six City feature tests. Lint, strict TypeScript
compilation and production build passed. Chrome at 390/1440 passed 30 assertions:
region and animal pages, all six HQ loads, overflow, contextual headers, region-only
and animal setup without auto-start, hidden routes/context and reveal action.
Three screenshots reviewed: region mobile/desktop and Raccoon desktop.
