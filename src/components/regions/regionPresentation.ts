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
