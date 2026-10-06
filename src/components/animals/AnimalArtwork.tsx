import Image from "next/image";

/**
 * Original, replaceable pixel-style illustrations. NOT original Disco Zoo sprites.
 * Coordinates below are SVG drawing coordinates, never rescue patterns.
 */
type Illustration = { body: string; fill: string; detail?: string; accent?: string; eye?: [number, number] };

const quadruped = "M5 10h11V6h5v9h-3v5h-3v-5H8v5H5v-6H3v-3H1V9h3v3h1z";
const roundBody = "M5 9h12V7h4v9h-3v4h-4v-3H9v3H5v-4H3v-5h2z";
const upright = "M8 3h8v3h3v4h2v7h-3v-5h-1v9h-5v-7h-1v7H6v-9H5v5H2v-7h3V6h3z";
const illustrations: Record<string, Illustration> = {
  sheep: { body: "M4 9h2V7h9v2h3v3h3v5h-4v-2h-2v5h-3v-4H8v4H5v-5H3v-4h1z", fill: "#e0dfc9", detail: "M16 11h5v5h-5zM5 17h3v3H5zm7 0h3v3h-3z", accent: "#8b8b7a", eye: [19, 12] },
  pig: { body: roundBody, fill: "#d59b98", detail: "M17 7h2V5h2v3h-2v2h-2zM19 12h4v3h-4z", accent: "#b4777b", eye: [19, 10] },
  rabbit: { body: "M4 14h3v-4h5V2h3v8h2V1h3v12h2v4h-5v4H7v-2H4z", fill: "#cec6b0", detail: "M13 3h1v6h-1zm5-1h1v7h-1zM4 14h3v3H4z", accent: "#ab9490", eye: [18, 12] },
  horse: { body: quadruped, fill: "#bc8b62", detail: "M16 6h2v5h-2zM18 4h2v3h-2zM5 17h3v3H5zm10 0h3v3h-3z", accent: "#674f41", eye: [19, 8] },
  cow: { body: quadruped, fill: "#d7d6c6", detail: "M7 10h4v4H7zm7 1h3v3h-3zm4-5h2v4h-2zM17 4h2v2h-2zm4 0h2v3h-2z", accent: "#5e625a", eye: [20, 9] },
  unicorn: { body: quadruped, fill: "#d9d5e4", detail: "M18 2h2v4h-2zM16 6h2v5h-2zM1 9h3v5H1z", accent: "#b0a0c5", eye: [19, 8] },
  kangaroo: { body: "M13 2h2v4h2V2h2v7h2v3h-5v4h3v2h-5v3H8v-2h3v-4H7v2H3v-2H1v-2h4v-2h6V8h2z", fill: "#bc9572", detail: "M11 12h3v5h-3zM14 19h6v2h-6z", accent: "#d4b18a", eye: [17, 8] },
  platypus: { body: "M1 14h5v-3h11v1h4v4h-4v3H7v-2H1z", fill: "#9e8168", detail: "M18 12h5v3h-5zM1 14h5v3H1zM8 17h3v3H8zm6 0h3v3h-3z", accent: "#bea272", eye: [16, 12] },
  crocodile: { body: "M1 14h5v-3h11v1h6v4h-5v4h-3v-3H9v3H6v-3H3v-1H1z", fill: "#8eaa76", detail: "M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM18 15h5v1h-5z", accent: "#607b51", eye: [18, 12] },
  koala: { body: "M4 5h4v2h8V5h4v5h-3v8h-3v3h-4v-3H7v-8H4z", fill: "#aaaeb0", detail: "M10 10h4v4h-4zM5 6h2v3H5zm12 0h2v3h-2z", accent: "#696e74", eye: [9, 9] },
  cockatoo: { body: "M13 3h2v2h3v3h3v3h-4v7h-3v3h-2v-3H8v-3H5v-3h4V8h3V5h1z", fill: "#dedcc9", detail: "M13 1h2v4h-2zm3 1h2v4h-2zM9 12h5v5H9zM17 8h4v3h-4z", accent: "#d2bc70", eye: [16, 7] },
  tiddalik: { body: "M5 9h3V6h3v2h3V6h3v3h3v9h2v3h-6v-3H8v3H2v-3h3z", fill: "#93ac75", detail: "M8 13h9v5H8zM9 15h6v1H9z", accent: "#c3ca91", eye: [9, 8] },
  zebra: { body: quadruped, fill: "#dbded4", detail: "M6 10h2v5H6zm4 0h2v4h-2zm4 0h2v5h-2zm4-5h2v6h-2zM5 17h3v3H5zm10 0h3v3h-3z", accent: "#515c59", eye: [20, 8] },
  hippo: { body: roundBody, fill: "#a5a1b0", detail: "M17 12h6v4h-6zM17 6h2v2h-2zM6 17h3v3H6zm9 0h3v3h-3z", accent: "#87818e", eye: [19, 9] },
  giraffe: { body: "M4 12h9V3h7v3h2v3h-6v7h-1v5h-3v-5H7v5H4z", fill: "#cbbb79", detail: "M14 1h2v3h-2zm4 0h2v3h-2zM5 12h3v2H5zm5 1h2v2h-2zm3-6h2v2h-2zm1 4h2v2h-2z", accent: "#9c8055", eye: [18, 4] },
  lion: { body: quadruped, fill: "#ccb077", detail: "M15 5h7v9h-7zM5 17h3v3H5zm10 0h3v3h-3zM1 8h3v3H1z", accent: "#977451", eye: [20, 8] },
  elephant: { body: "M4 7h15v2h3v11h-3v-7h-2v7h-4v-4H9v4H5v-5H3V9H1V7h2v4h1z", fill: "#9faeac", detail: "M13 8h4v7h-4zM17 13h3v1h-3z", accent: "#7b928f", eye: [18, 10] },
  gryphon: { body: quadruped, fill: "#c2ad7a", detail: "M7 7h2V3h3v5h2V6h2v7h-2v2H8V9H7zM17 6h4v5h-4zM20 9h3v3h-3z", accent: "#dfd9ba", eye: [19, 7] },
  bear: { body: roundBody, fill: "#a88b6e", detail: "M17 5h3v3h-3zM17 12h5v3h-5zM5 17h4v3H5zm9 0h4v3h-4z", accent: "#806851", eye: [19, 9] },
  skunk: { body: "M1 6h5v3h2v4h8V9h4v3h3v4h-5v4h-3v-3H9v3H6v-4H3v-3H1z", fill: "#626f69", detail: "M2 6h2v6h2v2h10v2H6v-2H4v-2H2z", accent: "#d6ddd0", eye: [18, 11] },
  beaver: { body: "M1 13h6v-3h9V8h5v9h-4v3h-4v-3H9v3H6v-3H1z", fill: "#b19470", detail: "M1 13h6v4H1zM18 15h3v2h-3z", accent: "#79654f", eye: [19, 10] },
  moose: { body: quadruped, fill: "#9e8568", detail: "M15 3h3V1h2v4h-5zM20 1h2v2h2v2h-4zM16 6h3v7h-3z", accent: "#c0ae87", eye: [20, 8] },
  fox: { body: "M1 10h4v3h10V6h2V3h2v3h2V3h2v9h-2v3h-3v5h-3v-4H9v4H6v-4H3v-2H1z", fill: "#c3946e", detail: "M1 10h3v3H1zM18 12h3v3h-3zM6 18h3v2H6zm9 0h3v2h-3z", accent: "#e1d3b1", eye: [20, 8] },
  sasquatch: { body: upright, fill: "#9e8a70", detail: "M9 5h6v4H9zM10 10h4v5h-4z", accent: "#bba88a", eye: [10, 6] },
  penguin: { body: "M9 3h7v3h2v4h3v5h-3v4h-3v2H7v-2H5v-9h2V6h2z", fill: "#647b80", detail: "M9 9h7v10H9zM16 6h5v2h-5zM7 19h4v2H7zm6 0h5v2h-5z", accent: "#d9e5db", eye: [14, 5] },
  seal: { body: "M2 15h3v-3h11V8h5v9h-5v2H8v2H5v-3H2z", fill: "#a3bcc1", detail: "M8 17h4v3H8zM1 14h4v3H1z", accent: "#7598a5", eye: [19, 10] },
  muskox: { body: roundBody, fill: "#929a96", detail: "M15 6h3V4h2v3h-3v3h-2zM20 4h2v4h-2zM5 14h13v4H5z", accent: "#c3c5b4", eye: [19, 10] },
  "polar-bear": { body: roundBody, fill: "#d3e3df", detail: "M17 5h3v3h-3zM17 12h5v3h-5zM5 17h4v3H5zm9 0h4v3h-4z", accent: "#a7c6ca", eye: [19, 9] },
  walrus: { body: "M3 13h4v-3h8V7h7v10h-5v2H9v2H5v-3H3z", fill: "#a6a99d", detail: "M16 13h2v7h-2zm4 0h2v7h-2zM5 18h4v3H5z", accent: "#e0dfcc", eye: [18, 9] },
  yeti: { body: upright, fill: "#d6e5e0", detail: "M9 5h6v4H9zM10 10h4v5h-4z", accent: "#9fbfc5", eye: [10, 6] },
};

export function AnimalArtwork({ id, name, imagePath, transitionName }: { id: string; name: string; imagePath?: string; transitionName?: string }) {
  if (imagePath) {
    return <Image className="animal-sprite" style={{ viewTransitionName: transitionName }} src={imagePath} alt={name} width={128} height={128} sizes="200px" />;
  }
  const illustration = illustrations[id];
  if (!illustration) {
    return <span className="animal-art-fallback" style={{ viewTransitionName: transitionName }} aria-hidden="true">{name.slice(0, 1)}</span>;
  }
  return (
    <svg className="animal-sprite" style={{ viewTransitionName: transitionName }} viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true">
      <path d={illustration.body} fill={illustration.fill} />
      {illustration.detail && <path d={illustration.detail} fill={illustration.accent} />}
      {illustration.eye && <rect x={illustration.eye[0]} y={illustration.eye[1]} width="1" height="1" fill="#26352f" />}
    </svg>
  );
}
