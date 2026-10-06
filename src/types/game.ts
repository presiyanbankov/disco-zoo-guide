export type RegionId =
    | "farm"
    | "outback"
    | "savanna"
    | "northern"
    | "polar";

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