import type { AnimalPattern, StaticSearchResult } from "../../types/game";
import type { AnimalGuidePresentation } from "./animalGuidePresentation";
import { PatternGrid } from "../grid/PatternGrid";
import { SearchOrderGrid } from "../grid/SearchOrderGrid";

type Props = {
  animalId: string;
  animalName: string;
  pattern?: AnimalPattern | null;
  strategy?: StaticSearchResult | null;
  strategyUnavailableReason?: AnimalGuidePresentation["strategyUnavailableReason"];
  strategyError?: string;
};

export function AnimalGuideGrids({ animalId, animalName, pattern, strategy, strategyUnavailableReason, strategyError }: Props) {
  return (
    <section className="animal-guide-grids" id="rescue-guide" aria-label={`${animalName} rescue guide`}>
      <div className="guide-grid-panels" id="guide-grid-panels">
        <PatternGrid pattern={pattern} animalName={animalName} />
        <SearchOrderGrid key={animalId} animalId={animalId} animalName={animalName} strategy={strategy} unavailableReason={strategyUnavailableReason} developmentError={strategyError} />
      </div>
    </section>
  );
}
