"use client";

import { useEffect } from "react";
import { audio } from "../audio/soundManager";

/** One event layer and audio context for the entire app; no particle render loop. */
export function EnvironmentLifecycle() {
  useEffect(() => {
    audio.restorePreference();
    const root = document.documentElement;
    const visibility = () => {
      root.dataset.pageHidden = String(document.hidden);
      if (document.hidden) audio.pause();
    };
    const activate = (event: Event) => { if (event.isTrusted) void audio.unlock(); };
    const hover = (event: PointerEvent) => {
      if (!event.isTrusted || event.pointerType !== "mouse" || !(event.target instanceof Element)) return;
      const target = event.target.closest(".region-card, .animal-card, button.board-tile");
      if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return;
      void audio.play(target.matches("button.board-tile") ? "grid-hover" : "region-hover");
    };
    const click = (event: MouseEvent) => {
      if (!event.isTrusted || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
      if (event.target.closest("button.board-tile")) { void audio.play("grid-select"); return; }
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const destination = new URL(link.href, location.href);
      if (destination.origin !== location.origin || destination.pathname === location.pathname) return;
      void audio.play(destination.pathname.split("/").filter(Boolean).length === 3 ? "animal-open" : "navigate");
    };
    const storage = (event: StorageEvent) => { if (event.key === "disco-zoo:sound-enabled" || event.key === null) audio.restorePreference(); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("pointerdown", activate, true);
    document.addEventListener("keydown", activate, true);
    document.addEventListener("pointerover", hover, { passive: true });
    document.addEventListener("click", click, true);
    window.addEventListener("storage", storage);
    return () => {
      audio.pause();
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("pointerdown", activate, true);
      document.removeEventListener("keydown", activate, true);
      document.removeEventListener("pointerover", hover);
      document.removeEventListener("click", click, true);
      window.removeEventListener("storage", storage);
      delete root.dataset.pageHidden;
    };
  }, []);
  return null;
}
