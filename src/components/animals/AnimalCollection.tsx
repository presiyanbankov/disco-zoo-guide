"use client";
import { useProgress } from "../progress/ProgressProvider";
import { canViewAnimal } from "../progress/spoilerPreferences";
import { AnimalCard } from "./AnimalCard";
import { TimelessSlot } from "./TimelessSlot";
import type { AnimalCardPreview } from "./DEV_MOCK_ANIMALS";

const rarityLabels = ["common", "rare", "mythical"] as const;

export function AnimalCollection({ animals: records }: { animals: readonly AnimalCardPreview[] }) {
  const { preferences } = useProgress();
  const animals = records.filter(a => canViewAnimal(a, preferences));
  return (
    <section className="animal-collection" id="wildlife" aria-labelledby="wildlife-title">
      <div className="section-heading">
        <div><span className="eyebrow">COLLECTION</span><h2 id="wildlife-title">Animals<span>.</span></h2></div>
        <span className="collection-count">{String(animals.length).padStart(2, "0")} ANIMALS / 01 MYSTERY</span>
      </div>
      {rarityLabels.map((rarity) => {
        const group = animals.filter((animal) => animal.rarity === rarity);
        if (!group.length) return null;
        return (
          <section className={`animal-group group-${rarity}`} key={rarity} aria-labelledby={`${rarity}-title`}>
            <div className="rarity-heading"><h3 id={`${rarity}-title`}>{rarity}<span>{String(group.length).padStart(2, "0")}</span></h3><span className="rarity-rule" /></div>
            <div className="animal-grid">{group.map((animal) => <AnimalCard key={animal.id} animal={animal} index={animals.indexOf(animal)} />)}</div>
          </section>
        );
      })}
      <TimelessSlot />
    </section>
  );
}
