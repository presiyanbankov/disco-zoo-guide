import type { Animal, PetSpecies } from "../../types/game";
import type { RescueParticipant } from "../../solver/dynamic/dynamicRescueSolver";

export interface DisplayParticipant extends RescueParticipant {
  name: string;
  imagePath: string;
}
export function animalParticipant(animal: Animal): DisplayParticipant {
  return { id: `animal:${animal.regionId}:${animal.id}`, kind: "animal", animalRarity: animal.rarity, name: animal.name, imagePath: animal.imagePath, pattern: animal.pattern };
}
export function petParticipant(pet: PetSpecies): DisplayParticipant {
  return { id: `pet:${pet.id}`, kind: "pet", name: pet.name, imagePath: pet.imagePath, pattern: pet.pattern };
}
/** Setup rules are separate from the solver's participant-agnostic geometry. */
export function validateRescueSetup(animals: readonly Animal[], pets: readonly PetSpecies[]): string | null {
  if (pets.length > 1) return "Select at most one pet.";
  if (!animals.length && !pets.length) return "Select at least one animal or pet.";
  if (animals.length + pets.length > 3) return "Select at most three participants; a pet allows at most two animals.";
  if (animals.length && new Set(animals.map(a => a.regionId)).size !== 1) return "Animals must belong to one region.";
  if (animals.some(a => a.hidden)) return "Select visible animals.";
  const ids = [...animals.map(animalParticipant), ...pets.map(petParticipant)].map(p => p.id);
  if (new Set(ids).size !== ids.length) return "Select distinct participants.";
  return null;
}
