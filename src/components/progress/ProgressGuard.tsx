"use client";
import { type ReactNode } from "react";
import { useProgress } from "./ProgressProvider";
import { canViewRegion, canViewTimeless, revealRegion } from "./spoilerPreferences";
import { regionProgression } from "./progression";
import { TransitionLink } from "../navigation/TransitionLink";

export function ProgressGuard({ regionId, timeless = false, rarity, children, onBack }: { regionId: string; timeless?: boolean; rarity?: string; children: ReactNode; onBack?: () => void }) {
  const { preferences, save, openSettings } = useProgress();
  const regionAllowed = canViewRegion(regionId, preferences);
  if (regionAllowed && (!(timeless || rarity === "timeless") || canViewTimeless(preferences))) return children;
  const destination = regionProgression(regionId);
  const maximum = destination?.group === "space" ? preferences.maxSpaceRegionId : preferences.maxEarthRegionId;
  return <section className="progress-barrier" aria-labelledby="progress-barrier-title">
    <span className="eyebrow">YOUR GUIDE / SPOILER SETTINGS</span>
    <h1 id="progress-barrier-title">Hidden by your spoiler settings.</h1>
    <p>{!regionAllowed ? maximum ? `${destination?.group === "space" ? "Space" : "Earth"} regions are shown through ${regionProgression(maximum)?.name}.` : "Space regions are hidden." : "Timeless animals are hidden."}</p>
    <div className="progress-actions"><button className="rescue-primary" onClick={() => save(!regionAllowed ? revealRegion(regionId, preferences) : { ...preferences, showTimeless: true })}>{!regionAllowed ? `Reveal ${destination?.name ?? "region"}` : "Show Timeless"}</button>
      {onBack ? <button className="rescue-secondary" onClick={onBack}>Go back</button> : <TransitionLink href="/" className="rescue-secondary" onClick={event => { if (window.history.length > 1 && document.referrer && new URL(document.referrer).origin === location.origin) { event.preventDefault(); window.history.back(); } }}>Go back</TransitionLink>}
    </div><button className="progress-control" onClick={openSettings}>Spoiler settings</button>
  </section>;
}
