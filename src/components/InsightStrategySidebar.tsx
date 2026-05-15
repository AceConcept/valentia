"use client";

import { useMemo, useState } from "react";

import { CryptoIcon } from "@/components/CryptoIcon";
import {
  buildRows,
  formatPriceUSD,
  type TickerRow,
} from "@/components/MarketTickerBar";
import { MARKETS, marketBySymbol, type Market } from "@/lib/tokens";

const ACCENT = "text-[#7ab8ff]";

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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-[1.25rem] w-[1.25rem] shrink-0 text-v-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
  );
}

function DownloadGlyph() {
  return (
    <svg
      className="h-[1.375rem] w-[1.375rem] text-v-subtle"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

type StrategyCopy = {
  overall: string;
  entryTitle: string;
  entryBody: string;
  riskTitle: string;
  riskBody: string;
  accordion1Title: string;
  obs1Title: string;
  obs1Body: string;
  obs2Title: string;
  obs2Body: string;
  accordion2Title: string;
};

function buildStrategyCopy(primary: Market, secondary: Market | undefined): StrategyCopy {
  const p = primary.label;
  const pid = primary.id;
  const pair = `${pid}/USDT`;

  if (secondary) {
    const s = secondary.label;
    const sid = secondary.id;
    return {
      overall: `Instead of chasing isolated spikes on ${s}, your multi-symbol read on the chart favors a higher-probability, lower-risk anchor: positioning around ${p} while ${s} digests its move. Use ${pair} as the primary execution leg and treat ${sid} as the context leg until both timeframes agree.`,
      entryTitle: "ENTRY LOGIC",
      entryBody: `You wait for ${p} to break cleanly through its local range with expanding volume, confirming that flow is stabilizing on ${pair} while ${s} cools off—only then do you add risk in line with the thesis.`,
      riskTitle: "RISK MANAGEMENT",
      riskBody: `You place a stop under the most recent swing low on ${pair}. Take profit scales into prior resistance on ${p}, with a plan to trail stops if ${s} stops dragging correlation lower.`,
      accordion1Title: `Liquidity is concentrating on ${p} first, which often leads ${s} to follow once the range resolves.`,
      obs1Title: `OBSERVATION ON ${secondary.label.toUpperCase()} (${sid})`,
      obs1Body: `Volume vs. avg: elevated. RSI: stretched vs. recent sessions.`,
      obs2Title: `OBSERVATION ON ${primary.label.toUpperCase()} (${pid})`,
      obs2Body: `Structure: constructive, but less one-sided than ${sid} on this window.`,
      accordion2Title: `${p}'s move is not purely passive beta—when it diverges from ${s}, treat it as a local catalyst worth respecting on size.`,
    };
  }

  return {
    overall: `Your chart work on ${p} points away from chasing every extension and toward a disciplined read on ${pair}: favor continuation only when volume and structure agree, and stand aside when the tape gets noisy around the highs.`,
    entryTitle: "ENTRY LOGIC",
    entryBody: `You wait for ${p} to reclaim its compression zone with a clear expansion in volume on ${pair}, confirming that buyers are willing to defend the breakout instead of fading it immediately.`,
    riskTitle: "RISK MANAGEMENT",
    riskBody: `You set a stop-loss below the consolidation range on ${pair}. Profit targets lean on the prior major resistance zone for ${p}, with a plan to trail your stop as the trend proves itself.`,
    accordion1Title: `Capital is leaning into ${p} first—treat that as a likely precursor to the next leg on ${pair} if breadth holds.`,
    obs1Title: `OBSERVATION ON ${primary.label.toUpperCase()} (${pid})`,
    obs1Body: "Volume vs. avg: elevated vs. the rolling mean. RSI: extended but not automatically bearish in a strong tape.",
    obs2Title: `CONTEXT ON ${pair}`,
    obs2Body: `Bias stays with ${p} while closes hold above the breakout pivot; a failed reclaim would invalidate the near-term long thesis.`,
    accordion2Title: `${p}'s move is not just generic risk-on drift—when it leads its own path on ${pair}, size with the understanding that catalysts can be name-specific.`,
  };
}

function pctColor(pct: number) {
  return pct >= 0 ? "var(--v-candle-up)" : "var(--v-candle-down)";
}

type Props = {
  leftSymbol: string;
  leftLabel: string;
  rightSymbol: string | null;
  rightLabel: string | null;
};

export function InsightStrategySidebar({
  leftSymbol,
  leftLabel,
  rightSymbol,
  rightLabel,
}: Props) {
  const [query, setQuery] = useState("");
  const [open1, setOpen1] = useState(true);
  const [open2, setOpen2] = useState(false);

  const primary = useMemo(
    () => marketBySymbol(leftSymbol) ?? MARKETS[0]!,
    [leftSymbol],
  );
  const secondary = useMemo(
    () => (rightSymbol ? marketBySymbol(rightSymbol) : undefined),
    [rightSymbol],
  );
  const secondaryLabel = secondary?.label ?? rightLabel ?? "";

  const copy = useMemo(
    () => buildStrategyCopy(primary, secondary),
    [primary, secondary],
  );

  const rows = useMemo(() => buildRows(), []);
  const selectedSymbols = useMemo(
    () => [leftSymbol, ...(rightSymbol ? [rightSymbol] : [])],
    [leftSymbol, rightSymbol],
  );
  const selectedRows = useMemo(() => {
    return selectedSymbols.map(
      (sym) => rows.find((r) => r.symbol === sym) ?? rows[0]!,
    );
  }, [rows, selectedSymbols]);

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

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-[1.25rem] overflow-hidden [contain:layout]">
      <div className="flex min-h-0 flex-1 flex-col gap-[1.25rem] overflow-y-auto px-[1.25rem]">
        <div className="flex shrink-0 items-start justify-between gap-[1rem]">
          <div className="flex min-w-0 items-center gap-[0.75rem]">
            {selectedRows.map((r: TickerRow) => (
              <div
                key={r.symbol}
                className="flex h-[3.5rem] w-[3.5rem] shrink-0 items-center justify-center rounded-full bg-[#2847ff]"
              >
                <CryptoIcon
                  iconSlug={r.iconSlug}
                  label={r.name}
                  className="h-[3.5rem] w-[3.5rem] shrink-0"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-label="Export strategy"
            className="inline-flex h-[3rem] w-[3rem] shrink-0 items-center justify-center rounded-[0.375rem] border-[0.0625rem] border-v-border bg-[#272727] text-foreground transition-colors hover:bg-[#333333] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            <DownloadGlyph />
          </button>
        </div>

        <div className="relative shrink-0">
          <span className="pointer-events-none absolute left-[1.25rem] top-1/2 z-[1] -translate-y-1/2 text-v-muted">
            <MagnifierGlyph />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-[3.5rem] w-full rounded-[0.375rem] border-[0.0625rem] border-solid border-v-border bg-[#272727] pl-[2.75rem] pr-[0.875rem] font-mono text-[1.125rem] font-light text-foreground placeholder:text-v-muted outline-none focus-visible:border-v-muted focus-visible:outline focus-visible:outline-[0.125rem] focus-visible:outline-offset-[0.125rem] focus-visible:outline-v-muted"
          />
        </div>

        <section
          aria-label="Generated strategy"
          className="flex shrink-0 flex-col gap-[1.25rem] rounded-[0.5rem] border-[0.0625rem] border-v-border bg-[#1c1c1c] p-[1.5rem]"
        >
          <h2 className="font-mono text-[1.125rem] font-semibold uppercase tracking-[0.12em] text-foreground">
            Trading Strategy
          </h2>
          <p className="font-mono text-[1.25rem] leading-relaxed text-[rgba(184,184,184,1)] [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace]">
            {copy.overall}
          </p>

          <div className="flex flex-col gap-[1rem]">
            <div className="rounded-[0.5rem] border-[0.0625rem] border-v-border bg-[#151515] p-[1.25rem] pb-[1.875rem]">
              <div className="flex w-full min-w-0 flex-col gap-[0.5rem]">
                <div className="flex items-center gap-[0.875rem]">
                  <CryptoIcon
                    iconSlug={primary.iconSlug}
                    label={leftLabel}
                    className="h-[2.25rem] w-[2.25rem] shrink-0"
                  />
                  <p
                    className={`m-0 min-w-0 font-mono text-[21px] font-semibold uppercase tracking-wide ${ACCENT}`}
                  >
                    {copy.entryTitle}
                  </p>
                </div>
                <p className="m-0 min-w-0 pl-[calc(2.25rem+0.875rem)] font-mono text-[1.1875rem] leading-relaxed text-v-muted [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace]">
                  {copy.entryBody}
                </p>
              </div>
            </div>

            <div className="rounded-[0.5rem] border-[0.0625rem] border-v-border bg-[#151515] p-[1.25rem] pb-[1.875rem]">
              <div className="flex w-full min-w-0 flex-col gap-[0.5rem]">
                <div className="flex items-center gap-[0.875rem]">
                  <CryptoIcon
                    iconSlug={(secondary ?? primary).iconSlug}
                    label={secondaryLabel || leftLabel}
                    className="h-[2.25rem] w-[2.25rem] shrink-0"
                  />
                  <p
                    className={`m-0 min-w-0 font-mono text-[21px] font-semibold uppercase tracking-wide ${ACCENT}`}
                  >
                    {copy.riskTitle}
                  </p>
                </div>
                <p className="m-0 min-w-0 pl-[calc(2.25rem+0.875rem)] font-mono text-[1.1875rem] leading-relaxed text-[rgba(201,201,201,1)] [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace]">
                  {copy.riskBody}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex min-h-0 flex-1 flex-col gap-[0.75rem]">
          <div className="rounded-[0.5rem] border-[0.0625rem] border-v-border bg-[#1c1c1c]">
            <button
              type="button"
              onClick={() => setOpen1((o) => !o)}
              className="flex w-full items-center justify-between gap-[1rem] px-[1.25rem] py-[1.125rem] text-left font-mono text-[1.25rem] leading-relaxed text-foreground [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace] transition-colors hover:bg-[#222]"
            >
              <span className="min-w-0 flex-1">{copy.accordion1Title}</span>
              <Chevron open={open1} />
            </button>
            {open1 ? (
              <div className="flex flex-col gap-[0.75rem] border-t-[0.0625rem] border-v-border px-[1.25rem] pb-[1.25rem] pt-[1rem]">
                <div className="rounded-[0.375rem] border-[0.0625rem] border-v-border bg-[#151515] p-[1rem] pb-[1.875rem]">
                  <div className="flex w-full min-w-0 flex-col gap-[0.5rem]">
                    <div className="flex items-center gap-[0.75rem]">
                      <CryptoIcon
                        iconSlug={(secondary ?? primary).iconSlug}
                        label={secondaryLabel || leftLabel}
                        className="h-[1.75rem] w-[1.75rem] shrink-0"
                      />
                      <p className="m-0 min-w-0 font-mono text-[21px] font-semibold uppercase tracking-wide text-foreground [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace]">
                        {copy.obs1Title}
                      </p>
                    </div>
                    <p className="m-0 min-w-0 pl-[calc(1.75rem+0.75rem)] font-mono text-[1.1875rem] leading-relaxed text-v-muted [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace]">
                      {copy.obs1Body}
                    </p>
                  </div>
                </div>
                <div className="rounded-[0.375rem] border-[0.0625rem] border-v-border bg-[#151515] p-[1rem] pb-[1.875rem]">
                  <div className="flex w-full min-w-0 flex-col gap-[0.5rem]">
                    <div className="flex items-center gap-[0.75rem]">
                      <CryptoIcon
                        iconSlug={primary.iconSlug}
                        label={leftLabel}
                        className="h-[1.75rem] w-[1.75rem] shrink-0"
                      />
                      <p className="m-0 min-w-0 font-mono text-[21px] font-semibold uppercase tracking-wide text-foreground [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace]">
                        {copy.obs2Title}
                      </p>
                    </div>
                    <p className="m-0 min-w-0 pl-[calc(1.75rem+0.75rem)] font-mono text-[1.1875rem] leading-relaxed text-v-muted [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace]">
                      {copy.obs2Body}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[0.5rem] border-[0.0625rem] border-v-border bg-[#1c1c1c]">
            <button
              type="button"
              onClick={() => setOpen2((o) => !o)}
              className="flex w-full items-center justify-between gap-[1rem] px-[1.25rem] py-[1.125rem] text-left font-mono text-[1.25rem] leading-relaxed text-foreground [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace] transition-colors hover:bg-[#222]"
            >
              <span className="min-w-0 flex-1">{copy.accordion2Title}</span>
              <Chevron open={open2} />
            </button>
            {open2 ? (
              <div className="border-t-[0.0625rem] border-v-border px-[1.25rem] pb-[1.25rem] pt-[1rem] font-mono text-[1.1875rem] leading-relaxed text-v-muted [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace]">
                Placeholder detail: watch how {primary.label} responds on{" "}
                {primary.id}/USDT
                {secondary
                  ? ` relative to ${secondary.label} when correlation breaks.`
                  : " when funding and spot basis diverge."}
              </div>
            ) : null}
          </div>
        </div>

        {query.trim() ? (
          <div className="flex shrink-0 flex-col gap-[0.5rem] rounded-[0.5rem] border-[0.0625rem] border-v-border bg-[#1c1c1c] p-[1rem]">
            <p className="font-mono text-[1rem] font-medium text-v-subtle">
              Matches
            </p>
            <ul className="flex max-h-[12rem] flex-col gap-[0.375rem] overflow-y-auto">
              {filteredRows.map((r) => (
                <li
                  key={r.symbol}
                  className="flex items-center justify-between gap-[0.75rem] rounded-[0.375rem] px-[0.5rem] py-[0.375rem] font-mono text-[1rem] text-foreground"
                >
                  <span className="flex min-w-0 items-center gap-[0.5rem]">
                    <CryptoIcon
                      iconSlug={r.iconSlug}
                      label={r.name}
                      className="h-[1.5rem] w-[1.5rem] shrink-0"
                    />
                    <span className="truncate">{r.name}</span>
                  </span>
                  <span
                    className="shrink-0 tabular-nums"
                    style={{ color: pctColor(r.pct) }}
                  >
                    {formatPriceUSD(r.price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
