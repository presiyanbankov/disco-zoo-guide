/** Vector interpretation: rust terrain, crater depth and a dusty horizon. */
export function MarsLandscape() {
  return <svg className="region-landscape vector-mars" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path className="land-sky" d="M0 0h600v340H0z" />
    <ellipse fill="#bd896c" opacity=".07" cx="400" cy="183" rx="220" ry="65" />
    <g className="land-far-layer"><path className="land-far" d="M-20 227 52 208 113 181 151 191 206 169 241 184 302 180 359 203 415 163 461 179 501 169 551 202 620 210v150H-20z" /><path stroke="#96715f" opacity=".3" d="m113 181 38 10 55-22m209-6 46 16 40-10" /></g>
    <g className="land-mid-layer"><path className="land-mid" d="M-20 257q107-43 214-9l90-17q108-20 176 22l160-15v122H-20z" /><ellipse fill="#302725" cx="336" cy="269" rx="102" ry="22" /><path stroke="#a37961" opacity=".45" strokeWidth="3" d="M237 264q94-36 201 2" /><path fill="#645044" d="m70 240 26-28 34 5 23 35z" /></g>
    <g className="land-near-layer"><path className="land-ground" d="M-20 313q80-54 172-20t176 15q141-55 292-5v57H-20z" /><path stroke="#261f1e" strokeWidth="3" d="m84 302 26 12-14 16m14-16 34-7m324-7-24 16 16 24m-16-24-39 4" /><path fill="#3b302b" d="m179 300 9-9 18 3 7 10zm327 16 12-12 21 6 6 13zm-459 7 7-8 14 3 5 8z" /></g>
  </svg>;
}
