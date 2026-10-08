import type { PetSpecies } from "../types/game";

// Approved ALPHA 09 coordinates. Artwork remains explicitly unresolved.
export const PET_SPECIES: readonly PetSpecies[] = [
  { id: "rabbit", name: "Rabbit", pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 1 }] }, imagePath: "/game/pets/artwork-pending.svg" },
  { id: "bird", name: "Bird", pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 0, col: 4 }, { row: 1, col: 1 }, { row: 1, col: 3 }] }, imagePath: "/game/pets/artwork-pending.svg" },
  { id: "dog", name: "Dog", pattern: { cells: [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 1 }] }, imagePath: "/game/pets/artwork-pending.svg" },
  { id: "cat", name: "Cat", pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 1 }] }, imagePath: "/game/pets/artwork-pending.svg" },
  { id: "fish", name: "Fish", pattern: { cells: [{ row: 0, col: 3 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 3 }] }, imagePath: "/game/pets/artwork-pending.svg" },
  { id: "turtle", name: "Turtle", pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 1 }] }, imagePath: "/game/pets/artwork-pending.svg" },
  { id: "lizard", name: "Lizard", pattern: { cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }] }, imagePath: "/game/pets/artwork-pending.svg" },
  { id: "hamster", name: "Hamster", pattern: { cells: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 2 }] }, imagePath: "/game/pets/artwork-pending.svg" },
];
