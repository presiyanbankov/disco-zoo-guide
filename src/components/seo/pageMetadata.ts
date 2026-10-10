import type { Metadata } from "next";

export const SITE_NAME = "Disco Zoo Guide";
/** Launch origin; set SITE_URL at build time when migrating to a custom domain. */
export const SITE_URL = "https://discozoohelper.netlify.app";

/** Never derive canonical URLs from a preview request's Host header. */
export function configuredSiteOrigin(value = process.env.SITE_URL ?? SITE_URL): URL | undefined {
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be the canonical HTTPS origin, without a path, query or credentials.");
  }
  return url;
}

export function pageMetadata(title: string, description: string, pathname: string): Metadata {
  const origin = configuredSiteOrigin();
  const url = origin ? new URL(pathname, origin).href : undefined;
  const image = origin ? { url: new URL("/opengraph-image", origin).href, width: 1200, height: 630, alt: "Disco Zoo Guide & Rescue Assistant" } : undefined;
  return {
    title, description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: { title, description, siteName: SITE_NAME, type: "website", locale: "en_US", ...(url ? { url } : {}), ...(image ? { images: [image] } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [image.url] } : {}) },
  };
}
