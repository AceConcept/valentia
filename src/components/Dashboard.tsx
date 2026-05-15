"use client";

import type { CandlestickData, Time } from "lightweight-charts";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { AppShell } from "@/components/AppShell";
import {
  MarketTickerBar,
  MarketTickerStrip,
  buildRows,
  formatPriceUSD,
  type TickerRow,
} from "@/components/MarketTickerBar";
import { CandlestickChart } from "@/components/CandlestickChart";
import { HeaderTradeToolbar } from "@/components/HeaderTradeToolbar";
import { CryptoIcon } from "@/components/CryptoIcon";
import { GraphDescriptor } from "@/components/GraphDescriptor";
import {
  InsightArticleDetailPanel,
  InsightArticleStrategyHeader,
} from "@/components/InsightArticleDetailPanel";
import { InsightStrategySidebar } from "@/components/InsightStrategySidebar";
import { MultiSymbolChartAnalysis } from "@/components/MultiSymbolChartAnalysis";
import { SingleTokenChartToolbar } from "@/components/SingleTokenChartToolbar";
import type { Candle } from "@/lib/candles";
import type {
  FrozenChartSnapshot,
  InsightArticlePayload,
} from "@/lib/insight-view-payload";
import {
  CRYPTO_SIDEBAR_WIDTH_CLASS,
  INSIGHT_SIDEBAR_WIDTH_CLASS,
} from "@/lib/layout";
import { writeInsightViewPayload } from "@/lib/insight-view-payload";
import { MARKETS, SIDEBAR_MARKETS } from "@/lib/tokens";

const DND_MIME = "application/x-valentia-market+json";

function toChartCandles(rows: Candle[]): CandlestickData<Time>[] {
  return rows.map((c) => ({
    time: c.time as Time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));
}

type MarketDragPayload = {
  symbol: string;
  label: string;
  id: string;
};

/** Dashboard charts: 15m bars — more candles per request than 1h for the same limit. */
const CANDLE_FETCH_INTERVAL = "15m";
const CANDLE_FETCH_LIMIT = 1000;

function candlesFetchUrl(symbol: string): string {
  const q = new URLSearchParams({
    symbol,
    interval: CANDLE_FETCH_INTERVAL,
    limit: String(CANDLE_FETCH_LIMIT),
  });
  return `/api/candles?${q}`;
}

/** Trailing candle count whose span is ~24h for the active chart interval (HUD high/low). */
function barsApproximating24h(interval: string): number {
  const m = interval.match(/^(\d+)(m|h|d)$/i);
  if (!m) return 24;
  const n = Number(m[1]);
  const u = m[2]!.toLowerCase() as "m" | "h" | "d";
  const barMinutes = u === "m" ? n : u === "h" ? n * 60 : n * 24 * 60;
  return Math.max(2, Math.ceil((24 * 60) / barMinutes));
}

const HIGH_LOW_WINDOW_BARS = barsApproximating24h(CANDLE_FETCH_INTERVAL);

function highLowLast24Bars(candles: Candle[]): { high: number; low: number } | null {
  if (candles.length === 0) return null;
  const slice = candles.slice(-HIGH_LOW_WINDOW_BARS);
  let high = slice[0]!.high;
  let low = slice[0]!.low;
  for (const c of slice) {
    if (c.high > high) high = c.high;
    if (c.low < low) low = c.low;
  }
  return { high, low };
}

function formatUsdTwoDecimals(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ChartDescriptor24hHighLow({
  high,
  low,
  loading,
}: {
  high: number | null;
  low: number | null;
  loading: boolean;
}) {
  const ready = !loading && high !== null && low !== null;
  return (
    <div className="flex w-[455px] shrink-0 items-center justify-end gap-[80px] pl-[0.5rem]">
      <div className="flex flex-col items-end gap-[0.5rem]">
        <span className="font-mono text-base font-normal uppercase leading-[24px] tracking-[0.06em] text-v-muted">
          24h high
        </span>
        <span className="font-mono text-[1.75rem] font-extralight tabular-nums leading-none align-middle text-foreground">
          {ready ? formatUsdTwoDecimals(high) : "—"}
        </span>
      </div>
      <div className="flex flex-col items-end gap-[0.5rem]">
        <span className="font-mono text-base font-normal uppercase leading-none tracking-[0.06em] text-v-muted h-fit">
          24h low
        </span>
        <span className="font-mono text-[1.75rem] font-extralight tabular-nums leading-none align-middle text-foreground">
          {ready ? formatUsdTwoDecimals(low) : "—"}
        </span>
      </div>
    </div>
  );
}

/** Ticker fields; 56×56px icon; title stacked above price / gain–loss. */
function ChartDescriptorTickerRow({ row }: { row: TickerRow }) {
  const gain = row.pct >= 0;
  const color = gain ? "var(--v-candle-up)" : "var(--v-candle-down)";
  return (
    <div className="flex min-h-0 min-w-0 flex-1 shrink-0 items-center justify-center gap-[20px]">
      <CryptoIcon
        iconSlug={row.iconSlug}
        label={row.name}
        className="h-[3.5rem] w-[3.5rem] shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[0.25rem]">
        <span className="flex truncate font-mono text-[1.25rem] font-extralight text-foreground">
          {row.name}
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-[0.75rem]">
          <span className="flex whitespace-nowrap font-mono text-[1.625rem] font-semibold tabular-nums text-foreground">
            {formatPriceUSD(row.price)}
          </span>
          <span
            className="whitespace-nowrap font-mono text-[1rem] font-semibold tabular-nums"
            style={{ color }}
          >
            {row.pct.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export type DashboardProps = {
  /** Restored chart from session snapshot; sidebar does not mutate chart state. */
  chartSource?: "live" | "snapshot";
  snapshot?: FrozenChartSnapshot | null;
  /** When set (insight page), replaces the insight card grid with expanded copy. */
  articleDetail?: InsightArticlePayload | null;
};

export function Dashboard({
  chartSource = "live",
  snapshot = null,
  articleDetail = null,
}: DashboardProps) {
  const router = useRouter();
  if (chartSource === "snapshot" && snapshot === null) return null;

  const chartSnap = chartSource === "snapshot" ? snapshot : null;
  const chartFrozen = chartSnap !== null;

  const [leftSymbol, setLeftSymbol] = useState<string>(
    () => chartSnap?.leftSymbol ?? MARKETS[0].symbol,
  );
  const [leftLabel, setLeftLabel] = useState<string>(
    () => chartSnap?.leftLabel ?? MARKETS[0].label,
  );
  const [rightSymbol, setRightSymbol] = useState<string | null>(
    () => chartSnap?.rightSymbol ?? null,
  );
  const [rightLabel, setRightLabel] = useState<string | null>(
    () => chartSnap?.rightLabel ?? null,
  );

  const [dropHover, setDropHover] = useState(false);
  /** True after user picks a different list item than Chart A; shows compare zone until Chart B is set or user collapses. */
  const [compareZoneOpen, setCompareZoneOpen] = useState(
    () => chartSnap?.compareZoneOpen ?? false,
  );
  /** True while dragging from the spot list so the compare column exists in the DOM (drop target). */
  const [listDragActive, setListDragActive] = useState(false);

  /** Sidebar list filter: Top Gainers = same “green” threshold as row styling (`pct >= 0`). */
  const [sidebarListTab, setSidebarListTab] = useState<"gainers" | "trending">(
    "gainers",
  );

  const [leftCandles, setLeftCandles] = useState<Candle[]>(
    () => chartSnap?.leftCandles ?? [],
  );
  const [leftLoading, setLeftLoading] = useState(() => !chartFrozen);
  const [leftError, setLeftError] = useState<string | null>(null);

  const [rightCandles, setRightCandles] = useState<Candle[]>(
    () => chartSnap?.rightCandles ?? [],
  );
  const [rightLoading, setRightLoading] = useState(
    () =>
      Boolean(
        chartSnap &&
          chartSnap.rightSymbol !== null &&
          chartSnap.rightCandles.length === 0,
      ),
  );
  const [rightError, setRightError] = useState<string | null>(null);

  /** Bumps on reset so charts remount and restore default zoom / interaction lock. */
  const [chartLayoutKey, setChartLayoutKey] = useState(
    () => chartSnap?.chartLayoutKey ?? 0,
  );

  /** Which insight card (0–5) shows its trend square on Chart A, or `null` when none. */
  const [insightCardOverlayActiveIndex, setInsightCardOverlayActiveIndex] =
    useState<number | null>(null);

  useEffect(() => {
    setInsightCardOverlayActiveIndex(null);
  }, [leftSymbol, rightSymbol, chartLayoutKey]);

  useEffect(() => {
    if (articleDetail) setInsightCardOverlayActiveIndex(null);
  }, [articleDetail]);

  useEffect(() => {
    if (chartFrozen) return;

    let cancelled = false;

    async function load() {
      setLeftCandles([]);
      setLeftLoading(true);
      setLeftError(null);
      try {
        const res = await fetch(candlesFetchUrl(leftSymbol));
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLeftError(
            typeof body.error === "string" ? body.error : "Request failed",
          );
          setLeftCandles([]);
          return;
        }
        setLeftCandles(body.candles as Candle[]);
      } catch {
        if (!cancelled) {
          setLeftError("Network error");
          setLeftCandles([]);
        }
      } finally {
        if (!cancelled) setLeftLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [leftSymbol, chartFrozen]);

  useEffect(() => {
    if (chartFrozen) return;
    if (!rightSymbol) return;

    const symbol = rightSymbol;
    let cancelled = false;

    async function load() {
      setRightCandles([]);
      setRightLoading(true);
      setRightError(null);
      try {
        const res = await fetch(candlesFetchUrl(symbol));
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setRightError(
            typeof body.error === "string" ? body.error : "Request failed",
          );
          setRightCandles([]);
          return;
        }
        setRightCandles(body.candles as Candle[]);
      } catch {
        if (!cancelled) {
          setRightError("Network error");
          setRightCandles([]);
        }
      } finally {
        if (!cancelled) setRightLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [rightSymbol, chartFrozen]);

  const leftChartData = useMemo(
    () => toChartCandles(leftCandles),
    [leftCandles],
  );
  const rightChartData = useMemo(
    () => toChartCandles(rightCandles),
    [rightCandles],
  );

  const leftHighLow24h = useMemo(
    () => highLowLast24Bars(leftCandles),
    [leftCandles],
  );
  const rightHighLow24h = useMemo(
    () => highLowLast24Bars(rightCandles),
    [rightCandles],
  );

  const anyLoading = leftLoading || (rightSymbol !== null && rightLoading);
  const dualChartsLoaded = rightSymbol !== null;
  const showCompareColumn =
    compareZoneOpen || dualChartsLoaded || listDragActive;
  const tickerRows = useMemo(() => buildRows(), []);
  const sidebarMarkets = useMemo(() => {
    const base = [...SIDEBAR_MARKETS];
    if (sidebarListTab === "trending") return base;
    const pctBySymbol = new Map(tickerRows.map((r) => [r.symbol, r.pct]));
    return base.sort((a, b) => {
      const pa = pctBySymbol.get(a.symbol) ?? 0;
      const pb = pctBySymbol.get(b.symbol) ?? 0;
      if (pb !== pa) return pb - pa;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [sidebarListTab, tickerRows]);
  const leftTickerRow = useMemo(
    () => tickerRows.find((r) => r.symbol === leftSymbol) ?? tickerRows[0]!,
    [tickerRows, leftSymbol],
  );
  const rightTickerRow = useMemo(
    () =>
      rightSymbol
        ? tickerRows.find((r) => r.symbol === rightSymbol) ?? tickerRows[0]!
        : null,
    [tickerRows, rightSymbol],
  );

  const resetRightPane = useCallback(() => {
    setRightSymbol(null);
    setRightLabel(null);
    setRightCandles([]);
    setRightError(null);
  }, []);

  const onListDragEnd = useCallback(() => {
    setListDragActive(false);
  }, []);

  const onMarketDragStart = useCallback(
    (m: (typeof MARKETS)[number]) => (e: React.DragEvent) => {
      if (chartFrozen) return;
      setListDragActive(true);
      const payload: MarketDragPayload = {
        symbol: m.symbol,
        label: m.label,
        id: m.id,
      };
      const json = JSON.stringify(payload);
      e.dataTransfer.setData(DND_MIME, json);
      e.dataTransfer.setData("text/plain", m.symbol);
      e.dataTransfer.effectAllowed = "copy";
    },
    [chartFrozen],
  );

  const parseDropPayload = useCallback((e: React.DragEvent) => {
    const raw = e.dataTransfer.getData(DND_MIME);
    if (raw) {
      try {
        const p = JSON.parse(raw) as MarketDragPayload;
        if (p.symbol && p.label) return p;
      } catch {
        /* fall through */
      }
    }
    const plain = e.dataTransfer.getData("text/plain").trim();
    if (plain) {
      const market = MARKETS.find((x) => x.symbol === plain);
      if (market) {
        return {
          symbol: market.symbol,
          label: market.label,
          id: market.id,
        } satisfies MarketDragPayload;
      }
    }
    return null;
  }, []);

  const onCompareDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (chartFrozen) return;
      setDropHover(false);
      const p = parseDropPayload(e);
      if (!p) return;
      if (p.symbol === leftSymbol) return;
      setRightSymbol(p.symbol);
      setRightLabel(p.label);
      setCompareZoneOpen(false);
    },
    [leftSymbol, parseDropPayload, chartFrozen],
  );

  const onCompareDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const clearCompareChart = useCallback(() => {
    resetRightPane();
    setCompareZoneOpen(false);
  }, [resetRightPane]);

  const handleSelectChartA = useCallback(
    (m: (typeof MARKETS)[number]) => {
      if (chartFrozen) return;
      if (m.symbol === leftSymbol) {
        clearCompareChart();
        return;
      }
      setLeftSymbol(m.symbol);
      setLeftLabel(m.label);
      resetRightPane();
      setCompareZoneOpen(true);
    },
    [leftSymbol, clearCompareChart, resetRightPane, chartFrozen],
  );

  const openInsightArticle = useCallback(
    (article: InsightArticlePayload) => {
      if (chartFrozen) return;
      setInsightCardOverlayActiveIndex(null);
      writeInsightViewPayload({
        chart: {
          v: 1,
          leftSymbol,
          leftLabel,
          leftCandles,
          rightSymbol,
          rightLabel,
          rightCandles,
          chartLayoutKey,
          compareZoneOpen,
        },
        article,
      });
      router.push("/insight");
    },
    [
      chartFrozen,
      leftSymbol,
      leftLabel,
      leftCandles,
      rightSymbol,
      rightLabel,
      rightCandles,
      chartLayoutKey,
      compareZoneOpen,
      router,
    ],
  );

  const handleResetCharts = useCallback(() => {
    if (chartFrozen) {
      router.push("/");
      return;
    }
    clearCompareChart();
    setLeftSymbol(MARKETS[0].symbol);
    setLeftLabel(MARKETS[0].label);
    setChartLayoutKey((k) => k + 1);
  }, [chartFrozen, clearCompareChart, router]);

  return (
    <AppShell>
      <AppHeader
        toolbar={<HeaderTradeToolbar onResetCharts={handleResetCharts} />}
      />
      <MarketTickerStrip />

      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-row bg-[#151515]">
        <main
          className="v-dashboard-main-scroll relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto bg-[rgba(13,13,13,1)] px-[72px] pt-[56px] pb-[2rem]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {anyLoading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[0.125rem]">
              <p className="font-mono text-[1.25rem] text-v-muted">
                Loading candles…
              </p>
            </div>
          )}
          <SingleTokenChartToolbar
            multiToken={dualChartsLoaded}
            article={articleDetail}
            chartLabel={leftLabel}
          />
          <div className="flex h-[45rem] min-h-0 shrink-0 flex-col rounded-[0.5rem] bg-v-panel">
            <div className="flex min-h-0 min-w-0 flex-1 flex-row gap-[36px] p-0">
              <section
                className={
                  showCompareColumn
                    ? dualChartsLoaded
                      ? "flex min-h-0 min-w-0 flex-[1_1_50%] flex-col gap-0 bg-[unset]"
                      : "flex min-h-0 min-w-0 flex-[1_1_68%] flex-col gap-0 bg-[unset]"
                    : "flex min-h-0 min-w-0 flex-1 flex-col gap-0 bg-[unset]"
                }
              >
                <GraphDescriptor>
                  <div className="flex min-w-0 flex-1">
                    <ChartDescriptorTickerRow row={leftTickerRow} />
                  </div>
                  <ChartDescriptor24hHighLow
                    high={leftHighLow24h?.high ?? null}
                    low={leftHighLow24h?.low ?? null}
                    loading={leftLoading}
                  />
                </GraphDescriptor>
                {leftError ? (
                  <div className="rounded-[0.5rem] border-[0.0625rem] border-red-500/30 bg-red-950/35 px-[1rem] py-[0.75rem] font-mono text-[1.25rem] text-red-200">
                    {leftError}
                  </div>
                ) : null}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  <CandlestickChart
                    key={`${leftSymbol}-${chartLayoutKey}`}
                    candles={leftChartData}
                    className="h-full min-h-0 w-full min-w-0 flex-1"
                    insightPositionOverlayActiveCardIndex={
                      articleDetail ? null : insightCardOverlayActiveIndex
                    }
                    onInsightPositionOverlaysRequestClose={() =>
                      setInsightCardOverlayActiveIndex(null)
                    }
                  />
                </div>
              </section>

              {showCompareColumn ? (
                <section
                  className={
                    dualChartsLoaded
                      ? "flex min-h-0 min-w-0 flex-[1_1_50%] flex-col gap-0 bg-[unset]"
                      : "flex min-h-0 min-w-0 flex-[1_1_32%] flex-col gap-0 bg-[unset]"
                  }
                >
                {rightSymbol !== null && rightLabel !== null ? (
                  <>
                    <GraphDescriptor>
                      <div className="flex min-w-0 flex-1">
                        <ChartDescriptorTickerRow row={rightTickerRow!} />
                      </div>
                      <div className="flex shrink-0 items-center gap-[0.75rem]">
                        <ChartDescriptor24hHighLow
                          high={rightHighLow24h?.high ?? null}
                          low={rightHighLow24h?.low ?? null}
                          loading={rightLoading}
                        />
                        <button
                          type="button"
                          disabled={chartFrozen}
                          onClick={clearCompareChart}
                          aria-label="Remove compare chart"
                          className="inline-flex h-[2.25rem] w-[2.25rem] shrink-0 items-center justify-center rounded-[0.375rem] border-[0.0625rem] border-white/60 text-white/60 transition-colors hover:border-white/60 hover:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <svg
                            className="h-[1.125rem] w-[1.125rem]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            aria-hidden
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </GraphDescriptor>
                    {rightError ? (
                      <div className="rounded-[0.5rem] border-[0.0625rem] border-red-500/30 bg-red-950/35 px-[1rem] py-[0.75rem] font-mono text-[1.25rem] text-red-200">
                        {rightError}
                      </div>
                    ) : null}
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                      <CandlestickChart
                        key={`${rightSymbol}-${chartLayoutKey}`}
                        candles={rightChartData}
                        className="h-full min-h-0 w-full min-w-0 flex-1"
                        insightPositionOverlayActiveCardIndex={
                          articleDetail ? null : insightCardOverlayActiveIndex
                        }
                        onInsightPositionOverlaysRequestClose={() =>
                          setInsightCardOverlayActiveIndex(null)
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div
                    role="region"
                    aria-label="Compare chart drop zone"
                    onDrop={onCompareDrop}
                    onDragOver={onCompareDragOver}
                    onDragEnter={() => {
                      if (chartFrozen) return;
                      setDropHover(true);
                    }}
                    onDragLeave={() => {
                      if (chartFrozen) return;
                      setDropHover(false);
                    }}
                    className={`flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center rounded-[0.5rem] border-[0.1875rem] border-dashed px-[1.5rem] py-[2rem] text-center transition-[border-color,background-color] duration-150 ${
                      chartFrozen ? "pointer-events-none select-none opacity-80 " : ""
                    }${
                      dropHover
                        ? "border-neutral-500 bg-white/[0.06]"
                        : "border-v-muted/50 bg-v-panel"
                    }`}
                  >
                    <p className="font-mono text-[1.25rem] font-medium text-v-subtle">
                      Compare zone
                    </p>
                    <p className="mt-[0.75rem] max-w-full text-[1.25rem] leading-relaxed text-v-muted">
                      Drag a spot pair from the list and release here to load
                      Chart B beside Chart A.
                    </p>
                  </div>
                )}
                </section>
              ) : null}
            </div>
          </div>
          {articleDetail ? (
            <section className="mt-[1.5rem] flex w-full min-w-0 shrink-0 flex-col gap-[2rem] pb-[0.5rem]">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex w-fit shrink-0 items-center gap-[0.5rem] rounded-[0.375rem] border-[0.0625rem] border-v-border bg-[#171717] px-[1rem] py-[0.625rem] font-mono text-[1.125rem] font-medium text-v-subtle transition-colors hover:border-v-muted/40 hover:bg-[#1c1c1c] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v-muted/35"
              >
                ← Back to markets
              </button>
              <InsightArticleStrategyHeader />
              <InsightArticleDetailPanel
                article={articleDetail}
                dualChart={dualChartsLoaded}
                leftSymbol={leftSymbol}
                rightSymbol={rightSymbol}
              />
            </section>
          ) : (
            <MultiSymbolChartAnalysis
              dualChart={dualChartsLoaded}
              chartALabel={leftLabel}
              chartBLabel={rightLabel ?? "Chart B"}
              chartPrimarySymbol={leftSymbol}
              onInsightArticleOpen={openInsightArticle}
              onInsightCardSurfaceActivate={
                chartFrozen || articleDetail
                  ? undefined
                  : (cardIndex) =>
                      setInsightCardOverlayActiveIndex((cur) =>
                        cur === cardIndex ? null : cardIndex,
                      )
              }
            />
          )}
        </main>

        <aside
          className={[
            chartFrozen ? "insight-sidebar" : "crypto-sidebar",
            chartFrozen ? INSIGHT_SIDEBAR_WIDTH_CLASS : CRYPTO_SIDEBAR_WIDTH_CLASS,
            "flex min-h-0 shrink-0 flex-col gap-[1.5rem] border-l-[0.0625rem] border-v-border bg-[#171717] py-[1.5rem] [contain:layout]",
          ].join(" ")}
        >
          {chartFrozen ? (
            <InsightStrategySidebar
              leftSymbol={leftSymbol}
              leftLabel={leftLabel}
              rightSymbol={rightSymbol}
              rightLabel={rightLabel}
            />
          ) : (
            <>
              <MarketTickerBar
                selectedSymbols={[
                  leftSymbol,
                  ...(rightSymbol !== null ? [rightSymbol] : []),
                ]}
                listTab={sidebarListTab}
                onListTabChange={setSidebarListTab}
              />
              <nav className="flex flex-1 flex-col gap-[0.5rem] overflow-y-auto p-[1.25rem]">
                {sidebarMarkets.map((m) => {
                  const onLeft = m.symbol === leftSymbol;
                  const onRight = dualChartsLoaded && m.symbol === rightSymbol;
                  const active = onLeft || onRight;
                  const row =
                    tickerRows.find((r) => r.symbol === m.symbol) ?? tickerRows[0]!;
                  const pctColor = row.pct >= 0 ? "var(--v-candle-up)" : "var(--v-candle-down)";
                  return (
                    <button
                      key={m.id}
                      type="button"
                      draggable
                      onDragStart={onMarketDragStart(m)}
                      onDragEnd={onListDragEnd}
                      onClick={() => handleSelectChartA(m)}
                      className={`flex h-[6.5rem] shrink-0 cursor-grab items-center justify-between gap-[0.75rem] rounded-[0.5rem] px-[1.5rem] text-left transition-colors active:cursor-grabbing ${
                        active ? "bg-[#474747]" : "bg-[#272727] hover:bg-[#333333]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-[0.875rem]">
                        <CryptoIcon
                          iconSlug={m.iconSlug}
                          label={m.label}
                          className="h-[3.125rem] w-[3.125rem]"
                        />
                        <span className="font-mono text-[1.3125rem] font-light text-foreground">
                          {m.label.toUpperCase()}
                        </span>
                      </span>
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-[1.4375rem] font-semibold tabular-nums text-foreground">
                          {formatPriceUSD(row.price)}
                        </span>
                        <span
                          className="mt-[0.125rem] font-mono text-[1.3125rem] font-light tabular-nums"
                          style={{ color: pctColor }}
                        >
                          {row.pct.toFixed(2)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
