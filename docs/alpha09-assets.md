# ALPHA 09 pet source inventory

Approved patterns and canonical pet records are unchanged. This polish pass
uses a frontend display manifest for original Fandom purple pet tile crops.
These are species icons from public community-hosted pattern diagrams, not
verified official standalone sprites. No reuse permission is claimed.

| Species | Source PNG | Source dimensions | Local display asset | Crop dimensions |
| --- | --- | --- | --- | --- |
| Rabbit | https://static.wikia.nocookie.net/discozoo/images/4/43/Pet_Rabbit_Pattern.png/revision/latest?format=original | 364x364 | public/game/pets/tiles/rabbit.png | 116x116 |
| Bird | https://static.wikia.nocookie.net/discozoo/images/1/10/Pet_Bird_Pattern.png/revision/latest?format=original | 604x244 | public/game/pets/tiles/bird.png | 116x116 |
| Dog | https://static.wikia.nocookie.net/discozoo/images/3/3b/Pet_Dog_Pattern.png/revision/latest?format=original | 244x364 | public/game/pets/tiles/dog.png | 116x116 |
| Cat | https://static.wikia.nocookie.net/discozoo/images/6/6f/Pet_Cat_Pattern.png/revision/latest?format=original | 244x364 | public/game/pets/tiles/cat.png | 116x116 |
| Fish | https://static.wikia.nocookie.net/discozoo/images/f/f7/Pet_Fish_Pattern.png/revision/latest?format=original | 484x364 | public/game/pets/tiles/fish.png | 116x116 |
| Turtle | https://static.wikia.nocookie.net/discozoo/images/0/05/Pet_Turtle_Pattern.png/revision/latest?format=original | 364x364 | public/game/pets/tiles/turtle.png | 116x116 |
| Lizard | https://static.wikia.nocookie.net/discozoo/images/a/a4/Pet_Lizard_Pattern.png/revision/latest?format=original | 364x368 | public/game/pets/tiles/lizard.png | 116x116 |
| Hamster | https://static.wikia.nocookie.net/discozoo/images/f/f7/Pet_Hamster_Pattern.png/revision/latest?format=original | 364x364 | public/game/pets/tiles/hamster.png | 116x116 |

## Extraction and provenance

Reference direction: https://discozoo.fandom.com/wiki/Category:Pets
Species documentation: https://discozoo.fandom.com/wiki/Pets

Downloaded diagrams remain unchanged under `assets/reference/fandom/pets`.
`scripts/cropPetTiles.py` crops the reviewed first occupied tile to 116x116,
trimming the outside sheet gutter only. It keeps the original purple background,
bevel, silhouette colours, shadow and source alpha. There is no masking,
recolouring, resizing, resampling or reconstruction. Each saved PNG's full pixel
buffer is asserted identical to its source crop, including background pixels.

`petTiles.json` is presentation-only. Canonical imagePath values are unchanged.
All pet UI uses these tile crops through PetArtwork. Its wrapper has no added
background, border, rounded clipping, padding or filter. The existing normalized
UI sizes use crisp pixel rendering. Missing assets retain an accessible fallback.

The earlier transparent silhouette files/manifest and extraction script are
retained as historical derivatives; they are not used in the current pet UI.
Source hashes, exact crop rectangles and pixel equality results are recorded in
`public/game/experiments/pet-tiles/pixel-validation.json`. The native-size contact
sheet shows all eight outputs. Standalone full-colour pet artwork is still
unresolved. Existing fan-site attribution is retained.

Sources are publicly hosted community files. Their appearance is consistent
with game rescue-tile silhouettes; uploader identity or official original-file
provenance was not established.
