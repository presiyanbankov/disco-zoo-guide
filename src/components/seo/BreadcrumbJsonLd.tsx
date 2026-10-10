import { configuredSiteOrigin } from "./pageMetadata";

export function breadcrumbData(items: readonly { name: string; path: string }[], origin: URL) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({
    "@type": "ListItem", position: index + 1, name: item.name, item: new URL(item.path, origin).href,
  })) };
}

export function BreadcrumbJsonLd({ items }: { items: readonly { name: string; path: string }[] }) {
  const origin = configuredSiteOrigin();
  if (!origin) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData(items, origin)).replace(/</g, "\\u003c") }} />;
}
