/** Bespoke vector environments. Layers share the existing CSS motion language. */
export function JungleLandscape() {
  return <svg className="region-landscape vector-jungle" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path className="land-sky" d="M0 0h600v340H0z" />
    <ellipse className="land-sun-glow" cx="392" cy="122" rx="100" ry="84" fill="currentColor" opacity=".06" />
    <g className="land-far-layer">
      <path fill="#324d3c" d="M-20 179Q14 139 56 164q26-52 65-25 16-62 68-38 30-42 67-12 40-53 83-12 36-22 67 8 45-36 85 15 38-12 65 36 30-16 64 20v178H-20z" />
      <path fill="#244637" d="M48 135h8v135h-8zm134-48h9v181h-9zm151-15h10v195h-10zm152 36h9v158h-9z" />
      <path className="land-far" d="M-20 256Q85 196 181 241T373 213T620 224v136H-20z" />
    </g>
    <g className="land-mid-layer">
      <path className="land-mid" d="M-20 283Q75 218 181 271T346 239T620 254v106H-20z" />
      <path fill="#789584" opacity=".25" d="M365 235q-50 31-61 43t-66 23l-39 39h74l18-35q42-3 35-25t67-41z" />
      <path fill="#274d38" d="M50 93h15l-5 206H42zm473-19h18l26 220h-20z" />
      <g className="land-leaves" fill="#3d6442">
        <path d="M-20 106Q12 47 65 67q34-47 69-4 43-3 47 43-66 32-117 7-45 35-84-7zM454 94q11-45 58-38 41-41 73-9 29-10 35 41-73 33-166 6z" />
        <path fill="#55754a" d="M7 93q55-41 109-6-30-2-55 12-26-11-54-6zm489-15q44-27 82-11-40 1-82 11z" />
      </g>
      <path stroke="#638052" strokeWidth="2" opacity=".6" d="M127 91q-23 50-7 86t-1 47M489 76q-14 43 2 73t-9 36" />
    </g>
    <g className="land-near-layer">
      <path className="land-ground" d="M-20 314Q108 271 216 313T422 282T620 309v51H-20z" />
      <g className="land-leaves" fill="#2e5638">
        <path d="M84 327Q28 261 9 238q54-12 75 89zm0 0q-19-65-4-120 30 27 4 120zm0 0q12-80 57-95 10 48-57 95zM539 333q-69-56-68-100 57 13 68 100zm0 0q-17-90 20-127 22 62-20 127zm0 0q30-79 69-81-8 63-69 81z" />
        <path fill="#456b43" d="M86 324q-15-46-6-83 13 38 6 83zm455 4q3-57 15-89 6 44-15 89z" />
      </g>
      <path fill="#60725a" opacity=".6" d="M386 294v-40h27v8h-18v32zm43 1v-22h22v22z" />
    </g>
  </svg>;
}

export function MoonLandscape() {
  return <svg className="region-landscape vector-moon" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path className="land-sky" d="M0 0h600v340H0z" />
    <g fill="#bcc5d8" opacity=".65">
      {[[37,79],[94,142],[150,51],[221,112],[285,34],[332,151],[381,72],[438,35],[520,137],[569,53]].map(([x,y]) => <rect key={x} x={x} y={y} width="2" height="2" />)}
      <path opacity=".8" d="M249 73h1v7h-1zm-3 3h7v1h-7z" />
    </g>
    <ellipse className="land-sun-glow" cx="468" cy="96" rx="83" ry="70" fill="currentColor" opacity=".06" />
    <circle cx="468" cy="96" r="29" fill="#5b718b" />
    <path fill="#8dacae" opacity=".6" d="M453 71q-12 12-11 25l13 3 6-10 16-3-8-15zm24 23-12 6 3 12 13 6 14-17-10-10z" />
    <path fill="#1a2538" opacity=".35" d="M468 67a29 29 0 0 1 0 58q17-29 0-58z" />
    <g className="land-far-layer">
      <path className="land-far" d="M-20 245 28 213 91 222 144 181 203 206 248 178 310 218 356 196 422 222 484 178 541 209 620 193v167H-20z" />
      <path fill="#949ba9" opacity=".24" d="m125 207 19-26 59 25-51-8zm341-10 18-19 57 31-49-12z" />
    </g>
    <g className="land-mid-layer">
      <path className="land-mid" d="M-20 284Q104 218 224 270T444 238T620 261v99H-20z" />
      <ellipse cx="158" cy="263" rx="49" ry="12" fill="#323b50" />
      <path stroke="#9298a9" strokeWidth="3" opacity=".6" d="M109 261q49-22 98 0" />
      <ellipse cx="428" cy="263" rx="29" ry="7" fill="#3b4355" />
      <path fill="#8990a1" d="m300 274 12-14 15 17zm225-19 10-15 13 19z" />
    </g>
    <g className="land-near-layer">
      <path className="land-ground" d="M-20 313Q106 279 244 317T454 285T620 308v52H-20z" />
      <ellipse cx="371" cy="315" rx="58" ry="13" fill="#434b5e" />
      <path stroke="#a7acb9" strokeWidth="3" opacity=".65" d="M313 313q54-24 115-1" />
      <ellipse cx="87" cy="313" rx="18" ry="4" fill="#4a5261" />
      <path fill="#a5abb7" d="m180 312 9-10 18 12zm334 9 12-16 16 20z" />
    </g>
  </svg>;
}
