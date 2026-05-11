"use client";

import type { CandlestickData, Time } from "lightweight-charts";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { AppShell } from "@/components/AppShell";
import { MarketTickerBar, MarketTickerStrip, buildRows, formatPriceUSD } from "@/components/MarketTickerBar";
import { CandlestickChart } from "@/components/CandlestickChart";
import { HeaderTradeToolbar } from "@/components/HeaderTradeToolbar";
import { CryptoIcon } from "@/components/CryptoIcon";
import { MultiSymbolChartAnalysis } from "@/components/MultiSymbolChartAnalysis";
import type { Candle } from "@/lib/candles";
import { MARKETS, marketBySymbol } from "@/lib/tokens";

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

export function Dashboard() {
  const [leftSymbol, setLeftSymbol] = useState<string>(MARKETS[0].symbol);
  const [leftLabel, setLeftLabel] = useState<string>(MARKETS[0].label);
  const [rightSymbol, setRightSymbol] = useState<string | null>(null);
  const [rightLabel, setRightLabel] = useState<string | null>(null);

  const [dropHover, setDropHover] = useState(false);
  /** True after user picks a different list item than Chart A; shows compare zone until Chart B is set or user collapses. */
  const [compareZoneOpen, setCompareZoneOpen] = useState(false);
  /** True while dragging from the spot list so the compare column exists in the DOM (drop target). */
  const [listDragActive, setListDragActive] = useState(false);

  const [leftCandles, setLeftCandles] = useState<Candle[]>([]);
  const [leftLoading, setLeftLoading] = useState(true);
  const [leftError, setLeftError] = useState<string | null>(null);

  const [rightCandles, setRightCandles] = useState<Candle[]>([]);
  const [rightLoading, setRightLoading] = useState(false);
  const [rightError, setRightError] = useState<string | null>(null);

  /** Bumps on reset so charts remount and restore default zoom / interaction lock. */
  const [chartLayoutKey, setChartLayoutKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLeftCandles([]);
      setLeftLoading(true);
      setLeftError(null);
      try {
        const res = await fetch(
          `/api/candles?symbol=${encodeURIComponent(leftSymbol)}`,
        );
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
  }, [leftSymbol]);

  useEffect(() => {
    if (!rightSymbol) return;

    const symbol = rightSymbol;
    let cancelled = false;

    async function load() {
      setRightCandles([]);
      setRightLoading(true);
      setRightError(null);
      try {
        const res = await fetch(
          `/api/candles?symbol=${encodeURIComponent(symbol)}`,
        );
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
  }, [rightSymbol]);

  const leftChartData = useMemo(
    () => toChartCandles(leftCandles),
    [leftCandles],
  );
  const rightChartData = useMemo(
    () => toChartCandles(rightCandles),
    [rightCandles],
  );

  const anyLoading = leftLoading || (rightSymbol !== null && rightLoading);
  const dualChartsLoaded = rightSymbol !== null;
  const showCompareColumn =
    compareZoneOpen || dualChartsLoaded || listDragActive;
  const tickerRows = useMemo(() => buildRows(), []);

  const leftMarket = useMemo(() => marketBySymbol(leftSymbol), [leftSymbol]);
  const rightMarket = useMemo(
    () => (rightSymbol ? marketBySymbol(rightSymbol) : undefined),
    [rightSymbol],
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
    [],
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
      setDropHover(false);
      const p = parseDropPayload(e);
      if (!p) return;
      if (p.symbol === leftSymbol) return;
      setRightSymbol(p.symbol);
      setRightLabel(p.label);
      setCompareZoneOpen(false);
    },
    [leftSymbol, parseDropPayload],
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
      if (m.symbol === leftSymbol) {
        clearCompareChart();
        return;
      }
      setLeftSymbol(m.symbol);
      setLeftLabel(m.label);
      resetRightPane();
      setCompareZoneOpen(true);
    },
    [leftSymbol, clearCompareChart, resetRightPane],
  );

  const handleResetCharts = useCallback(() => {
    clearCompareChart();
    setLeftSymbol(MARKETS[0].symbol);
    setLeftLabel(MARKETS[0].label);
    setChartLayoutKey((k) => k + 1);
  }, [clearCompareChart]);

  return (
    <AppShell>
      <AppHeader
        toolbar={<HeaderTradeToolbar onResetCharts={handleResetCharts} />}
      />
      <MarketTickerStrip />

      <div className="flex min-h-0 flex-1">
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto p-[2rem]">
          {anyLoading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[0.125rem]">
              <p className="font-mono text-[1.25rem] text-v-muted">
                Loading candles…
              </p>
            </div>
          )}
          <div className="flex h-[45rem] min-h-0 shrink-0 flex-col rounded-[0.5rem] border-[0.0625rem] border-v-border bg-v-panel">
            <div className="border-b-[0.0625rem] border-v-border bg-[color:var(--v-chart-bg)] px-[1.5rem] py-[1rem]">
              <h2 className="text-[1.25rem] font-medium">
                {showCompareColumn
                  ? "Compare — 1h candlesticks"
                  : "1h candlesticks"}
              </h2>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-row gap-[1rem] p-[1rem]">
              <section
                className={
                  showCompareColumn
                    ? "flex min-h-0 min-w-0 flex-[1_1_50%] flex-col"
                    : "flex min-h-0 min-w-0 flex-1 flex-col"
                }
              >
                <div className="mb-[0.5rem] flex shrink-0 items-center justify-between gap-[0.75rem]">
                  <h3 className="flex items-center gap-[0.5rem] font-mono text-[1.25rem] font-medium text-v-subtle">
                    {leftMarket ? (
                      <CryptoIcon
                        iconSlug={leftMarket.iconSlug}
                        label={leftLabel}
                        className="h-[1.5rem] w-[1.5rem]"
                      />
                    ) : null}
                    {leftSymbol.replace("USDT", "")}/USDT
                  </h3>
                  <span className="text-[1.25rem] uppercase tracking-wide text-v-muted">
                    Chart A
                  </span>
                </div>
                {leftError ? (
                  <div className="mb-[0.75rem] rounded-[0.5rem] border-[0.0625rem] border-red-500/30 bg-red-950/35 px-[1rem] py-[0.75rem] font-mono text-[1.25rem] text-red-200">
                    {leftError}
                  </div>
                ) : null}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  <CandlestickChart
                    key={`${leftSymbol}-${chartLayoutKey}`}
                    candles={leftChartData}
                    className="h-full min-h-0 w-full min-w-0 flex-1"
                  />
                </div>
              </section>

              {showCompareColumn ? (
                <section className="flex min-h-0 min-w-0 flex-[1_1_50%] flex-col border-l-[0.0625rem] border-v-border pl-[1rem]">
                {rightSymbol !== null && rightLabel !== null ? (
                  <>
                    <div className="mb-[0.5rem] flex min-h-[3.5rem] shrink-0 items-center justify-between gap-[0.75rem]">
                      <h3 className="flex items-center gap-[0.5rem] font-mono text-[1.25rem] font-medium text-v-subtle">
                        {rightMarket ? (
                          <CryptoIcon
                            iconSlug={rightMarket.iconSlug}
                            label={rightLabel}
                            className="h-[1.5rem] w-[1.5rem]"
                          />
                        ) : null}
                        {rightSymbol.replace("USDT", "")}/USDT
                      </h3>
                      <div className="flex h-[3.5rem] items-center gap-[0.75rem]">
                        <span className="text-[1.25rem] uppercase tracking-wide text-v-muted">
                          Chart B
                        </span>
                        <button
                          type="button"
                          onClick={clearCompareChart}
                          className="inline-flex h-[3.5rem] shrink-0 items-center justify-center rounded-[0.375rem] border-[0.0625rem] border-v-border px-[1rem] font-mono text-[1.25rem] text-v-muted hover:border-v-muted hover:text-v-subtle"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {rightError ? (
                      <div className="mb-[0.75rem] rounded-[0.5rem] border-[0.0625rem] border-red-500/30 bg-red-950/35 px-[1rem] py-[0.75rem] font-mono text-[1.25rem] text-red-200">
                        {rightError}
                      </div>
                    ) : null}
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                      <CandlestickChart
                        key={`${rightSymbol}-${chartLayoutKey}`}
                        candles={rightChartData}
                        className="h-full min-h-0 w-full min-w-0 flex-1"
                      />
                    </div>
                  </>
                ) : (
                  <div
                    role="region"
                    aria-label="Compare chart drop zone"
                    onDrop={onCompareDrop}
                    onDragOver={onCompareDragOver}
                    onDragEnter={() => setDropHover(true)}
                    onDragLeave={() => setDropHover(false)}
                    className={`flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center rounded-[0.5rem] border-[0.1875rem] border-dashed px-[1.5rem] py-[2rem] text-center transition-[border-color,background-color] duration-150 ${
                      dropHover
                        ? "border-neutral-500 bg-white/[0.06]"
                        : "border-v-muted/50 bg-v-panel"
                    }`}
                  >
                    <p className="font-mono text-[1.25rem] font-medium text-v-subtle">
                      Compare zone
                    </p>
                    <p className="mt-[0.75rem] max-w-[18rem] text-[1.25rem] leading-relaxed text-v-muted">
                      Drag a spot pair from the list and release here to load
                      Chart B beside Chart A.
                    </p>
                  </div>
                )}
                </section>
              ) : null}
            </div>
          </div>
          <MultiSymbolChartAnalysis />
        </main>

        <aside className="crypto-sidebar flex w-[34rem] shrink-0 flex-col gap-[1.5rem] border-l-[0.0625rem] border-v-border bg-[#171717] [contain:layout]">
          <MarketTickerBar
            selectedSymbols={[
              leftSymbol,
              ...(rightSymbol !== null ? [rightSymbol] : []),
            ]}
          />
          <nav className="flex flex-1 flex-col gap-[0.5rem] overflow-y-auto p-[1.25rem]">
            {MARKETS.map((m, i) => {
              const onLeft = m.symbol === leftSymbol;
              const onRight = dualChartsLoaded && m.symbol === rightSymbol;
              const active = onLeft || onRight;
              const row = tickerRows[i]!;
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
                    <span className="font-mono text-[1.3125rem] font-medium text-foreground">
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
        </aside>
      </div>
    </AppShell>
  );
}
