"use client";

import Link from "next/link";
import { useRef, type ComponentProps } from "react";
import { useNavigationMotion } from "./NavigationMotion";

type Props = Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & { href: string };

/** Keeps genuine URLs, prefetching, new-tab clicks, and native anchor semantics. */
export function TransitionLink({ href, onClick, scroll, replace, ...props }: Props) {
  const navigate = useNavigationMotion();
  const keyboard = useRef(false);
  return (
    <Link
      {...props}
      href={href}
      scroll={scroll}
      replace={replace}
      onClick={(event) => {
        keyboard.current = event.detail === 0;
        onClick?.(event);
      }}
      onNavigate={(event) => {
        if (navigate(href, { scroll, replace, keyboard: keyboard.current })) event.preventDefault();
      }}
    />
  );
}
