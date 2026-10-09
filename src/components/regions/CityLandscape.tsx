/** Subdued urban evening: layered roofs, a narrow street and sparse warm lights. */
export function CityLandscape() {
  return <svg className="region-landscape vector-city" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path className="land-sky" d="M0 0h600v340H0z" />
    <g className="land-far-layer">
      <path className="land-far" d="M-20 252V141h51v-30h40v84h21v-41h33v-66h49v28h23v88h29v-63h47v-43h39v99h29v-70h61v40h23v-68h44v-23h37v118h28v-58h40v91h31v188H-20z" />
      <g fill="#8d8670" opacity=".35"><path d="M140 111h5v8h-5zm14 0h5v8h-5zm84 47h6v10h-6zm15 0h6v10h-6zm174-27h6v9h-6zm14 0h6v9h-6z" /></g>
    </g>
    <g className="land-mid-layer">
      <path className="land-mid" d="M-20 292V209l38-27h102l32 27v107h-172zm436 33V195l26-17h111l67 26v121z" />
      <path fill="#514541" d="M18 182h102l32 27H-20zm424-4h111l67 26H416z" />
      <path fill="#333c3e" d="M52 183v-27h18v27zm437-4v-30h22v30z" />
      <path stroke="#1c292d" strokeWidth="3" d="M103 167q167 63 395-5M103 157q161 45 395-3" />
      <path stroke="#2b3637" strokeWidth="5" d="M103 153v127m395-130v131" />
      <g className="city-window-light" fill="#b69b64"><path d="M24 225h14v20H24zm66 0h14v20H90zm349-10h13v21h-13zm72 0h13v21h-13z" /></g>
      <path fill="#273235" d="M64 262h22v47H64zm473-12h24v55h-24z" />
    </g>
    <g className="land-near-layer">
      <path className="land-ground" d="M-20 310 167 289 236 260h115l78 29 191 21v30H-20z" />
      <path fill="#3b4442" d="m236 260-69 29-187 21v10l206-22 57-38zm115 0 78 29 191 21v10l-211-22-65-38z" />
      <path fill="#827452" opacity=".2" d="m254 267-15 73h101l-19-73z" />
      <g stroke="#7c8072" strokeWidth="3"><path d="M213 283v-65h15m155 65v-65h-15" /></g>
      <g fill="#c8b485"><path d="M222 216h12v6h-12zm138 0h12v6h-12" /></g>
      <g fill="#bd9d61" opacity=".08"><ellipse cx="228" cy="258" rx="32" ry="39"/><ellipse cx="366" cy="258" rx="32" ry="39"/></g>
      <path fill="#252f31" d="M38 304h29v26H38zm492 2h23v22h-23z" />
      <path stroke="#69716a" opacity=".3" d="m276 300 27-1m-40 26 54-1" />
    </g>
  </svg>;
}
