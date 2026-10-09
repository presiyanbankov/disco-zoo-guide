"use client";

import { usePathname } from "next/navigation";
import { TransitionLink } from "../navigation/TransitionLink";

export function RescueHeaderAction({ active, href = "/rescue" }: { active: boolean; href?: string }) {
  const label = <><span className="rescue-nav-desktop">Rescue Assistant</span><span className="rescue-nav-mobile">Rescue</span><span aria-hidden="true">{active ? "✓" : "↗"}</span></>;
  // On this route the prominent marker says where you are; it is not a dead button.
  return active
    ? <span className="rescue-header-link" data-active="true" aria-current="page" aria-label="Rescue Assistant, current page">{label}</span>
    : <TransitionLink href={href} className="rescue-header-link" aria-label="Rescue Assistant">{label}</TransitionLink>;
}

export function RescueHeaderLink({ href = "/rescue" }: { href?: string }) {
  return <RescueHeaderAction active={usePathname() === "/rescue"} href={href} />;
}
