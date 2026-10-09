import type { DynamicCellScore, DynamicRescueState, RescueParticipant, RescueWorld } from "./dynamicRescueSolver";

export type RescueStrategy =
  | { type: "balanced" }
  | { type: "finish-found" }
  | { type: "target"; participantId: string }
  | { type: "rarity-focus" };

export const RARITY_FOCUS_STRATEGY: RescueStrategy = { type: "rarity-focus" };

/** A participant is complete only when no surviving world has an unopened tile.
 * Knowing a placement alone does not mean its tiles have been reported. */
export function resolvedParticipantIds(state: DynamicRescueState, worlds: readonly RescueWorld[]): string[] {
  if (!worlds.length) return [];
  const opened = new Set(state.observations.map(o => o.cellIndex));
  return state.participants.filter(p => !worlds.some(w => w.participants.some(a =>
    a.participantId === p.id && a.cells.some(c => !opened.has(c))))).map(p => p.id);
}

/** Policy progression only: observations and world assignments are never changed.
 * Advance through original selection order, skipping completed participants. */
export function resolveTargetStrategy(state: DynamicRescueState, worlds: readonly RescueWorld[], strategy: RescueStrategy): RescueStrategy {
  if (strategy.type !== "target" || !worlds.length || !state.participants.some(p => p.id === strategy.participantId)) return strategy;
  const resolved = new Set(resolvedParticipantIds(state, worlds));
  if (!resolved.has(strategy.participantId)) return strategy;
  const next = state.participants.find(p => !resolved.has(p.id));
  return next ? { type: "target", participantId: next.id } : strategy;
}

export const BALANCED_STRATEGY: RescueStrategy = { type: "balanced" };

/** Rarity Focus is an ordered tier policy, not numeric rarity weighting.
 * All unresolved animals in the highest tier participate together. Only when
 * every normal animal is complete do remaining pets become cleanup targets. */
export function rarityFocusParticipantIds(state: DynamicRescueState, worlds: readonly RescueWorld[]): string[] {
  if (!worlds.length) return [];
  const resolved = new Set(resolvedParticipantIds(state, worlds));
  const unresolved = state.participants.filter(p => !resolved.has(p.id));
  const animals = unresolved.filter(p => p.kind === "animal");
  // Timeless shares the Rare tier; neither receives a separate priority bonus.
  for (const tier of [["mythical"], ["rare", "timeless"], ["common"]] as const) {
    const candidates = animals.filter(p => tier.some(rarity => rarity === (p.animalRarity ?? "common")));
    if (candidates.length) return candidates.map(p => p.id);
  }
  return unresolved.filter(p => p.kind === "pet").map(p => p.id);
}

/** Policy weights do not change world likelihoods or observation semantics. */
export function participantStrategyWeight(participant: RescueParticipant, state: DynamicRescueState, strategy: RescueStrategy, activeRarityIds: readonly string[] = []): number {
  switch (strategy.type) {
    case "balanced": return 1;
    case "finish-found": return state.observations.some(o => o.type === "hit" && o.participantId === participant.id) ? 3 : 1;
    case "target": return participant.id === strategy.participantId ? 1 : 0;
    case "rarity-focus":
      return activeRarityIds.includes(participant.id) ? 1 : 0;
  }
}

/** Weighted participant marginals over uniform surviving, non-overlapping worlds.
 * hitProbability stays the actual ANY-participant probability, never a weighted score.
 */
export function scoreWorldsByStrategy(worlds: readonly RescueWorld[], state: DynamicRescueState, strategy: RescueStrategy): DynamicCellScore[] {
  if (!worlds.length) return [];
  const opened = new Set(state.observations.map(o => o.cellIndex));
  const activeRarityIds = strategy.type === "rarity-focus" ? rarityFocusParticipantIds(state, worlds) : [];
  const weights = new Map(state.participants.map(p => [p.id, participantStrategyWeight(p, state, strategy, activeRarityIds)]));
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
