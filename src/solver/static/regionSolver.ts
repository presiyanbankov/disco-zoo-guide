import type { Animal } from "../../types/game";
import { generatePlacements } from "./generatePlacements";

export interface RegionAnimalState {
  animalId: string;
  placements: number[][];
}

export interface RegionSearchStep {
  step: number;
  cellIndex: number;
  hitProbability: number;
  activeAnimals: number;
}

export interface RegionSearchResult {
  steps: RegionSearchStep[];
}

// Absolute probability tolerance: absorbs arithmetic noise while retaining
// meaningful differences on this small 25-cell board.
export const REGION_SCORE_EPSILON = 1e-12;

export function scoreRegionCells(states: readonly RegionAnimalState[]): number[] {
  const active = states.filter(state => state.placements.length > 0);
  const scores = Array<number>(25).fill(0);
  if (active.length === 0) return scores;
  const animalWeight = 1 / active.length;
  for (const animal of active) {
    const placementWeight = animalWeight / animal.placements.length;
    for (const placement of animal.placements) {
      for (const cell of placement) scores[cell] += placementWeight;
    }
  }
  return scores;
}

export function chooseRegionCell(scores: readonly number[], clicked: readonly number[]): number {
  const available = scores.map((score, cellIndex) => ({ score, cellIndex }))
    .filter(cell => !clicked.includes(cell.cellIndex));
  if (available.length === 0) throw new Error("No region search cells available");
  const highestScore = Math.max(...available.map(cell => cell.score));
  // Compare against the actual maximum, avoiding accumulation of near-ties.
  // Traversal is row-major, so the first cell within epsilon wins.
  return available.find(cell => highestScore - cell.score <= REGION_SCORE_EPSILON)!.cellIndex;
}

export function applyRegionMiss(states: readonly RegionAnimalState[], cellIndex: number): RegionAnimalState[] {
  return states.map(animal => ({
    animalId: animal.animalId,
    placements: animal.placements.filter(placement => !placement.includes(cellIndex)),
  })).filter(animal => animal.placements.length > 0);
}

export function generateRegionSearchSequence(animals: readonly Pick<Animal, "id" | "pattern">[]): RegionSearchResult {
  let active = animals.map(animal => ({
    animalId: animal.id,
    placements: generatePlacements(animal.pattern.cells),
  })).filter(animal => animal.placements.length > 0);
  const clicked: number[] = [];
  const steps: RegionSearchStep[] = [];
  while (active.length > 0) {
    // Recompute after every miss: surviving animals each regain equal total
    // mass, distributed uniformly over that animal's remaining placements.
    const scores = scoreRegionCells(active);
    const cellIndex = chooseRegionCell(scores, clicked);
    steps.push({ step: steps.length + 1, cellIndex, hitProbability: scores[cellIndex], activeAnimals: active.length });
    clicked.push(cellIndex);
    active = applyRegionMiss(active, cellIndex);
  }
  return { steps };
}
