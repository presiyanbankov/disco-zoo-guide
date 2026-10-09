"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { DEFAULT_PREFERENCES, PROGRESS_STORAGE_KEY, parsePreferences, serializePreferences, type SpoilerPreferences } from "./spoilerPreferences";
import { ProgressSetup } from "./ProgressSetup";

export const ProgressContext = createContext({ preferences: DEFAULT_PREFERENCES, save: (value: SpoilerPreferences) => { void value; }, openSettings: () => {} });
export function useProgress() { return useContext(ProgressContext); }

function ProgressDialog({ preferences, save, close }: { preferences: SpoilerPreferences; save: (p: SpoilerPreferences) => void; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element.showModal();
    return () => { element.close(); if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={dialog} className="progress-dialog" aria-labelledby="progress-title" onCancel={event => { event.preventDefault(); close(); }}><ProgressSetup initial={preferences} firstVisit={false} onSave={save} onCancel={close} /></dialog>;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [preferences, setPreferences] = useState<SpoilerPreferences | null>(null);
  const [settings, setSettings] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  useEffect(() => {
    // Local-only preferences must be read after hydration. Until then no page
    // children are rendered, so conservative initialization never flashes content.
    let saved: SpoilerPreferences | null = null;
    try { saved = parsePreferences(localStorage.getItem(PROGRESS_STORAGE_KEY)); } catch { /* Storage may be unavailable. */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration boundary for browser-only storage.
    setPreferences(saved); setLoaded(true);
    const synchronize = (event: StorageEvent) => { if (event.key === PROGRESS_STORAGE_KEY || event.key === null) { setPreferences(parsePreferences(event.newValue)); setSettings(false); } };
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, []);
  function save(value: SpoilerPreferences) {
    try { localStorage.setItem(PROGRESS_STORAGE_KEY, serializePreferences(value)); setStorageNotice(""); }
    catch { setStorageNotice("Spoiler settings saved for this visit. Browser storage is unavailable."); }
    setPreferences(value); setSettings(false);
  }
  if (!loaded) return <div className="progress-loading" role="status">Preparing your guide…</div>;
  if (!preferences) return <main className="progress-welcome"><ProgressSetup initial={DEFAULT_PREFERENCES} firstVisit onSave={save} /></main>;
  return <ProgressContext.Provider value={{ preferences, save, openSettings: () => setSettings(true) }}>
    {children}
    {storageNotice && <p className="progress-storage-notice" role="status">{storageNotice}</p>}
    {settings && <ProgressDialog preferences={preferences} close={() => setSettings(false)} save={save} />}
  </ProgressContext.Provider>;
}

export function ProgressControl() {
  const { openSettings } = useProgress();
  return <button type="button" className="progress-control" onClick={openSettings}>Spoilers</button>;
}
