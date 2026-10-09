import { EARTH_PROGRESS, SPACE_PROGRESS, regionProgression, type EarthProgressId, type SpaceProgressId } from "./progression";

export interface SpoilerPreferences {
  maxEarthRegionId: EarthProgressId;
  maxSpaceRegionId: SpaceProgressId | null;
  showTimeless: boolean;
}
export const PROGRESS_STORAGE_KEY = "disco-zoo-guide.progress";
export const DEFAULT_PREFERENCES: SpoilerPreferences = { maxEarthRegionId: "farm", maxSpaceRegionId: null, showTimeless: false };
export function serializePreferences(preferences: SpoilerPreferences): string {
  return JSON.stringify({ version: 1, ...preferences });
}
export function parsePreferences(raw: string | null): SpoilerPreferences | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (!p || p.version !== 1 || typeof p.showTimeless !== "boolean"
      || !EARTH_PROGRESS.some(r => r.id === p.maxEarthRegionId)
      || !(p.maxSpaceRegionId === null || SPACE_PROGRESS.some(r => r.id === p.maxSpaceRegionId))) return null;
    return { maxEarthRegionId: p.maxEarthRegionId, maxSpaceRegionId: p.maxSpaceRegionId, showTimeless: p.showTimeless };
  } catch { return null; }
}
export function canViewRegion(id: string, preferences: SpoilerPreferences): boolean {
  const region = regionProgression(id);
  if (!region) return false;
  const maximum = region.group === "earth" ? preferences.maxEarthRegionId : preferences.maxSpaceRegionId;
  const limit = maximum ? regionProgression(maximum) : null;
  return !!limit && limit.group === region.group && region.index <= limit.index;
}
export function canViewTimeless(preferences: SpoilerPreferences): boolean { return preferences.showTimeless; }
export function canViewAnimal(animal: { regionId: string; rarity: string; hidden?: boolean }, preferences: SpoilerPreferences): boolean {
  return !animal.hidden && canViewRegion(animal.regionId, preferences) && (animal.rarity !== "timeless" || canViewTimeless(preferences));
}
export function getVisibleRegions<T extends { id: string }>(regions: readonly T[], preferences: SpoilerPreferences): T[] {
  return regions.filter(r => canViewRegion(r.id, preferences));
}
export function revealRegion(id: string, preferences: SpoilerPreferences): SpoilerPreferences {
  const region = regionProgression(id);
  if (!region || canViewRegion(id, preferences)) return preferences;
  return region.group === "earth" ? { ...preferences, maxEarthRegionId: id as EarthProgressId }
    : { ...preferences, maxSpaceRegionId: id as SpaceProgressId };
}
