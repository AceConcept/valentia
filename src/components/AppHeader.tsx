"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { HeaderUtcClock } from "@/components/HeaderUtcClock";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/trade", label: "Trade" },
  { href: "/portfolio", label: "Portfolio" },
] as const;

type Props = {
  /** After nav: e.g. derivatives menu + reset (trade page only). */
  toolbar?: ReactNode;
};

function navLinkClass(href: string, pathname: string | null): string {
  const isActive =
    href === "/"
      ? pathname === "/" || pathname === ""
      : pathname === href || pathname?.startsWith(`${href}/`);
  return [
    "inline-flex h-[3.5rem] items-center rounded-[0.375rem] px-[1rem] text-[1.25rem] font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-[0.125rem] focus-visible:outline-offset-[0.125rem] focus-visible:outline-v-muted",
    isActive
      ? "bg-v-hover text-foreground"
      : "text-v-muted hover:bg-v-hover/70 hover:text-v-subtle",
  ].join(" ");
}

export function AppHeader({ toolbar }: Props) {
  const pathname = usePathname();

  return (
    <header className="flex h-[var(--v-app-header-h)] min-h-[var(--v-app-header-h)] w-full min-w-0 shrink-0 items-center justify-between gap-[1.25rem] border-b-[0.0625rem] border-v-border px-[2.5rem]">
      <div className="flex min-w-0 flex-1 items-center">
        <nav
          className="flex shrink-0 items-center gap-[0.25rem]"
          aria-label="Main navigation"
        >
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={navLinkClass(href, pathname)}
            >
              {label}
            </Link>
          ))}
        </nav>
        {toolbar != null ? (
          <div className="ml-[1.25rem] flex shrink-0 items-center border-l-[0.0625rem] border-v-border pl-[1.25rem]">
            {toolbar}
          </div>
        ) : null}
      </div>
      <HeaderUtcClock />
    </header>
  );
}
