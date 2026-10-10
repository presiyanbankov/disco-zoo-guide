import type { MetadataRoute } from "next";
import { configuredSiteOrigin } from "../components/seo/pageMetadata";

export default function robots(): MetadataRoute.Robots {
  const origin = configuredSiteOrigin();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/game/experiments/" },
    ...(origin ? { host: origin.origin, sitemap: new URL("/sitemap.xml", origin).href } : {}),
  };
}
