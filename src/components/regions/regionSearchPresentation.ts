import type { AnimalPattern } from "../../types/game";
import { generateRegionSearchSequence, type RegionSearchStep } from "../../solver/static/regionSolver";
import { inspectPattern } from "../grid/gridPresentation";

export type RegionSearchPresentation = {
  status: "ready" | "pending";
  steps: readonly RegionSearchStep[];
  error?: string;
};

/** Rendering boundary only; all scoring and placement generation stay in the solver. */
export function getRegionSearchPresentation(
  animals: readonly { id: string; pattern?: AnimalPattern }[],
  generate: typeof generateRegionSearchSequence = generateRegionSearchSequence,
): RegionSearchPresentation {
  if (!animals.length || animals.some(a => inspectPattern(a.pattern).status !== "ready")) {
    return { status: "pending", steps: [] };
  }
  try {
    const result = generate(animals.map(a => ({ id: a.id, pattern: a.pattern! })));
    return { status: result.steps.length ? "ready" : "pending", steps: result.steps };
  } catch (error) {
    const development = process.env.NODE_ENV === "development";
    if (development) console.error("Region search sequence failed", error);
    return { status: "pending", steps: [], error: development ? error instanceof Error ? error.message : String(error) : undefined };
  }
}
