export type RegionId =
    | "farm"
    | "outback"
    | "savanna"
    | "northern"
    | "polar"
    | "jungle"
    | "jurassic"
    | "ice-age"
    | "city"
    | "mountain"
    | "nocturnal"
    | "moon"
    | "mars"
    | "constellation";

export type Rarity =
    | "common"
    | "rare"
    | "mythical"
    | "timeless";

export interface Coordinate {
    row: number;
    col: number;
}

export interface AnimalPattern {
    cells: Coordinate[];
}

export interface Animal {
    id: string;
    name: string;
    regionId: RegionId;
    rarity: Rarity;
    pattern: AnimalPattern;

    imagePath: string;

    hidden?: boolean;
}

export interface Region {
    id: RegionId;
    name: string;

    imagePath: string;
    backgroundPath?: string;

    unlocked: boolean;
}

export interface SearchStep {
    step: number;
    cell: Coordinate;
    probability: number;
}

export interface StaticSearchResult {
    animalId: string;
    steps: SearchStep[];
}
/** One rescue-relevant record per pet species; cosmetics do not change geometry. */
export interface PetSpecies {
    id: string;
    name: string;
    pattern: AnimalPattern;
    imagePath: string;
}
