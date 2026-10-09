"use client";
import { useState } from "react";
import { EARTH_PROGRESS, SPACE_PROGRESS } from "./progression";
import type { SpoilerPreferences } from "./spoilerPreferences";

export function ProgressSetup({ initial, firstVisit, onSave, onCancel }: { initial: SpoilerPreferences; firstVisit: boolean; onSave: (value: SpoilerPreferences) => void; onCancel?: () => void }) {
  const [draft, setDraft] = useState(initial);
  const earthEndpoint = EARTH_PROGRESS.findIndex(r => r.id === draft.maxEarthRegionId);
  const spaceEndpoint = SPACE_PROGRESS.findIndex(r => r.id === draft.maxSpaceRegionId);
  const stopState = (index: number, endpoint: number) => index === endpoint ? "endpoint" : index < endpoint ? "reached" : "future";
  return <form className="progress-setup" onSubmit={e => { e.preventDefault(); onSave(draft); }}>
    <span className="eyebrow">{firstVisit ? "WELCOME TO DISCO ZOO GUIDE" : "YOUR GUIDE"}</span>
    <h1 id="progress-title">{firstVisit ? <>Choose your<br />spoiler level<span>.</span></> : "Spoiler settings."}</h1>
    <p>Choose how much of Disco Zoo the guide should reveal.</p>
    <fieldset className="progress-track progress-earth"><legend>Earth spoilers <span>{earthEndpoint + 1} / {EARTH_PROGRESS.length} visible</span></legend>
      <p className="progress-track-hint">Show regions through:</p>
      <div className="progress-destinations">{EARTH_PROGRESS.map((r, i) => <label key={r.id} data-progress-state={stopState(i, earthEndpoint)}>
        <input type="radio" name="earth-progress" value={r.id} checked={draft.maxEarthRegionId === r.id} aria-label={`${r.name}, ${i === earthEndpoint ? "show through this region" : i < earthEndpoint ? "visible" : "hidden"}`} onChange={() => setDraft({ ...draft, maxEarthRegionId: r.id })} />
        <span><small>{String(i + 1).padStart(2, "0")}</small><span className="journey-name">{r.name}</span>{i === earthEndpoint && <b className="journey-endpoint" aria-hidden="true">SHOW THROUGH</b>}</span>
      </label>)}</div>
    </fieldset>
    <fieldset className="progress-track progress-space"><legend>Space spoilers <span>{spaceEndpoint + 1} / {SPACE_PROGRESS.length} visible</span></legend>
      <div className="progress-space-heading"><p className="progress-track-hint">Independent from Earth.</p><label className="progress-space-none"><input type="radio" name="space-progress" value="none" checked={draft.maxSpaceRegionId === null} onChange={() => setDraft({ ...draft, maxSpaceRegionId: null })} /><span>Hide Space{draft.maxSpaceRegionId === null && <b aria-hidden="true">✓</b>}</span></label></div>
      <div className="progress-destinations">{SPACE_PROGRESS.map((r, i) => <label key={r.id} data-progress-state={stopState(i, spaceEndpoint)}>
        <input type="radio" name="space-progress" value={r.id} checked={draft.maxSpaceRegionId === r.id} aria-label={`${r.name}, ${i === spaceEndpoint ? "show through this region" : i < spaceEndpoint ? "visible" : "hidden"}`} onChange={() => setDraft({ ...draft, maxSpaceRegionId: r.id })} />
        <span><small>{String(i + 1).padStart(2, "0")}</small><span className="journey-name">{r.name}</span>{i === spaceEndpoint && <b className="journey-endpoint" aria-hidden="true">SHOW THROUGH</b>}</span>
      </label>)}</div>
    </fieldset>
    <fieldset className="progress-track progress-timeless"><legend>Timeless animals</legend><div className="timeless-choices">
      {[false, true].map(show => <label key={String(show)}><input type="radio" name="timeless-progress" aria-label={show ? "Show Timeless" : "Hide Timeless"} checked={draft.showTimeless === show} onChange={() => setDraft({ ...draft, showTimeless: show })} /><span>{show ? "Show" : "Hide"}{draft.showTimeless === show && <b aria-hidden="true">✓</b>}</span></label>)}
    </div></fieldset>
    <div className="progress-entry"><div className="progress-summary" aria-live="polite" aria-atomic="true"><span className="eyebrow">YOUR GUIDE WILL REVEAL</span><p>Earth through <strong>{EARTH_PROGRESS[earthEndpoint].name}</strong><span>{spaceEndpoint < 0 ? "No Space regions" : `Space through ${SPACE_PROGRESS[spaceEndpoint].name}`}</span><span>Timeless {draft.showTimeless ? "shown" : "hidden"}</span></p></div>
      <div className="progress-actions">{onCancel && <button type="button" className="rescue-secondary" onClick={onCancel}>Cancel</button>}<button type="submit" className="rescue-primary progress-save">{firstVisit ? "Enter Guide" : "Save settings"}<span aria-hidden="true">↗</span></button></div>
    </div>
  </form>;
}
