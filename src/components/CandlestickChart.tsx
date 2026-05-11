"use client";

import {
  CandlestickSeries,
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

/** Design space: `html { font-size: 16px; }` — rem is stable; stage is scaled via CSS transform. */
const DESIGN_ROOT_PX = 16;

/** Axis / layout text — minimum 20 design px (1.25rem at 16px root). */
const DESIGN_AXIS_FONT_PX = 20;

/** Library default bar gap is ~6px at 16px root; higher = wider candle bodies. */
const DESIGN_BAR_SPACING = 12;
/** Floors how narrow bars can get when zooming in (library default 0.5). */
const DESIGN_MIN_BAR_SPACING = 2;

type Props = {
  candles: CandlestickData<Time>[];
  className?: string;
};

/** Current root font-size in CSS px (same value `1rem` resolves to). */
function rootRemPx(): number {
  if (typeof document === "undefined") return 16;
  const px = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(px) && px > 0 ? px : 16;
}

/**
 * Convert “design px” at 16px root into CSS px (same as design px while root stays 16px).
 * Maps library defaults (bar gap, labels, …) to chart options.
 */
function dpx(designPx: number): number {
  return (designPx * rootRemPx()) / DESIGN_ROOT_PX;
}

function cssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

/**
 * Default view is heavily zoomed vs `fitContent()` (all bars).
 * `zoomDivisor` 8 → ~1/8 of the range visible (~8× tighter than showing everything).
 */
function applyDefaultZoomedView(chart: IChartApi, barCount: number) {
  const ts = chart.timeScale();
  if (barCount <= 1) {
    ts.fitContent();
    return;
  }
  const zoomDivisor = 8;
  const minVisible = 8;
  let visibleBars = Math.max(minVisible, Math.ceil(barCount / zoomDivisor));
  visibleBars = Math.min(visibleBars, barCount);
  const from = barCount - visibleBars;
  const to = barCount - 1;
  requestAnimationFrame(() => {
    ts.setVisibleLogicalRange({ from, to });
  });
}

/** Pan/zoom/scroll off until the user clicks the chart (wheel near chart won’t move it). */
function interactionChartOptions(locked: boolean) {
  if (locked) {
    return {
      handleScroll: false as const,
      handleScale: false as const,
    };
  }
  return {
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: true,
    },
    handleScale: {
      mouseWheel: true,
      pinch: true,
      axisPressedMouseMove: true,
      axisDoubleClickReset: true,
    },
  };
}

export function CandlestickChart({ candles, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick", Time> | null>(null);
  const [interactionLocked, setInteractionLocked] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const hairline = Math.min(
      4,
      Math.max(1, Math.round(dpx(1))),
    ) as 1 | 2 | 3 | 4;

    const chartBg = cssVar("--v-chart-bg", "#0a0a0a");
    const gridColor = cssVar("--v-grid", "#1c1c1c");
    const borderColor = cssVar("--v-border", "#2a2a2a");
    const crosshairColor = cssVar("--v-crosshair", "#5c5c5c");
    const axisText = cssVar("--v-chart-label", "#8a8a8a");
    const candleUp = cssVar("--v-candle-up", "#5ce1c6");
    const candleDown = cssVar("--v-candle-down", "#ff8b9a");

    const chart = createChart(el, {
      autoSize: false,
      ...interactionChartOptions(true),
      layout: {
        background: { type: ColorType.Solid, color: chartBg },
        textColor: axisText,
        fontSize: dpx(DESIGN_AXIS_FONT_PX),
        fontFamily:
          typeof document !== "undefined"
            ? getComputedStyle(document.body).fontFamily || "system-ui, sans-serif"
            : "system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        vertLine: { color: crosshairColor, width: hairline },
        horzLine: { color: crosshairColor, width: hairline },
      },
      rightPriceScale: { borderColor: borderColor },
      timeScale: {
        borderColor: borderColor,
        barSpacing: dpx(DESIGN_BAR_SPACING),
        minBarSpacing: dpx(DESIGN_MIN_BAR_SPACING),
        lockVisibleTimeRangeOnResize: true,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: candleUp,
      downColor: candleDown,
      borderVisible: false,
      wickUpColor: candleUp,
      wickDownColor: candleDown,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const applyRemScaledOptions = () => {
      const h = Math.min(
        4,
        Math.max(1, Math.round(dpx(1))),
      ) as 1 | 2 | 3 | 4;

      chart.applyOptions({
        layout: {
          fontSize: dpx(DESIGN_AXIS_FONT_PX),
          fontFamily:
            getComputedStyle(document.body).fontFamily || "system-ui, sans-serif",
        },
        crosshair: {
          vertLine: { color: crosshairColor, width: h },
          horzLine: { color: crosshairColor, width: h },
        },
        timeScale: {
          barSpacing: dpx(DESIGN_BAR_SPACING),
          minBarSpacing: dpx(DESIGN_MIN_BAR_SPACING),
        },
      });
    };

    const measureAndResize = () => {
      const w = Math.max(1, Math.floor(el.clientWidth));
      const h = Math.max(1, Math.floor(el.clientHeight));
      chart.resize(w, h);
      applyRemScaledOptions();
    };

    const ro = new ResizeObserver(() => {
      measureAndResize();
    });
    ro.observe(el);
    window.addEventListener("resize", measureAndResize);
    measureAndResize();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureAndResize);
      seriesRef.current = null;
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.applyOptions(interactionChartOptions(interactionLocked));
  }, [interactionLocked]);

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series) return;
    if (candles.length === 0) {
      series.setData([]);
      return;
    }
    series.setData(candles);
    if (chart) applyDefaultZoomedView(chart, candles.length);
  }, [candles]);

  return (
    <div
      className={[
        "relative flex min-h-0 min-w-0 flex-1 flex-col outline-none",
        className ?? "",
      ].join(" ")}
      onPointerDownCapture={() => {
        setInteractionLocked((locked) => {
          if (!locked) return locked;
          queueMicrotask(() => {
            chartRef.current?.applyOptions(interactionChartOptions(false));
          });
          return false;
        });
      }}
      aria-label={
        interactionLocked
          ? "Candlestick chart, view locked. Click to enable pan and zoom."
          : "Candlestick chart"
      }
    >
      {interactionLocked ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex justify-center pb-[0.75rem]"
          aria-hidden
        >
          <span className="rounded-[0.375rem] bg-v-panel/90 px-[0.75rem] py-[0.375rem] font-mono text-[1.25rem] text-v-muted">
            Click chart to pan and zoom
          </span>
        </div>
      ) : null}
      <div ref={containerRef} className="min-h-0 w-full min-w-0 flex-1" />
    </div>
  );
}
