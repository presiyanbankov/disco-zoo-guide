import type { AnimalPattern, Coordinate, SearchStep, StaticSearchResult } from "../../types/game";

export const BOARD_SIZE = 5;

// Display adapter only. It checks safe rendering, never scores cells or places animals.
export type DisplaySearchStep = Pick<SearchStep, "step" | "cell"> & Partial<Pick<SearchStep, "probability">>;
export type DisplayStrategy = Pick<StaticSearchResult, "animalId"> & { steps: readonly DisplaySearchStep[] };
export type StrategyDisplay =
  | { status: "ready"; steps: readonly DisplaySearchStep[] }
  | { status: "missing" | "invalid"; steps: readonly [] };
export type PatternDisplay =
  | { status: "ready"; cells: readonly Coordinate[] }
  | { status: "missing" | "invalid"; cells: readonly [] };

function isBoardCoordinate(cell: Coordinate | null | undefined): cell is Coordinate {
  return !!cell && Number.isInteger(cell.row) && Number.isInteger(cell.col)
    && cell.row >= 0 && cell.row < BOARD_SIZE && cell.col >= 0 && cell.col < BOARD_SIZE;
}

export function inspectPattern(pattern?: AnimalPattern | null): PatternDisplay {
  if (!pattern) return { status: "missing", cells: [] };
  if (!Array.isArray(pattern.cells) || !pattern.cells.length || pattern.cells.length > BOARD_SIZE ** 2) {
    return { status: "invalid", cells: [] };
  }
  const cells = new Set<number>();
  for (const cell of pattern.cells) {
    if (!isBoardCoordinate(cell)) return { status: "invalid", cells: [] };
    const index = cell.row * BOARD_SIZE + cell.col;
    if (cells.has(index)) return { status: "invalid", cells: [] };
    cells.add(index);
  }
  return { status: "ready", cells: pattern.cells };
}

export function inspectStrategy(strategy: DisplayStrategy | null | undefined, animalId: string): StrategyDisplay {
  if (!strategy) return { status: "missing", steps: [] };
  if (strategy.animalId !== animalId || !Array.isArray(strategy.steps)
    || !strategy.steps.length || strategy.steps.length > BOARD_SIZE ** 2) {
    return { status: "invalid", steps: [] };
  }
  // Sorting the supplied step labels is presentation, not a generated search order.
  if (strategy.steps.some((step) => !step || !Number.isInteger(step.step))) {
    return { status: "invalid", steps: [] };
  }
  const steps = [...strategy.steps].sort((a, b) => a.step - b.step);
  const cells = new Set<number>();
  for (const [index, step] of steps.entries()) {
    if (step.step !== index + 1 || !isBoardCoordinate(step.cell)) return { status: "invalid", steps: [] };
    const cellIndex = step.cell.row * BOARD_SIZE + step.cell.col;
    if (cells.has(cellIndex)) return { status: "invalid", steps: [] };
    cells.add(cellIndex);
  }
  return { status: "ready", steps };
}
