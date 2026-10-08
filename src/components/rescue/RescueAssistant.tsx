"use client";

import { useMemo, useState } from "react";
import { PET_SPECIES } from "../../data/pets";
import { animalParticipant, petParticipant, validateRescueSetup } from "./rescueParticipants";
import type { Animal } from "../../types/game";
import { analyzeRescueWorlds, getPossibleWorlds, applyObservation, createDynamicRescueState, resetObservations, undoObservation, type DynamicRescueState } from "../../solver/dynamic/dynamicRescueSolver";
import { REGION_PRESENTATION } from "../regions/regionPresentation";
import { BALANCED_STRATEGY, DEFAULT_RARITY_PRIORITIES, type PriorityValue, type RarityPriorityConfig, type RescueStrategy } from "../../solver/dynamic/rescueStrategy";
import { RescueSetup } from "./RescueSetup";
import { RescueBoard } from "./RescueBoard";

export function RescueAssistant({ animals }: { animals: readonly Animal[] }) {
  const [regionId, setRegionId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [petId, setPetId] = useState<string | null>(null);
  const [state, setState] = useState<DynamicRescueState | null>(null);
  const [strategy, setStrategy] = useState<RescueStrategy>(BALANCED_STRATEGY);
  const [priorities, setPriorities] = useState<RarityPriorityConfig>(DEFAULT_RARITY_PRIORITIES);
  const [lastTarget, setLastTarget] = useState("");
  const [error, setError] = useState<string>();
  const selected = animals.filter(a => a.regionId === regionId && selectedIds.includes(a.id) && !a.hidden && a.rarity !== "timeless");
  const pet = PET_SPECIES.find(p => p.id === petId);
  const participants = [...selected.map(animalParticipant), ...(pet ? [petParticipant(pet)] : [])];
  const worlds = useMemo(() => state ? getPossibleWorlds(state) : [], [state]);
  const result = useMemo(() => state ? analyzeRescueWorlds(state, worlds, strategy) : null, [state, worlds, strategy]);
  const onStrategy = (type: RescueStrategy["type"]) => setStrategy(type === "target" ? { type, participantId: lastTarget } : type === "rarity-priority" ? { type, priorities } : { type });
  const onPriority = (category: keyof RarityPriorityConfig, value: PriorityValue) => {
    const next = { ...priorities, [category]: value };
    setPriorities(next);
    setStrategy({ type: "rarity-priority", priorities: next });
  };
  const onTarget = (participantId: string) => { setLastTarget(participantId); setStrategy({ type: "target", participantId }); };
  const region = REGION_PRESENTATION.find(r => r.id === regionId);

  function start() {
    try { const validation = validateRescueSetup(selected, pet ? [pet] : []); if (validation) throw new Error(validation); setState(createDynamicRescueState(participants)); setError(undefined); }
    catch (error) { setError(error instanceof Error ? error.message : String(error)); }
  }

  return <div className={`rescue-assistant${regionId ? ` region-${regionId}` : ""}`}>
    {!state || !result ? <RescueSetup regionId={regionId} selectedIds={selectedIds} animals={animals}
      participants={participants} strategy={strategy} onStrategy={onStrategy} onTarget={onTarget} onPriority={onPriority}
      petId={petId} onPet={id => { if (id === null || selectedIds.length < 3) setPetId(id); }}
      onRegion={id => { if (id === regionId) return; setRegionId(id); setSelectedIds([]); setState(null); setStrategy(BALANCED_STRATEGY); setLastTarget(""); setError(undefined); }}
      onAnimal={id => {
        if (!animals.some(a => a.id === id && a.regionId === regionId && !a.hidden && a.rarity !== "timeless")) return;
        setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : ids.length < (petId ? 2 : 3) ? [...ids, id] : ids);
      }} onStart={start} />
      : <RescueBoard key={`${regionId}:${selectedIds.join(",")}`} regionName={selected.length ? region?.name ?? "" : "Pet rescue"} participants={participants} state={state} result={result} strategy={strategy} onStrategy={onStrategy} onTarget={onTarget} onPriority={onPriority}
        onObservation={observation => setState(previous => previous ? applyObservation(previous, observation) : previous)}
        onUndo={() => setState(previous => previous ? undoObservation(previous) : previous)}
        onReset={() => setState(previous => previous ? resetObservations(previous) : previous)}
        onChange={() => setState(null)} />}
    {error && <p role="alert">{error}</p>}
  </div>;
}
