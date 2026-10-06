import {
  AnimalPattern,
  StaticSearchResult,
} from "../../types/game";

import {
  generatePlacements,
  indexToCoord,
} from "./generatePlacements";

import {
  chooseBestCell,
  scoreCells,
} from "./scoreCells";

/**
 * OWNER IMPLEMENTATION.
 *
 * Codex/AI agents must not implement or modify this algorithm.
 */
export function generateSearchSequence(
  animalId: string,
  pattern: AnimalPattern
): StaticSearchResult {
  let remainingPlacements = generatePlacements(pattern.cells);

  const selectedCells: number[] = [];
  const steps = [];

  let stepNumber = 1;

  while (remainingPlacements.length > 0) {
    const placementsBeforeClick = remainingPlacements.length;

    const scores = scoreCells(
      remainingPlacements,
      selectedCells
    );

    const bestCell = chooseBestCell(scores);

    const coord = indexToCoord(bestCell.cellIndex);

    steps.push({
      step: stepNumber,
      cell: {
        row: coord.row,
        col: coord.col,
      },
      probability:
        bestCell.hits / placementsBeforeClick,
    });

    selectedCells.push(bestCell.cellIndex);

    remainingPlacements = remainingPlacements.filter(
      (placement) =>
        !placement.includes(bestCell.cellIndex)
    );

    stepNumber++;
  }

  return {
    animalId,
    steps,
  };
}