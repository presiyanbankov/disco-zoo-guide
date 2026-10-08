import type { AnimalPattern } from "../../types/game";
import { generatePlacements } from "../static/generatePlacements";
import { BALANCED_STRATEGY, resolveTargetStrategy, scoreWorldsByStrategy, type RescueStrategy } from "./rescueStrategy";

export interface RescueParticipant {
  id: string;
  kind: "animal" | "pet";
  animalRarity?: "common" | "rare" | "mythical";
  pattern: AnimalPattern;
}
export type RescueObservation =
  | { type: "empty"; cellIndex: number }
  | { type: "hit"; cellIndex: number; participantId: string };
export interface DynamicRescueState {
  participants: readonly RescueParticipant[];
  observations: readonly RescueObservation[];
}
export interface RescueWorld {
  participants: readonly { participantId: string; cells: readonly number[] }[];
}
export interface DynamicCellScore {
  cellIndex: number;
  hitProbability: number;
  /** Policy utility; may exceed one. Absent for backwards-compatible balanced scores. */
  strategyScore?: number;
}
export interface DynamicRescueResult {
  status: "ready" | "complete" | "contradiction" | "target-required" | "target-resolved" | "strategy-complete" | "strategy-unavailable";
  worldCount: number;
  scores: readonly DynamicCellScore[];
  recommendation: DynamicCellScore | null;
}

// Absolute probability tolerance for arithmetic noise; row-major ties win.
export const DYNAMIC_SCORE_EPSILON = 1e-12;

export function createDynamicRescueState(participants: readonly RescueParticipant[]): DynamicRescueState {
  if (participants.length < 1 || participants.length > 3) throw new Error("Select one to three participants");
  if (new Set(participants.map(a => a.id)).size !== participants.length) throw new Error("Select distinct participants");
  for (const participant of participants) {
    const cells = participant.pattern?.cells;
    if (!cells?.length || cells.some(c => !Number.isInteger(c.row) || !Number.isInteger(c.col)
      || c.row < 0 || c.row >= 5 || c.col < 0 || c.col >= 5)
      || new Set(cells.map(c => c.row * 5 + c.col)).size !== cells.length) {
      throw new Error(`Invalid pattern for ${participant.id}`);
    }
  }
  return {
    participants: participants.map(a => ({ id: a.id, kind: a.kind, ...(a.animalRarity ? { animalRarity: a.animalRarity } : {}), pattern: { cells: a.pattern.cells.map(c => ({ ...c })) } })),
    observations: [],
  };
}

/** Every world assigns one placement to every guaranteed participant, without overlap. */
export function generateRescueWorlds(participants: readonly RescueParticipant[]): RescueWorld[] {
  const candidates = participants.map(a => ({ participantId: a.id, placements: generatePlacements(a.pattern.cells) }));
  const worlds: RescueWorld[] = [];
  function visit(index: number, assigned: RescueWorld["participants"], occupied: ReadonlySet<number>) {
    if (index === candidates.length) {
      worlds.push({ participants: assigned });
      return;
    }
    const participant = candidates[index];
    for (const cells of participant.placements) {
      if (cells.some(cell => occupied.has(cell))) continue;
      visit(index + 1, [...assigned, { participantId: participant.participantId, cells }], new Set([...occupied, ...cells]));
    }
  }
  if (participants.length) visit(0, [], new Set());
  return worlds;
}

/** EMPTY excludes all participants; a named hit requires precisely that participant. */
export function filterRescueWorlds(worlds: readonly RescueWorld[], observations: readonly RescueObservation[]): RescueWorld[] {
  return worlds.filter(world => observations.every(observation => {
    if (observation.type === "empty") return world.participants.every(a => !a.cells.includes(observation.cellIndex));
    return world.participants.some(a => a.participantId === observation.participantId && a.cells.includes(observation.cellIndex))
      && world.participants.every(a => a.participantId === observation.participantId || !a.cells.includes(observation.cellIndex));
  }));
}

export function applyObservation(state: DynamicRescueState, observation: RescueObservation): DynamicRescueState {
  if (!Number.isInteger(observation.cellIndex) || observation.cellIndex < 0 || observation.cellIndex >= 25) throw new Error("Invalid board cell");
  if (observation.type === "hit" && !state.participants.some(a => a.id === observation.participantId)) throw new Error("Participant is not selected");
  return { ...state, observations: [...state.observations, { ...observation }] };
}

export function undoObservation(state: DynamicRescueState): DynamicRescueState {
  return { ...state, observations: state.observations.slice(0, -1) };
}

export function resetObservations(state: DynamicRescueState): DynamicRescueState {
  return { ...state, observations: [] };
}

export function getPossibleWorlds(state: DynamicRescueState): RescueWorld[] {
  return filterRescueWorlds(generateRescueWorlds(state.participants), state.observations);
}

/** Uniform valid worlds. This scoring objective is separate from generation/filtering. */
export function scoreWorldsByHitProbability(worlds: readonly RescueWorld[], observations: readonly RescueObservation[]): DynamicCellScore[] {
  if (!worlds.length) return [];
  const opened = new Set(observations.map(o => o.cellIndex));
  const scores: DynamicCellScore[] = [];
  for (let cellIndex = 0; cellIndex < 25; cellIndex++) {
    if (opened.has(cellIndex)) continue;
    const hits = worlds.filter(world => world.participants.some(a => a.cells.includes(cellIndex))).length;
    scores.push({ cellIndex, hitProbability: hits / worlds.length });
  }
  return scores;
}

export function chooseDynamicCell(scores: readonly DynamicCellScore[]): DynamicCellScore | null {
  if (!scores.length) return null;
  const value = (s: DynamicCellScore) => s.strategyScore ?? s.hitProbability;
  const maximum = Math.max(...scores.map(value));
  // Compare with the actual maximum, then take the lowest row-major index.
  return scores.filter(s => maximum - value(s) <= DYNAMIC_SCORE_EPSILON)
    .reduce((best, s) => s.cellIndex < best.cellIndex ? s : best);
}

export function analyzeDynamicRescue(state: DynamicRescueState, strategy: RescueStrategy = BALANCED_STRATEGY): DynamicRescueResult {
  return analyzeRescueWorlds(state, getPossibleWorlds(state), strategy);
}

/** Policy-only analysis of already generated/filtered worlds; useful when switching modes. */
export function analyzeRescueWorlds(state: DynamicRescueState, worlds: readonly RescueWorld[], strategy: RescueStrategy = BALANCED_STRATEGY): DynamicRescueResult {
  // An impossible observation history is a result state, not an exception.
  if (!worlds.length) return { status: "contradiction", worldCount: 0, scores: [], recommendation: null };
  if (strategy.type === "rarity-focus" && state.participants.every(p => p.kind === "pet")) {
    return { status: "strategy-unavailable", worldCount: worlds.length, scores: [], recommendation: null };
  }
  strategy = resolveTargetStrategy(state, worlds, strategy);
  if (strategy.type === "target" && !state.participants.some(p => p.id === strategy.participantId)) {
    return { status: "target-required", worldCount: worlds.length, scores: [], recommendation: null };
  }
  const scores = strategy.type === "balanced" ? scoreWorldsByHitProbability(worlds, state.observations)
    : scoreWorldsByStrategy(worlds, state, strategy);
  const recommendation = chooseDynamicCell(scores);
  // Conservative completion: no unopened cell can contain a participant in ANY
  // surviving world. A uniquely determined but partly unopened participant continues.
  if (!scores.some(s => s.hitProbability > 0)) {
    return { status: "complete", worldCount: worlds.length, scores, recommendation: null };
  }
  if (!recommendation || (recommendation.strategyScore ?? recommendation.hitProbability) === 0) {
    return { status: strategy.type === "target" ? "target-resolved" : "strategy-complete", worldCount: worlds.length, scores, recommendation: null };
  }
  return { status: "ready", worldCount: worlds.length, scores, recommendation };
}
