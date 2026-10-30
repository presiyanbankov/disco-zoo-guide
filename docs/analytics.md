# Google Analytics 4

Production defaults to G-DJNRFJF66X. Configure `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-DJNRFJF66X` in the Netlify build environment explicitly. Public environment values are baked into the Next.js bundle: rebuild/redeploy after changes. Development has no default tracking. An empty value disables tracking.

The root layout loads one afterInteractive Google script. The client observer sends an initial page_view and one per pathname change (including back/forward); query-only changes do not count as new pages. No query strings, fragments or referrer URLs are forwarded. No user IDs or user-provided text are set. Google still processes normal analytics/network identifiers; this is not a consent-management system.

In GA4 Admin > Data streams > Web stream > Enhanced measurement, turn OFF automatic Page views based on browser history events (or automatic Page views entirely), since this app sends them explicitly. Disable other enhanced-measurement events if only the explicitly instrumented events are wanted.

Custom events:
- rescue_opened: Rescue component entry, once per mounted setup context.
- contextual_rescue_opened: valid, visible region/animal query context; source_surface is region or animal (context type, not claimed referrer).
- rescue_started: successfully validated explicit Start action.
- rescue_completed: first complete result per started rescue; undo/re-completion does not duplicate it.
- rescue_strategy_selected: explicit change to another strategy.
- spoiler_settings_changed: settings Save when values actually change; hydration and direct-route reveals do not emit it.

Allowed custom parameters: region, animal, strategy, participant_count, has_pet, source_surface. Runtime validation drops everything else and unknown values. Spoiler preferences themselves are not transmitted.

Verify after deployment in GA4 Realtime: open the site without an analytics blocker, visit several routes, then start/complete a rescue and change strategy/settings. Check the named events and page_view counts. In browser Network, inspect g/collect requests to confirm tid=G-DJNRFJF66X and sanitized page locations. Realtime can be delayed. Use Tag Assistant/DebugView for detailed inspection. Block googletagmanager.com and google-analytics.com and confirm the guide still works. Register the allowed parameters as custom dimensions if needed in standard reports. Do not enable automatic history page views alongside manual tracking.
