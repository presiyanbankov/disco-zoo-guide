import { PetSelector } from "../pets/PetSelector";
import { regionPosition } from "../regions/regionPresentation";
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
  petId?: string | null;
  onPet?: (id: string | null) => void;
};

export function RescueSetup({ regionId, selectedIds, animals, onRegion, onAnimal, onStart, petId = null, onPet = () => {} }: Props) {
  const candidates = animals.filter(a => a.regionId === regionId && !a.hidden && a.rarity !== "timeless");
  return <div className="rescue-setup">
    <section aria-labelledby="rescue-region-heading">
      <div className="rescue-section-heading"><h2 id="rescue-region-heading"><span>01</span> Region</h2><span className="eyebrow">7 UNLOCKED</span></div>
      <div className="rescue-regions">
        {REGION_PRESENTATION.map((region) => <button key={region.id} type="button" className={`rescue-region region-${region.id}`} aria-pressed={region.id === regionId} onClick={() => onRegion(region.id)}>
          <RegionLandscape region={region.id} /><span className="rescue-region-number">{regionPosition(region.id).group.toUpperCase()} / {String(regionPosition(region.id).number).padStart(2, "0")}</span><strong>{region.name}</strong>
        </button>)}
      </div>
    </section>
    <section aria-labelledby="rescue-animals-heading">
      <div className="rescue-section-heading"><h2 id="rescue-animals-heading"><span>02</span> Animals</h2><span className="eyebrow" aria-live="polite">{selectedIds.length} / {petId ? 2 : 3} SELECTED</span></div>
      <p className="rescue-functional-copy">Choose {petId ? "1-2" : "1-3"} animals that are definitely present.</p>
      {regionId ? <div className="rescue-animal-options">
        {candidates.map(animal => {
          const selected = selectedIds.includes(animal.id);
          return <button key={animal.id} type="button" className="rescue-animal-option" aria-pressed={selected} disabled={!selected && selectedIds.length >= (petId ? 2 : 3)} onClick={() => onAnimal(animal.id)} data-animal-id={animal.id}>
            <span className="rescue-option-art"><AnimalArtwork id={animal.id} name={animal.name} imagePath={animal.imagePath} /></span>
            <strong>{animal.name}</strong><span className="eyebrow">{animal.rarity}</span><span className="rescue-check" aria-hidden="true">{selected ? "✓" : "+"}</span>
          </button>;
        })}
      </div> : <div className="rescue-setup-pending">Select a region to see its six classic animals.</div>}
    </section>
    <PetSelector petId={petId} disabled={!regionId || selectedIds.length >= 3} disabledReason={!regionId ? "Select a region first." : "A pet allows at most two animals."} onPet={onPet} />
    <div className="rescue-start-row"><span>04 / Participants cannot overlap.</span><button className="rescue-primary rescue-start-cta" type="button" disabled={!selectedIds.length} onClick={onStart}>Start rescue <span aria-hidden="true">&#8599;</span></button></div>
  </div>;
}
