import { useEffect, useRef } from "react";
import type { Animal } from "../../types/game";
import type { RescueObservation } from "../../solver/dynamic/dynamicRescueSolver";
import { AnimalArtwork } from "../animals/AnimalArtwork";

type Props = {
  cellIndex: number;
  anchor: { left: number; top: number };
  animals: readonly Animal[];
  onResult: (observation: RescueObservation) => void;
  onClose: () => void;
};

export function ResultSelector({ cellIndex, anchor, animals, onResult, onClose }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLButtonElement>(".rescue-result-empty")?.focus();
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  const reportEmpty = () => onResult({ type: "empty", cellIndex });
  const reportAnimal = (animal: Animal) => onResult({ type: "animal", cellIndex, animalId: animal.id });

  return <>
    <button className="rescue-result-backdrop" aria-label="Cancel result entry" tabIndex={-1} onClick={onClose} />
    <div className="rescue-result-selector" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="rescue-result-title" style={anchor}
      onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); onClose(); }
        if (!event.altKey && !event.ctrlKey && !event.metaKey) {
          if (event.key.toLowerCase() === "e") { event.preventDefault(); reportEmpty(); }
          const animal = animals[Number(event.key) - 1];
          if (/^[1-3]$/.test(event.key) && animal) { event.preventDefault(); reportAnimal(animal); }
        }
        if (event.key === "Tab") {
          const buttons = [...dialog.current!.querySelectorAll<HTMLButtonElement>("button")];
          const first = buttons[0], last = buttons.at(-1)!;
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }}>
      <div className="rescue-result-heading"><div><span className="eyebrow">REPORT RESULT</span><h3 id="rescue-result-title">Row {Math.floor(cellIndex / 5) + 1} / Column {cellIndex % 5 + 1}</h3></div><button className="rescue-close" aria-label="Close result selector" onClick={onClose}>×</button></div>
      <div className="rescue-result-options">
        <button className="rescue-result-empty" onClick={reportEmpty}><span aria-hidden="true">—</span><strong>Empty</strong><kbd>E</kbd></button>
        {animals.map((animal, index) => <button key={animal.id} className="rescue-result-animal" onClick={() => reportAnimal(animal)} data-animal-id={animal.id}>
          <AnimalArtwork id={animal.id} name={animal.name} imagePath={animal.imagePath} /><strong>{animal.name}</strong><kbd>{index + 1}</kbd>
        </button>)}
      </div>
      <p>Report the result shown in the game.</p>
    </div>
  </>;
}
