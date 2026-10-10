# SEO readiness

BETA 01 is unchanged. No commit. Gameplay data, patterns and solver algorithms are unchanged.

## Audit and implemented changes

Before this pass, metadata was generic for every region/animal; pets inherited the homepage title. Canonicals, robots, sitemap, social cards and structured data were absent. The root local-storage gate prevented fresh visitors and crawlers from seeing actual guide content or links.

The owner changed the product default: fresh visitors now see Earth through Nocturnal, Space through Constellation, and Timeless. Server-rendered public content uses the same default for humans and crawlers. No bot detection or hidden SEO copy exists. Saved version-1 preferences are restored unchanged; a tiny pre-body storage-presence script veils returning visitors until their restrictions commit, preventing a visual spoiler flash. Missing/invalid storage defaults to the full guide. Settings, independent tracks, reveal/re-hide, contextual Rescue filtering and persistence remain intact. Mandatory first-visit UI/copy/styles were removed.

- Unique canonical-name region/animal titles and descriptions, including Timeless titles, use Next generateMetadata.
- Shared metadata provides absolute self-canonicals, OG and Twitter cards. Contextual Rescue links canonicalize to `/rescue`.
- Canonical routes retain `/regions/<region>/<animal>`; no alternate `/animals` routes were created.
- Sitemap derives homepage, Rescue, pets and all valid region/animal paths from existing data/presentation. No query variants, fake timestamps, experiments or unavailable records.
- Robots permits pages/CSS/JS/artwork, references sitemap, and excludes only `/game/experiments/`.
- BreadcrumbList is inside region/animal visibility guards and uses Home > Region > Animal. No ratings, reviews, Product or fake FAQ markup.
- One 1200x630 generated brand OG image shows a decorative, unnumbered 5x5 Rescue board, no hidden animal artwork or invented solver output.
- Animal guides have a factual pattern/search-order sentence and a named contextual Rescue link. Rescue intro explains next-tile recommendation/reporting.
- Real anchor links already connect homepage, regions, animals, pets and Rescue. No link stuffing or broad redesign.

Public server metadata can name the visited route even for an existing visitor who hides it; this is explicitly authorized by the new public-content decision. Visible page sections, counts, names/artwork and contextual setup still respect saved preferences after hydration.

## Production origin

The confirmed launch origin is `https://discozoohelper.netlify.app`, defined once as `SITE_URL` in `src/components/seo/pageMetadata.ts`. Canonicals, sitemap, robots, breadcrumbs, Open Graph and Twitter image URLs all consume this configuration. A build-time `SITE_URL` environment override supports a future custom-domain migration. Never use preview hosts; the helper rejects non-HTTPS origins, paths, queries, fragments and credentials. Rebuild after changing the origin.

## Validation

- 410 automated tests passed, including 8 focused SEO tests and updated saved-preference/default coverage.
- Strict compilation, lint and production build passed.
- 49 source/browser checks: 7 representative routes, 390/1440, fresh visitors, preserved restricted settings, Timeless/region barriers, settings/Escape, canonical/OG/Twitter, sitemap/robots and BreadcrumbList.
- Shared OG PNG inspected at 1200x630.
- Version remains BETA 01; no solver/data/pattern/artwork-extraction edits.

## Performance and remaining follow-up

Public SSR removes the previous loading/onboarding dependency for first-time guide content. Sprite dimensions and contain rendering reserve layout; Next fonts are already optimized. No obvious image/layout regression justified a refactor. No field LCP/CLS/INP claim is made. Check real Core Web Vitals after deployment, plus social preview caches and Search Console rendered HTML. Indexing/ranking is not guaranteed by metadata.

## Search Console after deployment

1. Add the URL-prefix property `https://discozoohelper.netlify.app/` and verify ownership using a supported method. A future owned custom domain can use DNS verification.
2. Submit `https://discozoohelper.netlify.app/sitemap.xml`.
3. Inspect `/`, `/rescue`, `/pets`, `/regions/savanna`, `/regions/mars`, `/regions/savanna/giraffe`, `/regions/farm/chicken`. Check rendered content and canonical selection.
4. Validate region/animal BreadcrumbList with Rich Results Test.

No Search Console/account setup attempted. The production origin is confirmed and configured. Deploy the validated build before submitting the sitemap.## Production origin

Confirmed origin: `https://discozoohelper.netlify.app`. Defined centrally as `SITE_URL` in `src/components/seo/pageMetadata.ts`, used by canonicals, sitemap, robots, breadcrumbs and social URLs. Set the build-time SITE_URL environment variable to override it for a custom-domain migration; rebuild after changing it. Preview request hosts never determine canonical URLs.

## Validation

- 410 automated tests passed, including 8 focused SEO tests and updated saved-preference/default coverage.
- Strict compilation, lint and production build passed.
- 49 source/browser checks: 7 representative routes, 390/1440, fresh visitors, preserved restricted settings, Timeless/region barriers, settings/Escape, canonical/OG/Twitter, sitemap/robots and BreadcrumbList.
- Shared OG PNG inspected at 1200x630.
- Version remains BETA 01; no solver/data/pattern/artwork-extraction edits.

## Performance and remaining follow-up

Public SSR removes the previous loading/onboarding dependency for first-time guide content. Sprite dimensions and contain rendering reserve layout; Next fonts are already optimized. No obvious image/layout regression justified a refactor. No field LCP/CLS/INP claim is made. Check real Core Web Vitals after deployment, plus social preview caches and Search Console rendered HTML. Indexing/ranking is not guaranteed by metadata.

## Search Console after deployment

1. Add the URL-prefix property `https://discozoohelper.netlify.app/` and verify ownership using a supported method. A future owned custom domain can use DNS verification.
2. Submit `https://discozoohelper.netlify.app/sitemap.xml`.
3. Inspect `/`, `/rescue`, `/pets`, `/regions/savanna`, `/regions/mars`, `/regions/savanna/giraffe`, `/regions/farm/chicken`. Check rendered content and canonical selection.
4. Validate region/animal BreadcrumbList with Rich Results Test.

No Search Console/account setup attempted. The production origin is confirmed and configured. Deploy the validated build before submitting the sitemap.
