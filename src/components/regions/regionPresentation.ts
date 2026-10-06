import type { RegionId } from "../../types/game";

// Frontend copy and progress presentation, not canonical region data.
export const REGION_PRESENTATION = [
  {
    id: "farm",
    name: "Farm",
    mood: "Where it all begins",
    description: "Pastures, picket fences, and familiar faces. A small beginning for a much bigger adventure.",
    climate: "PASTORAL",
    fieldNote: "A familiar face can still be a wonderful discovery.",
  },
  {
    id: "outback",
    name: "Outback",
    mood: "A little further afield",
    description: "Follow the red earth toward a sun-soaked horizon. Out here, the everyday feels a little extraordinary.",
    climate: "ARID",
    fieldNote: "Look a little closer. The quiet landscape is full of character.",
  },
  {
    id: "savanna",
    name: "Savanna",
    mood: "Into the golden grass",
    description: "Wide open skies and golden grasslands. Meet the wildlife that makes this horizon worth exploring.",
    climate: "GRASSLAND",
    fieldNote: "Every great adventure needs a little room to roam.",
  },
  {
    id: "northern",
    name: "Northern",
    mood: "Answer the call of the wild",
    description: "Quiet forests beneath mountain peaks. Head north and discover a cooler side of the zoo.",
    climate: "BOREAL",
    fieldNote: "Slow down for a moment. There is life between the trees.",
  },
  {
    id: "polar",
    name: "Polar",
    mood: "Beyond the snow line",
    description: "Snow-covered shores and crisp, still air. Your next discovery is waiting at the edge of the ice.",
    climate: "FROZEN",
    fieldNote: "Even the coldest corners of the world have a little warmth.",
  },
] as const satisfies readonly {
  id: RegionId;
  name: string;
  mood: string;
  description: string;
  climate: string;
  fieldNote: string;
}[];

export type RegionPresentation = (typeof REGION_PRESENTATION)[number];

export function getRegionPresentation(id: string) {
  return REGION_PRESENTATION.find((region) => region.id === id);
}
