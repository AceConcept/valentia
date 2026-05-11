"use client";

import { useEffect, useState } from "react";

const TIME_LAYOUTS = [
  { id: "utc-hms-24", label: "24h · HH:mm:ss" },
  { id: "utc-hms-12", label: "12h · h:mm:ss a" },
  { id: "utc-iso", label: "ISO · UTC" },
  { id: "utc-compact", label: "Compact · yyyy-MM-dd" },
] as const;

type TimeLayoutId = (typeof TIME_LAYOUTS)[number]["id"];

function formatUtc(now: Date, layout: TimeLayoutId): string {
  switch (layout) {
    case "utc-hms-24":
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
    case "utc-hms-12":
      return new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
    case "utc-iso":
      return now.toISOString().replace(/\.\d{3}Z$/, "Z");
    case "utc-compact":
      return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
    default:
      return now.toISOString();
  }
}

function ClockGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const CLOCK_PLACEHOLDER = "--:--:--";
const CLOCK_PLACEHOLDER_ISO = "1970-01-01T00:00:00.000Z";

export function HeaderUtcClock() {
  const [layout, setLayout] = useState<TimeLayoutId>("utc-hms-24");
  const [open, setOpen] = useState(false);
  /** null until after mount so SSR + first client paint match (avoids hydration mismatch on `Date`). */
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const t = window.setTimeout(() => {
      document.addEventListener("click", close);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("click", close);
    };
  }, [open]);

  const timeText =
    now != null ? formatUtc(now, layout) : CLOCK_PLACEHOLDER;

  const utcBtnClass =
    "inline-flex h-[3rem] shrink-0 items-center justify-center gap-[0.375rem] rounded-[0.375rem] border-[0.0625rem] border-v-border bg-transparent px-[0.75rem] font-medium text-foreground transition-colors hover:bg-v-hover focus-visible:outline focus-visible:outline-[0.125rem] focus-visible:outline-offset-[0.125rem] focus-visible:outline-v-muted";

  return (
    <div
      className="flex shrink-0 flex-row items-center gap-[0.75rem]"
      dir="rtl"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static local asset */}
      <img
        src="/avatar-default.svg"
        alt="Profile"
        width={48}
        height={48}
        draggable={false}
        className="pointer-events-none h-[48px] w-[48px] shrink-0 rounded-full object-cover ring-1 ring-v-border"
      />

      <div className="relative shrink-0">
        <button
          type="button"
          dir="ltr"
          className={utcBtnClass}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="utc-time-layout-menu"
          aria-label="UTC time format"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          <ClockGlyph className="h-[1.75rem] w-[1.75rem] shrink-0 text-v-subtle" />
          <span className="whitespace-nowrap text-[1.25rem] tracking-wide">
            UTC
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from /public */}
          <img
            src="/MISC/exp-arrow.svg"
            alt=""
            width={16}
            height={16}
            draggable={false}
            className={`h-[1rem] w-[1rem] shrink-0 object-contain opacity-90 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {open ? (
          <div
            id="utc-time-layout-menu"
            role="listbox"
            aria-label="UTC time layout"
            className="absolute right-0 top-[calc(100%+0.25rem)] z-50 min-w-[14rem] rounded-[0.375rem] border-[0.0625rem] border-v-border bg-v-panel py-[0.375rem] shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="py-[0.125rem]">
              {TIME_LAYOUTS.map((opt) => {
                const selected = opt.id === layout;
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={[
                        "flex w-full items-center px-[0.875rem] py-[0.5rem] text-left text-[1.125rem] transition-colors",
                        selected
                          ? "bg-v-hover text-foreground"
                          : "text-v-subtle hover:bg-v-hover/80 hover:text-foreground",
                      ].join(" ")}
                      onClick={() => {
                        setLayout(opt.id);
                        setOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <time
        dateTime={now != null ? now.toISOString() : CLOCK_PLACEHOLDER_ISO}
        className="min-w-0 shrink font-mono text-[1.25rem] font-medium tabular-nums text-foreground"
      >
        {timeText}
      </time>
    </div>
  );
}
