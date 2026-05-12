"use client";

import { useEffect, useState } from "react";

const RESET_ICON = encodeURI("/Sidebar Icons/auto_mode.svg");

const DERIVATIVE_ACCOUNTS = [
  { id: "usdm-main", label: "USDⓈ-M — Main" },
  { id: "coinm-main", label: "COIN-M — Main" },
  { id: "options", label: "Options — Main" },
] as const;

type Props = {
  onResetCharts: () => void;
};

export function HeaderTradeToolbar({ onResetCharts }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] =
    useState<(typeof DERIVATIVE_ACCOUNTS)[number]["id"]>("usdm-main");
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const id = window.setTimeout(() => {
      document.addEventListener("click", close);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("click", close);
    };
  }, [open]);

  const btnBase =
    "inline-flex h-[var(--v-header-toolbar-btn-h)] min-h-[var(--v-header-toolbar-btn-h)] shrink-0 items-center justify-center rounded-[0.375rem] border-[0.0625rem] border-v-border bg-[#232323] px-[0.875rem] text-[1.25rem] font-medium text-foreground transition-colors duration-150 hover:bg-v-hover focus-visible:outline focus-visible:outline-[0.125rem] focus-visible:outline-offset-[0.125rem] focus-visible:outline-v-muted";

  return (
    <div className="flex shrink-0 items-center gap-[0.75rem]">
      <div className="relative">
        <button
          type="button"
          className={`${btnBase} gap-[1.125rem]`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="derivatives-accounts-menu"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          <span>Derivatives accounts</span>
          <svg
            className={`h-[1.3125rem] w-[1.3125rem] shrink-0 text-v-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open ? (
          <div
            id="derivatives-accounts-menu"
            role="listbox"
            className="absolute left-0 top-[calc(100%+0.25rem)] z-50 min-w-[16rem] rounded-[0.375rem] border-[0.0625rem] border-v-border bg-v-panel py-[0.375rem] shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="border-b-[0.0625rem] border-v-border px-[0.875rem] pb-[0.375rem] pt-[0.125rem] text-[1.25rem] font-medium uppercase tracking-wide text-v-muted">
              Account
            </p>
            <ul className="py-[0.125rem]">
              {DERIVATIVE_ACCOUNTS.map((acc) => {
                const isSel = acc.id === selectedId;
                return (
                  <li key={acc.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSel}
                      className={[
                        "flex min-h-[var(--v-header-toolbar-btn-h)] w-full items-center gap-[0.5rem] px-[0.875rem] text-left text-[1.25rem] transition-colors",
                        isSel
                          ? "bg-v-hover text-foreground"
                          : "text-v-subtle hover:bg-v-hover/80 hover:text-foreground",
                      ].join(" ")}
                      onClick={() => {
                        setSelectedId(acc.id);
                        setOpen(false);
                      }}
                    >
                      {isSel ? (
                        <span className="w-[1rem] shrink-0 text-v-candle-up">
                          ✓
                        </span>
                      ) : (
                        <span className="w-[1rem] shrink-0" aria-hidden />
                      )}
                      {acc.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <button type="button" className={`${btnBase} gap-[0.5625rem]`} onClick={onResetCharts}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from /public */}
        <img
          src={RESET_ICON}
          alt=""
          draggable={false}
          className="pointer-events-none h-[1.25rem] w-[1.25rem] shrink-0 object-contain opacity-90"
        />
        <span>Reset charts</span>
      </button>
    </div>
  );
}
