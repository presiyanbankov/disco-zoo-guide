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
  return <dialog ref={dialog} className="progress-dialog" aria-labelledby="progress-title" onCancel={event => { event.preventDefault(); close(); }}><ProgressSetup initial={preferences} onSave={save} onCancel={close} /></dialog>;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [preferences, setPreferences] = useState<SpoilerPreferences>(DEFAULT_PREFERENCES);
  const [settings, setSettings] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  useEffect(() => {
    // Public content is server-rendered for everyone. Returning visitors' saved
    // restrictions are restored unchanged before the pre-hydration veil clears.
    let saved: SpoilerPreferences | null = null;
    try { saved = parsePreferences(localStorage.getItem(PROGRESS_STORAGE_KEY)); } catch { /* Storage may be unavailable. */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration boundary for browser-only storage.
    setPreferences(saved ?? DEFAULT_PREFERENCES); setLoaded(true);
    const synchronize = (event: StorageEvent) => { if (event.key === PROGRESS_STORAGE_KEY || event.key === null) { setPreferences(parsePreferences(event.newValue) ?? DEFAULT_PREFERENCES); setSettings(false); } };
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, []);
  useEffect(() => {
    if (loaded) delete document.documentElement.dataset.spoilerRestoring;
  }, [loaded]);
  function save(value: SpoilerPreferences) {
    try { localStorage.setItem(PROGRESS_STORAGE_KEY, serializePreferences(value)); setStorageNotice(""); }
    catch { setStorageNotice("Spoiler settings saved for this visit. Browser storage is unavailable."); }
    setPreferences(value); setSettings(false);
  }
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
