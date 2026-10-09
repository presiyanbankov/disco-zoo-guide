# ALPHA 17 вЂ” Mountain

Mountain is Earth 10. Six appended approved classic records: Goat, Cougar, Elk
(Common); Eagle, Coyote (Rare); Aatxe (Mythical). Existing records and patterns
remain unchanged. No Timeless content added.

## Artwork source inventory

| ID | Source | Native dimensions | HQ dimensions | Reviewed extraction |
| --- | --- | --- | --- | --- |
| goat | [Original PNG](https://static.wikia.nocookie.net/discozoo/images/5/52/Goat.png/revision/latest?format=original) | 150Г—150 | 136Г—124 | Reviewed horn opening (38,28): 108 pixels |
| cougar | [Original PNG](https://static.wikia.nocookie.net/discozoo/images/5/55/Cougar.png/revision/latest?format=original) | 150Г—150 | 136Г—88 | No enclosed seed required |
| elk | [Original PNG](https://static.wikia.nocookie.net/discozoo/images/3/32/Elk.png/revision/latest?format=original) | 150Г—150 | 124Г—136 | No enclosed seed required |
| eagle | [Original PNG](https://static.wikia.nocookie.net/discozoo/images/8/8b/Eagle.png/revision/latest?format=original) | 150Г—150 | 136Г—112 | No enclosed seed required |
| coyote | [Original PNG](https://static.wikia.nocookie.net/discozoo/images/0/02/Coyote.png/revision/latest?format=original) | 150Г—150 | 124Г—88 | No enclosed seed required |
| aatxe | [Original PNG](https://static.wikia.nocookie.net/discozoo/images/2/28/Aatxe.png/revision/latest?format=original) | 150Г—150 | 131Г—124 | Reviewed muzzle opening (18,78): 36 pixels |

Unchanged references: `assets/reference/fandom/{id}.png`.
HQ outputs: `public/game/animals-hq/mountain/{id}.png`.
Profiles/hashes/shadow bounds: `scripts/fandomExtractionProfiles.json`.
Per-pixel results: `assets/reference/fandom/mountain-validation.json`.

All six individually inspected. Exact-color exterior flood fill plus reviewed
exact-color ground-shadow boxes; alpha-only removal, native integer crop and
2px transparent padding. Goat horn and Aatxe muzzle seeds explicitly inspected
before extraction. No signature visible. Zero lost/added animal pixels, zero RGB
changes, zero artificial semitransparent pixels, no resampling. Antlers, horns,
feather tips, pale markings, thin legs and tails inspected in native contact sheet.
No unresolved assets. Existing HQ manifest prefers cleaned display assets; failure
falls back to the canonical path, then accessible unavailable artwork. No fabricated
small canonical sprites. Fandom hosting establishes neither official-export
provenance nor reuse permission; existing fan-site attribution retained.

## Presentation and integration

Dedicated asymmetric cliffs, slate ledges, narrow alpine valley, blue-green ridges,
sparse conifers and restrained golden rock-plane light. Slow existing parallax,
high-altitude haze and sparse motes reuse reduced-motion/page-hidden rules.
Minimal snow; no screenshots, decorative animals, or new animation dependencies.

Existing region presentation is extended; no parallel registry. Generic routes,
explorer, navigation, static/region/dynamic searches and contextual Rescue consume
canonical data. Existing spoiler metadata already includes Mountain. City-only
visibility blocks region/animal routes and Rescue query context; reveal advances
Earth to Mountain. Lowering preferences hides it again. Region-only context selects
no animal; Goat context selects Goat without starting a rescue. Aatxe naturally
activates the Mythical tier in Rarity Focus. No solver files or algorithms changed.

Full-visibility fixtures now end at Mountain; unsupported fixtures use Nocturnal.
Two-digit numbering assertion uses padding rather than a prefixed zero (which
incorrectly expected 010). Production counts remain derived from existing data.

## Files in this pass

- `src/types/game.ts`: RegionId addition only.
- `src/data/animals.ts`: six Mountain records appended only.
- `src/components/animals/hqArtwork.json`: six display entries.
- `src/components/regions/regionPresentation.ts`, `RegionLandscape.tsx`:
  availability and vector dispatch.
- New `src/components/regions/MountainLandscape.tsx`, `mountain.test.tsx`.
- `src/styles/regions.css`, `environment.css`: Mountain palette/atmosphere.
- `scripts/fandomExtractionProfiles.json`, `extractFandomAnimals.py`:
  reviewed profiles and supported-region tuple.
- `src/components/progress/progressTestSupport.tsx`,
  `src/components/regions/regionSupport.test.ts`,
  `scripts/checkRegionSupportBrowser.cjs`: expansion fixtures/number formatting.
- New `scripts/checkMountainBrowser.cjs` and this report.
- Six source PNGs, six HQ PNGs, Mountain validation JSON.
- Three screenshots in `public/game/experiments/alpha17-mountain/`:
  `region-390.png`, `region-1440.png`, `animal-1440.png`.
- `src/components/layout/siteVersion.ts`: single ALPHA 17 source of truth.

## Validation

75 focused tests pass (six new Mountain feature tests). Strict TypeScript compilation
and lint pass. Production build passes, including the final ALPHA 17 version build.
A Windows SWC sandbox path-access failure required rerunning the final build outside
the sandbox; no source workaround was needed. 30 browser assertions pass at 390 and 1440: guide, six HQ images,
Goat page, header context, editable/non-started Rescue context, hidden selector,
hidden region/animal barrier and reveal. Three screenshots inspected as a group;
no overflow, clipped sprites or weak region presentation found. Native extraction
contact sheet reviewed separately. No packages installed and no commit created.
