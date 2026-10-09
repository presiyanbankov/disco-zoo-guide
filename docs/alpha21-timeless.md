# ALPHA 21 — Timeless integration

Canonical animals now include one approved Timeless record for each of the 14
regions. Coordinates retain their original orientation and gaps. Pattern
confidence is medium-high: directly inspected Fandom pattern PNGs, without
independent second-source visual corroboration. Classic coordinates are unchanged.

Ankylosaurus / `ankylosaurus` is the approved project spelling. Its dedicated
page and pattern filename use Ankylosaurus; Time Machine reward text uses Ankylo.
The actual in-game display wording remains unconfirmed. This is easy to rename.

## Visibility and search

Region visibility AND Timeless visibility are required. Existing version-1
local-storage preferences and two-stage direct-route barriers are unchanged.
Hero counts, collection sections, navigation, Rescue options/context and region
search candidates follow the central `canViewAnimal` helper. Region Search now
runs the existing small solver on the visible client-side candidate list, so a
hidden Timeless pattern cannot alter the displayed classic sequence.

Timeless is a fourth collection section when visible; hidden content retains an
anonymous spoiler slot. It is a normal region animal for Rescue participant
limits, world generation, named hits, completion and all existing strategies.
Rarity Focus tiers are Mythical → Rare + Timeless jointly → Common → pets.
World generation/filtering, tie tolerance and the other policy formulas are
unchanged. Static solver algorithms are untouched.

## Artwork inventory

Original PNG bytes are preserved in `assets/reference/fandom/<id>.png`.
Verified original CDN URLs, source SHA-256 hashes, dimensions and individual
review decisions are recorded in `scripts/timelessExtractionProfiles.json`.
These are community-hosted references; uploader identity does not establish
official provenance or reuse permission. Existing fan attribution remains.

| Animal | Source size | Production status | Review notes |
|---|---|---|---|
| Chicken | 120×120 | Fallback | Tan background/shadow; uncertain small edge islands |
| Echidna | 150×150 | HQ 136×88 | Exact exterior fill; reviewed shadow and two spine gaps |
| Rhinoceros | 197×188 | HQ 159×112 | Retain every opaque pixel; remove reviewed alpha-53 shadow |
| Otter | 194×185 | Fallback | Baked noisy checkerboard; chest/tail edges |
| Snowy Owl | 298×314 | Fallback | Baked checkerboard overlaps pale/internal details |
| Lemur | 191×187 | Fallback | Noisy checkerboard; ringed tail/thin feet |
| Ankylosaurus | 140×131 | Fallback | Varied low-contrast plate/foot boundaries |
| Yukon Camel | 172×190 | Fallback | Noisy checkerboard; thin legs/underbody gaps |
| Chipmunk | 100×94 | Fallback | Softened edges; pale stripes/narrow tail |
| Pika | 88×88 | Fallback | Varied edges/pale underside |
| Firefly | 147×129 | Fallback | Yellow tile background; antenna/lower edge uncertainty |
| Babmoon | 88×85 | Fallback | Thin limbs/tail-opening boundary uncertainty |
| Marsten | 92×94 | Fallback | Edge variation; thin legs/long tail |
| Horologium | 150×150 | HQ 78×134 | Preserve existing binary alpha and internal opaque black |

Fallbacks use the established neutral initial SVG treatment, not imitation
sprites, and are never labeled HQ. Every animal has a valid canonical fallback;
the display manifest prefers only the three reviewed HQ files.

Echidna's 276px background pocket reconnects to the exterior after removing the
reviewed shadow `(148,128,91)` within `(10,129,138,141)`. Two visually reviewed
36px spine gaps use seeds `(57,64)` and `(128,93)`. These profiles are source-hash
protected and are not general rules for other animals.

`scripts/extractTimelessArtwork.py` reuses the existing connectivity helpers,
skips unresolved profiles, and validates retained pixel counts, unchanged RGB,
binary alpha and exactly 2px padding. No resizing, recoloring or reconstruction.
Results are in `assets/reference/fandom/timeless-validation.json`.

## Review

Focused data/presentation/visibility/Rescue/policy tests and unchanged solver
regressions cover the integration. `scripts/checkTimelessBrowser.cjs` checks
390px and 1440px and saves four representative screenshots under
`public/game/experiments/alpha21-timeless/`. No commit is made by this pass.

Validation: build, lint and strict TypeScript compilation passed. 338 focused
tests passed, including 22 new Timeless tests. Browser checks: 42 assertions
at 390px/1440px, four screenshots visually reviewed. Classic extraction now
preserves display-manifest entries owned by separate reviewed profiles;
classic extraction masks and source pixels are unchanged.
