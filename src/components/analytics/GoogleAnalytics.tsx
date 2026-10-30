"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { GA_MEASUREMENT_ID, sendAnalytics, validMeasurementId } from "./analytics";
let initialized = false;

export function GoogleAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (!validMeasurementId(GA_MEASUREMENT_ID)) return;
    if (!initialized) {
      initialized = true;
      sendAnalytics("js", new Date());
      sendAnalytics("config", GA_MEASUREMENT_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, page_location: location.origin + location.pathname, page_referrer: "" });
    }
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    sendAnalytics("event", "page_view", { page_path: pathname, page_location: location.origin + pathname, page_referrer: "" });
  }, [pathname]);
  return validMeasurementId(GA_MEASUREMENT_ID) ? <Script id="google-analytics" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" /> : null;
}
