import type { AnimalPattern } from "../../types/game";
import { GridBoard, type BoardTile } from "./GridBoard";
import { BOARD_SIZE, inspectPattern } from "./gridPresentation";

export function PatternGrid({ pattern, animalName, demo = false }: { pattern?: AnimalPattern | null; animalName: string; demo?: boolean }) {
  const display = inspectPattern(pattern);
  const occupied = new Set(display.cells.map((cell) => cell.row * BOARD_SIZE + cell.col));
  const tiles: BoardTile[] = Array.from({ length: BOARD_SIZE ** 2 }, (_, index) => ({
    kind: occupied.has(index) ? "pattern" : "quiet",
    label: `Row ${Math.floor(index / BOARD_SIZE) + 1}, column ${index % BOARD_SIZE + 1}`,
  }));
  const coordinates = display.cells.map((cell) => `row ${cell.row + 1}, column ${cell.col + 1}`).join("; ");
  const ready = display.status === "ready";

  return (
    <section className={`guide-panel pattern-panel${!ready ? " panel-awaiting" : ""}`} aria-labelledby="pattern-title" data-pattern-status={display.status}>
      <div className="guide-panel-heading"><div><span className="eyebrow">01 / RECOGNIZE</span><h2 id="pattern-title">{demo ? "Example shape" : "Animal pattern"}</h2></div><span className="grid-meta">{ready ? `${display.cells.length} TILES` : "PENDING"}</span></div>
      <p className="guide-panel-description">{demo ? "An illustrative shape for checking the layout." : "The animal’s shape, separate from your search order."}</p>
      <GridBoard label={ready ? `${demo ? "Layout example" : animalName + " pattern"}. Occupied cells: ${coordinates}.` : `${animalName} pattern unavailable. No animal tiles are shown.`} tiles={tiles} />
      {ready ? <div className="grid-legend"><span className="legend-pixel" /><p>{demo ? "Example tile · not an animal pattern" : "Highlighted tiles form the animal’s shape."}</p></div>
        : <div className="grid-empty-note"><span className="empty-state-mark" aria-hidden="true">?</span><div><h3>{display.status === "invalid" ? "Pattern couldn’t be displayed" : "Pattern not supplied yet"}</h3><p>{display.status === "invalid" ? "The supplied tiles don’t fit this board. No replacement shape has been assumed." : "The shape will appear here once the animal’s pattern is available."}</p></div></div>}
    </section>
  );
}
