import { useEffect, useRef, useState } from "react";
import type { DisplayParticipant } from "./rescueParticipants";
import type { DynamicRescueResult, DynamicRescueState, RescueObservation } from "../../solver/dynamic/dynamicRescueSolver";
import { ParticipantArtwork } from "./ParticipantArtwork";
import { audio } from "../audio/soundManager";
import { ResultSelector } from "./ResultSelector";

type Props = {
  regionName: string;
  participants: readonly DisplayParticipant[];
  state: DynamicRescueState;
  result: DynamicRescueResult;
  onObservation: (observation: RescueObservation) => void;
  onUndo: () => void;
  onReset: () => void;
  onChange: () => void;
};

export function RescueBoard({ regionName, participants, state, result, onObservation, onUndo, onReset, onChange }: Props) {
  const [pending, setPending] = useState<{ cellIndex: number; anchor: { left: number; top: number } } | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const recommendation = result.recommendation;
  const observations = new Map(state.observations.map(o => [o.cellIndex, o]));
  useEffect(() => {
    if (recommendation) buttons.current[recommendation.cellIndex]?.focus({ preventScroll: true });
  }, [state.observations.length, recommendation]);

  return <section className="rescue-live" data-rescue-status={result.status} aria-labelledby="live-rescue-title">
    <div className="rescue-live-heading"><div><span className="eyebrow">LIVE RESCUE</span><h2 id="live-rescue-title">{regionName}</h2></div><button className="rescue-secondary" onClick={onChange}>Change setup</button></div>
    <div className="rescue-live-layout">
      <div className="rescue-live-board-panel">
        <div className="rescue-recommendation" aria-live="polite" aria-atomic="true">
          <span className="eyebrow">{result.status === "ready" ? "NEXT CELL" : "RESCUE STATUS"}</span>
          <strong>{recommendation ? `Row ${Math.floor(recommendation.cellIndex / 5) + 1} / Column ${recommendation.cellIndex % 5 + 1}` : result.status === "complete" ? "All participant tiles reported" : "Inconsistent results"}</strong>
        </div>
        <div className="board-frame dynamic-board-frame">
          <div className="board-columns" aria-hidden="true">{[1, 2, 3, 4, 5].map(n => <span key={n}>{n}</span>)}</div>
          <div className="board-rows" aria-hidden="true">{[1, 2, 3, 4, 5].map(n => <span key={n}>{n}</span>)}</div>
          <div className="dynamic-rescue-grid" role="group" aria-label="Live rescue board, five rows and five columns">
            {Array.from({ length: 25 }, (_, cellIndex) => {
              const observation = observations.get(cellIndex);
              const animal = observation?.type === "hit" ? participants.find(a => a.id === observation.participantId) : undefined;
              const recommended = cellIndex === recommendation?.cellIndex;
              const status = observation ? animal ? "animal" : "empty" : "unopened";
              return <button key={cellIndex} ref={node => { buttons.current[cellIndex] = node; }} type="button"
                className={`dynamic-cell cell-${status}${recommended ? " cell-recommended" : ""}${animal ? ` animal-color-${participants.indexOf(animal)}` : ""}`}
                data-cell-index={cellIndex} data-cell-state={status} data-recommended={recommended || undefined}
                disabled={!!observation || result.status !== "ready"}
                data-participant-kind={animal?.kind}
                aria-label={`Row ${Math.floor(cellIndex / 5) + 1}, column ${cellIndex % 5 + 1}: ${animal ? animal.name : observation ? "empty" : recommended ? "recommended" : "unopened"}`}
                onClick={event => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setPending({ cellIndex, anchor: { left: Math.max(16, Math.min(rect.left, window.innerWidth - 304)), top: Math.max(16, Math.min(rect.bottom + 8, window.innerHeight - 310)) } });
                  void audio.play("grid-select");
                }}>
                {animal ? <ParticipantArtwork participant={animal} /> : observation ? <span aria-hidden="true">—</span> : recommended ? <span className="rescue-crosshair" aria-hidden="true">+</span> : <span className="rescue-unopened-dot" aria-hidden="true" />}
              </button>;
            })}
          </div>
        </div>
        <div className="rescue-board-actions"><button className="rescue-secondary" disabled={!state.observations.length} onClick={onUndo}>↶ Undo last result</button><button className="rescue-secondary" disabled={!state.observations.length} onClick={onReset}>Reset rescue</button></div>
      </div>
      <div className="rescue-live-sidebar">
        <dl className="rescue-metrics"><div><dt>HIT PROBABILITY</dt><dd>{recommendation ? `${(recommendation.hitProbability * 100).toFixed(1)}%` : "—"}</dd></div><div><dt>POSSIBLE WORLDS</dt><dd>{result.worldCount.toLocaleString("en-US")}</dd></div><div><dt>RESULTS REPORTED</dt><dd>{state.observations.length}</dd></div></dl>
        {result.status === "contradiction" && <div className="rescue-status-note" role="alert"><strong>Results are inconsistent.</strong><p>Undo the last result or reset this rescue.</p></div>}
        {result.status === "complete" && <div className="rescue-status-note" role="status"><strong>Rescue complete.</strong><p>No unopened participant tiles remain in the possible worlds.</p></div>}
        <div className="rescue-selected-roster"><span className="eyebrow">GUARANTEED PARTICIPANTS</span>{participants.map((animal, i) => <div key={animal.id} className={`rescue-roster-animal animal-color-${i}`} data-participant-kind={animal.kind}>
          <ParticipantArtwork participant={animal} /><div><strong>{animal.name}{animal.kind === "pet" && <small className="participant-kind">PET</small>}</strong><span>{state.observations.filter(o => o.type === "hit" && o.participantId === animal.id).length} / {animal.pattern.cells.length} TILES REPORTED</span></div>
        </div>)}</div>
        <p className="rescue-functional-copy">Targets the highest chance of revealing any new participant tile. Opened cells are excluded.</p>
        {!!state.observations.length && <details className="rescue-history"><summary>Reported results ({state.observations.length})</summary><ol>{state.observations.map((o, i) => <li key={i} data-participant-kind={o.type === "hit" ? participants.find(a => a.id === o.participantId)?.kind : undefined}><span>R{Math.floor(o.cellIndex / 5) + 1} / C{o.cellIndex % 5 + 1}</span><strong>{o.type === "empty" ? "Empty" : participants.find(a => a.id === o.participantId)?.name}</strong></li>)}</ol></details>}
      </div>
    </div>
    {pending && <ResultSelector cellIndex={pending.cellIndex} anchor={pending.anchor} participants={participants} onClose={() => setPending(null)} onResult={observation => { setPending(null); onObservation(observation); void audio.play("grid-select"); }} />}
  </section>;
}
