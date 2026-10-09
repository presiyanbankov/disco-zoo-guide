"use client";

import { useMemo, useState } from "react";
import { GridBoard, type BoardTile } from "../grid/GridBoard";
import { BOARD_SIZE } from "../grid/gridPresentation";
import { useProgress } from "../progress/ProgressProvider";
import { canViewAnimal } from "../progress/spoilerPreferences";
import type { AnimalGuidePresentation } from "../animals/animalGuidePresentation";
import { getRegionSearchPresentation } from "./regionSearchPresentation";
import type { RegionSearchPresentation } from "./regionSearchPresentation";

export function RegionSearch({ regionName, strategy: suppliedStrategy, animals }: { regionName: string; strategy?: RegionSearchPresentation; animals?: readonly AnimalGuidePresentation[] }) {
  const { preferences } = useProgress();
  // Only visible candidates enter the real solver; hidden Timeless cannot change numbers.
  const strategy = useMemo(() => animals ? getRegionSearchPresentation(animals.filter(a => canViewAnimal(a, preferences))) : suppliedStrategy, [animals, preferences, suppliedStrategy]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const ready = strategy?.status === "ready";
  const steps = new Map((ready ? strategy.steps : []).map(step => [step.cellIndex, step]));
  const inspected = activeCell === null ? undefined : steps.get(activeCell);
  const tiles: BoardTile[] = Array.from({ length: BOARD_SIZE ** 2 }, (_, index) => {
    const step = steps.get(index);
    return {
      kind: step ? step.step === 1 ? "first" : "step" : "quiet",
      number: step?.step,
      label: `${step ? `Search step ${step.step}, ` : ""}row ${Math.floor(index / BOARD_SIZE) + 1}, column ${index % BOARD_SIZE + 1}`,
    };
  });
  return <section className="region-search" aria-labelledby="region-search-title" data-region-search-status={ready ? "ready" : "pending"}>
    <div className="region-search-copy">
      <span className="eyebrow">RESCUE GUIDE</span>
      <h2 id="region-search-title">REGION SEARCH</h2>
      <p>Best opening sequence when the animal is unknown.</p>
      <p className="region-search-assumption">Assumes each animal is equally likely.</p>
      {ready ? <p className="region-search-assumption">Follow the numbers while every previous click is empty. Unnumbered cells are outside this sequence.</p>
        : <div className="region-search-pending"><span className="status-dot" aria-hidden="true" /><span>Sequence not available yet.</span></div>}
      {process.env.NODE_ENV === "development" && strategy?.error && <p>Development error: {strategy.error}</p>}
    </div>
    <div className={`guide-panel region-search-board${ready ? "" : " panel-awaiting"}`}>
      <div className="region-search-board-heading"><span className="eyebrow">5 × 5 SEARCH ORDER</span><span className="grid-meta">{ready ? `${strategy.steps.length} STEPS` : "PENDING"}</span></div>
      <GridBoard label={`${regionName} region search. ${ready ? `All ${strategy.steps.length} steps are visible.` : "Pending. No recommended cells yet."}`} tiles={tiles} interactive={ready} activeCell={activeCell} onInspect={setActiveCell} />
      {ready && <div className="grid-detail" aria-live="polite" aria-atomic="true">
        <span className="detail-step">{inspected ? String(inspected.step).padStart(2, "0") : "↗"}</span>
        <div><strong>{inspected ? `Step ${inspected.step}` : "Complete search sequence"}</strong>
          <p>{inspected ? `${(inspected.hitProbability * 100).toFixed(1)}% hit probability · ${inspected.activeAnimals} possible animals` : "Tap or focus a number for its probability."}</p>
        </div>
      </div>}
    </div>
  </section>;
}
