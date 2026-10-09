import { ANIMALS } from "../../data/animals";
import { getRegionPresentation } from "../regions/regionPresentation";
import { canViewAnimal, canViewRegion, type SpoilerPreferences } from "../progress/spoilerPreferences";

export type RescueSetupContext = { regionId: string | null; selectedIds: string[] };

/** Query context initializes setup only; it never starts a rescue or stores observations. */
export function resolveRescueSetupContext(region?: string | string[], animal?: string | string[], preferences?: SpoilerPreferences): RescueSetupContext {
  const regionId = typeof region === "string" && getRegionPresentation(region) && (!preferences || canViewRegion(region, preferences)) ? region : null;
  const record = regionId && typeof animal === "string"
    ? ANIMALS.find(a => a.regionId === regionId && a.id === animal && !a.hidden && (!preferences || canViewAnimal(a, preferences))) : undefined;
  return { regionId, selectedIds: record ? [record.id] : [] };
}

export function rescueSetupHref(region?: string, animal?: string): string {
  const context = resolveRescueSetupContext(region, animal);
  if (!context.regionId) return "/rescue";
  const query = new URLSearchParams({ region: context.regionId });
  if (context.selectedIds[0]) query.set("animal", context.selectedIds[0]);
  return `/rescue?${query}`;
}
