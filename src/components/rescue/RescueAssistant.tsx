"use client";

import { useMemo, useState } from "react";
import { PET_SPECIES } from "../../data/pets";
import { animalParticipant, petParticipant, validateRescueSetup } from "./rescueParticipants";
import type { Animal } from "../../types/game";
import { analyzeRescueWorlds, getPossibleWorlds, applyObservation, createDynamicRescueState, resetObservations, undoObservation, type DynamicRescueState } from "../../solver/dynamic/dynamicRescueSolver";
import { REGION_PRESENTATION } from "../regions/regionPresentation";
import { BALANCED_STRATEGY, resolveTargetStrategy, rarityFocusParticipantIds, type RescueStrategy } from "../../solver/dynamic/rescueStrategy";
import { RescueSetup } from "./RescueSetup";
import { RescueBoard } from "./RescueBoard";
import type { RescueSetupContext } from "./rescueSetupContext";
import { resolveRescueSetupContext } from "./rescueSetupContext";
import { useProgress } from "../progress/ProgressProvider";
import { canViewAnimal, canViewRegion, getVisibleRegions } from "../progress/spoilerPreferences";
import { ProgressGuard } from "../progress/ProgressGuard";

export function RescueAssistant({ animals: allAnimals, initialContext }: { animals: readonly Animal[]; initialContext?: RescueSetupContext }) {
  const { preferences } = useProgress();
  const animals = allAnimals.filter(a => canViewAnimal(a, preferences));
  const regions = getVisibleRegions(REGION_PRESENTATION, preferences);
  const context = resolveRescueSetupContext(initialContext?.regionId ?? undefined, initialContext?.selectedIds[0], preferences);
  const [regionId, setRegionId] = useState<string | null>(() => context.regionId);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [...context.selectedIds]);
  const [petId, setPetId] = useState<string | null>(null);
  const [state, setState] = useState<DynamicRescueState | null>(null);
  const [strategy, setStrategy] = useState<RescueStrategy>(BALANCED_STRATEGY);
  const [targetTransition, setTargetTransition] = useState("");
  const [lastTarget, setLastTarget] = useState("");
  const [error, setError] = useState<string>();
  const selected = selectedIds.flatMap(id => { const a = animals.find(a => a.id === id && a.regionId === regionId && !a.hidden); return a ? [a] : []; });
  const pet = PET_SPECIES.find(p => p.id === petId);
  const participants = [...selected.map(animalParticipant), ...(pet ? [petParticipant(pet)] : [])];
  const worlds = useMemo(() => state ? getPossibleWorlds(state) : [], [state]);
  const effectiveStrategy = state ? resolveTargetStrategy(state, worlds, strategy) : strategy;
  const rarityParticipants = state && effectiveStrategy.type === "rarity-focus" ? rarityFocusParticipantIds(state, worlds) : [];
  const result = useMemo(() => state ? analyzeRescueWorlds(state, worlds, strategy) : null, [state, worlds, strategy]);
  const onStrategy = (type: RescueStrategy["type"]) => {
    setTargetTransition("");
    setStrategy(type === "target" ? { type, participantId: lastTarget } : { type });
  };
  const onTarget = (participantId: string) => { setTargetTransition(""); setLastTarget(participantId); setStrategy({ type: "target", participantId }); };
  function report(observation: Parameters<typeof applyObservation>[1]) {
    if (!state) return;
    const next = applyObservation(state, observation);
    const nextStrategy = resolveTargetStrategy(next, getPossibleWorlds(next), effectiveStrategy);
    if (effectiveStrategy.type === "target" && nextStrategy.type === "target" && nextStrategy.participantId !== effectiveStrategy.participantId) {
      const before = participants.find(p => p.id === effectiveStrategy.participantId)?.name;
      const after = participants.find(p => p.id === nextStrategy.participantId)?.name;
      setTargetTransition(`${before} complete \u2192 targeting ${after}`);
      setStrategy(nextStrategy); setLastTarget(nextStrategy.participantId);
    } else setTargetTransition("");
    setState(next);
  }
  function nextRescue() {
    setState(null); setSelectedIds([]); setPetId(null); setError(undefined); setTargetTransition("");
    if (strategy.type === "target") { setStrategy({ type: "target", participantId: "" }); setLastTarget(""); }
    requestAnimationFrame(() => {
      const control = regionId ? document.getElementById("rescue-animals-heading") : document.querySelector<HTMLElement>(".pet-disclosure-summary");
      control?.focus({ preventScroll: false });
    });
  }
  const region = REGION_PRESENTATION.find(r => r.id === regionId);

  function start() {
    try { const validation = validateRescueSetup(selected, pet ? [pet] : []); if (validation) throw new Error(validation); setState(createDynamicRescueState(participants)); setError(undefined); }
    catch (error) { setError(error instanceof Error ? error.message : String(error)); }
  }

  // A progress reduction must never leave a stale live roster/board visible.
  // Keep state behind the barrier so revealing again is non-destructive.
  const hiddenParticipant = allAnimals.find(a => a.regionId === regionId && selectedIds.includes(a.id) && !canViewAnimal(a, preferences));
  if (regionId && (!canViewRegion(regionId, preferences) || hiddenParticipant)) return <ProgressGuard regionId={regionId} timeless={hiddenParticipant?.rarity === "timeless"} onBack={() => { setRegionId(null); setSelectedIds([]); setPetId(null); setState(null); setError(undefined); }}>{null}</ProgressGuard>;

  return <div className={`rescue-assistant${regionId ? ` region-${regionId}` : ""}`}>
    {!state || !result ? <RescueSetup regionId={regionId} selectedIds={selectedIds} animals={animals} regions={regions}
      participants={participants} strategy={effectiveStrategy} onStrategy={onStrategy} onTarget={onTarget}
      petId={petId} onPet={id => { if (id === null || selectedIds.length < 3) { setPetId(id); if (id && !selectedIds.length && strategy.type === "rarity-focus") setStrategy(BALANCED_STRATEGY); } }}
      onRegion={id => { if (id === regionId || !regions.some(r => r.id === id)) return; setRegionId(id); setSelectedIds([]); setState(null); setStrategy(BALANCED_STRATEGY); setLastTarget(""); setError(undefined); }}
      onAnimal={id => {
        if (!animals.some(a => a.id === id && a.regionId === regionId && !a.hidden)) return;
        if (selectedIds.includes(id) && selectedIds.length === 1 && petId && strategy.type === "rarity-focus") setStrategy(BALANCED_STRATEGY);
        setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : ids.length < (petId ? 2 : 3) ? [...ids, id] : ids);
      }} onStart={start} />
      : <RescueBoard key={`${regionId}:${selectedIds.join(",")}`} regionName={selected.length ? region?.name ?? "" : "Pet rescue"} participants={participants} state={state} result={result} strategy={effectiveStrategy} onStrategy={onStrategy} onTarget={onTarget}
        onObservation={report} rarityParticipants={rarityParticipants} targetTransition={targetTransition} onNext={nextRescue}
        onUndo={() => { setTargetTransition(""); setState(previous => previous ? undoObservation(previous) : previous); }}
        onReset={() => { setTargetTransition(""); setState(previous => previous ? resetObservations(previous) : previous); }}
        onChange={() => setState(null)} />}
    {error && <p role="alert">{error}</p>}
  </div>;
}
