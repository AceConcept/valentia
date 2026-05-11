"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { CryptoIcon } from "@/components/CryptoIcon";
import { MARKETS } from "@/lib/tokens";

/** Demo 24h-style moves (placeholder until live quotes). */
const DEMO_PCT: number[] = [0.99, -0.48, 1.24, -0.87, 3.02, -1.15];
const DEMO_BASE_PRICE: number[] = [0.4203, 1840.55, 87233, 3120, 182, 616];

export type TickerRow = {
  symbol: string;
  name: string;
  iconSlug: string;
  pct: number;
  price: number;
};

export function formatPriceUSD(price: number): string {
  const abs = Math.abs(price);
  if (abs >= 100) return `$${Math.round(price).toLocaleString("en-US")}`;
  if (abs >= 10) return `$${price.toFixed(2)}`;
  if (abs < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
}

export function buildRows(): TickerRow[] {
  return MARKETS.map((m, i) => ({
    symbol: m.symbol,
    name: m.label.toUpperCase(),
    iconSlug: m.iconSlug,
    pct: DEMO_PCT[i % DEMO_PCT.length]!,
    price: DEMO_BASE_PRICE[i % DEMO_BASE_PRICE.length]!,
  }));
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-[2rem] w-[2rem] items-center justify-center rounded-[0.375rem] border-[0.0625rem] border-v-border bg-transparent text-v-muted transition-colors hover:bg-v-hover/50"
    >
      {children}
    </button>
  );
}

function TickerSegment({ row }: { row: TickerRow }) {
  const gain = row.pct >= 0;
  const color = gain ? "var(--v-candle-up)" : "var(--v-candle-down)";
  return (
    <div className="flex shrink-0 items-center justify-between gap-[1.5rem] px-[1.5rem] py-[0.25rem]">
      <div className="flex items-center gap-[0.75rem]">
        <CryptoIcon
          iconSlug={row.iconSlug}
          label={row.name}
          className="h-[1.5rem] w-[1.5rem] shrink-0"
        />
        <span className="whitespace-nowrap font-mono text-[1.25rem] font-semibold text-foreground">
          {row.name}
        </span>
      </div>

      <span className="flex shrink-0 items-center gap-[1.5rem] font-mono text-[1.25rem] font-semibold tabular-nums">
        <span className="whitespace-nowrap text-foreground">
          {formatPriceUSD(row.price)}
        </span>
        <span className="whitespace-nowrap" style={{ color }}>
          {row.pct.toFixed(2)}%
        </span>
      </span>
    </div>
  );
}

function TickerStrip({
  rows,
  duplicate,
}: {
  rows: TickerRow[];
  duplicate: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-stretch"
      aria-hidden={duplicate ? true : undefined}
    >
      {rows.map((row) => (
        <TickerSegment key={`${duplicate ? "b" : "a"}-${row.symbol}`} row={row} />
      ))}
    </div>
  );
}

function MagnifierGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function ListGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

function TrendingGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 17l6-6 4 4 7-10" />
      <path d="M14 5h7v7" />
    </svg>
  );
}

function MoreGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

/** Full-width animated marquee strip — place directly below AppHeader. */
export function MarketTickerStrip() {
  const rows = useMemo(() => buildRows(), []);
  return (
    <div className="market-ticker-root flex h-[3.5rem] min-h-[3.5rem] w-full min-w-0 shrink-0 items-center overflow-hidden border-b-[0.0625rem] border-v-border bg-[color:var(--v-chart-bg)]">
      <div className="market-ticker-track flex min-h-0 w-max">
        <TickerStrip rows={rows} duplicate={false} />
        <TickerStrip rows={rows} duplicate />
      </div>
    </div>
  );
}

/**
 * Crypto sidebar panel:
 * - selected coin(s) at top
 * - tab buttons + icon buttons
 * - search input
 */
export function MarketTickerBar({
  selectedSymbols,
}: {
  selectedSymbols: string[];
}) {
  const [tab, setTab] = useState<"gainers" | "trending">("gainers");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => buildRows(), []);
  const selected = selectedSymbols.length ? selectedSymbols : [MARKETS[0]!.symbol];
  const selectedRows = useMemo(() => {
    return selected.map((sym) => rows.find((r) => r.symbol === sym) ?? rows[0]!);
  }, [rows, selected]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) ||
        r.symbol.toLowerCase().includes(q)
      );
    });
  }, [query, rows]);

  const getPctColor = (pct: number) =>
    pct >= 0 ? "var(--v-candle-up)" : "var(--v-candle-down)";

  return (
    <div className="w-full min-w-0">
      <div className="overflow-hidden rounded-[0.5rem] border-[0.0625rem] border-v-border bg-v-panel">
        <div className="flex flex-col gap-[1.5rem]">
          <div className="flex flex-col">
            {selectedRows.map((r, idx) => {
              const pctColor = getPctColor(r.pct);
              return (
                <div
                  key={`selected-${r.symbol}`}
                  className={`flex h-fit min-h-0 w-full shrink-0 items-center gap-[1rem] px-[1.75rem] py-0 ${
                    idx === selectedRows.length - 1
                      ? ""
                      : "border-b-[0.0625rem] border-v-border"
                  }`}
                >
                  <div className="flex h-[4.875rem] w-[4.875rem] shrink-0 items-center justify-center rounded-full bg-[#2847ff]">
                    <CryptoIcon
                      iconSlug={r.iconSlug}
                      label={r.name}
                      className="h-[4.875rem] w-[4.875rem] shrink-0 ring-0"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="font-mono text-[1.3125rem] uppercase tracking-wide text-foreground">
                      {r.name}
                    </span>
                    <div className="mt-[0.25rem] flex items-center gap-[0.75rem]">
                      <span className="font-mono text-[1.3125rem] font-semibold tabular-nums text-foreground">
                        {formatPriceUSD(r.price)}
                      </span>
                      <span
                        className="font-mono text-[1.3125rem] font-semibold tabular-nums"
                        style={{ color: pctColor }}
                      >
                        {r.pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-[1rem] px-[1.25rem] py-[0.75rem]">
            <div className="flex items-center gap-[0.5rem]">
              <button
                type="button"
                onClick={() => setTab("gainers")}
                className={[
                  "inline-flex h-[2.25rem] items-center justify-center rounded-[0.375rem] border-[0.0625rem] px-[0.75rem] font-mono text-[1.3125rem] font-medium transition-colors",
                  tab === "gainers"
                    ? "border-v-border bg-v-hover text-foreground"
                    : "border-v-border bg-transparent text-v-muted hover:bg-v-hover/50",
                ].join(" ")}
              >
                Top Gainers
              </button>
              <button
                type="button"
                onClick={() => setTab("trending")}
                className={[
                  "inline-flex h-[2.25rem] items-center justify-center rounded-[0.375rem] border-[0.0625rem] px-[0.75rem] font-mono text-[1.3125rem] font-medium transition-colors",
                  tab === "trending"
                    ? "border-v-border bg-v-hover text-foreground"
                    : "border-v-border bg-transparent text-v-muted hover:bg-v-hover/50",
                ].join(" ")}
              >
                Trending
              </button>
            </div>

            <div className="flex items-center gap-[0.5rem]">
              <IconButton label="List view" onClick={() => setTab("gainers")}>
                <ListGlyph />
              </IconButton>
              <IconButton label="Trending" onClick={() => setTab("trending")}>
                <TrendingGlyph />
              </IconButton>
              <IconButton label="More" onClick={() => setTab(tab)}>
                <MoreGlyph />
              </IconButton>
            </div>
          </div>

          <div className="px-[1.25rem]">
            <div className="relative">
              <span className="pointer-events-none absolute left-[1.25rem] top-1/2 -translate-y-1/2 text-v-muted">
                <MagnifierGlyph />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-[3.5rem] w-full rounded-[0.375rem] border-[0.0625rem] border-v-border bg-transparent pl-[2.75rem] pr-[0.875rem] font-mono text-[1.125rem] font-medium text-foreground placeholder:text-v-muted outline-none focus-visible:outline focus-visible:outline-[0.125rem] focus-visible:outline-offset-[0.125rem] focus-visible:outline-v-muted"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
