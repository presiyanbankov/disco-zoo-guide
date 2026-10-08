import type { DynamicCellScore, DynamicRescueState, RescueParticipant, RescueWorld } from "./dynamicRescueSolver";

export type RescueStrategy =
  | { type: "balanced" }
  | { type: "finish-found" }
  | { type: "target"; participantId: string }
  | { type: "rarity-first" };

export const BALANCED_STRATEGY: RescueStrategy = { type: "balanced" };

/** Policy weights do not change world likelihoods or observation semantics. */
export function participantStrategyWeight(participant: RescueParticipant, state: DynamicRescueState, strategy: RescueStrategy): number {
  switch (strategy.type) {
    case "balanced": return 1;
    case "finish-found": return state.observations.some(o => o.type === "hit" && o.participantId === participant.id) ? 3 : 1;
    case "target": return participant.id === strategy.participantId ? 1 : 0;
    case "rarity-first":
      if (participant.kind === "pet") return 0;
      // Legacy callers without rarity metadata remain common-weight participants.
      return participant.animalRarity === "mythical" ? 3 : participant.animalRarity === "rare" ? 2 : 1;
  }
}

/** Weighted participant marginals over uniform surviving, non-overlapping worlds.
 * hitProbability stays the actual ANY-participant probability, never a weighted score.
 */
export function scoreWorldsByStrategy(worlds: readonly RescueWorld[], state: DynamicRescueState, strategy: RescueStrategy): DynamicCellScore[] {
  if (!worlds.length) return [];
  const opened = new Set(state.observations.map(o => o.cellIndex));
  const weights = new Map(state.participants.map(p => [p.id, participantStrategyWeight(p, state, strategy)]));
  const hits = Array<number>(25).fill(0);
  const totals = Array<number>(25).fill(0);
  for (const world of worlds) {
    for (const placement of world.participants) {
      for (const cell of placement.cells) {
        if (opened.has(cell)) continue;
        // No overlap means each occupied cell contributes exactly one hit per world.
        hits[cell]++;
        totals[cell] += weights.get(placement.participantId) ?? 0;
      }
    }
  }
  return hits.flatMap((count, cellIndex) => opened.has(cellIndex) ? [] : [{
    cellIndex, hitProbability: count / worlds.length, strategyScore: totals[cellIndex] / worlds.length,
  }]);
}
