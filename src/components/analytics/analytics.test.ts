import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeEventParams, sendAnalytics, trackEvent, validMeasurementId } from "./analytics";

test("GA measurement IDs are validated", () => {
  assert.ok(validMeasurementId("G-DJNRFJF66X"));
  assert.ok(!validMeasurementId("<script>"));
  assert.ok(!validMeasurementId(""));
});
test("event parameters retain canonical IDs and fixed strategy values", () => {
  const params = { region: "farm", animal: "pig", strategy: "target", participant_count: 3, has_pet: true, source_surface: "animal" };
  assert.deepEqual(sanitizeEventParams(params), params);
});
test("arbitrary text, unknown fields and invalid counts are discarded", () => {
  assert.deepEqual(sanitizeEventParams({ region: "email@example.com", animal: "private text", strategy: "custom text", participant_count: 4, source_surface: "https://private.example", email: "secret" } as Parameters<typeof sanitizeEventParams>[0]), {});
});
test("analytics is safe during SSR", () => {
  assert.doesNotThrow(() => { sendAnalytics("event", "page_view"); trackEvent("rescue_started"); });
});

test("event wiring is global and explicit at product actions", async () => {
  const { readFileSync } = await import("node:fs");
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  assert.equal((layout.match(/<GoogleAnalytics \/>/g) ?? []).length, 1);
  const assistant = readFileSync("src/components/rescue/RescueAssistant.tsx", "utf8");
  for (const event of ["rescue_opened", "contextual_rescue_opened", "rescue_started", "rescue_completed", "rescue_strategy_selected"]) assert.ok(assistant.includes(`trackEvent("${event}"`));
  const provider = readFileSync("src/components/progress/ProgressProvider.tsx", "utf8");
  assert.ok(provider.includes('trackEvent("spoiler_settings_changed"'));
  const ga = readFileSync("src/components/analytics/GoogleAnalytics.tsx", "utf8");
  assert.ok(ga.includes("send_page_view: false"));
  assert.ok(ga.includes('lastPath.current === pathname'));
  assert.ok(!ga.includes('location.href'));
});

test("blocked analytics transport cannot throw into UI", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  try {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { gtag() { throw new Error("blocked"); } } });
    assert.doesNotThrow(() => trackEvent("rescue_started", { region: "farm" }));
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
