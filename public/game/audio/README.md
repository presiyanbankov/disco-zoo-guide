# Optional sound replacements

The alpha currently uses quiet original synthesized UI tones. There are no
official Disco Zoo audio files here and no startup downloads.

Add short licensed or owner-supplied files here, then set a cue's `src` in
`src/components/audio/soundManager.ts` to `/game/audio/your-file.wav` (or another
browser-supported format). Keep clips short and adjust the central cue volume.
All components continue to use the same `audio.play(...)` interface.
