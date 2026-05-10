"use client";

import type { CandlestickData, Time } from "lightweight-charts";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CandlestickChart } from "@/components/CandlestickChart";
import type { Candle } from "@/lib/candles";
import { MARKETS } from "@/lib/tokens";

const DEFAULT_CAPTION =
  "Data via Binance public API (proxied through this app).";

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

  const [leftCandles, setLeftCandles] = useState<Candle[]>([]);
  const [leftLoading, setLeftLoading] = useState(true);
  const [leftError, setLeftError] = useState<string | null>(null);
  const [leftCaption, setLeftCaption] = useState(DEFAULT_CAPTION);

  const [rightCandles, setRightCandles] = useState<Candle[]>([]);
  const [rightLoading, setRightLoading] = useState(false);
  const [rightError, setRightError] = useState<string | null>(null);
  const [rightCaption, setRightCaption] = useState(DEFAULT_CAPTION);

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
        if (body.source === "coingecko" && typeof body.note === "string") {
          setLeftCaption(body.note);
        } else {
          setLeftCaption(DEFAULT_CAPTION);
        }
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
        if (body.source === "coingecko" && typeof body.note === "string") {
          setRightCaption(body.note);
        } else {
          setRightCaption(DEFAULT_CAPTION);
        }
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
  const compareMode = rightSymbol !== null;

  const handleSelectChartA = useCallback(
    (m: (typeof MARKETS)[number]) => {
      setLeftSymbol(m.symbol);
      setLeftLabel(m.label);
    },
    [],
  );

  const onMarketDragStart = useCallback(
    (m: (typeof MARKETS)[number]) => (e: React.DragEvent) => {
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
    return null;
  }, []);

  const onCompareDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropHover(false);
      const p = parseDropPayload(e);
      if (!p) return;
      setRightSymbol(p.symbol);
      setRightLabel(p.label);
    },
    [parseDropPayload],
  );

  const onCompareDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const clearCompareChart = useCallback(() => {
    setRightSymbol(null);
    setRightLabel(null);
    setRightCandles([]);
    setRightError(null);
    setRightCaption(DEFAULT_CAPTION);
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-[#0c0e12] text-[#e8eaed]">
      <header className="flex h-[5.5rem] shrink-0 items-center border-b border-[#2a2e39] px-[2.5rem]">
        <div>
          <p className="font-mono text-[0.875rem] uppercase tracking-[0.125rem] text-[#758696]">
            Valentia
          </p>
          <h1 className="text-[1.75rem] font-semibold tracking-tight">
            Markets
          </h1>
        </div>
        <div className="ml-auto flex max-w-[60%] flex-col items-end gap-[0.25rem] text-right">
          <div className="flex flex-wrap items-baseline justify-end gap-x-[1rem] gap-y-[0.25rem]">
            <span className="font-mono text-[1.125rem] text-[#26a69a]">
              {leftSymbol.replace("USDT", "")}
              <span className="text-[#758696]">/USDT</span>
              <span className="ml-[0.5rem] text-[1rem] font-sans text-[#758696]">
                {leftLabel}
              </span>
            </span>
            {compareMode && rightLabel !== null ? (
              <>
                <span className="text-[0.875rem] text-[#758696]">vs</span>
                <span className="font-mono text-[1.125rem] text-[#26a69a]">
                  {rightSymbol.replace("USDT", "")}
                  <span className="text-[#758696]">/USDT</span>
                  <span className="ml-[0.5rem] text-[1rem] font-sans text-[#758696]">
                    {rightLabel}
                  </span>
                </span>
              </>
            ) : null}
          </div>
          <p className="max-w-[28rem] text-[0.75rem] text-[#758696]">
            Click a pair for Chart A · Drag any pair into the compare zone for
            Chart B
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[38rem] shrink-0 flex-col border-r border-[#2a2e39] bg-[#131722]">
          <div className="border-b border-[#2a2e39] px-[1.75rem] py-[1.25rem]">
            <p className="font-mono text-[0.75rem] uppercase tracking-wider text-[#758696]">
              Spot pairs
            </p>
          </div>
          <nav className="flex flex-col gap-[0.5rem] overflow-y-auto p-[1.25rem]">
            {MARKETS.map((m) => {
              const onLeft = m.symbol === leftSymbol;
              const onRight = compareMode && m.symbol === rightSymbol;
              const active = onLeft || onRight;
              return (
                <button
                  key={m.id}
                  type="button"
                  draggable
                  onDragStart={onMarketDragStart(m)}
                  onClick={() => handleSelectChartA(m)}
                  className={`flex cursor-grab items-center justify-between rounded-[0.5rem] px-[1.25rem] py-[1rem] text-left transition-colors active:cursor-grabbing ${
                    active
                      ? onRight && !onLeft
                        ? "bg-[#7c4dff]/20 text-[#b388ff]"
                        : "bg-[#2962ff]/20 text-[#82b1ff]"
                      : "bg-transparent text-[#b2b5be] hover:bg-[#2a2e39]"
                  }`}
                >
                  <span className="text-[1.125rem] font-medium">{m.id}</span>
                  <span className="flex items-center gap-[0.5rem] text-[0.875rem] text-[#758696]">
                    {onLeft ? (
                      <span className="font-mono text-[0.625rem] uppercase text-[#82b1ff]">
                        A
                      </span>
                    ) : null}
                    {onRight ? (
                      <span className="font-mono text-[0.625rem] uppercase text-[#b388ff]">
                        B
                      </span>
                    ) : null}
                    {m.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col p-[2rem]">
          {anyLoading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#0c0e12]/60 backdrop-blur-[0.125rem]">
              <p className="font-mono text-[1rem] text-[#758696]">
                Loading candles…
              </p>
            </div>
          )}
          <div className="flex min-h-0 flex-1 flex-col rounded-[0.5rem] border border-[#2a2e39] bg-[#131722]">
            <div className="border-b border-[#2a2e39] px-[1.5rem] py-[1rem]">
              <h2 className="text-[1.125rem] font-medium">
                {compareMode ? "Compare — 1h candlesticks" : "1h candlesticks"}
              </h2>
              <p className="mt-[0.25rem] text-[0.875rem] leading-snug text-[#758696]">
                {compareMode
                  ? "Each pane uses the same data source note when both are Binance; CoinGecko fallback shows USD OHLC per pane."
                  : leftCaption}
              </p>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-row gap-[1rem] p-[1rem]">
              <section className="flex min-h-0 min-w-0 w-1/2 flex-1 flex-col">
                <div className="mb-[0.5rem] flex shrink-0 items-baseline justify-between gap-[0.75rem]">
                  <h3 className="font-mono text-[0.875rem] font-medium text-[#b2b5be]">
                    {leftSymbol.replace("USDT", "")}/USDT
                  </h3>
                  <span className="text-[0.75rem] uppercase tracking-wide text-[#758696]">
                    Chart A
                  </span>
                </div>
                {leftError ? (
                  <div className="mb-[0.75rem] rounded-[0.5rem] border border-[#ef5350]/40 bg-[#ef5350]/10 px-[1rem] py-[0.75rem] font-mono text-[0.8125rem] text-[#ffb4b4]">
                    {leftError}
                  </div>
                ) : null}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  <p className="mb-[0.5rem] shrink-0 text-[0.75rem] leading-snug text-[#758696]">
                    {leftCaption}
                  </p>
                  <CandlestickChart
                    key={leftSymbol}
                    candles={leftChartData}
                    className="h-full min-h-0 w-full min-w-0 flex-1"
                  />
                </div>
              </section>

              <section className="flex min-h-0 min-w-0 w-1/2 flex-1 flex-col border-l border-[#2a2e39] pl-[1rem]">
                {compareMode &&
                rightSymbol !== null &&
                rightLabel !== null ? (
                  <>
                    <div className="mb-[0.5rem] flex shrink-0 items-baseline justify-between gap-[0.75rem]">
                      <h3 className="font-mono text-[0.875rem] font-medium text-[#b2b5be]">
                        {rightSymbol.replace("USDT", "")}/USDT
                      </h3>
                      <div className="flex items-center gap-[0.75rem]">
                        <span className="text-[0.75rem] uppercase tracking-wide text-[#758696]">
                          Chart B
                        </span>
                        <button
                          type="button"
                          onClick={clearCompareChart}
                          className="rounded-[0.375rem] border border-[#2a2e39] px-[0.5rem] py-[0.125rem] font-mono text-[0.6875rem] text-[#758696] hover:border-[#758696] hover:text-[#b2b5be]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {rightError ? (
                      <div className="mb-[0.75rem] rounded-[0.5rem] border border-[#ef5350]/40 bg-[#ef5350]/10 px-[1rem] py-[0.75rem] font-mono text-[0.8125rem] text-[#ffb4b4]">
                        {rightError}
                      </div>
                    ) : null}
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                      <p className="mb-[0.5rem] shrink-0 text-[0.75rem] leading-snug text-[#758696]">
                        {rightCaption}
                      </p>
                      <CandlestickChart
                        key={rightSymbol}
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
                    className={`flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center rounded-[0.5rem] border-[0.1875rem] border-dashed px-[1.5rem] py-[2rem] text-center transition-colors ${
                      dropHover
                        ? "border-[#2962ff] bg-[#2962ff]/15"
                        : "border-[#758696]/50 bg-[#131722]"
                    }`}
                  >
                    <p className="font-mono text-[0.875rem] font-medium text-[#b2b5be]">
                      Compare zone
                    </p>
                    <p className="mt-[0.75rem] max-w-[18rem] text-[0.8125rem] leading-relaxed text-[#758696]">
                      Drag a spot pair from the list and release here to load
                      Chart B beside Chart A.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
