/** Groundless vector starfield; deliberately distinct from lunar/planetary terrain. */
export function ConstellationLandscape() {
  const stars = [[48, 71], [108, 133], [182, 62], [248, 112], [316, 48], [386, 144], [461, 85], [544, 128], [72, 259], [195, 229], [283, 281], [420, 238], [516, 277]];
  return <svg className="region-landscape vector-constellation" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path className="land-sky" d="M0 0h600v340H0z" />
    <g className="land-far-layer"><ellipse cx="370" cy="170" rx="190" ry="64" fill="#656184" opacity=".035" /><path d="M-60 320Q210-100 670 120M-20 370Q280-50 630 210" stroke="#7e809d" opacity=".12" /></g>
    <g className="land-mid-layer"><path d="m108 133 74-71 66 50 68-64m70 96 75-59 83 43M72 259l123-30 88 52 137-43" stroke="#a2a6c2" strokeWidth=".8" opacity=".2" />{stars.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 2 : 1.2} fill="#c6cadb" opacity={i % 3 === 0 ? .7 : .4} />)}</g>
    <g className="land-near-layer" fill="#b4bed0" opacity=".24"><circle cx="337" cy="209" r="1" /><circle cx="230" cy="177" r="1" /><circle cx="567" cy="54" r="1.5" /></g>
  </svg>;
}
