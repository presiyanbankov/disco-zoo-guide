import type { KeyboardEvent } from "react";
import type { PriorityValue, RarityPriorityConfig } from "../../solver/dynamic/rescueStrategy";

const CATEGORIES = [
  { key: "common", name: "Common" }, { key: "rare", name: "Rare" },
  { key: "mythical", name: "Mythical" }, { key: "pet", name: "Pet" },
] as const;
const VALUES: readonly PriorityValue[] = [1, 2, 3, 4];
const LEVELS = ["Low", "Medium", "High", "Highest"];

export function formatRarityPriorities(priorities: RarityPriorityConfig): string {
  return `C${priorities.common} \u00b7 R${priorities.rare} \u00b7 M${priorities.mythical} \u00b7 P${priorities.pet}`;
}

export function RarityPriorityControls({ priorities, onPriority }: {
  priorities: RarityPriorityConfig;
  onPriority: (category: keyof RarityPriorityConfig, value: PriorityValue) => void;
}) {
  function onKey(event: KeyboardEvent<HTMLButtonElement>, category: keyof RarityPriorityConfig, value: PriorityValue) {
    let next: PriorityValue;
    switch (event.key) {
      case "ArrowRight": case "ArrowDown": next = VALUES[value % 4]; break;
      case "ArrowLeft": case "ArrowUp": next = VALUES[(value + 2) % 4]; break;
      case "Home": next = 1; break;
      case "End": next = 4; break;
      default: return;
    }
    event.preventDefault();
    onPriority(category, next);
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-priority-value="${next}"]`)?.focus();
  }
  return <div className="rarity-priority-controls" aria-label="Rarity priorities">
    {CATEGORIES.map(category => <div key={category.key} className="priority-row" data-priority-category={category.key}>
      <span className="priority-category">{category.name}</span>
      <div className="priority-values" role="radiogroup" aria-label={`${category.name} priority`}>
        {VALUES.map(value => <button key={value} type="button" role="radio" aria-checked={priorities[category.key] === value}
          aria-label={`${category.name} priority ${value}: ${LEVELS[value - 1]}`} tabIndex={priorities[category.key] === value ? 0 : -1}
          data-priority-value={value} title={`${value}: ${LEVELS[value - 1]}`} onClick={() => onPriority(category.key, value)} onKeyDown={event => onKey(event, category.key, value)}>
          {value}{priorities[category.key] === value && <span className="priority-check" aria-hidden="true">&#10003;</span>}
        </button>)}
      </div>
    </div>)}
  </div>;
}
