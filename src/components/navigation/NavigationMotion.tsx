"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type NavigationOptions = { scroll?: boolean; replace?: boolean; keyboard?: boolean };
type Navigate = (href: string, options: NavigationOptions) => boolean;
type ActiveTransition = { transition: ViewTransition; settle: () => void };

const NavigationContext = createContext<Navigate>(() => false);

function pageHasArrived(pathname: string) {
  return location.pathname === pathname && [...document.querySelectorAll<HTMLElement>("[data-route-page]")]
    .some((page) => page.dataset.routePage === pathname || page.dataset.routePage === "not-found");
}

function focusHeading() {
  const heading = document.querySelector<HTMLElement>("#page-title");
  heading?.setAttribute("tabindex", "-1");
  heading?.focus({ preventScroll: true });
}

function RouteStage({ children }: { children: ReactNode }) {
  // Sample once on mount: finishing a native transition must not start a second fade.
  const [entryMotion] = useState(() => typeof document !== "undefined"
    && document.documentElement.dataset.routeTransition === "active" ? "shared" : "enter");
  return <div className="route-stage" data-entry-motion={entryMotion}>{children}</div>;
}

export function NavigationMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = useRef<ActiveTransition | null>(null);
  const keyboardDestination = useRef<string | null>(null);

  const navigate = useCallback<Navigate>((href, options) => {
    const destination = new URL(href, location.href);
    // Hash links and same-page actions keep Next's ordinary scroll behavior.
    if (destination.origin !== location.origin || destination.pathname === location.pathname) return false;
    keyboardDestination.current = options.keyboard ? destination.pathname : null;
    active.current?.transition.skipTransition();
    active.current?.settle();

    if (typeof document.startViewTransition !== "function" || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }

    const root = document.documentElement;
    root.dataset.routeTransition = "active";
    let settle = () => {};
    let navigationStarted = false;
    const move = () => {
      if (navigationStarted) return;
      navigationStarted = true;
      const url = destination.pathname + destination.search + destination.hash;
      if (options.replace) router.replace(url, { scroll: options.scroll });
      else router.push(url, { scroll: options.scroll });
    };

    try {
      const transition = document.startViewTransition(() => new Promise<void>((resolve) => {
        let finished = false;
        let snapshotTask = 0;
        const finish = () => {
          if (finished) return;
          finished = true;
          observer.disconnect();
          clearTimeout(deadline);
          clearTimeout(snapshotTask);
          resolve();
        };
        settle = finish;
        const inspect = () => {
          if (!pageHasArrived(destination.pathname) || snapshotTask || finished) return;
          // Rendering frames are suspended during snapshot updates. A task lets
          // Next finish its scroll work without waiting on a blocked frame.
          snapshotTask = window.setTimeout(() => {
            if (options.scroll !== false && destination.hash) {
              let anchorId = destination.hash.slice(1);
              try { anchorId = decodeURIComponent(anchorId); } catch { /* Keep malformed anchors harmless. */ }
              const anchor = document.getElementById(anchorId);
              anchor?.scrollIntoView({ behavior: "instant", block: "start" });
            }
            finish();
          }, 0);
        };
        const observer = new MutationObserver(inspect);
        observer.observe(document.body, { childList: true, subtree: true });
        const deadline = window.setTimeout(() => {
          transition.skipTransition();
          finish();
        }, 450);
        move();
        inspect();
      }));
      const current: ActiveTransition = { transition, settle: () => settle() };
      active.current = current;
      // Skipped/unsupported snapshots must never become unhandled rejections.
      void transition.ready.catch(() => {});
      void transition.finished.catch(() => {}).then(() => {
        if (active.current !== current) return;
        active.current = null;
        delete root.dataset.routeTransition;
        if (keyboardDestination.current === destination.pathname && pageHasArrived(destination.pathname)) {
          keyboardDestination.current = null;
          focusHeading();
        }
      });
      return true;
    } catch {
      delete root.dataset.routeTransition;
      // If no snapshot could start, let Link perform its normal navigation.
      return navigationStarted;
    }
  }, [router]);

  useEffect(() => {
    const destination = keyboardDestination.current;
    if (!destination || destination !== pathname) return;
    const inspect = () => {
      if (keyboardDestination.current !== destination) { observer.disconnect(); return; }
      if (active.current) return;
      if (!pageHasArrived(destination)) return;
      keyboardDestination.current = null;
      observer.disconnect();
      focusHeading();
    };
    const observer = new MutationObserver(inspect);
    observer.observe(document.body, { childList: true, subtree: true });
    inspect();
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const cancel = () => {
      active.current?.transition.skipTransition();
      active.current?.settle();
    };
    const updatePreference = () => { if (preference.matches) cancel(); };
    const restoreHistory = () => { keyboardDestination.current = null; cancel(); };
    // History restoration belongs to Next/the browser, not this motion layer.
    window.addEventListener("popstate", restoreHistory);
    preference.addEventListener("change", updatePreference);
    return () => {
      cancel();
      delete document.documentElement.dataset.routeTransition;
      window.removeEventListener("popstate", restoreHistory);
      preference.removeEventListener("change", updatePreference);
    };
  }, []);

  return <NavigationContext.Provider value={navigate}><RouteStage key={pathname}>{children}</RouteStage></NavigationContext.Provider>;
}

export function useNavigationMotion() {
  return useContext(NavigationContext);
}
