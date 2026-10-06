import type { CSSProperties } from "react";

/** Deterministic, decorative CSS particles. Never animal or game-domain data. */
const MOTES = [
  [12, 61, 0, 12], [29, 25, -4, 15], [48, 70, -8, 13],
  [65, 40, -2, 16], [79, 17, -11, 14], [91, 76, -6, 17],
];

export function RegionAtmosphere({ region }: { region: string }) {
  return <div className={`region-atmosphere atmosphere-${region}`} aria-hidden="true">
    <span className="atmosphere-light" />
    {MOTES.map(([x, y, delay, duration], index) => <i className="atmosphere-mote" key={index}
      style={{ left: `${x}%`, top: `${y}%`, "--mote-delay": `${delay}s`, "--mote-duration": `${duration}s` } as CSSProperties} />)}
  </div>;
}
