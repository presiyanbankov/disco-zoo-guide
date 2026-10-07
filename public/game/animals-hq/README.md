# Reviewed Fandom HQ display assets

All 30 classic animals have individually inspected extraction profiles. These are
cleaned display assets; canonical sprites and canonical data imagePath values
remain untouched. No Timeless or later-region content is included.

Extraction preserves source RGB exactly, changes alpha only to 0, and crops with
2px transparent padding. No resize, resampling, blur, color edits or AI. Source
bytes are pinned by SHA-256 and retained in assets/reference/fandom. Every animal
has a reviewed exact-color shadow strip. Farm/Outback also remove the three signed
corner-letter components. Pig alone requires a 16px enclosed tail-background seed
at (89,66). Every animal-palette pixel is retained, including all reviewed thin
extremities, legs, eye highlights and small color patches. No unresolved animals.

Reproduce: python scripts/extractFandomAnimals.py. Profiles and masks/seeds:
 scripts/fandomExtractionProfiles.json. Validation and exact source-to-crop mapping:
 public/game/experiments/fandom-extracted-all/validation.json.

Frontend manifest: src/components/animals/hqArtwork.json. Collections and details
prefer these files. Missing manifest entries and failed HQ image loads fall back
to original art; failed original loads show an accessible unavailable state.
HQ display is crisp and restrained; legacy Scale4x output is no longer selected.

Fandom uploaders are Bee523 (Farm, Savanna, Northern, Polar) and Doginthehouse14
(Outback). Uploaders do not establish official-original provenance or reuse rights.
Disco Zoo artwork belongs to its creators, NimbleBit / Milkbag Games; no affiliation
or endorsement is claimed. Signed originals remain available as references.

| Local HQ file | Fandom PNG | Source dimensions | HQ dimensions | Reviewed shadow RGB / bounds | Enclosed seed | Inspection notes |
|---|---|---|---|---|---|---|
| public/game/animals-hq/farm/sheep.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/c/cc/Sheep.png/revision/latest?format=original) | [120, 120] | [76, 60] | [136, 130, 93] / [25, 106, 95, 114] | none | White fleece, pink muzzle, gray legs and gray eye highlight preserved. |
| public/game/animals-hq/farm/pig.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/3/30/Pig.png/revision/latest?format=original) | [120, 120] | [76, 60] | [136, 130, 93] / [26, 106, 96, 114] | [{'seed': [89, 66], 'count': 16, 'label': 'tail-opening'}] | Curled tail and both legs preserved; explicitly clear the enclosed 16px tail opening. |
| public/game/animals-hq/farm/rabbit.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/f/fd/Rabbit.png/revision/latest?format=original) | [120, 120] | [52, 68] | [136, 130, 93] / [37, 106, 83, 114] | none | Thin upright ears, pink inner ear, short tail, feet and eye highlight preserved. |
| public/game/animals-hq/farm/horse.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/c/c3/Horse.png/revision/latest?format=original) | [120, 120] | [76, 72] | [135, 126, 96] / [25, 106, 95, 114] | none | Both ears, muzzle, tail, darker mane and four hoof/leg portions preserved. |
| public/game/animals-hq/farm/cow.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/8/84/Cow.png/revision/latest?format=original) | [120, 120] | [76, 60] | [135, 126, 96] / [25, 106, 95, 114] | none | Tail, spotted coat, pink muzzle/udder, dark hooves and eye highlight preserved. |
| public/game/animals-hq/farm/unicorn.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/7/7e/Unicorn.png/revision/latest?format=original) | [120, 120] | [76, 84] | [149, 124, 95] / [25, 106, 95, 114] | none | Thin horn, all rainbow mane colors, purple tail, feet and eye highlight preserved. |
| public/game/animals-hq/outback/kangaroo.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/5/56/Kangaroo.png/revision/latest?format=original) | [120, 120] | [92, 76] | [136, 130, 93] / [23, 106, 101, 114] | none | Long tapering tail, ears, tiny arms, dark feet and eye highlight preserved. |
| public/game/animals-hq/outback/platypus.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/5/5d/Platypus.png/revision/latest?format=original) | [120, 120] | [92, 44] | [136, 130, 93] / [15, 106, 99, 114] | none | Broad dark bill, extending tail, separate feet and eye highlight preserved. |
| public/game/animals-hq/outback/crocodile.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/d/d6/Crocodile.png/revision/latest?format=original) | [120, 120] | [92, 36] | [136, 130, 93] / [19, 106, 97, 114] | none | Long tapering tail, dorsal bumps, pale jaw, feet and eye highlight preserved. |
| public/game/animals-hq/outback/koala.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/2/22/Koala.png/revision/latest?format=original) | [120, 120] | [76, 68] | [135, 126, 96] / [25, 106, 95, 114] | none | All distinct gray face/ear/body/foot colors and eye highlight preserved. |
| public/game/animals-hq/outback/cockatoo.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/b/b6/Cockatoo.png/revision/latest?format=original) | [120, 120] | [76, 76] | [135, 126, 96] / [25, 106, 90, 114] | none | Yellow crest tips, dark beak/feet, white/gray tail feathers and eye highlight preserved. |
| public/game/animals-hq/outback/tiddalik.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/e/e9/Tiddalik.png/revision/latest?format=original) | [120, 120] | [92, 68] | [149, 124, 95] / [18, 106, 102, 114] | none | Red crest, vivid blue/yellow legs, green body and eye highlight preserved. |
| public/game/animals-hq/savanna/zebra.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/3/37/Zebra.png/revision/latest?format=original) | [150, 150] | [112, 106] | [136, 131, 93] / [23, 129, 127, 141] | none | Ears, mane, checker-striped body, thin legs, hooves and eye highlight preserved. |
| public/game/animals-hq/savanna/hippo.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/f/f3/Hippo.png/revision/latest?format=original) | [150, 150] | [124, 88] | [136, 131, 93] / [17, 130, 133, 142] | none | Small ears, muzzle, dark foot/leg portions and eye highlight preserved. |
| public/game/animals-hq/savanna/giraffe.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/6/60/Giraffe.png/revision/latest?format=original) | [150, 150] | [100, 130] | [136, 131, 93] / [27, 130, 113, 142] | none | Horn/ear tips, long neck, markings, extending tail, thin legs and eye highlight preserved. |
| public/game/animals-hq/savanna/lion.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/4/47/Lion.png/revision/latest?format=original) | [150, 150] | [112, 88] | [135, 126, 94] / [23, 129, 127, 141] | none | Mane outline, long tail and dark tuft, feet and eye highlight preserved. |
| public/game/animals-hq/savanna/elephant.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/6/60/Elephant.png/revision/latest?format=original) | [150, 150] | [112, 88] | [135, 126, 94] / [21, 129, 118, 141] | none | Both tusk whites, narrow trunk tip, body/ear grays, feet and eye highlight preserved. |
| public/game/animals-hq/savanna/gryphon.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/2/2f/Gryphon.png/revision/latest?format=original) | [150, 150] | [124, 124] | [149, 124, 94] / [15, 130, 130, 142] | none | Extended wings/feather tips, beak, tail, rear legs and eye highlight preserved. |
| public/game/animals-hq/northern/bear.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/a/a4/Bear.png/revision/latest?format=original) | [150, 150] | [124, 81] | [136, 131, 93] / [16, 129, 123, 141] | none | Ears, muzzle, brown leg/body shades and gray eye highlight preserved. |
| public/game/animals-hq/northern/skunk.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/7/79/Skunk.png/revision/latest?format=original) | [150, 150] | [124, 88] | [136, 131, 93] / [17, 129, 133, 141] | none | Long raised tail and white stripe, black feet and eye highlight preserved. |
| public/game/animals-hq/northern/beaver.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/2/26/Beaver.png/revision/latest?format=original) | [150, 150] | [136, 70] | [136, 131, 93] / [12, 130, 140, 142] | none | Wide extending tail and every tail shade, pale teeth, feet and eye highlight preserved. |
| public/game/animals-hq/northern/moose.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/2/27/Moose.png/revision/latest?format=original) | [150, 150] | [124, 112] | [135, 126, 94] / [16, 130, 132, 142] | none | Thin branching antlers, extending muzzle, thin legs and eye highlight preserved. |
| public/game/animals-hq/northern/fox.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/7/73/Fox.png/revision/latest?format=original) | [150, 150] | [136, 100] | [135, 126, 94] / [11, 131, 139, 143] | none | Pointed ears, extending white-tipped tail, black feet and eye highlight preserved. |
| public/game/animals-hq/northern/sasquatch.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/8/8d/Sasquatch.png/revision/latest?format=original) | [150, 150] | [88, 130] | [149, 124, 94] / [38, 130, 119, 142] | none | Thin arms/fingers, separated legs and feet, all torso shades and eye highlight preserved. |
| public/game/animals-hq/polar/penguin.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/9/97/Penguin.png/revision/latest?format=original) | [150, 150] | [76, 100] | [136, 131, 93] / [40, 129, 105, 141] | none | Thin beak/flippers, yellow neck patches, gray feet and eye highlight preserved. |
| public/game/animals-hq/polar/seal.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/8/8e/Seal.png/revision/latest?format=original) | [150, 150] | [136, 88] | [136, 131, 93] / [23, 129, 141, 141] | none | Raised tail/flipper tips, muzzle, all gray body shades and lighter eye highlight preserved. |
| public/game/animals-hq/polar/muskox.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/9/98/Muskox.png/revision/latest?format=original) | [150, 150] | [136, 100] | [136, 131, 93] / [11, 129, 129, 141] | none | Curved pale horn, back/body trim, feet and eye highlight preserved. |
| public/game/animals-hq/polar/polar-bear.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/7/78/Polar_Bear.png/revision/latest?format=original) | [150, 150] | [136, 88] | [135, 126, 95] / [10, 129, 128, 141] | none | Pale muzzle, ears, all three white body shades, feet and eye highlight preserved. |
| public/game/animals-hq/polar/walrus.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/7/79/Walrus.png/revision/latest?format=original) | [150, 150] | [136, 88] | [135, 126, 95] / [13, 129, 141, 141] | none | Long white tusk, tail/flipper tips, dark body shades and eye highlight preserved. |
| public/game/animals-hq/polar/yeti.png | [PNG](https://static.wikia.nocookie.net/discozoo/images/7/7d/Yeti.png/revision/latest?format=original) | [150, 150] | [88, 130] | [149, 124, 95] / [36, 130, 117, 142] | none | Separated hands/arms/legs/feet, all white/gray body shades and eye highlight preserved. |
