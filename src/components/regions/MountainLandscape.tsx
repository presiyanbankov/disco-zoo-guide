/** Steep slate planes and a narrow alpine valley, with very little snow. */
export function MountainLandscape() {
  return <svg className="region-landscape vector-mountain" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path className="land-sky" d="M0 0h600v340H0z" />
    <ellipse className="land-sun-glow" cx="388" cy="90" rx="110" ry="70" fill="currentColor" opacity=".07" />
    <g className="land-far-layer">
      <path className="land-far" d="M-20 235 71 129 155 176 256 78 298 121 341 106 416 192 511 134 620 232v128H-20z" />
      <path fill="#829184" opacity=".3" d="m256 78 42 43 43-15-33 29-47-23-71 75z" />
      <path fill="#334e50" d="m177 242 95-82 46 52 66-55 73 87v116H177z" />
    </g>
    <g className="land-mid-layer">
      <path className="land-mid" d="M-20 70 73 35 128 80 167 172 239 282 211 360H-20zm398 290-54-86 59-57 24-63 93-27 100 104v129z" />
      <path fill="#586260" d="m73 35 55 45 39 92-41-27-17-56-73 45-56-5zm334 119 93-27 100 104-70-42-39-28-71 25z" />
      <path fill="#8a8a70" opacity=".55" d="m128 80 39 92 72 110-27-25-68-108zm279 74-24 63-59 57 27-11 47-47 25-65z" />
      <path stroke="#242f32" strokeWidth="4" d="m-10 188 97-18 55 27m-154 47 112-22 47 24m289-25 72-10 75 26" />
      <g fill="#243d39"><path d="m100 208-19 35h12l-20 31h51l-18-31h11zm374-6-18 31h11l-17 27h45l-16-27h10zm37 20-14 25h9l-14 23h37l-13-23h8z" /></g>
    </g>
    <g className="land-near-layer">
      <path className="land-ground" d="M-20 301 136 270 242 313 296 282 349 301 467 277 620 307v53H-20z" />
      <path fill="#52605a" d="m136 270 106 43-101-24-88 19-73-7zm331 7 153 30-87-6-67-9-64 21z" />
      <path fill="#697a72" opacity=".45" d="m296 282-54 31 21 27h76l-35-20 45-19-48 12-32-2z" />
      <path fill="#bec8bb" opacity=".35" d="m102 225 21 7-25-1zm366-15 28-2-14 5z" />
      <g stroke="#687866" strokeWidth="2"><path d="m70 316 4-10 4 8m89 17 3-12 6 10m278-11 4-10 5 8" /></g>
    </g>
  </svg>;
}
