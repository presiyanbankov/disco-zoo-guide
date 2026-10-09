import { BALANCED_STRATEGY, type RescueStrategy } from "../../solver/dynamic/rescueStrategy";
import { StrategySelector, STRATEGY_OPTIONS } from "./StrategySelector";
import { useEffect, useRef, useState } from "react";
import type { DisplayParticipant } from "./rescueParticipants";
import type { DynamicRescueResult, DynamicRescueState, RescueObservation } from "../../solver/dynamic/dynamicRescueSolver";
import { ParticipantArtwork } from "./ParticipantArtwork";
import { audio } from "../audio/soundManager";
import { ResultSelector } from "./ResultSelector";

type Props = {
  strategy?: RescueStrategy;
  onStrategy?: (type: RescueStrategy["type"]) => void;
  onTarget?: (id: string) => void;
  regionName: string;
  participants: readonly DisplayParticipant[];
  state: DynamicRescueState;
  result: DynamicRescueResult;
  onObservation: (observation: RescueObservation) => void;
  onUndo: () => void;
  onReset: () => void;
  onChange: () => void;
  onNext?: () => void;
  targetTransition?: string;
  rarityParticipants?: readonly string[];
};

export function RescueBoard({ regionName, participants, state, result, onObservation, onUndo, onReset, onChange, onNext = onChange, targetTransition = "", rarityParticipants = [], strategy = BALANCED_STRATEGY, onStrategy = () => {}, onTarget = () => {} }: Props) {
  const [pending, setPending] = useState<{ cellIndex: number; anchor: { left: number; top: number } } | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const livePanel = useRef<HTMLElement>(null);
  const recovery = useRef<HTMLButtonElement>(null);
  const completionAction = useRef<HTMLButtonElement>(null);
  const recommendation = result.recommendation;
  const resolved = result.status === "contradiction" ? [] : participants.filter(p => new Set(state.observations.filter(o => o.type === "hit" && o.participantId === p.id).map(o => o.cellIndex)).size === p.pattern.cells.length).map(p => p.id);

  const found = new Set(state.observations.flatMap(o => o.type === "hit" ? [o.participantId] : []));
  const rarityParticipant = participants.find(p => rarityParticipants.includes(p.id));
  const raritySummary = rarityParticipant?.kind === "pet" ? "Finishing pet" : rarityParticipant ? `Priority: ${rarityParticipant.animalRarity === "rare" || rarityParticipant.animalRarity === "timeless" ? "Rare + Timeless" : (rarityParticipant.animalRarity ?? "common").replace(/^./, c => c.toUpperCase())}` : "Mythical, then Rare + Timeless, then Common.";
  const targetName = strategy.type === "target" ? participants.find(p => p.id === strategy.participantId)?.name : undefined;
  const statusText = result.status === "contradiction" ? "Results don't match any possible layout."
    : result.status === "complete" ? "RESCUE COMPLETE"
    : result.status === "strategy-unavailable" ? "Rarity Focus requires an animal"
    : result.status === "strategy-complete" ? "Animal tiles reported"
    : result.status === "target-required" ? "Select a target" : "Target complete";
  const observations = new Map(state.observations.map(o => [o.cellIndex, o]));
  const lastFocusedObservationCount = useRef<number | null>(null);
  useEffect(() => {
    // Mode changes keep focus on the strategy control; reporting/undo/reset focuses the board.
    if (lastFocusedObservationCount.current === state.observations.length) return;
    lastFocusedObservationCount.current = state.observations.length;
    if (result.status === "contradiction") recovery.current?.focus({ preventScroll: true });
    else if (result.status === "complete") completionAction.current?.focus({ preventScroll: true });
    else if (recommendation) buttons.current[recommendation.cellIndex]?.focus({ preventScroll: true });
    else if (result.status === "target-resolved") livePanel.current?.querySelector<HTMLButtonElement>('[data-target-id][aria-pressed="true"]')?.focus({ preventScroll: true });
  }, [state.observations.length, recommendation, result.status]);

  return <section ref={livePanel} className="rescue-live" data-rescue-status={result.status} aria-labelledby="live-rescue-title">
    <div className="rescue-live-heading"><div><span className="eyebrow">LIVE RESCUE</span><h2 id="live-rescue-title">{regionName}</h2></div><button className="rescue-secondary" onClick={onChange}>Change setup</button></div>
    {result.status !== "complete" && <StrategySelector live strategy={strategy} participants={participants} onStrategy={onStrategy} onTarget={onTarget} resolvedIds={resolved} />}
    <div className="rescue-live-layout">
      <div className="rescue-live-board-panel">
        <div className="rescue-recommendation" aria-live="polite" aria-atomic="true">
          <span className="eyebrow">{result.status === "ready" ? "NEXT CELL" : "RESCUE STATUS"}</span>
          <strong>{recommendation ? `Row ${Math.floor(recommendation.cellIndex / 5) + 1} / Column ${recommendation.cellIndex % 5 + 1}` : statusText}</strong>
        </div>
        {result.status === "contradiction" && <div className="rescue-recovery-panel" role="alert"><p>Check the last result or undo it.</p><button ref={recovery} className="rescue-recovery-action" onClick={() => { onUndo(); }}>Undo last result</button></div>}
        {result.status === "complete" && <div className="rescue-completion-panel" role="status"><p>All participant tiles reported.</p><button ref={completionAction} className="rescue-primary rescue-next-cta" onClick={onNext}>Next Rescue <span aria-hidden="true">&#8599;</span></button></div>}
        <div className="board-frame dynamic-board-frame">
          <div className="board-columns" aria-hidden="true">{[1, 2, 3, 4, 5].map(n => <span key={n}>{n}</span>)}</div>
          <div className="board-rows" aria-hidden="true">{[1, 2, 3, 4, 5].map(n => <span key={n}>{n}</span>)}</div>
          <div className="dynamic-rescue-grid" tabIndex={-1} role="group" aria-label="Live rescue board, five rows and five columns">
            {Array.from({ length: 25 }, (_, cellIndex) => {
              const observation = observations.get(cellIndex);
              const animal = observation?.type === "hit" ? participants.find(a => a.id === observation.participantId) : undefined;
              const recommended = cellIndex === recommendation?.cellIndex;
              const status = observation ? animal ? "animal" : "empty" : "unopened";
              return <button key={cellIndex} ref={node => { buttons.current[cellIndex] = node; }} type="button"
                className={`dynamic-cell cell-${status}${recommended ? " cell-recommended" : ""}`}
                data-cell-index={cellIndex} data-cell-state={status} data-recommended={recommended || undefined}
                disabled={!!observation || result.status !== "ready"}
                data-participant-kind={animal?.kind}
                aria-label={`Row ${Math.floor(cellIndex / 5) + 1}, column ${cellIndex % 5 + 1}: ${animal ? animal.name : observation ? "empty" : recommended ? "recommended" : "unopened"}`}
                onClick={event => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setPending({ cellIndex, anchor: { left: Math.max(16, Math.min(rect.left, window.innerWidth - 304)), top: Math.max(16, Math.min(rect.bottom + 8, window.innerHeight - 310)) } });
                  void audio.play("grid-select");
                }}>
                {animal ? <span className="rescue-cell-art"><ParticipantArtwork participant={animal} /></span> : observation ? <span aria-hidden="true">—</span> : recommended ? <span className="rescue-crosshair" aria-hidden="true">+</span> : <span className="rescue-unopened-dot" aria-hidden="true" />}
              </button>;
            })}
          </div>
        </div>
        {!!state.observations.length && <div className="rescue-board-actions">{result.status !== "contradiction" && <button className="rescue-secondary" disabled={!state.observations.length} onClick={() => { onUndo(); }}>↶ Undo last result</button>}<button className="rescue-secondary" disabled={!state.observations.length} onClick={() => { onReset(); }}>Reset rescue</button></div>}
      </div>
      <div className="rescue-live-sidebar">
        {result.status !== "contradiction" && result.status !== "complete" && <div className="strategy-feedback" aria-live="polite"><strong>{STRATEGY_OPTIONS.find(o => o.type === strategy.type)?.label}</strong><span>{strategy.type === "finish-found" ? `${found.size} participants currently prioritized` : strategy.type === "target" ? `Target: ${targetName ?? "not selected"}` : strategy.type === "rarity-focus" ? raritySummary : "Best chance of hitting anything."}</span></div>}
        {targetTransition && result.status === "ready" && <p className="rescue-target-transition" role="status">{targetTransition}</p>}
        <dl className="rescue-metrics"><div><dt>HIT PROBABILITY</dt><dd>{recommendation ? `${(recommendation.hitProbability * 100).toFixed(1)}%` : "—"}</dd></div><div><dt>POSSIBLE WORLDS</dt><dd>{result.worldCount.toLocaleString("en-US")}</dd></div><div><dt>RESULTS REPORTED</dt><dd>{state.observations.length}</dd></div></dl>
        {(result.status === "target-required" || result.status === "strategy-unavailable" || result.status === "strategy-complete") && <div className="rescue-status-note" role="status"><strong>{statusText}.</strong><p>{result.status === "strategy-complete" || result.status === "strategy-unavailable" ? "Change strategy to continue." : "Choose a target above."}</p></div>}
        <div className="rescue-selected-roster"><span className="eyebrow">GUARANTEED PARTICIPANTS</span>{participants.map(animal => <div key={animal.id} className="rescue-roster-animal" data-participant-kind={animal.kind} data-prioritized={(strategy.type === "finish-found" && found.has(animal.id)) || (strategy.type === "rarity-focus" && rarityParticipants.includes(animal.id)) || undefined}>
          <ParticipantArtwork participant={animal} /><div><strong>{animal.name}{animal.kind === "pet" && <small className="participant-kind">PET</small>}{strategy.type === "finish-found" && found.has(animal.id) && <small className="participant-priority">FOUND / PRIORITY</small>}{strategy.type === "rarity-focus" && rarityParticipants.includes(animal.id) && <small className="participant-priority">PRIORITY</small>}</strong><span>{state.observations.filter(o => o.type === "hit" && o.participantId === animal.id).length} / {animal.pattern.cells.length} TILES REPORTED</span></div>
        </div>)}</div>
        <p className="rescue-functional-copy">Opened cells are excluded. Hit probability includes any selected participant.</p>
        {!!state.observations.length && <details className="rescue-history"><summary>Reported results ({state.observations.length})</summary><ol>{state.observations.map((o, i) => <li key={i} data-participant-kind={o.type === "hit" ? participants.find(a => a.id === o.participantId)?.kind : undefined}><span>R{Math.floor(o.cellIndex / 5) + 1} / C{o.cellIndex % 5 + 1}</span><strong>{o.type === "empty" ? "Empty" : participants.find(a => a.id === o.participantId)?.name}</strong></li>)}</ol></details>}
      </div>
    </div>
    {pending && <ResultSelector cellIndex={pending.cellIndex} anchor={pending.anchor} participants={participants} onClose={() => setPending(null)} onResult={observation => { setPending(null); onObservation(observation); void audio.play("grid-select"); }} />}
  </section>;
}
