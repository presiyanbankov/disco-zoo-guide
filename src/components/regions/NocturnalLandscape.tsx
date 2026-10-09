/** Moonlit deciduous forest edge: open space between broad, irregular trees. */
export function NocturnalLandscape() {
  return <svg className="region-landscape vector-nocturnal" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path className="land-sky" d="M0 0h600v340H0z" />
    <g fill="#bdc5cc" opacity=".35"><rect x="249" y="43" width="1.5" height="1.5"/><rect x="343" y="30" width="1" height="1"/><rect x="303" y="102" width="1" height="1"/><rect x="473" y="38" width="1" height="1"/></g>
    <ellipse className="land-sun-glow" cx="425" cy="78" rx="43" ry="38" fill="currentColor" opacity=".045" />
    <circle cx="425" cy="78" r="18" fill="#b6c1c5" opacity=".7" />
    <g className="land-far-layer">
      <path className="land-far" d="M-20 219q70-39 146-5t160-7q59-22 113-8t221 8v153H-20z" />
      <g stroke="#303744" strokeWidth="7"><path d="M185 238 177 129m0 32-25-20m26 5 29-29m151 110 9-93m-3 30-25-23m25 8 21-15m112 105-8-98"/></g>
      <path fill="#303744" d="M119 139q-14-22 10-29 6-22 29-17 14-18 35-4 29-8 32 17 22 13 8 28-19 15-44 9-48 21-70-4zm204-6q-10-23 15-26 5-17 28-12 20-16 36 3 28 0 25 22 13 24-17 25-40 17-87-12z" />
    </g>
    <g className="land-mid-layer">
      <path className="land-mid" d="M-20 270q101-47 206-17t198-14q130-25 236 25v96H-20z" />
      <path fill="#212b38" d="m55 257 10-137-27-42 7-5 29 34 37-47 7 6-40 65 6 126zm448-10-6-133-31-35 7-5 31 27 27-50 9 4-29 67 9 125z" />
      <path fill="#242e3c" d="M-20 85q23-29 45-20-2-29 31-30 16-25 39-9 41-6 42 30 30 15 15 43-16 18-46 12-35 20-65 1-36 12-61-8zm445-7q-12-25 15-38 15-21 40-10 5-29 39-24 33-17 50 8 33-8 51 22v54q-25 16-54 6-39 14-65-5-49 15-76-13z" />
      <path stroke="#617080" strokeWidth="2" opacity=".25" d="m78 135 5 94m420-106 6 109" />
    </g>
    <g className="land-near-layer">
      <path className="land-ground" d="M-20 309q92-37 186-11t173-4q130-31 281 11v55H-20z" />
      <path fill="#2b3940" opacity=".6" d="m194 304 64-9 79 4-84 5zm166 11 71-12 50 2-62 9z" />
      <path fill="#111e29" d="M21 340 31 131 8 102l6-6 27 24 26-30 7 5-31 49 3 196zm528 0 5-198-27-44 7-4 29 34 22-31 7 5-28 51 9 187z" />
      <path fill="#17232f" d="M-20 76q17-31 41-24 16-28 44-10 30-13 46 19 28 15 8 36-26 20-56 4-35 14-56-4-18 11-27-2zm529 10q-15-30 17-42 18-25 43-7 29-10 51 17v48q-20 13-38 2-46 15-73-18z" />
      <g stroke="#3d5051" strokeWidth="2"><path d="m108 331 4-13 5 11m41-4 3-10 5 9m339-1 5-13 4 12" /></g>
    </g>
  </svg>;
}
