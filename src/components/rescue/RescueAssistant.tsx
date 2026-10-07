"use client";

import { useMemo, useState } from "react";
import type { Animal } from "../../types/game";
import { analyzeDynamicRescue, applyObservation, createDynamicRescueState, resetObservations, undoObservation, type DynamicRescueState } from "../../solver/dynamic/dynamicRescueSolver";
import { REGION_PRESENTATION } from "../regions/regionPresentation";
import { RescueSetup } from "./RescueSetup";
import { RescueBoard } from "./RescueBoard";

export function RescueAssistant({ animals }: { animals: readonly Animal[] }) {
  const [regionId, setRegionId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [state, setState] = useState<DynamicRescueState | null>(null);
  const [error, setError] = useState<string>();
  const selected = animals.filter(a => a.regionId === regionId && selectedIds.includes(a.id) && !a.hidden && a.rarity !== "timeless");
  const result = useMemo(() => state ? analyzeDynamicRescue(state) : null, [state]);
  const region = REGION_PRESENTATION.find(r => r.id === regionId);

  function start() {
    try { setState(createDynamicRescueState(selected)); setError(undefined); }
    catch (error) { setError(error instanceof Error ? error.message : String(error)); }
  }

  return <div className={`rescue-assistant${regionId ? ` region-${regionId}` : ""}`}>
    {!state || !result ? <RescueSetup regionId={regionId} selectedIds={selectedIds} animals={animals}
      onRegion={id => { setRegionId(id); setSelectedIds([]); setError(undefined); }}
      onAnimal={id => {
        if (!animals.some(a => a.id === id && a.regionId === regionId && !a.hidden && a.rarity !== "timeless")) return;
        setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : ids.length < 3 ? [...ids, id] : ids);
      }} onStart={start} />
      : <RescueBoard key={`${regionId}:${selectedIds.join(",")}`} regionName={region?.name ?? ""} animals={selected} state={state} result={result}
        onObservation={observation => setState(previous => previous ? applyObservation(previous, observation) : previous)}
        onUndo={() => setState(previous => previous ? undoObservation(previous) : previous)}
        onReset={() => setState(previous => previous ? resetObservations(previous) : previous)}
        onChange={() => setState(null)} />}
    {error && <p role="alert">{error}</p>}
  </div>;
}
