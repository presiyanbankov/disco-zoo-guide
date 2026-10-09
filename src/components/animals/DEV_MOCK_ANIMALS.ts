import type { Animal, RegionId } from "../../types/game";

/**
 * DEVELOPMENT-ONLY FRONTEND ROSTER — not owner-approved canonical game data.
 * Names/rarities cross-checked against Pocket Gamer's Disco Zoo ZooPedia:
 * https://www.pocketgamer.com/disco-zoo/update-disco-zoo-zoopedia-the-complete-pattern-guide-for-every-animal/
 * Deliberately contains NO patterns, strategy steps, Timeless animals, or locked regions.
 * Replace this boundary with owner-supplied records when src/data/animals.ts is ready.
 */
export type AnimalCardPreview = Pick<Animal, "id" | "name" | "regionId"> & {
  rarity: Animal["rarity"];
  imagePath?: Animal["imagePath"];
};

export const DEV_MOCK_ANIMALS: readonly AnimalCardPreview[] = [
  { id: "sheep", name: "Sheep", regionId: "farm", rarity: "common" },
  { id: "pig", name: "Pig", regionId: "farm", rarity: "common" },
  { id: "rabbit", name: "Rabbit", regionId: "farm", rarity: "common" },
  { id: "horse", name: "Horse", regionId: "farm", rarity: "rare" },
  { id: "cow", name: "Cow", regionId: "farm", rarity: "rare" },
  { id: "unicorn", name: "Unicorn", regionId: "farm", rarity: "mythical" },
  { id: "kangaroo", name: "Kangaroo", regionId: "outback", rarity: "common" },
  { id: "platypus", name: "Platypus", regionId: "outback", rarity: "common" },
  { id: "crocodile", name: "Crocodile", regionId: "outback", rarity: "common" },
  { id: "koala", name: "Koala", regionId: "outback", rarity: "rare" },
  { id: "cockatoo", name: "Cockatoo", regionId: "outback", rarity: "rare" },
  { id: "tiddalik", name: "Tiddalik", regionId: "outback", rarity: "mythical" },
  { id: "zebra", name: "Zebra", regionId: "savanna", rarity: "common" },
  { id: "hippo", name: "Hippo", regionId: "savanna", rarity: "common" },
  { id: "giraffe", name: "Giraffe", regionId: "savanna", rarity: "common" },
  { id: "lion", name: "Lion", regionId: "savanna", rarity: "rare" },
  { id: "elephant", name: "Elephant", regionId: "savanna", rarity: "rare" },
  { id: "gryphon", name: "Gryphon", regionId: "savanna", rarity: "mythical" },
  { id: "bear", name: "Bear", regionId: "northern", rarity: "common" },
  { id: "skunk", name: "Skunk", regionId: "northern", rarity: "common" },
  { id: "beaver", name: "Beaver", regionId: "northern", rarity: "common" },
  { id: "moose", name: "Moose", regionId: "northern", rarity: "rare" },
  { id: "fox", name: "Fox", regionId: "northern", rarity: "rare" },
  { id: "sasquatch", name: "Sasquatch", regionId: "northern", rarity: "mythical" },
  { id: "penguin", name: "Penguin", regionId: "polar", rarity: "common" },
  { id: "seal", name: "Seal", regionId: "polar", rarity: "common" },
  { id: "muskox", name: "Muskox", regionId: "polar", rarity: "common" },
  { id: "polar-bear", name: "Polar Bear", regionId: "polar", rarity: "rare" },
  { id: "walrus", name: "Walrus", regionId: "polar", rarity: "rare" },
  { id: "yeti", name: "Yeti", regionId: "polar", rarity: "mythical" },
];

export function getPreviewAnimals(regionId: RegionId) {
  return DEV_MOCK_ANIMALS.filter((animal) => animal.regionId === regionId);
}
