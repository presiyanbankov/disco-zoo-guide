import { BALANCED_STRATEGY, type RescueStrategy } from "../../solver/dynamic/rescueStrategy";
import { StrategySelector } from "./StrategySelector";
import { animalParticipant, petParticipant, validateRescueSetup, type DisplayParticipant } from "./rescueParticipants";
import { PET_SPECIES } from "../../data/pets";
import { PetSelector } from "../pets/PetSelector";
import { regionPosition } from "../regions/regionPresentation";
import type { Animal } from "../../types/game";
import { AnimalArtwork } from "../animals/AnimalArtwork";
import { REGION_PRESENTATION } from "../regions/regionPresentation";
import { RegionLandscape } from "../regions/RegionLandscape";

type Props = {
  strategy?: RescueStrategy;
  participants?: readonly DisplayParticipant[];
  onStrategy?: (type: RescueStrategy["type"]) => void;
  onTarget?: (id: string) => void;
  regionId: string | null;
  selectedIds: readonly string[];
  animals: readonly Animal[];
  onRegion: (id: string) => void;
  onAnimal: (id: string) => void;
  onStart: () => void;
  petId?: string | null;
  onPet?: (id: string | null) => void;
};

export function RescueSetup({ regionId, selectedIds, animals, onRegion, onAnimal, onStart, petId = null, onPet = () => {}, strategy = BALANCED_STRATEGY, participants, onStrategy = () => {}, onTarget = () => {} }: Props) {
  const candidates = animals.filter(a => a.regionId === regionId && !a.hidden && a.rarity !== "timeless");
  const pet = PET_SPECIES.find(p => p.id === petId);
  const targets = participants ?? [...candidates.filter(a => selectedIds.includes(a.id)).map(animalParticipant), ...(pet ? [petParticipant(pet)] : [])];
  const setupError = validateRescueSetup(candidates.filter(a => selectedIds.includes(a.id)), pet ? [pet] : []);
  const regionRequired = !!selectedIds.length && !regionId;
  const strategyUnavailable = strategy.type === "rarity-focus" && !targets.some(p => p.kind === "animal");
  const targetRequired = strategy.type === "target" && !targets.some(p => p.id === strategy.participantId);
  return <div className="rescue-setup">
    <section aria-labelledby="rescue-region-heading">
      <div className="rescue-section-heading"><h2 id="rescue-region-heading"><span>01</span> Region</h2><span className="eyebrow">7 UNLOCKED</span></div>
      <p className="rescue-functional-copy">Choose a region for animals. Pet-only rescues do not need a region.</p>
      <div className="rescue-regions">
        {REGION_PRESENTATION.map((region) => <button key={region.id} type="button" className={`rescue-region region-${region.id}`} aria-pressed={region.id === regionId} onClick={() => onRegion(region.id)}>
          <RegionLandscape region={region.id} /><span className="rescue-region-number">{regionPosition(region.id).group.toUpperCase()} / {String(regionPosition(region.id).number).padStart(2, "0")}</span><strong>{region.name}</strong>
        </button>)}
      </div>
    </section>
    <section aria-labelledby="rescue-animals-heading">
      <div className="rescue-section-heading"><h2 id="rescue-animals-heading" tabIndex={-1}><span>02</span> Animals</h2><span className="eyebrow" aria-live="polite">{selectedIds.length} / {petId ? 2 : 3} SELECTED</span></div>
      <p className="rescue-functional-copy">Choose {petId ? "0-2" : "1-3"} animals that are definitely present.</p>
      {regionId ? <div className="rescue-animal-options">
        {candidates.map(animal => {
          const selected = selectedIds.includes(animal.id);
          return <button key={animal.id} type="button" className="rescue-animal-option" aria-pressed={selected} disabled={!selected && selectedIds.length >= (petId ? 2 : 3)} onClick={() => onAnimal(animal.id)} data-animal-id={animal.id}>
            <span className="rescue-option-art"><AnimalArtwork id={animal.id} name={animal.name} imagePath={animal.imagePath} /></span>
            <strong>{animal.name}</strong><span className="eyebrow">{animal.rarity}</span><span className="rescue-check" aria-hidden="true">{selected ? "✓" : "+"}</span>
          </button>;
        })}
      </div> : <div className="rescue-setup-pending">Select a region to see its six classic animals, or choose a pet below.</div>}
    </section>
    <PetSelector petId={petId} disabled={selectedIds.length >= 3} disabledReason="A pet allows at most two animals." onPet={onPet} />
    <StrategySelector strategy={strategy} participants={targets} onStrategy={onStrategy} onTarget={onTarget} />
    <div className="rescue-start-row"><span>05 / Participants cannot overlap.</span><button className="rescue-primary rescue-start-cta" type="button" disabled={!!setupError || regionRequired || targetRequired || strategyUnavailable} onClick={onStart}>Start rescue <span aria-hidden="true">&#8599;</span></button></div>
  </div>;
}
