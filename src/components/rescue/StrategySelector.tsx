import { useId } from "react";
import { RarityPriorityControls } from "./RarityPriorityControls";
import type { PriorityValue, RarityPriorityConfig, RescueStrategy } from "../../solver/dynamic/rescueStrategy";
import type { DisplayParticipant } from "./rescueParticipants";
import { ParticipantArtwork } from "./ParticipantArtwork";

export const STRATEGY_OPTIONS = [
  { type: "balanced", label: "Balanced Search", description: "Best chance of hitting anything." },
  { type: "finish-found", label: "Finish What You Found", description: "Prefer animals you've already started uncovering." },
  { type: "target", label: "Target One", description: "Focus on one selected animal or pet." },
  { type: "rarity-priority", label: "Rarity Priority", description: "Set how strongly Common, Rare, Mythical, and Pet results should influence the search." },
] as const;

type Props = {
  strategy: RescueStrategy;
  participants: readonly DisplayParticipant[];
  onStrategy: (type: RescueStrategy["type"]) => void;
  onTarget: (participantId: string) => void;
  onPriority?: (category: keyof RarityPriorityConfig, value: PriorityValue) => void;
  live?: boolean;
};

export function StrategySelector({ strategy, participants, onStrategy, onTarget, onPriority = () => {}, live = false }: Props) {
  const id = useId();
  return <section className={`strategy-control${live ? " strategy-live" : ""}`} aria-labelledby={id}>
    <h2 id={id}>{!live && <span>04</span>} Strategy</h2>
    <div className="strategy-options" role="group" aria-label="Rescue strategy">
      {STRATEGY_OPTIONS.map(option => <button key={option.type} type="button" data-strategy={option.type}
        aria-pressed={strategy.type === option.type} onClick={() => onStrategy(option.type)}>
        <strong>{option.label}</strong>{!live && <span>{option.description}</span>}
        {strategy.type === option.type && <span className="strategy-check" aria-hidden="true">&#10003;</span>}
      </button>)}
    </div>
    {live && <p className="strategy-active-help">{STRATEGY_OPTIONS.find(option => option.type === strategy.type)?.description}</p>}
    {strategy.type === "target" && <div className="strategy-targets" role="group" aria-label="Target participant">
      <p className="rescue-functional-copy">{participants.length ? "Choose a target. Other participants do not influence the score." : "Select participants to choose a target."}</p>
      <div>{participants.map(p => <button key={p.id} type="button" data-target-id={p.id} data-participant-kind={p.kind}
        aria-pressed={strategy.participantId === p.id} onClick={() => onTarget(p.id)}>
        <ParticipantArtwork participant={p} /><strong>{p.name}{p.kind === "pet" && <small className="participant-kind">PET</small>}</strong>
        {strategy.participantId === p.id && <span aria-hidden="true">&#10003;</span>}
      </button>)}</div>
      {!participants.some(p => p.id === strategy.participantId) && <p className="strategy-target-required" role="status">Select a target to continue.</p>}
    </div>}
    {strategy.type === "rarity-priority" && <RarityPriorityControls priorities={strategy.priorities} onPriority={onPriority} />}
  </section>;
}
