"use client";

import { useSyncExternalStore } from "react";
import { audio } from "./soundManager";

export function SoundToggle() {
  const enabled = useSyncExternalStore(audio.subscribe, audio.getSnapshot, audio.getServerSnapshot);
  return <button className="sound-toggle" type="button" aria-label="Sound effects" aria-pressed={enabled}
    title={enabled ? "Mute sound effects" : "Enable sound effects"}
    onClick={(event) => {
      audio.setEnabled(!enabled);
      if (!enabled && event.isTrusted) void audio.unlock().then(() => audio.play("grid-select"));
    }}>
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 8h3l4-4v12l-4-4H3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      {enabled ? <path d="M13 6c3 2 3 6 0 8m2-11c5 4 5 10 0 14" stroke="currentColor" strokeWidth="1.2" />
        : <path d="m14 8 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.4" />}
    </svg><span>SOUND {enabled ? "ON" : "OFF"}</span>
  </button>;
}
