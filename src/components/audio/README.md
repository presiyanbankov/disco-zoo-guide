# Phase 5 sound and environment

## Sound ownership and integration

`soundManager.ts` owns one lazy AudioContext, a master mute gain, rate limiting,
preference subscriptions, and cue definitions. Components can call
`audio.play("navigate")`; they never create their own audio systems.

`SoundToggle` exposes a labeled, keyboard-accessible pressed state and starts
off. `EnvironmentLifecycle` restores the preference without creating audio,
unlocks only on trusted user interaction, and delegates region/animal navigation
and grid interaction cues. Modified/new-tab clicks stay silent. Muting silences
active sources immediately and suspends the context; hidden tabs also suspend it and invalidate
pending file loads. Returning to a tab requires another interaction to resume.
Local storage failures and unsupported audio never interrupt the UI.

The five quiet cues are original synthesized sine tones, not Disco Zoo sounds.
To replace a cue, add a licensed/owner-supplied file under `public/game/audio/`
and set `SOUND_CUES[cue].src` to its public URL. Files are fetched and decoded
only when requested and cached centrally. Adjust volume in the same definition.
Downloaded audio is capped at 500ms per cue; no background music or looping audio
is included. No result/success cue is wired to search results.

## Environment and performance

`../effects/RegionAtmosphere.tsx` uses six deterministic decorative CSS motes
per artwork surface, four visible on phones. Farm, Outback, and Savanna use
warm floating accents; Northern uses cooler motes and Polar uses light snow.
Effects are confined to artwork, hidden from assistive technology, and cannot
intercept pointer input. Reduced motion makes them static. Hidden tabs pause
both motes and existing sparkle animations.

There is no canvas, requestAnimationFrame loop, particle dependency, sound asset
download at startup, or permanent will-change promotion. Listeners live once in
the root lifecycle component and are cleaned up on unmount. The sound control
keeps a 44px target and readable on/off text at narrow phone widths.

## Verification and alpha limits

Production build and TypeScript pass. ESLint has no errors and only the existing
unused solver-stub parameter warning. Chrome checked default mute, trusted
activation, one context across region/animal navigation, saved preference without
autoplay after reload, mute silence, preference synchronization, hidden-tab
suspension, interaction-based resume, reduced motion, denied storage, and an
unavailable AudioContext. No browser runtime errors were found.
Real numbered search tiles use the same delegated grid hover/selection cues;
they remain silent until sound is enabled.

32 layout checks across 320, 375, 390, 430, 768, 1024, 1440, and 2560 pixels
found no horizontal overflow. Phone and desktop screenshots were reviewed.
Keyboard Space activation, visible focus, and the accessibility tree's toggle
name/pressed state pass. The Polar artwork caption has 4.76:1 measured contrast.

No packages, game-data files, domain types, animal patterns, or solver code
changed. The classic roster uses owner-approved icons; region artwork retains placeholders
only for Outback and Northern. Approved patterns and existing solver output are now integrated by the animal
guide presentation layer. Approved animal icons and three official region crops are now integrated.
