import type { Animal } from "../types/game";

// Owner-approved classic patterns: Farm through Polar; no Timeless animals.
// Coordinates are zero-based, bounding-box normalized, with internal gaps preserved.
// Verified against the Pocket Gamer Zoopedia screenshots and Netlify pattern sheets:
// https://www.pocketgamer.com/disco-zoo/update-disco-zoo-zoopedia-the-complete-pattern-guide-for-every-animal/
// https://discozoo.netlify.app/
// imagePath values reserve future sprite locations; those files are not yet supplied.
export const ANIMALS: Animal[] = [
  // Farm
  {
    id: "sheep", name: "Sheep", regionId: "farm", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }] },
    imagePath: "/game/animals/farm/sheep.png",
  },
  {
    id: "pig", name: "Pig", regionId: "farm", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }] },
    imagePath: "/game/animals/farm/pig.png",
  },
  {
    id: "rabbit", name: "Rabbit", regionId: "farm", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }] },
    imagePath: "/game/animals/farm/rabbit.png",
  },
  {
    id: "horse", name: "Horse", regionId: "farm", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }] },
    imagePath: "/game/animals/farm/horse.png",
  },
  {
    id: "cow", name: "Cow", regionId: "farm", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] },
    imagePath: "/game/animals/farm/cow.png",
  },
  {
    id: "unicorn", name: "Unicorn", regionId: "farm", rarity: "mythical",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }] },
    imagePath: "/game/animals/farm/unicorn.png",
  },
  // Outback
  {
    id: "kangaroo", name: "Kangaroo", regionId: "outback", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }] },
    imagePath: "/game/animals/outback/kangaroo.png",
  },
  {
    id: "platypus", name: "Platypus", regionId: "outback", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 }] },
    imagePath: "/game/animals/outback/platypus.png",
  },
  {
    id: "crocodile", name: "Crocodile", regionId: "outback", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }] },
    imagePath: "/game/animals/outback/crocodile.png",
  },
  {
    id: "koala", name: "Koala", regionId: "outback", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }] },
    imagePath: "/game/animals/outback/koala.png",
  },
  {
    id: "cockatoo", name: "Cockatoo", regionId: "outback", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }] },
    imagePath: "/game/animals/outback/cockatoo.png",
  },
  {
    id: "tiddalik", name: "Tiddalik", regionId: "outback", rarity: "mythical",
    pattern: { cells: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 2 }] },
    imagePath: "/game/animals/outback/tiddalik.png",
  },
  // Savanna
  {
    id: "zebra", name: "Zebra", regionId: "savanna", rarity: "common",
    pattern: { cells: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 1 }] },
    imagePath: "/game/animals/savanna/zebra.png",
  },
  {
    id: "hippo", name: "Hippo", regionId: "savanna", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }] },
    imagePath: "/game/animals/savanna/hippo.png",
  },
  {
    id: "giraffe", name: "Giraffe", regionId: "savanna", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }] },
    imagePath: "/game/animals/savanna/giraffe.png",
  },
  {
    id: "lion", name: "Lion", regionId: "savanna", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] },
    imagePath: "/game/animals/savanna/lion.png",
  },
  {
    id: "elephant", name: "Elephant", regionId: "savanna", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }] },
    imagePath: "/game/animals/savanna/elephant.png",
  },
  {
    id: "gryphon", name: "Gryphon", regionId: "savanna", rarity: "mythical",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }] },
    imagePath: "/game/animals/savanna/gryphon.png",
  },
  // Northern
  {
    id: "bear", name: "Bear", regionId: "northern", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }] },
    imagePath: "/game/animals/northern/bear.png",
  },
  {
    id: "skunk", name: "Skunk", regionId: "northern", rarity: "common",
    pattern: { cells: [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 1 }] },
    imagePath: "/game/animals/northern/skunk.png",
  },
  {
    id: "beaver", name: "Beaver", regionId: "northern", rarity: "common",
    pattern: { cells: [{ row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }] },
    imagePath: "/game/animals/northern/beaver.png",
  },
  {
    id: "moose", name: "Moose", regionId: "northern", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }] },
    imagePath: "/game/animals/northern/moose.png",
  },
  {
    id: "fox", name: "Fox", regionId: "northern", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 2 }] },
    imagePath: "/game/animals/northern/fox.png",
  },
  {
    id: "sasquatch", name: "Sasquatch", regionId: "northern", rarity: "mythical",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }] },
    imagePath: "/game/animals/northern/sasquatch.png",
  },
  // Polar
  {
    id: "penguin", name: "Penguin", regionId: "polar", rarity: "common",
    pattern: { cells: [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 2 }] },
    imagePath: "/game/animals/polar/penguin.png",
  },
  {
    id: "seal", name: "Seal", regionId: "polar", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 3 }, { row: 2, col: 2 }] },
    imagePath: "/game/animals/polar/seal.png",
  },
  {
    id: "muskox", name: "Muskox", regionId: "polar", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 2 }] },
    imagePath: "/game/animals/polar/muskox.png",
  },
  {
    id: "polar-bear", name: "Polar Bear", regionId: "polar", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 2 }] },
    imagePath: "/game/animals/polar/polar-bear.png",
  },
  {
    id: "walrus", name: "Walrus", regionId: "polar", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }] },
    imagePath: "/game/animals/polar/walrus.png",
  },
  {
    id: "yeti", name: "Yeti", regionId: "polar", rarity: "mythical",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 2, col: 0 }] },
    imagePath: "/game/animals/polar/yeti.png",
  },
  // Jungle — owner-approved research coordinates.
  {
    id: "monkey", name: "Monkey", regionId: "jungle", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 3 }] },
    imagePath: "/game/animals/jungle/monkey.png",
  },
  {
    id: "toucan", name: "Toucan", regionId: "jungle", rarity: "common",
    pattern: { cells: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 2, col: 1 }, { row: 3, col: 1 }] },
    imagePath: "/game/animals/jungle/toucan.png",
  },
  {
    id: "gorilla", name: "Gorilla", regionId: "jungle", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 2 }] },
    imagePath: "/game/animals/jungle/gorilla.png",
  },
  {
    id: "panda", name: "Panda", regionId: "jungle", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 2 }, { row: 1, col: 0 }, { row: 2, col: 2 }] },
    imagePath: "/game/animals/jungle/panda.png",
  },
  {
    id: "tiger", name: "Tiger", regionId: "jungle", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 0, col: 3 }] },
    imagePath: "/game/animals/jungle/tiger.png",
  },
  {
    id: "phoenix", name: "Phoenix", regionId: "jungle", rarity: "mythical",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 2, col: 2 }] },
    imagePath: "/game/animals/jungle/phoenix.png",
  },
  // Moon — owner-approved research coordinates.
  {
    id: "moonkey", name: "Moonkey", regionId: "moon", rarity: "common",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 2 }] },
    imagePath: "/game/animals/moon/moonkey.png",
  },
  {
    id: "lunar-tick", name: "Lunar Tick", regionId: "moon", rarity: "common",
    pattern: { cells: [{ row: 0, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 0 }, { row: 3, col: 2 }] },
    imagePath: "/game/animals/moon/lunar-tick.png",
  },
  {
    id: "tribble", name: "Tribble", regionId: "moon", rarity: "common",
    pattern: { cells: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }] },
    imagePath: "/game/animals/moon/tribble.png",
  },
  {
    id: "moonicorn", name: "Moonicorn", regionId: "moon", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }] },
    imagePath: "/game/animals/moon/moonicorn.png",
  },
  {
    id: "luna-moth", name: "Luna Moth", regionId: "moon", rarity: "rare",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 1 }] },
    imagePath: "/game/animals/moon/luna-moth.png",
  },
  {
    id: "jade-rabbit", name: "Jade Rabbit", regionId: "moon", rarity: "mythical",
    pattern: { cells: [{ row: 0, col: 0 }, { row: 2, col: 1 }] },
    imagePath: "/game/animals/moon/jade-rabbit.png",
  },
];
