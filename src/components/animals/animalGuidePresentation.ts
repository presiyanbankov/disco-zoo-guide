import type { Animal, AnimalPattern, StaticSearchResult } from "../../types/game";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { generateSearchSequence } from "../../solver/static/staticSolver";
import { inspectPattern } from "../grid/gridPresentation";
import { ANIMALS } from "../../data/animals";
import { getRegionPresentation } from "../regions/regionPresentation";
import type { AnimalCardPreview } from "./DEV_MOCK_ANIMALS";
import { getAnimalDisplayArtwork } from "./animalArtworkPresentation";

export type AnimalGuidePresentation = AnimalCardPreview & {
  pattern?: AnimalPattern;
  strategy?: StaticSearchResult;
  strategyUnavailableReason?: "missing-pattern" | "invalid-pattern" | "solver-error";
  strategyError?: string;
  source: "development-preview" | "owner-data";
};

/**
 * Frontend visibility/data boundary. No patterns or strategies are invented here.
 * Server-side presentation of owner-approved records. Reserved sprite paths
 * fall back to original artwork until their public files actually exist.
 */
export function getAnimalGuidePresentation(regionId: string, animalId: string): AnimalGuidePresentation | undefined {
  const animal = getRegionAnimalPresentations(regionId).find((animal) => animal.id === animalId);
  return animal ? generateAnimalGuideStrategy(animal) : undefined;
}

export function getRegionAnimalPresentations(regionId: string): AnimalGuidePresentation[] {
  const region = getRegionPresentation(regionId);
  if (!region) return [];
  return ANIMALS.filter((animal) => animal.regionId === region.id)
    .map((animal): AnimalGuidePresentation | undefined => {
      const view = presentOwnerAnimal(animal);
      if (!view) return undefined;
      const artwork = getAnimalDisplayArtwork(animal.imagePath);
      const available = artwork && (existsSync(join(process.cwd(), "public", artwork.src)) || existsSync(join(process.cwd(), "public", animal.imagePath)));
      return { ...view, imagePath: available ? animal.imagePath : undefined };
    })
    .filter((animal): animal is AnimalGuidePresentation => animal !== undefined);
}

// Presentation adapter for owner-reviewed records; never invokes a solver.
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

/** Presentation boundary: delegates all search computation to the owner solver. */
export function generateAnimalGuideStrategy(animal: AnimalGuidePresentation, generate: typeof generateSearchSequence = generateSearchSequence): AnimalGuidePresentation {
  const pattern = inspectPattern(animal.pattern);
  if (pattern.status !== "ready") {
    return { ...animal, strategy: undefined, strategyUnavailableReason: pattern.status === "missing" ? "missing-pattern" : "invalid-pattern", strategyError: undefined };
  }
  try {
    return { ...animal, strategy: generate(animal.id, animal.pattern!), strategyUnavailableReason: undefined, strategyError: undefined };
  } catch (error) {
    const development = process.env.NODE_ENV === "development";
    if (development) console.error(`Search sequence failed for ${animal.regionId}/${animal.id}`, error);
    return { ...animal, strategy: undefined, strategyUnavailableReason: "solver-error", strategyError: development ? error instanceof Error ? error.message : String(error) : undefined };
  }
}
