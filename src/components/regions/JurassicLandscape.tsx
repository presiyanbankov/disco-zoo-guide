/** Vector habitat interpretation: basalt, volcanic ridges and prehistoric vegetation. */
export function JurassicLandscape() {
  return <svg className="region-landscape vector-jurassic" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <defs><linearGradient id="jurassic-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#202627"/><stop offset="1" stopColor="#52604a"/></linearGradient></defs>
    <path fill="url(#jurassic-sky)" d="M0 0h600v340H0z"/>
    <path className="land-far" fill="#303b36" d="M-20 230 45 160 115 191 201 82 233 105 253 91 334 202 410 156 470 192 547 129 620 185v155H-20z"/>
    <path fill="#9b6547" opacity=".5" d="m201 82 32 23 20-14-8 21-28-4z"/>
    <path className="land-mid" fill="#3d493b" d="M-20 261 62 223 149 248 250 212 331 239 448 214 620 242v98H-20z"/>
    <ellipse cx="383" cy="279" rx="92" ry="17" fill="#526768" opacity=".6"/>
    <path className="land-ground" fill="#20282a" d="M-20 307 60 287 138 305 234 277 321 300 424 290 512 311 620 279v61H-20z"/>
    <path stroke="#b96c41" strokeWidth="3" opacity=".65" d="m290 305-17 12 33 9-17 14"/>
    <path fill="#333c3b" d="m389 305 19-24 29 4 15 21zm-219 5 23-33 29 7 9 25z"/>
    <g className="land-leaves" fill="#394e39">
      <path d="M50 310Q44 225 20 195q42 9 43 47 10-49 42-66-7 45-34 67 43-17 63 4-40 13-61 8 12 40 2 55z"/>
      <path d="M536 323q3-91-36-130 40 6 48 52 15-52 48-61-12 41-38 64 38-9 63 9-42 16-65 4 9 36 4 62z"/>
    </g>
    <g className="land-grass" stroke="#74805a" strokeWidth="2"><path d="m116 321-9-25m9 25 8-34m-8 34 19-17m329 18-15-21m15 21 3-35m-3 35 17-16"/></g>
  </svg>;
}
