import type { Animal } from "../../types/game";
import { generatePlacements } from "../static/generatePlacements";

export type RescueAnimal = Pick<Animal, "id" | "regionId" | "pattern">;
export type RescueObservation =
  | { type: "empty"; cellIndex: number }
  | { type: "animal"; cellIndex: number; animalId: string };
export interface DynamicRescueState {
  animals: readonly RescueAnimal[];
  observations: readonly RescueObservation[];
}
export interface RescueWorld {
  animals: readonly { animalId: string; cells: readonly number[] }[];
}
export interface DynamicCellScore {
  cellIndex: number;
  hitProbability: number;
}
export interface DynamicRescueResult {
  status: "ready" | "complete" | "contradiction";
  worldCount: number;
  scores: readonly DynamicCellScore[];
  recommendation: DynamicCellScore | null;
}

// Absolute probability tolerance for arithmetic noise; row-major ties win.
export const DYNAMIC_SCORE_EPSILON = 1e-12;

export function createDynamicRescueState(animals: readonly RescueAnimal[]): DynamicRescueState {
  if (animals.length < 1 || animals.length > 3) throw new Error("Select one to three animals");
  if (new Set(animals.map(a => a.id)).size !== animals.length) throw new Error("Select distinct animals");
  if (new Set(animals.map(a => a.regionId)).size !== 1) throw new Error("Animals must belong to one region");
  for (const animal of animals) {
    const cells = animal.pattern?.cells;
    if (!cells?.length || cells.some(c => !Number.isInteger(c.row) || !Number.isInteger(c.col)
      || c.row < 0 || c.row >= 5 || c.col < 0 || c.col >= 5)
      || new Set(cells.map(c => c.row * 5 + c.col)).size !== cells.length) {
      throw new Error(`Invalid pattern for ${animal.id}`);
    }
  }
  return {
    animals: animals.map(a => ({ id: a.id, regionId: a.regionId, pattern: { cells: a.pattern.cells.map(c => ({ ...c })) } })),
    observations: [],
  };
}

/** Every world assigns one placement to every guaranteed animal, without overlap. */
export function generateRescueWorlds(animals: readonly RescueAnimal[]): RescueWorld[] {
  const candidates = animals.map(a => ({ animalId: a.id, placements: generatePlacements(a.pattern.cells) }));
  const worlds: RescueWorld[] = [];
  function visit(index: number, assigned: RescueWorld["animals"], occupied: ReadonlySet<number>) {
    if (index === candidates.length) {
      worlds.push({ animals: assigned });
      return;
    }
    const animal = candidates[index];
    for (const cells of animal.placements) {
      if (cells.some(cell => occupied.has(cell))) continue;
      visit(index + 1, [...assigned, { animalId: animal.animalId, cells }], new Set([...occupied, ...cells]));
    }
  }
  if (animals.length) visit(0, [], new Set());
  return worlds;
}

/** EMPTY excludes all animals; a named hit requires precisely that animal. */
export function filterRescueWorlds(worlds: readonly RescueWorld[], observations: readonly RescueObservation[]): RescueWorld[] {
  return worlds.filter(world => observations.every(observation => {
    if (observation.type === "empty") return world.animals.every(a => !a.cells.includes(observation.cellIndex));
    return world.animals.some(a => a.animalId === observation.animalId && a.cells.includes(observation.cellIndex))
      && world.animals.every(a => a.animalId === observation.animalId || !a.cells.includes(observation.cellIndex));
  }));
}

export function applyObservation(state: DynamicRescueState, observation: RescueObservation): DynamicRescueState {
  if (!Number.isInteger(observation.cellIndex) || observation.cellIndex < 0 || observation.cellIndex >= 25) throw new Error("Invalid board cell");
  if (observation.type === "animal" && !state.animals.some(a => a.id === observation.animalId)) throw new Error("Animal is not selected");
  return { ...state, observations: [...state.observations, { ...observation }] };
}

export function undoObservation(state: DynamicRescueState): DynamicRescueState {
  return { ...state, observations: state.observations.slice(0, -1) };
}

export function resetObservations(state: DynamicRescueState): DynamicRescueState {
  return { ...state, observations: [] };
}

export function getPossibleWorlds(state: DynamicRescueState): RescueWorld[] {
  return filterRescueWorlds(generateRescueWorlds(state.animals), state.observations);
}

/** Uniform valid worlds. This scoring objective is separate from generation/filtering. */
export function scoreWorldsByHitProbability(worlds: readonly RescueWorld[], observations: readonly RescueObservation[]): DynamicCellScore[] {
  if (!worlds.length) return [];
  const opened = new Set(observations.map(o => o.cellIndex));
  const scores: DynamicCellScore[] = [];
  for (let cellIndex = 0; cellIndex < 25; cellIndex++) {
    if (opened.has(cellIndex)) continue;
    const hits = worlds.filter(world => world.animals.some(a => a.cells.includes(cellIndex))).length;
    scores.push({ cellIndex, hitProbability: hits / worlds.length });
  }
  return scores;
}

export function chooseDynamicCell(scores: readonly DynamicCellScore[]): DynamicCellScore | null {
  if (!scores.length) return null;
  const maximum = Math.max(...scores.map(s => s.hitProbability));
  // Compare with the actual maximum, then take the lowest row-major index.
  return scores.filter(s => maximum - s.hitProbability <= DYNAMIC_SCORE_EPSILON)
    .reduce((best, s) => s.cellIndex < best.cellIndex ? s : best);
}

export function analyzeDynamicRescue(state: DynamicRescueState): DynamicRescueResult {
  const worlds = getPossibleWorlds(state);
  // An impossible observation history is a result state, not an exception.
  if (!worlds.length) return { status: "contradiction", worldCount: 0, scores: [], recommendation: null };
  const scores = scoreWorldsByHitProbability(worlds, state.observations);
  const recommendation = chooseDynamicCell(scores);
  // Conservative completion: no unopened cell can contain an animal in ANY
  // surviving world. A uniquely determined but partly unopened animal continues.
  if (!recommendation || recommendation.hitProbability === 0) {
    return { status: "complete", worldCount: worlds.length, scores, recommendation: null };
  }
  return { status: "ready", worldCount: worlds.length, scores, recommendation };
}
