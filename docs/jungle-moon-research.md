# Jungle and Moon — approval report

Research date: 2026-10-07. Research only: no canonical data, types, solver, routing, frontend or production asset changes. No extraction performed. Temporary source inspection files are under `.next/jungle-moon-research/` and are not production assets.

## Verification method

Each pattern was read visually from its original Zoopedia screenshot in [Pocket Gamer's animal guide](https://www.pocketgamer.com/disco-zoo/update-disco-zoo-zoopedia-the-complete-pattern-guide-for-every-animal/), then checked visually against the corresponding image rectangle in [Disco Zoo Patterns](https://discozoo.netlify.app/). All 12 agree, including internal empty rows/columns and orientation. The two presentations may share source game captures; this is a cross-check of published references, not proof of independent extraction from the game.

Names, regions and rarity agree between those two guides and the relevant [Fandom rarity lists](https://discozoo.fandom.com/wiki/Rarity). Pocket Gamer calls the highest classic rarity “Mythological”; the project/Fandom/Netlify label is “Mythical”. This is terminology only, not a classification disagreement. No Timeless animal is included.

Coordinates below are zero-based `{ row, col }`, sorted row-major and normalized to the occupied bounding box. Empty internal rows and columns remain present. `■` is occupied; `·` is empty. Confidence is **high for all 12 patterns/names/rarities**; no shape disagreements were found.

## Jungle

3 Common, 2 Rare, 1 Mythical. Secondary pattern image for all six: [Jungle pattern sheet](https://d33wubrfki0l68.cloudfront.net/images/0952fbd1542895168f641f05ee3d96d1f7a838fa/jungle.png). Sheet rectangles were matched using the site's published CSS labels, not inferred from species or prose.

### Monkey — Common

```text
■ · ■ ·
· ■ · ■
```

```ts
[{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 3 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/images/featimgs/discozooguide-patterns-monkey.jpg). Name/rarity: [Monkey page](https://discozoo.fandom.com/wiki/Monkey), Pocket Gamer and Netlify. Confidence: high. Notes: 2×4; do not compress the alternating gaps.

### Toucan — Common

```text
· ■
■ ·
· ■
· ■
```

```ts
[{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 2, col: 1 }, { row: 3, col: 1 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/images/featimgs/discozooguide-patterns-toucan.jpg). Name/rarity: Pocket Gamer, Netlify and Fandom rarity list; [animal page](https://discozoo.fandom.com/wiki/Toucan) is the relevant wiki reference. Confidence: high. Notes: 4×2; top cell is on the right.

### Gorilla — Common

```text
■ · ■
■ · ■
```

```ts
[{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 2 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/images/featimgs/discozooguide-patterns-gorilla.jpg). Name/rarity: Pocket Gamer, Netlify and Fandom rarity list; [animal page](https://discozoo.fandom.com/wiki/Gorilla). Confidence: high. Notes: 2×3; central column is empty.

### Panda — Rare

```text
· · ■
■ · ·
· · ■
```

```ts
[{ row: 0, col: 2 }, { row: 1, col: 0 }, { row: 2, col: 2 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/images/featimgs/discozooguide-patterns-panda.jpg). Name/rarity: Pocket Gamer, Netlify and Fandom rarity list; [animal page](https://discozoo.fandom.com/wiki/Panda). Confidence: high. Notes: 3×3; two right-hand cells and one left-hand cell, not its mirror.

### Tiger — Rare

```text
■ · ■ ■
```

```ts
[{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 0, col: 3 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/images/featimgs/discozooguide-patterns-tiger.jpg). Name/rarity: [Tiger page](https://discozoo.fandom.com/wiki/Tiger), Pocket Gamer and Netlify. Confidence: high. Notes: 1×4; second column is empty.

### Phoenix — Mythical

```text
■ · ·
· · ·
· · ■
```

```ts
[{ row: 0, col: 0 }, { row: 2, col: 2 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/images/featimgs/discozooguide-patterns-phoenix.jpg). Name/rarity: [Phoenix page](https://discozoo.fandom.com/wiki/Phoenix), Pocket Gamer and Netlify. Confidence: high. Notes: 3×3 with two cells; preserve the empty middle row and column.

## Moon

3 Common, 2 Rare, 1 Mythical. Secondary pattern image for all six: [Moon pattern sheet](https://d33wubrfki0l68.cloudfront.net/images/4f61e0f4e244af59b3350bb2f125a55642d3f4ae/moon.png).

### Moonkey — Common

```text
■ · ·
■ · ■
· · ■
```

```ts
[{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 2 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/FCKEditorFiles/disco-zoo-guide-moonkey.jpg). Name/rarity: [Moonkey page](https://discozoo.fandom.com/wiki/Moonkey), Pocket Gamer and Netlify. Confidence: high. Notes: 3×3; empty central column. Suggested ID: `moonkey`.

### Lunar Tick — Common

```text
· ■ ·
· · ·
· ■ ·
■ · ■
```

```ts
[{ row: 0, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 0 }, { row: 3, col: 2 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/FCKEditorFiles/disco-zoo-guide-lunartick.jpg). Name/rarity: Pocket Gamer, Netlify and Fandom rarity list; [animal page](https://discozoo.fandom.com/wiki/Lunar_Tick). Confidence: high. Notes: 4×3; preserve the completely empty second row. Suggested ID: `lunar-tick`.

### Tribble — Common

```text
· ■ ·
■ ■ ■
```

```ts
[{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/FCKEditorFiles/disco-zoo-guide-tribble.jpg). Name/rarity: Pocket Gamer, Netlify and Fandom rarity list; [animal page](https://discozoo.fandom.com/wiki/Tribble). Confidence: high. Notes: 2×3, horizontal base below the center cell. Suggested ID: `tribble`.

### Moonicorn — Rare

```text
■ ·
■ ■
```

```ts
[{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/FCKEditorFiles/disco-zoo-guide-moonicorn.jpg). Name/rarity: [Moonicorn page](https://discozoo.fandom.com/wiki/Moonicorn), Pocket Gamer and Netlify. Confidence: high. Notes: 2×2; top-right cell is empty. Suggested ID: `moonicorn`.

### Luna Moth — Rare

```text
■ · ■
· · ·
· ■ ·
```

```ts
[{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 1 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/FCKEditorFiles/disco-zoo-guide-lunamoth.jpg). Name/rarity: Pocket Gamer, Netlify and Fandom rarity list; [animal page](https://discozoo.fandom.com/wiki/Luna_Moth). Confidence: high. Notes: 3×3; preserve the empty middle row. Suggested ID: `luna-moth`.

### Jade Rabbit — Mythical

```text
■ ·
· ·
· ■
```

```ts
[{ row: 0, col: 0 }, { row: 2, col: 1 }]
```

Primary pattern: [Zoopedia image](https://media.pocketgamer.com/FCKEditorFiles/disco-zoo-guide-jaderabbit.jpg). Name/rarity: Pocket Gamer, Netlify and Fandom rarity list; [animal page](https://discozoo.fandom.com/wiki/Jade_Rabbit). Confidence: high. Notes: 3×2, two cells. Suggested ID: `jade-rabbit`.

## Fandom artwork audit

All 12 direct URLs returned PNG files. Decoded dimensions: **150×150**, RGBA format, alpha exclusively **255** (fully opaque). Each has one animal on a uniform background with a ground shadow. No signature, watermark, UI text or other foreground subject is visible. Art is consistent in silhouette and coloring with the game images above and with the existing approved Fandom set. Confidence: **high as a matching visual candidate; medium/uncertain as to original provenance**. A Fandom upload or larger canvas does not establish official authorship, original asset resolution or reuse permission. File-history/uploader information could not be verified because file pages were inaccessible; none is invented here.

The Jungle file names are also listed in the [Fandom Jungle image category](https://discozoo.fandom.com/wiki/Category:Jungle_Animals_Images). Animal and file-page links below identify the corresponding wiki records, even where direct access to those pages failed.

| Animal page | File page | Direct original-resolution PNG | Dimensions | Background/shadow | Likely special treatment |
|---|---|---|---|---|---|
| [Monkey](https://discozoo.fandom.com/wiki/Monkey) | [Monkey.png](https://discozoo.fandom.com/wiki/File:Monkey.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/2/27/Monkey.png/revision/latest?format=original) | 150×150 | A | Reviewed shadow mask; preserve curled tail, fingers, legs and eye highlight. Under-leg gap connects outward through shadow. |
| [Toucan](https://discozoo.fandom.com/wiki/Toucan) | [Toucan.png](https://discozoo.fandom.com/wiki/File:Toucan.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/e/e2/Toucan.png/revision/latest?format=original) | 150×150 | A | Reviewed shadow mask; protect cyan feet, beak tip and tail. No enclosed seed indicated. |
| [Gorilla](https://discozoo.fandom.com/wiki/Gorilla) | [Gorilla.png](https://discozoo.fandom.com/wiki/File:Gorilla.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/8/84/Gorilla.png/revision/latest?format=original) | 150×150 | A | Reviewed shadow mask; retain all gray body/face shading and toes. Under-leg gap opens through shadow. |
| [Panda](https://discozoo.fandom.com/wiki/Panda) | [Panda.png](https://discozoo.fandom.com/wiki/File:Panda.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/0/00/Panda.png/revision/latest?format=original) | 150×150 | B | Reviewed shadow mask; protect white muzzle/body, gray eye highlight and separate legs. No enclosed seed indicated after shadow connectivity. |
| [Tiger](https://discozoo.fandom.com/wiki/Tiger) | [Tiger.png](https://discozoo.fandom.com/wiki/File:Tiger.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/a/ae/Tiger.png/revision/latest?format=original) | 150×150 | B | Reviewed shadow mask; preserve extended striped tail, white muzzle/feet and dark stripes. No enclosed seed indicated after shadow connectivity. |
| [Phoenix](https://discozoo.fandom.com/wiki/Phoenix) | [Phoenix.png](https://discozoo.fandom.com/wiki/File:Phoenix.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/c/c1/Phoenix.png/revision/latest?format=original) | 150×150 | C | Reviewed shadow mask plus likely enclosed-background seed `(x:88,y:21)` for 36 pixels in `[88,21,94,27)`. Preserve crest, flame feathers and long tail. |
| [Moonkey](https://discozoo.fandom.com/wiki/Moonkey) | [Moonkey.png](https://discozoo.fandom.com/wiki/File:Moonkey.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/3/38/Moonkey.png/revision/latest?format=original) | 150×150 | A | Reviewed shadow mask plus likely enclosed-background seed `(x:107,y:100)` for a 504-pixel tail loop within `[107,94,125,130)`. Protect the entire tail and small feet. |
| [Lunar Tick](https://discozoo.fandom.com/wiki/Lunar_Tick) | [Lunar Tick.png](https://discozoo.fandom.com/wiki/File:Lunar_Tick.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/6/67/Lunar_Tick.png/revision/latest?format=original) | 150×150 | A | Reviewed shadow mask; protect fine black legs and antenna-like extensions, red shell and eye highlight. Under-body gap opens through shadow. |
| [Tribble](https://discozoo.fandom.com/wiki/Tribble) | [Tribble.png](https://discozoo.fandom.com/wiki/File:Tribble.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/1/15/Tribble.png/revision/latest?format=original) | 150×150 | A | Reviewed shadow mask; preserve every tan/brown texture pixel. No enclosed seed indicated. |
| [Moonicorn](https://discozoo.fandom.com/wiki/Moonicorn) | [Moonicorn.png](https://discozoo.fandom.com/wiki/File:Moonicorn.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/d/d5/Moonicorn.png/revision/latest?format=original) | 150×150 | B | Reviewed shadow mask; protect crescent horn, thin colored mane/tail and all legs. Horn opening is exterior-connected; no enclosed seed indicated after shadow connectivity. |
| [Luna Moth](https://discozoo.fandom.com/wiki/Luna_Moth) | [Luna Moth.png](https://discozoo.fandom.com/wiki/File:Luna_Moth.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/2/2a/Luna_Moth.png/revision/latest?format=original) | 150×150 | B | Reviewed shadow mask; protect thin antenna, red legs and long green wing tips. Under-leg gaps open through shadow. |
| [Jade Rabbit](https://discozoo.fandom.com/wiki/Jade_Rabbit) | [Jade Rabbit.png](https://discozoo.fandom.com/wiki/File:Jade_Rabbit.png) | [PNG](https://static.wikia.nocookie.net/discozoo/images/d/d7/Jade_Rabbit.png/revision/latest?format=original) | 150×150 | C | Reviewed shadow mask; preserve tall ear, small forepaw, hind foot and pale ear highlight. No enclosed seed indicated. |

Observed RGB pairs (background / shadow):

- A: `(154,148,104)` / `(136,131,93)`.
- B: `(153,142,107)` / `(135,126,95)`.
- C: `(169,140,107)` / `(149,124,95)`.

Background pixels disconnected at first inspection are often under legs and become exterior-connected when the ground-shadow area is treated as passable. Read-only connectivity analysis indicates only Phoenix and Moonkey still have enclosed background after that allowance. These are **candidate seeds**, not approved extraction profiles or completed masks.

The deterministic pipeline appears suitable for all 12, subject to individual reviewed shadow rectangles, anatomical inspection and the same exact-RGB/alpha validation used for the existing 30. No largest-component assumption is necessary. No extraction, cropping, resizing, upscaling or production output was performed in this research pass.

Proposed later destinations: `assets/reference/fandom/<id>.png` for unchanged sources and `public/game/animals-hq/jungle/<id>.png` or `public/game/animals-hq/moon/<id>.png` for approved cleaned display assets. Candidate IDs match the animal headings, lowercased with hyphens for spaces. Output dimensions are unknown until approved extraction; no fabricated crop dimensions are supplied.

## Deferred integration / owner-controlled change

`src/types/game.ts` currently defines `RegionId` as Farm–Polar only. Adding canonical Jungle/Moon animals will require the explicit minimal union extension `| "jungle" | "moon"`. This has **not** been made. New animal records in `src/data/animals.ts` likewise await approval. No existing coordinates need to change.

Vector landscapes, atmosphere, unlocked navigation and the Region Search unavailable-state shell are deferred until this research approval stop is resolved. Region Search will appear before the collection and consume the owner's eventual function/result contract; no scoring, sequence or guessed solver API implementation is included here. Moon is region 12 in the actual game, rather than the seventh region; supported/unlocked membership should therefore be explicit rather than inferred from a contiguous progression. No animals from unsupported regions should be exposed.

No build/lint/tests were run: this pass changes only this research document and temporary ignored research-cache files, not executable project code.
