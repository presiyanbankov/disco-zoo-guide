# ALPHA 19 - Mars

Mars is Space 02. Six approved records appended: Rock, Marsmot, Marsmoset
(Common), Rover, Martian (Rare), Marsmallow (Mythical). Exact approved
normalized coordinates remain unchanged. No Timeless content or solver edits.

## Artwork

All six original files were resolved through Fandom's public imageinfo API.
Uploader: Bee523, 27 September 2020. CDN URLs without `format=original`
delivered WebP previews despite their suffix; production extraction uses the
verified actual 150x150 RGB PNG originals. Originals remain unchanged in
`assets/reference/fandom/<id>.png`; output is
`public/game/animals-hq/mars/<id>.png`.

| ID | Original PNG | HQ dimensions | Reviewed source background pockets |
| --- | --- | --- | --- |
| rock | [Source](https://static.wikia.nocookie.net/discozoo/images/0/0b/Rock.png/revision/latest?format=original) | 136x100 | None |
| marsmot | [Source](https://static.wikia.nocookie.net/discozoo/images/2/21/Marsmot.png/revision/latest?format=original) | 112x136 | 36px (90,124,96,130) |
| marsmoset | [Source](https://static.wikia.nocookie.net/discozoo/images/2/2b/Marsmoset.png/revision/latest?format=original) | 136x112 | 252px (33,105,57,129) |
| rover | [Source](https://static.wikia.nocookie.net/discozoo/images/f/f4/Rover.png/revision/latest?format=original) | 136x136 | 900px (35,87,71,129); 720px (71,87,113,129) |
| martian | [Source](https://static.wikia.nocookie.net/discozoo/images/0/00/Martian.png/revision/latest?format=original) | 136x130 | 66px (70,118,76,129) |
| marsmallow | [Source](https://static.wikia.nocookie.net/discozoo/images/b/b4/Marsmallow.png/revision/latest?format=original) | 106x136 | 377px (61,117,90,130) |

Bounds use exclusive right/bottom. Individually reviewed bounded shadow
removal connects every measured pocket to the exterior. Therefore **no
enclosed seeds are required**. Shadow boxes and exact colors are recorded in
`scripts/fandomExtractionProfiles.json`. Thin supports, tails, eye stalks,
wheel openings and pale highlights survive. No visible signatures were found.
All six pass zero lost/added/recolored animal pixels, binary alpha, no
resampling, and 2px transparent padding. Source/output hashes, dimensions,
palettes and measured components are in `assets/reference/fandom/mars-validation.json`.
Hosting/uploader metadata does not establish official provenance or reuse
permission. Existing fan attribution remains.

## Files and integration

- `src/types/game.ts`, `src/data/animals.ts`: minimal Mars union addition and six records.
- `src/components/animals/hqArtwork.json`: six HQ entries; existing canonical/unavailable fallback remains.
- `src/components/regions/MarsLandscape.tsx`, `RegionLandscape.tsx`, `regionPresentation.ts`, `src/styles/regions.css`, `src/styles/environment.css`: charcoal sky, muted rust terrain, layered crater/ridges, stones, fissures and restrained dust. Existing motion budget and reduced-motion behavior remain.
- `scripts/extractFandomAnimals.py`, `scripts/fandomExtractionProfiles.json`: supported region and six reviewed profiles; extraction engine unchanged.
- `src/components/progress/progressTestSupport.tsx`, `progress.test.tsx`, `src/components/regions/regionSupport.test.ts`, `src/components/rescue/alpha09.test.tsx`, `rescueSetupContext.test.tsx`, `scripts/checkRegionSupportBrowser.cjs`: remove stale unsupported-Mars assertions and update full-supported-visibility fixtures.
- `src/components/regions/mars.test.tsx`, `scripts/checkMarsBrowser.cjs`: focused validation.
- `src/components/layout/siteVersion.ts`: single ALPHA 19 label.
- Six original PNGs, six HQ PNGs, validation JSON, and four screenshots under `public/game/experiments/alpha19-mars/` added.

Canonical availability drives route generation, navigation, collections,
Rescue selectors and counts. Space None/Moon/Mars behavior, direct region
and animal barriers, reveal, reduction back to Moon, and contextual Rescue
without auto-start are covered. Earth visibility remains independent.
Constellation remains unimplemented. Moon-limited historical browser fixtures,
including Nocturnal's two-hidden-Space-card assertion, remain intentionally
unchanged. Historical seven-region smoke lists are not represented as current
full coverage; the new test covers all Mars policies without altering solver files.

All static/region/dynamic policies consume the new records. Marsmallow is
automatically Mythical in tiered Rarity Focus. No competing registry, solver
algorithm changes, pattern edits to existing records, dependencies, or commits.

## Validation

71 focused automated tests passed, including six new Mars tests. Strict
TypeScript compilation, lint and production build passed. Browser validation:
36 assertions at 390 and 1440px covering region, animal, explorer, Rescue,
context, hidden routes, reveal and reducing visibility. Four screenshots
reviewed together: region mobile/desktop, desktop Marsmoset guide and explorer.
