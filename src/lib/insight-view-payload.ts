import type { Candle } from "@/lib/candles";

export const INSIGHT_VIEW_STORAGE_KEY = "valentia-insight-view";

export type InsightArticlePayload = {
  category: string;
  headline: string;
  body: string;
};

export type FrozenChartSnapshot = {
  v: 1;
  leftSymbol: string;
  leftLabel: string;
  leftCandles: Candle[];
  rightSymbol: string | null;
  rightLabel: string | null;
  rightCandles: Candle[];
  chartLayoutKey: number;
  compareZoneOpen: boolean;
};

export type InsightViewPayload = {
  chart: FrozenChartSnapshot;
  article: InsightArticlePayload;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function isCandle(x: unknown): x is Candle {
  if (!isRecord(x)) return false;
  return (
    typeof x.time === "number" &&
    typeof x.open === "number" &&
    typeof x.high === "number" &&
    typeof x.low === "number" &&
    typeof x.close === "number"
  );
}

export function writeInsightViewPayload(payload: InsightViewPayload): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(INSIGHT_VIEW_STORAGE_KEY, JSON.stringify(payload));
}

export function readInsightViewPayload(): InsightViewPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(INSIGHT_VIEW_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return null;
    const chart = parsed.chart;
    const article = parsed.article;
    if (!isRecord(chart) || !isRecord(article)) return null;
    if (chart.v !== 1) return null;
    if (
      typeof chart.leftSymbol !== "string" ||
      typeof chart.leftLabel !== "string" ||
      !Array.isArray(chart.leftCandles) ||
      !chart.leftCandles.every(isCandle)
    ) {
      return null;
    }
    const rs = chart.rightSymbol;
    const rl = chart.rightLabel;
    if (rs !== null && typeof rs !== "string") return null;
    if (rl !== null && typeof rl !== "string") return null;
    if (!Array.isArray(chart.rightCandles) || !chart.rightCandles.every(isCandle)) {
      return null;
    }
    if (typeof chart.chartLayoutKey !== "number") return null;
    if (typeof chart.compareZoneOpen !== "boolean") return null;
    if (
      typeof article.category !== "string" ||
      typeof article.headline !== "string" ||
      typeof article.body !== "string"
    ) {
      return null;
    }
    return {
      chart: {
        v: 1,
        leftSymbol: chart.leftSymbol,
        leftLabel: chart.leftLabel,
        leftCandles: chart.leftCandles,
        rightSymbol: rs,
        rightLabel: rl,
        rightCandles: chart.rightCandles,
        chartLayoutKey: chart.chartLayoutKey,
        compareZoneOpen: chart.compareZoneOpen,
      },
      article: {
        category: article.category,
        headline: article.headline,
        body: article.body,
      },
    };
  } catch {
    return null;
  }
}
