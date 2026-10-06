import { generateSearchSequence } from "../src/solver/static/staticSolver";

const singleCellPattern = {
  cells: [{ row: 0, col: 0 }],
};

const squarePattern = {
  cells: [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
  ],
};

const fullBoardPattern = {
  cells: Array.from({ length: 25 }, (_, index) => ({
    row: Math.floor(index / 5),
    col: index % 5,
  })),
};

console.log("=== SINGLE CELL ===");

const singleCellResult = generateSearchSequence(
  "test-single",
  singleCellPattern
);

console.log(singleCellResult);

console.log("=== SQUARE PATTERN ===");

const squarePatternResult = generateSearchSequence(
    "test-square",
    squarePattern
)

console.log(squarePatternResult);

console.log("\n=== FULL BOARD ===");

const fullBoardResult = generateSearchSequence(
  "test-full",
  fullBoardPattern
);

console.log(fullBoardResult);