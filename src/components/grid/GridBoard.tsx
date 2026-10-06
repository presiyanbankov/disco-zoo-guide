import { BOARD_SIZE } from "./gridPresentation";

export type BoardTile = {
  kind: "quiet" | "pattern" | "step" | "first";
  number?: number;
  label: string;
};

type Props = {
  label: string;
  tiles: readonly BoardTile[];
  interactive?: boolean;
  activeCell?: number | null;
  onInspect?: (index: number) => void;
};

export function GridBoard({ label, tiles, interactive = false, activeCell, onInspect }: Props) {
  return (
    <div className="board-frame">
      <div className="board-columns" aria-hidden="true">{Array.from({ length: BOARD_SIZE }, (_, col) => <span key={col}>{col + 1}</span>)}</div>
      <div className="board-rows" aria-hidden="true">{Array.from({ length: BOARD_SIZE }, (_, row) => <span key={row}>{row + 1}</span>)}</div>
      <div className="rescue-board" role={interactive ? "group" : "img"} aria-label={label}>
        {tiles.map((tile, index) => {
          const className = `board-tile tile-${tile.kind}${activeCell === index ? " is-inspected" : ""}`;
          if (interactive && tile.number !== undefined) {
            return (
              <button
                key={index}
                type="button"
                className={className}
                aria-label={tile.label}
                onFocus={() => onInspect?.(index)}
                onClick={() => onInspect?.(index)}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") onInspect?.(index); }}
              >{tile.number}</button>
            );
          }
          return <span key={index} className={className} aria-hidden="true">{tile.kind === "pattern" ? <span className="pattern-pixel" /> : tile.number}</span>;
        })}
      </div>
    </div>
  );
}
