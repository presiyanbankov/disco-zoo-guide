// Original presentation artwork, not official or extracted Disco Zoo imagery.
// Replace with owner-supplied assets under public/game/regions when available.
export function RegionLandscape({region}:{region:string}){
  const polar=region==="polar",farm=region==="farm",northern=region==="northern",outback=region==="outback";
  return <svg className="region-landscape" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <path className="land-sky" d="M0 0h600v340H0z"/>
    <circle className="land-sun" cx="465" cy="92" r={polar?25:37}/>
    <path className="land-cloud" d="M68 75h35V64h42v11h37v13H68zm235 43h30v-9h47v9h34v11H303z"/>
    <path className="land-far" d={polar||northern?"M0 215 82 127 119 165 206 67 284 173 335 125 420 203 480 115 600 215v125H0z":"M0 201 90 171 157 178 228 140 318 153 420 126 501 157 600 136v204H0z"}/>
    {(polar||northern)&&<path fill="#d8e4e0" opacity=".6" d="m166 114 40-47 43 58-29-10-14 9-14-18zm286 32 28-31 29 38-28-11-13 9z"/>}
    <path className="land-mid" d={outback?"M0 239h68v-39h36v-32h135v32h28v50l117-20 112 3 104-19v126H0z":"M0 238 106 207 196 230 292 204 412 216 507 189 600 215v125H0z"}/>
    <path className="land-ground" d="m0 274 112-18 133 24 137-29 110 19 108-16v86H0z"/>
    {farm&&<g><path fill="#d2bd8b" d="M96 211h87v62H96z"/><path fill="#94564a" d="m84 213 55-44 56 44z"/><path fill="#4a4935" d="M131 236h22v37h-22z"/><path fill="#ecce8f" d="M105 227h14v14h-14zm55 0h14v14h-14z"/><path stroke="#b7bd85" strokeWidth="5" d="M246 253v28m39-32v28m39-30v28m-86-15 95-6"/><path fill="#485c3b" d="M420 225h9v51h-9z"/><path fill="#738653" d="M388 202h72v29h-72zm13-23h47v30h-47z"/></g>}
    {(northern||polar)&&<g fill={polar?"#8cb5b8":"#426b61"}><path d="m97 180-28 51h17l-28 40h79l-26-40h17zM459 159l-29 57h17l-31 48h86l-31-48h18z"/><path d="M92 260h9v24h-9zm362-5h10v27h-10z"/></g>}
    {(!farm&&!northern&&!polar)&&<g fill={outback?"#6d5741":"#555a3b"}><path d="M440 189h8v84h-8zM394 180h96v15h-96zm13-12h69v15h-69z"/><path d="m157 257-9-20 3 23-13-10 7 16h25l8-19-15 12 2-22z"/></g>}
    <path className="land-detail" d="M0 310h74v4h-74zm171-11h57v3h-57zm192 23h83v3h-83zm134-35h47v3h-47z"/>
    {polar&&<g fill="#e5f6f0" opacity=".65">{[35,130,245,330,390,535,570].map((x,i)=><rect key={x} x={x} y={45+i*24} width="3" height="3"/>)}</g>}
  </svg>;
}
