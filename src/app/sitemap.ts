import type { MetadataRoute } from "next";
import { REGION_PRESENTATION } from "../components/regions/regionPresentation";
import { getRegionAnimalPresentations } from "../components/animals/animalGuidePresentation";
import { configuredSiteOrigin } from "../components/seo/pageMetadata";

export function publicPagePaths(): string[] {
  return ["/", "/rescue", "/pets", ...REGION_PRESENTATION.flatMap(region => [
    `/regions/${region.id}`,
    ...getRegionAnimalPresentations(region.id).map(animal => `/regions/${region.id}/${animal.id}`),
  ])];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = configuredSiteOrigin();
  // Never publish guessed localhost/preview canonicals. The central launch origin can be overridden with SITE_URL.
  return origin ? publicPagePaths().map(path => ({ url: new URL(path, origin).href })) : [];
}
