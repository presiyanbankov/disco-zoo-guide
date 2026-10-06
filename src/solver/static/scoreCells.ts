export type CellIndex = number;
export type Placement = CellIndex[];

export interface CellScore {
  cellIndex: CellIndex;
  hits: number;
}

export function scoreCells(
  placements: Placement[],
  excludedCells: CellIndex[] = []
): CellScore[] {
  const excluded = new Set(excludedCells);
  const scores: CellScore[] = [];

  for (let cellIndex = 0; cellIndex < 25; cellIndex++) {
    if (excluded.has(cellIndex)) {
      continue;
    }

    let hits = 0;

    for (const placement of placements) {
      if (placement.includes(cellIndex)) {
        hits++;
      }
    }

    scores.push({
      cellIndex,
      hits,
    });
  }

  return scores;
}

export function chooseBestCell(
  scores: CellScore[]
): CellScore {
  if (scores.length === 0) {
    throw new Error("No cells available to choose from");
  }

  return scores.reduce((best, current) => {
    if (current.hits > best.hits) {
      return current;
    }

    if (
      current.hits === best.hits &&
      current.cellIndex < best.cellIndex
    ) {
      return current;
    }

    return best;
  });
}
