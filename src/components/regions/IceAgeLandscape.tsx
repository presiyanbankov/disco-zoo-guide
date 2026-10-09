/** A frozen land valley: exposed rock and glacier channels, rather than polar sea ice. */
export function IceAgeLandscape() {
  return <svg className="region-landscape vector-ice-age" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path className="land-sky" d="M0 0h600v340H0z" />
    <ellipse className="land-sun-glow" fill="currentColor" opacity=".06" cx="390" cy="92" rx="95" ry="65" />
    <circle className="land-sun" cx="390" cy="92" r="23" opacity=".45" />
    <g className="land-far-layer">
      <path className="land-far" d="M-20 243 34 161 94 180 157 84 209 111 254 171 321 143 380 186 463 92 522 132 620 209v131H-20z" />
      <path fill="#9baeb0" d="m94 180 63-96 52 27-15 26-31-18-26 65zm286 6 83-94 59 40-42 2-20-15-32 71z" />
      <path fill="#71898d" d="m163 119 5 77-31-12zm317 15-11 67-41-11z" />
    </g>
    <g className="land-mid-layer">
      <path className="land-mid" d="M-20 227 72 211 148 251 216 257 284 284 359 254 433 241 533 200 620 225v115H-20z" />
      <path fill="#93a5a5" d="m-20 227 92-16 76 40 68 6 68 27-40-6-45-10-57-6-74-35-88 6zm379 27 74-13 100-41 87 25-89-10-92 41-54 7z" />
      <path fill="#647d80" d="m277 275 48 2 46 38h-96l25-21z" />
      <g fill="#2e4140">{[52,91,478,510].map((x,i)=><path key={x} d={`M${x} ${204+i%2*13}l-12 25h6l-15 24h42l-15-24h6z`} />)}</g>
    </g>
    <g className="land-near-layer">
      <path className="land-ground" d="M-20 284 71 266 163 289 248 305 333 319 415 289 506 272 620 290v50H-20z" />
      <ellipse cx="346" cy="311" rx="63" ry="11" fill="#7b999e" />
      <path fill="#b3c3c0" opacity=".7" d="m282 313 49-8 68 3-61 2zm-302-29 91-18 92 23-27 1-68-12-88 13zm435 5 91-17 114 18-112-7-64 12z" />
      <path fill="#283435" d="m117 304 24-30 27 9 14 31zm309 13 24-30 37 7 15 23z" />
      <g className="land-grass" stroke="#6e8072" strokeWidth="2"><path d="m46 321-7-11m7 11 3-14m0 14 8-8m471 12-4-15m4 15 8-9" /></g>
      <path className="land-ice-shimmer" stroke="#bacdcf" opacity=".4" d="m318 311 27-2 14 3" />
    </g>
  </svg>;
}
