# Phase 4 navigation and responsive polish

`TransitionLink` retains Next Link URLs, prefetching, modifier clicks, and anchor
semantics. `NavigationMotion` progressively enhances internal route changes with
the browser's View Transition API. Region landscape and animal artwork names
match between cards and detail pages; the shared header stays visually stable.

The snapshot waits for the destination page marker, with a 450ms deadline for
slow requests. It never waits for an animation frame inside the snapshot callback
because the browser suspends rendering there. Missing API support, reduced
motion, and slow requests keep ordinary Next navigation available. Browser
history retains Next's scroll restoration. Keyboard activation focuses the new
page heading, and section anchors preserve their destination scroll position.

`src/styles/motion.css` defines 280ms page entrances and 320ms shared-artwork
transitions, focus feedback, touch hover overrides, and reduced-motion behavior.
`src/styles/responsive.css` refines narrow-phone gutters, tap targets, tablet
grids, and ultrawide compositions. Native transitions do not trigger a second
entrance animation when they finish.

No dependencies, canonical data, domain types, patterns, or solver files changed.
Artwork remains clearly identified original placeholder art. Additional ambient
effects and optional centralized sound infrastructure belong to Phase 5.

## Browser verification

Chrome passed 78 layout checks at 320, 375, 390, 430, 768, 900, 1024, 1440,
1920, and 2560 pixels. Numbered demo tiles remain at least 44px wide.
Checks cover region/animal snapshot carry-over, keyboard focus, browser history,
section scroll positions, modifier clicks, missing API support, reduced motion,
a deliberately delayed route, touch inspection, and the viewport-fixed skip
link. No duplicate transition names or browser runtime errors were found.
The production build and TypeScript checks pass. A separate production browser
check confirms the navigation behavior and absence of development demo controls.
ESLint has zero errors and only the existing unused solver-stub parameter warning.
