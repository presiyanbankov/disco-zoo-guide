import { Coordinate } from "../../types/game";

export type CellIndex = number;

export interface Coord {
  row: number;
  col: number;
}

export interface PatternBounds {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
  width: number;
  height: number;
}

export function indexToCoord(index: CellIndex): Coord {
  return {
    row: Math.floor(index / 5),
    col: index % 5,
  };
}

export function coordToIndex(row: number, col: number): CellIndex {
  return row * 5 + col;
}

export function getPatternBounds(pattern: Coordinate[]): PatternBounds {
  if (pattern.length === 0) {
    throw new Error("Pattern cannot be empty");
  }

  const rows = pattern.map((coord) => coord.row);
  const cols = pattern.map((coord) => coord.col);

  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);

  return {
    minRow,
    maxRow,
    minCol,
    maxCol,
    width: maxCol - minCol + 1,
    height: maxRow - minRow + 1,
  };
}

export function generatePlacements(
  pattern: Coordinate[]
): CellIndex[][] {
  const bounds = getPatternBounds(pattern);

  const localCoords = pattern.map(({ row, col }) => ({
    row: row - bounds.minRow,
    col: col - bounds.minCol,
  }));

  const placements: CellIndex[][] = [];

  const maxRowOffset = 5 - bounds.height;
  const maxColOffset = 5 - bounds.width;

  for (let rowOffset = 0; rowOffset <= maxRowOffset; rowOffset++) {
    for (let colOffset = 0; colOffset <= maxColOffset; colOffset++) {
      const placement = localCoords.map(({ row, col }) =>
        coordToIndex(
          row + rowOffset,
          col + colOffset
        )
      );

      placements.push(placement);
    }
  }

  return placements;
}
