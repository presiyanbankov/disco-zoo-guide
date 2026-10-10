import { ImageResponse } from "next/og";

export const alt = "Disco Zoo Guide and Rescue Assistant: choose the next tile on a 5 by 5 board";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** One shared brand preview; decorative board, no invented solver sequence. */
export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 70, background: "#090c0d", color: "#eceee7" }}>
    <div style={{ display: "flex", flexDirection: "column", width: 610 }}>
      <span style={{ fontSize: 24, color: "#cadb9e", marginBottom: 32 }}>DISCO ZOO GUIDE · UNOFFICIAL</span>
      <span style={{ fontSize: 70, fontWeight: 700, lineHeight: 1.05 }}>Rescue Assistant</span>
      <span style={{ fontSize: 28, color: "#b4bcb0", marginTop: 30 }}>Find your next tile.</span>
      <span style={{ fontSize: 22, color: "#b4bcb0", marginTop: 18 }}>Animal & pet rescue patterns</span>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", width: 350, gap: 8 }}>
      {Array.from({ length: 25 }, (_, i) => <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 62, height: 62, border: `2px solid ${i === 12 ? "#cadb9e" : "#354034"}`, background: i === 12 ? "#42553d" : "#162018", borderRadius: 4, fontSize: 38 }}>{i === 12 ? "+" : ""}</div>)}
    </div>
  </div>, size);
}
