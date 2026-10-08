import type { RegionId } from "../../types/game";

// Frontend copy and progress presentation, not canonical region data.
export const REGION_PRESENTATION = [
  {
    id: "farm",
    name: "Farm",
    climate: "PASTORAL",
  },
  {
    id: "outback",
    name: "Outback",
    climate: "ARID",
  },
  {
    id: "savanna",
    name: "Savanna",
    climate: "GRASSLAND",
  },
  {
    id: "northern",
    name: "Northern",
    climate: "BOREAL",
  },
  {
    id: "polar",
    name: "Polar",
    climate: "FROZEN",
  },
  {
    id: "jungle",
    name: "Jungle",
    climate: "TROPICAL",
  },
  {
    id: "moon",
    name: "Moon",
    climate: "LUNAR",
  },
] as const satisfies readonly {
  id: RegionId;
  name: string;
  climate: string;
}[];

export type RegionPresentation = (typeof REGION_PRESENTATION)[number];

export function getRegionPresentation(id: string) {
  return REGION_PRESENTATION.find((region) => region.id === id);
}

/** Group-local numbering is presentation metadata, independent of routing/data. */
export const REGION_GROUPS = [
  { id: "earth", name: "Earth", destinations: ["Farm", "Outback", "Savanna", "Northern", "Polar", "Jungle", "Jurassic", "Ice Age", "City", "Mountain", "Nocturnal"] },
  { id: "space", name: "Space", destinations: ["Moon", "Mars", "Constellation"] },
] as const;
export function regionPosition(id: string) {
  const region = getRegionPresentation(id);
  const group = REGION_GROUPS.find(g => g.destinations.some(name => name === region?.name));
  return { group: group?.name ?? "Earth", number: group ? group.destinations.findIndex(name => name === region?.name) + 1 : 0 };
}
