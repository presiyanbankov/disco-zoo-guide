import type { RegionId } from "../../types/game";
import { EARTH_PROGRESS, SPACE_PROGRESS } from "../progress/progression";

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
  { id: "jurassic", name: "Jurassic", climate: "PRIMEVAL" },
  { id: "ice-age", name: "Ice Age", climate: "GLACIAL" },
  { id: "city", name: "City", climate: "URBAN" },
  { id: "mountain", name: "Mountain", climate: "ALPINE" },
  { id: "nocturnal", name: "Nocturnal", climate: "MOONLIT" },
  {
    id: "moon",
    name: "Moon",
    climate: "LUNAR",
  },
  { id: "mars", name: "Mars", climate: "MARTIAN" },
  { id: "constellation", name: "Constellation", climate: "STELLAR" },
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
  { id: "earth", name: "Earth", destinations: EARTH_PROGRESS.map(r => r.name) },
  { id: "space", name: "Space", destinations: SPACE_PROGRESS.map(r => r.name) },
] as const;
export function regionPosition(id: string) {
  const region = getRegionPresentation(id);
  const group = REGION_GROUPS.find(g => g.destinations.some(name => name === region?.name));
  return { group: group?.name ?? "Earth", number: group ? group.destinations.findIndex(name => name === region?.name) + 1 : 0 };
}
