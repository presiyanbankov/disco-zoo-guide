import { ANIMALS } from "../../data/animals";
import { REGION_PRESENTATION } from "../regions/regionPresentation";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? (process.env.NODE_ENV === "production" ? "G-DJNRFJF66X" : "");
export type AnalyticsEvent = "rescue_opened" | "rescue_started" | "rescue_completed" | "rescue_strategy_selected" | "contextual_rescue_opened" | "spoiler_settings_changed";
type Params = { region?: string; animal?: string; strategy?: string; participant_count?: number; has_pet?: boolean; source_surface?: string };
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
const events = new Set(["rescue_opened", "rescue_started", "rescue_completed", "rescue_strategy_selected", "contextual_rescue_opened", "spoiler_settings_changed"]);

/** Runtime allowlist: never forward user text, URLs, query strings or arbitrary properties. */
export function sanitizeEventParams(params: Params): Params {
  const clean: Params = {};
  if (REGION_PRESENTATION.some(r => r.id === params.region)) clean.region = params.region;
  if (ANIMALS.some(a => a.id === params.animal)) clean.animal = params.animal;
  if (["balanced", "finish-found", "target", "rarity-focus"].includes(params.strategy ?? "")) clean.strategy = params.strategy;
  if (Number.isInteger(params.participant_count) && params.participant_count! >= 1 && params.participant_count! <= 3) clean.participant_count = params.participant_count;
  if (typeof params.has_pet === "boolean") clean.has_pet = params.has_pet;
  if (["rescue", "region", "animal", "spoiler_settings"].includes(params.source_surface ?? "")) clean.source_surface = params.source_surface;
  return clean;
}
export function validMeasurementId(id: string) { return /^G-[A-Z0-9]+$/.test(id); }
export function sendAnalytics(...args: unknown[]) {
  if (typeof window === "undefined" || !validMeasurementId(GA_MEASUREMENT_ID)) return;
  try {
    const browser = window as AnalyticsWindow;
    browser.dataLayer ??= [];
    // gtag's command queue expects an Arguments object, matching Google's bootstrap.
    // eslint-disable-next-line prefer-rest-params
    browser.gtag ??= function () { browser.dataLayer!.push(arguments); };
    browser.gtag(...args);
  } catch { /* Blocked analytics must never interrupt the guide. */ }
}
export function trackEvent(name: AnalyticsEvent, params: Params = {}) {
  if (events.has(name)) sendAnalytics("event", name, sanitizeEventParams(params));
}
