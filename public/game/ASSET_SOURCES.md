# Disco Zoo asset sources

Owner-approved asset integration. Game artwork: Milkbag Games / NimbleBit.
Public availability and project-owner approval do not establish reuse permission.
No app packages, protected extraction, AI sprites, Timeless animals or locked-region assets were used.

## Animal icons

Community source: https://discozoo.netlify.app/
All outputs are exact 32x23 RGBA PNG crops. Original alpha and partially transparent pixels are preserved.
No resizing, redrawing, alpha cleanup or background replacement was performed.
The source thumbnails have softened edges; display sizes are limited to 2x or 3x with pixel rendering.

### Downloaded source sheets (temporary; never placed under public/)

- `farm-sheet.png` (446x665): [farm-sheet.png](https://d33wubrfki0l68.cloudfront.net/images/9ecdc977252b99262a15032a5b7d042c0f1fd396/farm.png) ? Disco Zoo Patterns community PNG sheet.
- `outback-sheet.png` (627x759): [outback-sheet.png](https://d33wubrfki0l68.cloudfront.net/images/8552ebf4d3b1fb697b7341372150507ba33c318e/outback.png) ? Disco Zoo Patterns community PNG sheet.
- `savanna-sheet.png` (836x525): [savanna-sheet.png](https://d33wubrfki0l68.cloudfront.net/images/4e584f1312647b2e73d8f378a4eeb549f586c3d4/savanna.png) ? Disco Zoo Patterns community PNG sheet.
- `northern-sheet.png` (642x644): [northern-sheet.png](https://d33wubrfki0l68.cloudfront.net/images/f3045ded0ab272721ac47a3319a9aed4ed1ce73d/northern.png) ? Disco Zoo Patterns community PNG sheet.
- `polar-sheet.png` (738x645): [polar-sheet.png](https://d33wubrfki0l68.cloudfront.net/images/b538ef149cb2060999780903a86d3366511394d5/polar.png) ? Disco Zoo Patterns community PNG sheet.

### Produced animal files

Source is the corresponding region sheet above. Crop format: x, y, width, height.

| Local filename | Subject | Crop |
|---|---|---|
| `public/game/animals/farm/sheep.png` | Sheep | 0, 598, 32, 23 |
| `public/game/animals/farm/pig.png` | Pig | 0, 550, 32, 23 |
| `public/game/animals/farm/rabbit.png` | Rabbit | 0, 574, 32, 23 |
| `public/game/animals/farm/horse.png` | Horse | 0, 526, 32, 23 |
| `public/game/animals/farm/cow.png` | Cow | 311, 0, 32, 23 |
| `public/game/animals/farm/unicorn.png` | Unicorn | 0, 622, 32, 23 |
| `public/game/animals/outback/kangaroo.png` | Kangaroo | 66, 523, 32, 23 |
| `public/game/animals/outback/platypus.png` | Platypus | 132, 523, 32, 23 |
| `public/game/animals/outback/crocodile.png` | Crocodile | 33, 523, 32, 23 |
| `public/game/animals/outback/koala.png` | Koala | 99, 523, 32, 23 |
| `public/game/animals/outback/cockatoo.png` | Cockatoo | 0, 523, 32, 23 |
| `public/game/animals/outback/tiddalik.png` | Tiddalik | 165, 523, 32, 23 |
| `public/game/animals/savanna/zebra.png` | Zebra | 527, 311, 32, 23 |
| `public/game/animals/savanna/hippo.png` | Hippo | 461, 311, 32, 23 |
| `public/game/animals/savanna/giraffe.png` | Giraffe | 0, 24, 32, 23 |
| `public/game/animals/savanna/lion.png` | Lion | 494, 311, 32, 23 |
| `public/game/animals/savanna/elephant.png` | Elephant | 0, 0, 32, 23 |
| `public/game/animals/savanna/gryphon.png` | Gryphon | 0, 48, 32, 23 |
| `public/game/animals/northern/bear.png` | Bear | 311, 0, 32, 23 |
| `public/game/animals/northern/skunk.png` | Skunk | 344, 263, 32, 23 |
| `public/game/animals/northern/beaver.png` | Beaver | 311, 239, 32, 23 |
| `public/game/animals/northern/moose.png` | Moose | 377, 239, 32, 23 |
| `public/game/animals/northern/fox.png` | Fox | 344, 239, 32, 23 |
| `public/game/animals/northern/sasquatch.png` | Sasquatch | 311, 263, 32, 23 |
| `public/game/animals/polar/penguin.png` | Penguin | 33, 311, 32, 23 |
| `public/game/animals/polar/seal.png` | Seal | 99, 311, 32, 23 |
| `public/game/animals/polar/muskox.png` | Muskox | 0, 311, 32, 23 |
| `public/game/animals/polar/polar-bear.png` | Polar Bear | 66, 311, 32, 23 |
| `public/game/animals/polar/walrus.png` | Walrus | 132, 311, 32, 23 |
| `public/game/animals/polar/yeti.png` | Yeti | 165, 311, 32, 23 |

## Region imagery

Official publisher screenshots from [Google Play](https://play.google.com/store/apps/details?id=com.nimblebit.discozoo).
Each downloaded screenshot is 1600x2560 and stays in temporary verification storage outside public/.
Outputs are opaque RGB PNG crops at source resolution. No fabricated layers or repainting.
Crop format below: x, y, width, height.

- `public/game/regions/farm-terrain.png` ? Farm tree and grass terrain; crop `464, 848, 192, 192`.
  Source: [farm-source.png](https://play-lh.googleusercontent.com/-mRt1JpRLqIUnEqLIvB7KV4TwCo9ch9mIPZnd2sFZGqaF3SelANUSG_HnCS-sgGDLqZPs7yKNWejZKtkYHpbilE=s0) (official Google Play screenshot).
  Notes: inspected crop excludes currency, text, buttons, speech bubbles, fences and interface panels.
- `public/game/regions/savanna-habitat.png` ? Savanna elephant enclosure, trees and ponds; crop `224, 192, 1152, 832`.
  Source: [savanna-source.png](https://play-lh.googleusercontent.com/wyPzRMw6KVXzMJpQ3l7ixgJNTBCTmaekK9LpKVB0Q9oCpoMar8nwDTXa3D8jzejok6PxNxzlSW63Se0ykaWCCA=s0) (official Google Play screenshot).
  Notes: inspected crop excludes currency, text, buttons, speech bubbles, fences and interface panels.
- `public/game/regions/polar-habitat.png` ? Polar penguin enclosure, snow and ice; crop `224, 480, 1152, 832`.
  Source: [polar-source.png](https://play-lh.googleusercontent.com/P804P83Vd-ScMIPM_xTgOhT7Ly1Y1TzE9kYWQyK6PWVY4ld1ovIeIfCHWLYC5v17PRWSxpoYXN6rQPsrmnrC=s0) (official Google Play screenshot).
  Notes: inspected crop excludes currency, text, buttons, speech bubbles, fences and interface panels.

All five regions now use original vector landscapes in `RegionLandscape.tsx`. The three official crops above are reference-only and are not rendered on production pages. Outback and Northern candidates remain unapproved. Ambient motion is independent CSS.

## Presentation and verification

- Animal icons bypass Next image conversion to preserve the exact tiny PNGs; no heavy blur or interpolation.
- Regions use the existing responsive artwork containers with dark styling and decorative alt text.
- All 30 canonical image paths already matched these filenames; no data-file edit was needed.
- Exact decoded icon pixels and alpha were compared to the approved source rectangles before build.
- Full sheets and uncropped screenshots are not production/public assets.

## Isolated sprite experiment

`experiments/sprite-upscale/` contains nine 4x variants for Kangaroo, Koala and Cockatoo only, plus a contact sheet and comparison page. All derive from the approved animal crops above. Source PNGs remain untouched; production still uses originals. Methods, source hashes and verification are documented in that folder. No reuse permission is claimed.

## Detail-only derived display asset

`public/game/derived/animals/outback/cockatoo-scale4x.png` is an unchanged copy of the three-sprite Scale4x trial, derived from the approved Cockatoo crop above. Display-only hero override; canonical PNG and data path are untouched. Collections retain nearest-neighbor source rendering. Kangaroo/Koala trials and the other 27 animals are not selected or processed for production. Method and verification details: `derived/README.md`.

## Current HQ display source inventory

All 30 classic animals now prefer reviewed exact-pixel Fandom foreground extractions under `public/game/animals-hq/<region>/<id>.png`. The canonical 32x23 files and their data paths remain unchanged as fallback. Previous Scale4x artwork is retained for reference but is no longer rendered. The complete per-file source URLs, dimensions, shadow masks, enclosed seeds and inspection notes are in [animals-hq/README.md](animals-hq/README.md). Pixel validation is in [the all-animal report](experiments/fandom-extracted-all/validation.json). Unresolved cases: none.
