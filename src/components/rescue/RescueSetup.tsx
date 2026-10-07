import type { Animal } from "../../types/game";
import { AnimalArtwork } from "../animals/AnimalArtwork";
import { REGION_PRESENTATION } from "../regions/regionPresentation";
import { RegionLandscape } from "../regions/RegionLandscape";

type Props = {
  regionId: string | null;
  selectedIds: readonly string[];
  animals: readonly Animal[];
  onRegion: (id: string) => void;
  onAnimal: (id: string) => void;
  onStart: () => void;
};

export function RescueSetup({ regionId, selectedIds, animals, onRegion, onAnimal, onStart }: Props) {
  const candidates = animals.filter(a => a.regionId === regionId && !a.hidden && a.rarity !== "timeless");
  return <div className="rescue-setup">
    <section aria-labelledby="rescue-region-heading">
      <div className="rescue-section-heading"><h2 id="rescue-region-heading"><span>01</span> Region</h2><span className="eyebrow">7 UNLOCKED</span></div>
      <div className="rescue-regions">
        {REGION_PRESENTATION.map((region, i) => <button key={region.id} type="button" className={`rescue-region region-${region.id}`} aria-pressed={region.id === regionId} onClick={() => onRegion(region.id)}>
          <RegionLandscape region={region.id} /><span className="rescue-region-number">{String(i + 1).padStart(2, "0")}</span><strong>{region.name}</strong>
        </button>)}
      </div>
    </section>
    <section aria-labelledby="rescue-animals-heading">
      <div className="rescue-section-heading"><h2 id="rescue-animals-heading"><span>02</span> Animals</h2><span className="eyebrow" aria-live="polite">{selectedIds.length} / 3 SELECTED</span></div>
      <p className="rescue-functional-copy">Choose 1–3 animals that are definitely present.</p>
      {regionId ? <div className="rescue-animal-options">
        {candidates.map(animal => {
          const selected = selectedIds.includes(animal.id);
          return <button key={animal.id} type="button" className="rescue-animal-option" aria-pressed={selected} disabled={!selected && selectedIds.length === 3} onClick={() => onAnimal(animal.id)} data-animal-id={animal.id}>
            <span className="rescue-option-art"><AnimalArtwork id={animal.id} name={animal.name} imagePath={animal.imagePath} /></span>
            <strong>{animal.name}</strong><span className="eyebrow">{animal.rarity}</span><span className="rescue-check" aria-hidden="true">{selected ? "✓" : "+"}</span>
          </button>;
        })}
      </div> : <div className="rescue-setup-pending">Select a region to see its six classic animals.</div>}
      <div className="rescue-start-row"><span>Animals cannot overlap.</span><button className="rescue-primary" type="button" disabled={!selectedIds.length} onClick={onStart}>Start rescue <span aria-hidden="true">↗</span></button></div>
    </section>
  </div>;
}
