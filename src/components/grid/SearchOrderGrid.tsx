"use client";

import { useState } from "react";
import { GridBoard, type BoardTile } from "./GridBoard";
import { BOARD_SIZE, inspectStrategy, type DisplayStrategy } from "./gridPresentation";

type Props = {
  animalId: string;
  animalName: string;
  strategy?: DisplayStrategy | null;
  demo?: boolean;
};

export function SearchOrderGrid({ animalId, animalName, strategy, demo = false }: Props) {
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const display = inspectStrategy(strategy, animalId);
  const ready = display.status === "ready";
  const stepsByCell = new Map(display.steps.map((step) => [step.cell.row * BOARD_SIZE + step.cell.col, step]));
  const activeStep = activeCell === null ? undefined : stepsByCell.get(activeCell);
  const tiles: BoardTile[] = Array.from({ length: BOARD_SIZE ** 2 }, (_, index) => {
    const step = stepsByCell.get(index);
    const position = `row ${Math.floor(index / BOARD_SIZE) + 1}, column ${index % BOARD_SIZE + 1}`;
    return { kind: step ? step.step === 1 ? "first" : "step" : "quiet", number: step?.step, label: `${demo ? "Example " : ""}${step ? `search step ${step.step}, ` : ""}${position}` };
  });

  return (
    <section className={`guide-panel search-panel${!ready ? " panel-awaiting" : ""}`} aria-labelledby="search-title" data-strategy-status={display.status}>
      <div className="guide-panel-heading"><div><span className="eyebrow">02 / SEARCH</span><h2 id="search-title">{demo ? "Example numbering" : ready ? "Optimal search order" : "Search order"}</h2></div><span className="grid-meta">{ready ? `${display.steps.length} STEPS` : "PENDING"}</span></div>
      <p className="guide-panel-description">{demo ? "Layout demo only. These numbers are not rescue advice." : ready ? "The complete sequence, ready to read at a glance." : "A place for the complete sequence once it’s available."}</p>
      <GridBoard label={`${demo ? "Development layout example" : animalName + " search order"}. ${ready ? "All " + display.steps.length + " steps are visible. Select a numbered tile for its coordinates." : "No strategy is available. No numbered recommendations are shown."}`} tiles={tiles} interactive={ready} activeCell={activeCell} onInspect={setActiveCell} />
      {ready ? <div className="grid-detail" aria-live="polite" aria-atomic="true">
        {activeStep ? <><span className="detail-step">{String(activeStep.step).padStart(2, "0")}</span><div><strong>{demo ? "Example " : ""}Step {activeStep.step}</strong><p>Row {activeStep.cell.row + 1} / Column {activeStep.cell.col + 1}</p></div></>
          : <><span className="detail-step" aria-hidden="true">↗</span><div><strong>Every step is already visible</strong><p>Tap or focus a number to inspect its position.</p></div></>}
      </div> : <div className="grid-empty-note"><span className="empty-state-mark" aria-hidden="true">—</span><div><h3>{display.status === "invalid" ? "Strategy couldn’t be displayed" : "Strategy not available yet"}</h3><p>{display.status === "invalid" ? "The supplied result doesn’t match this animal or board. No search order has been substituted." : "Numbered recommendations will appear when a strategy is supplied."}</p></div></div>}
      <div className="search-instructions"><span className="eyebrow">HOW TO READ THE ORDER</span><p>{demo ? "This demo only shows how numbered tiles look. It makes no claim about where to click." : <>Start with <strong>1</strong>. Move to <strong>2</strong> only if the first tile was empty, then <strong>3</strong> if both were empty. Follow the sequence while every previous click is a miss; once you hit an animal, use its pattern instead.</>}</p>{ready && !demo && <p className="search-caveat">A complete strategy is intended to reach this animal by the final numbered tile.</p>}<p className="search-caveat">Row and column labels count from 1. {demo ? "The example numbers illustrate ordering only." : "Unnumbered tiles are outside this sequence, not guaranteed empty."}</p></div>
    </section>
  );
}
