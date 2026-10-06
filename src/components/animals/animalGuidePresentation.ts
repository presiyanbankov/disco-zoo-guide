import type { Animal, AnimalPattern, StaticSearchResult } from "../../types/game";
import { getRegionPresentation } from "../regions/regionPresentation";
import { getPreviewAnimals, type AnimalCardPreview } from "./DEV_MOCK_ANIMALS";

export type AnimalGuidePresentation = AnimalCardPreview & {
  pattern?: AnimalPattern;
  strategy?: StaticSearchResult;
  source: "development-preview" | "owner-data";
};

/**
 * Frontend visibility/data boundary. No patterns or strategies are invented here.
 * The canonical data files are currently empty; only preview identities are used.
 * Replace the lookup with owner-supplied records when those exports are ready.
 */
export function getAnimalGuidePresentation(regionId: string, animalId: string): AnimalGuidePresentation | undefined {
  const region = getRegionPresentation(regionId);
  if (!region) return undefined;
  const animal = getPreviewAnimals(region.id).find((record) => record.id === animalId);
  return animal ? { ...animal, source: "development-preview" } : undefined;
}

// Integration adapter for future owner-reviewed records; never invokes a solver.
export function presentOwnerAnimal(animal: Animal, strategy?: StaticSearchResult): AnimalGuidePresentation | undefined {
  if (animal.hidden || animal.rarity === "timeless" || !getRegionPresentation(animal.regionId)) return undefined;
  return {
    id: animal.id,
    name: animal.name,
    regionId: animal.regionId,
    rarity: animal.rarity,
    imagePath: animal.imagePath || undefined,
    pattern: animal.pattern,
    strategy,
    source: "owner-data",
  };
}
