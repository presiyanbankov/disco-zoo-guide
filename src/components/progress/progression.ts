// Approved progression destinations; availability is a separate concern.
export const EARTH_PROGRESS = [
  { id: "farm", name: "Farm" }, { id: "outback", name: "Outback" },
  { id: "savanna", name: "Savanna" }, { id: "northern", name: "Northern" },
  { id: "polar", name: "Polar" }, { id: "jungle", name: "Jungle" },
  { id: "jurassic", name: "Jurassic" }, { id: "ice-age", name: "Ice Age" },
  { id: "city", name: "City" }, { id: "mountain", name: "Mountain" },
  { id: "nocturnal", name: "Nocturnal" },
] as const;
export const SPACE_PROGRESS = [
  { id: "moon", name: "Moon" }, { id: "mars", name: "Mars" },
  { id: "constellation", name: "Constellation" },
] as const;
export type EarthProgressId = typeof EARTH_PROGRESS[number]["id"];
export type SpaceProgressId = typeof SPACE_PROGRESS[number]["id"];
export function regionProgression(id: string) {
  const earthIndex = EARTH_PROGRESS.findIndex(r => r.id === id);
  if (earthIndex >= 0) return { group: "earth" as const, index: earthIndex, name: EARTH_PROGRESS[earthIndex].name };
  const spaceIndex = SPACE_PROGRESS.findIndex(r => r.id === id);
  return spaceIndex >= 0 ? { group: "space" as const, index: spaceIndex, name: SPACE_PROGRESS[spaceIndex].name } : null;
}
