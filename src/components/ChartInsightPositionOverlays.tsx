"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useState } from "react";

import type {
  CandlestickData,
  IChartApi,
  ISeriesApi,
  Time,
} from "lightweight-charts";

export const CHART_INSIGHT_OVERLAY_COUNT = 6;

/** ~5-candle-wide square; bottom-right sits on anchor candle close (card index = overlay index). */
const CANDLES_PER_OVERLAY = 5;

/** Visual scale applied on top of the candle-window pixel width. */
const OVERLAY_SIZE_SCALE = 2.5;

/** #85DB6A at 45% opacity — border and fill. */
const TREND_OVERLAY_COLOR = "rgba(133, 219, 106, 0.45)";

/** Per insight card (0–5): stable width variation while height stays uniform. */
const OVERLAY_WIDTH_FACTORS: readonly number[] = [
  0.88, 1.14, 0.96, 1.22, 0.91, 1.08,
];

export type ChartInsightOverlayRect = {
  time1: Time;
  time2: Time;
  /** Right-edge anchor candle — square’s bottom-right corner uses this close. */
  anchorClose: number;
};

type PixelBox = { left: number; top: number; width: number; height: number };

function overlayWidthFactor(cardIndex: number): number {
  return OVERLAY_WIDTH_FACTORS[cardIndex] ?? 1;
}

/** Height from ~5 bars × scale; width varies per card; bottom-right on (time2, anchorClose). */
function rectToAnchoredGreenSquare(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick", Time>,
  rect: ChartInsightOverlayRect,
  cardIndex: number,
): PixelBox | null {
  const ts = chart.timeScale();
  const xl = ts.timeToCoordinate(rect.time1);
  const xr = ts.timeToCoordinate(rect.time2);
  const yr = series.priceToCoordinate(rect.anchorClose);
  if (xl === null || xr === null || yr === null) return null;

  const rightEdge = Math.max(xl, xr);
  const baseSide = Math.abs(rightEdge - Math.min(xl, xr));
  const height = Math.max(8, baseSide * OVERLAY_SIZE_SCALE);
  const width = Math.max(8, height * overlayWidthFactor(cardIndex));

  const left = rightEdge - width;
  const top = yr - height;
  return { left, top, width, height };
}

/**
 * One overlay per insight card: ~5 visible candles wide, anchored so the bottom-right corner
 * sits on that window’s right-hand candle close (trend “tip”). Cards are ordered 0…5 like the UI grid.
 */
export function buildInsightAnchorOverlayRects(
  chart: IChartApi,
  series: ISeriesApi<"Candlestick", Time>,
  candles: CandlestickData<Time>[],
): ChartInsightOverlayRect[] {
  if (candles.length < CANDLES_PER_OVERLAY) return [];

  const lr = chart.timeScale().getVisibleLogicalRange();
  if (!lr) return [];

  const lo = Math.max(0, Math.floor(Math.min(lr.from, lr.to)));
  const hi = Math.min(candles.length - 1, Math.ceil(Math.max(lr.from, lr.to)));
  const span = hi - lo;
  if (span < 1) return [];

  const ts = chart.timeScale();
  const out: ChartInsightOverlayRect[] = [];

  for (let i = 0; i < CHART_INSIGHT_OVERLAY_COUNT; i++) {
    const frac = (i + 1) / (CHART_INSIGHT_OVERLAY_COUNT + 1);
    let anchorIdx = lo + Math.round(frac * span);
    anchorIdx = Math.max(lo, Math.min(hi, anchorIdx));

    let right = Math.min(hi, Math.max(lo + CANDLES_PER_OVERLAY - 1, anchorIdx));
    let left = right - (CANDLES_PER_OVERLAY - 1);
    if (left < lo) {
      left = lo;
      right = Math.min(hi, lo + CANDLES_PER_OVERLAY - 1);
    }

    const candleR = candles[right]!;
    const time1 = candles[left]!.time;
    const time2 = candleR.time;
    const anchorClose = candleR.close;

    const xl = ts.timeToCoordinate(time1);
    const xr = ts.timeToCoordinate(time2);
    const yr = series.priceToCoordinate(anchorClose);
    if (xl === null || xr === null || yr === null) continue;

    out.push({ time1, time2, anchorClose });
  }

  return out.length === CHART_INSIGHT_OVERLAY_COUNT ? out : [];
}

type Props = {
  chartRef: RefObject<IChartApi | null>;
  seriesRef: RefObject<ISeriesApi<"Candlestick", Time> | null>;
  layoutRootRef: RefObject<HTMLDivElement | null>;
  candles: CandlestickData<Time>[];
  /** Which insight card (0–5) owns the visible square, or `null` for none. */
  activeCardIndex: number | null;
  onRequestClose: () => void;
};

export function ChartInsightPositionOverlays({
  chartRef,
  seriesRef,
  layoutRootRef,
  candles,
  activeCardIndex,
  onRequestClose,
}: Props) {
  const [activeRect, setActiveRect] = useState<ChartInsightOverlayRect | null>(null);
  const [pixelTick, setPixelTick] = useState(0);

  const flushPixels = useCallback(() => {
    setPixelTick((t) => t + 1);
  }, []);

  const rebuildModel = useCallback(() => {
    if (
      activeCardIndex === null ||
      activeCardIndex < 0 ||
      activeCardIndex >= CHART_INSIGHT_OVERLAY_COUNT
    ) {
      setActiveRect(null);
      return;
    }
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series || candles.length < CANDLES_PER_OVERLAY) return;
    const built = buildInsightAnchorOverlayRects(chart, series, candles);
    if (built.length === CHART_INSIGHT_OVERLAY_COUNT) {
      setActiveRect(built[activeCardIndex]!);
    }
  }, [chartRef, seriesRef, candles, activeCardIndex]);

  useEffect(() => {
    if (
      activeCardIndex === null ||
      activeCardIndex < 0 ||
      activeCardIndex >= CHART_INSIGHT_OVERLAY_COUNT
    ) {
      setActiveRect(null);
      return;
    }
    const run = () => rebuildModel();
    run();
    const id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [activeCardIndex, candles, rebuildModel]);

  useEffect(() => {
    if (activeRect) flushPixels();
  }, [activeRect, flushPixels]);

  useEffect(() => {
    if (activeCardIndex === null) return;
    const chart = chartRef.current;
    if (!chart) return;
    const handle = chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      rebuildModel();
      flushPixels();
    });
    return () => {
      const h = handle as unknown as { destroy?: () => void } | (() => void) | undefined;
      if (typeof h === "function") h();
      else if (h && typeof h.destroy === "function") h.destroy();
    };
  }, [activeCardIndex, chartRef, rebuildModel, flushPixels]);

  useEffect(() => {
    if (activeCardIndex === null) return;
    const root = layoutRootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => {
      rebuildModel();
      flushPixels();
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [activeCardIndex, layoutRootRef, rebuildModel, flushPixels]);

  const chart = chartRef.current;
  const series = seriesRef.current;
  const pixelBox: PixelBox | null =
    activeCardIndex !== null &&
    activeRect &&
    chart &&
    series
      ? rectToAnchoredGreenSquare(chart, series, activeRect, activeCardIndex)
      : null;
  void pixelTick;

  if (activeCardIndex === null || !activeRect || !pixelBox) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[4] overflow-hidden"
      role="region"
      aria-label="Insight position overlay"
    >
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRequestClose}
        className="pointer-events-auto absolute right-[0.5rem] top-[0.5rem] z-[5] flex h-[2rem] min-w-[2rem] items-center justify-center rounded-[0.25rem] border-[0.0625rem] border-white/40 bg-black/55 px-[0.5rem] font-mono text-[1rem] text-white/90 backdrop-blur-[2px] hover:bg-black/70"
        aria-label="Hide insight position overlay"
      >
        ×
      </button>
      <div
        role="img"
        aria-label={`Insight card ${activeCardIndex + 1} trend marker`}
        className="pointer-events-none absolute border-2"
        style={{
          left: pixelBox.left,
          top: pixelBox.top,
          width: pixelBox.width,
          height: pixelBox.height,
          borderColor: TREND_OVERLAY_COLOR,
          backgroundColor: TREND_OVERLAY_COLOR,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
}
