"use client";
import { useRef } from "react";
import { PET_SPECIES } from "../../data/pets";
import { PetArtwork } from "./PetArtwork";

type Props = { petId: string | null; disabled: boolean; disabledReason: string; onPet: (id: string | null) => void };
export function PetSelector({ petId, disabled, disabledReason, onPet }: Props) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  const selected = PET_SPECIES.find(pet => pet.id === petId);
  function choose(id: string | null) {
    onPet(id);
    if (disclosure.current) {
      disclosure.current.open = false;
      disclosure.current.querySelector("summary")?.focus();
    }
  }
  return <section className="optional-pet-section" aria-labelledby="rescue-pet-heading">
    <details className="pet-disclosure" data-pet-selected={!!selected} ref={disclosure}>
      <summary className="pet-disclosure-summary">
        <h2 id="rescue-pet-heading"><span>03</span> Pet</h2>
        <span className="pet-current" aria-live="polite">{selected && <PetArtwork name={selected.name} imagePath={selected.imagePath} />}<strong>{selected?.name ?? "None"}</strong><span className="pet-chevron" aria-hidden="true">&#8964;</span></span>
      </summary>
      <div className="pet-disclosure-content">
        <p className="rescue-functional-copy">{disabled ? disabledReason : "Select a species definitely present. Rescue a pet on its own or with up to two animals."}</p>
        <div className="rescue-pet-options">
          <button type="button" className="rescue-pet-option" aria-pressed={petId === null} onClick={() => choose(null)}><span className="pet-none" aria-hidden="true">&#8212;</span><strong>None</strong>{petId === null && <span className="pet-choice-check" aria-hidden="true">&#10003;</span>}</button>
          {PET_SPECIES.map(pet => <button key={pet.id} type="button" className="rescue-pet-option" data-pet-id={pet.id} aria-pressed={petId === pet.id} disabled={disabled} onClick={() => choose(petId === pet.id ? null : pet.id)}><PetArtwork name={pet.name} imagePath={pet.imagePath} /><strong>{pet.name}</strong>{petId === pet.id && <span className="pet-choice-check" aria-hidden="true">&#10003;</span>}</button>)}
        </div>
      </div>
    </details>
  </section>;
}
