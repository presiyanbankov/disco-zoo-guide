"use client";

import { useState } from "react";
import type { AnimalPattern, StaticSearchResult } from "../../types/game";
import { PatternGrid } from "../grid/PatternGrid";
import { SearchOrderGrid } from "../grid/SearchOrderGrid";
import { DEV_MOCK_PATTERN, DEV_MOCK_STRATEGY } from "../grid/DEV_MOCK_STRATEGY";

type Props = {
  animalId: string;
  animalName: string;
  pattern?: AnimalPattern | null;
  strategy?: StaticSearchResult | null;
};

export function AnimalGuideGrids({ animalId, animalName, pattern, strategy }: Props) {
  const [showDemo, setShowDemo] = useState(false);
  const demo = process.env.NODE_ENV === "development" && showDemo;
  return (
    <section className="animal-guide-grids" id="rescue-guide" aria-label={`${animalName} rescue guide`}>
      {process.env.NODE_ENV === "development" && <div className="development-demo-control">
        <div><span className="eyebrow">DEVELOPMENT ONLY</span><p>Preview the grid design with illustrative tiles.</p></div>
        <button type="button" className="demo-toggle" aria-pressed={demo} aria-controls="guide-grid-panels" onClick={() => setShowDemo(!showDemo)}>{demo ? "Hide layout demo" : "Show layout demo"}<span aria-hidden="true">{demo ? "−" : "+"}</span></button>
      </div>}
      {demo && <div className="demo-disclosure" role="status"><strong>LAYOUT DEMO · NOT A RESCUE STRATEGY</strong><p>These example tiles are not {animalName}’s pattern or an optimal search order. No solver was used.</p></div>}
      <div className="guide-grid-panels" id="guide-grid-panels">
        <PatternGrid pattern={demo ? DEV_MOCK_PATTERN : pattern} animalName={animalName} demo={demo} />
        <SearchOrderGrid key={demo ? "demo" : animalId} animalId={demo ? DEV_MOCK_STRATEGY.animalId : animalId} animalName={animalName} strategy={demo ? DEV_MOCK_STRATEGY : strategy} demo={demo} />
      </div>
    </section>
  );
}
