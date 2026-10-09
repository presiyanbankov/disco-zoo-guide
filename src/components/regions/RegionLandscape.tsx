import { ConstellationLandscape } from "./ConstellationLandscape";
import { MarsLandscape } from "./MarsLandscape";
import { NocturnalLandscape } from "./NocturnalLandscape";
import { MountainLandscape } from "./MountainLandscape";
import { CityLandscape } from "./CityLandscape";
import { IceAgeLandscape } from "./IceAgeLandscape";
import { JungleLandscape, MoonLandscape } from "./JungleMoonLandscapes";
import { JurassicLandscape } from "./JurassicLandscape";

/** Original vector interpretations; no game screenshots or animal-pattern geometry. */
export function RegionLandscape({ region }: { region: string }) {
  if (region === "constellation") return <ConstellationLandscape />;
  if (region === "mars") return <MarsLandscape />;
  if (region === "nocturnal") return <NocturnalLandscape />;
  if (region === "mountain") return <MountainLandscape />;
  if (region === "city") return <CityLandscape />;
  if (region === "ice-age") return <IceAgeLandscape />;
  if (region === "jurassic") return <JurassicLandscape />;
  if (region === "jungle") return <JungleLandscape />;
  if (region === "moon") return <MoonLandscape />;
  const farm = region === "farm", outback = region === "outback", savanna = region === "savanna";
  const northern = region === "northern", polar = region === "polar";
  return <svg className={`region-landscape vector-${region}`} viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path className="land-sky" d="M0 0h600v340H0z" />
    <ellipse className="land-sun-glow" cx={outback ? 440 : 466} cy={outback ? 181 : 91} rx="80" ry="72" fill="currentColor" opacity=".06" />
    <circle className="land-sun" cx={outback ? 440 : 466} cy={outback ? 181 : 91} r={polar ? 22 : outback ? 39 : 34} />
    <g className="land-far-layer">
      {(northern || polar) ? <>
        <path className="land-far" d="M-20 234 65 157 113 183 226 65 316 167 374 121 450 184 528 111 620 224v130H-20z" />
        <path className="land-snow" d="m181 112 45-47 40 45-22-8-17 12-19-15zm326 29 21-30 27 34-18-8-9 7z" />
      </> : outback ? <>
        <path className="land-far" d="M-20 255V210h80v-48h99v-24h62v24h31v88h50v-35h61v-39h107v39h70v-29h80v174H-20z" />
        <path fill="#b77d5a" opacity=".22" d="M60 162h99v5H60zm99-24h62v6h-62zm204 38h107v6H363z" />
      </> : <path className="land-far" d="M-20 219Q100 159 211 196T411 162T620 194v166H-20z" />}
    </g>
    <g className="land-mid-layer">
      <path className="land-mid" d={outback ? "M-20 287v-39h73v-34h47v-44h113v44h39v58l114-31 83 9 67-46h104v156H-20z" : polar ? "M-20 282 75 244 158 253 234 223 311 250 413 227 489 248 620 220v140H-20z" : "M-20 271Q94 202 210 248T426 212T620 249v111H-20z"} />
      {northern && <g className="land-pines" fill="#33564f">
        {[72, 102, 138, 390, 431, 473, 510].map((x, i) => <path key={x} d={`M${x} ${185 + i % 3 * 12}l-23 45h12l-24 39h70l-24-39h12z`} />)}
      </g>}
      {polar && <g className="land-ice" fill="#9bbdc4">
        <path d="m53 274 24-61 23 11 19 62zm335-4 18-78 35 12 27 84zm101 8 23-43 34 4 23 53z" />
        <path fill="#cfddd9" d="m77 213 23 11-12 57-11-5zm329-21 35 12-17 70-18-4zm106 43 34 4-12 42-21-3z" />
      </g>}
      {savanna && <g className="land-acacias" fill="#535838">
        <path d="M407 216h8v76h-8zM367 209q45-31 91-3l-8 9h-73zM137 250h6v35h-6zM108 246q31-24 67-3l-7 9h-53z" />
      </g>}
    </g>
    <g className="land-near-layer">
      <path className="land-ground" d="M-20 309Q107 267 241 299T430 276T620 292v68H-20z" />
      {farm && <g>
        <path fill="#425e38" d="m118 224-5 76h19l-4-76z" />
        <g className="land-leaves" fill="#738a50"><path d="M49 207q-12-25 13-37-8-24 27-33 15-25 47-11 41-6 44 29 30 5 27 36-1 28-36 25-22 22-57 12-35 12-65-21z" /><path fill="#93a365" d="M62 175q35-22 73-20 34 0 50 26-48-12-75 10-29 9-48-16z" /></g>
        <path fill="#b9bd82" opacity=".36" d="m310 301 39-2 33 4-36 3z" />
      </g>}
      {savanna && <path fill="#60726a" opacity=".65" d="M234 289q32-13 65-3l22 8q-48 13-88 0z" />}
      {(savanna || outback || farm) && <g className="land-grass" stroke={outback ? "#b29969" : savanna ? "#b6ad68" : "#91a463"} strokeWidth="2" strokeLinecap="round">
        <path d="m39 318-4-16m4 16 8-14m74 23-3-13m3 13 7-9m309 5-7-17m7 17 9-13m87 9-3-18m3 18 9-10" />
      </g>}
      {polar && <path className="land-ice-shimmer" stroke="#d8efee" strokeWidth="2" d="m55 304 49-4m227 13 54-6m102 13 57-7" />}
      {northern && <g fill="#253f39"><path d="m54 243-27 49h14l-22 32h78l-25-32h13zm489-13-30 56h14l-28 46h99l-32-46h15z" /></g>}
    </g>
  </svg>;
}
