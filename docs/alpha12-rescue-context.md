# Contextual Rescue navigation

Guide headers use canonical IDs:

- Region: `/rescue?region=savanna`
- Animal: `/rescue?region=savanna&animal=giraffe`
- Homepage and pets: `/rescue`

Audit: SiteHeader/RescueHeaderLink is the only Rescue CTA on region pages,
animal pages and their hero/guide navigation. The homepage RescueHero remains
generic; pets/header links also remain generic. Desktop and mobile share the
same anchor and destination. The active rescue header remains a current-page
marker.

The rescue server page validates initial context against supported presentation
regions and canonical, visible classic animals. Unknown/locked regions yield an
empty setup. Invalid/mismatched animals are ignored while a valid region is
retained. Ambiguous repeated parameter values are ignored.

RescueAssistant initializes local selections once. There is no query-sync effect
and no automatic start. The region/animal query pair keys the assistant: a new
context URL creates fresh selections, observations and Balanced strategy rather
than merging stale rescue state. Returning from a guide remounts the setup.
Refresh reinitializes from the URL; unsaved edits are intentionally not serialized.
Once initialized, edits, strategies, pets, start, undo and reset work normally.
Changing unrelated query parameters does not replace local state.

`/rescue` is now server-rendered on demand to read query context; guide routes
remain statically generated. No persistence, solver or protected-data changes.

Validation evidence: `scripts/checkRescueContext.cjs` covers all four responsive
widths, guide/generic CTA destinations, keyboard focus, editable preselection,
refresh, back/forward and invalid parameters. Screenshots/results live under
`public/game/experiments/alpha12-rescue-context/`.

Results: build, lint and standalone strict TypeScript compilation passed.
All 237 tests passed, including 13 new context tests. Browser QA passed 284
checks at 375/390/768/1440px, including starting an earlier rescue before using
a different guide context. Four screenshots were saved; mobile and desktop
preselected setups were visually reviewed. All 73 protected inventory hashes
remain unchanged. ALPHA 12 and the square-cell fix are unchanged. No commit.
