import type { Candle } from "@/lib/candles";

export const INSIGHT_VIEW_STORAGE_KEY = "valentia-insight-view";

export type InsightArticlePayload = {
  category: string;
  headline: string;
  body: string;
};

/** Longer, readable blurb for the article "lens" — keys are lowercased category labels. */
const INSIGHT_CATEGORY_DESCRIPTION_BY_KEY: Record<string, string> = {
  "trend & levels":
    "Trend and key levels tell you where the market has already agreed on value: breaks, holds, and failed breaks there often matter more than isolated candle shapes alone.",
  "patterns & shapes":
    "Classic chart formations and candlestick clusters summarize repeated behavior; treat them as hypotheses to confirm with follow-through, volume, and where price sits relative to nearby structure.",
  "outside influences":
    "Headlines, policy, and cross-asset flows can temporarily override pure technicals; this tag means the write-up weighs how those forces might accelerate, blunt, or invert what the tape is implying.",
  trading:
    "Execution-focused read: entries, invalidation, and how aggressive the tape is on retests—useful when you care less about naming the pattern and more about whether the next few handles reward risk.",
  volume:
    "Volume and depth describe who is participating and at what prices: absorption, dry-ups, and spikes often flag where control shifts even before price prints a clean breakout or reversal.",
  "inter-market":
    "Relates this symbol to peers or related markets (majors, ratios, indices). Use it when leadership, lag, or correlation is part of the thesis—not only the single-chart microstructure.",
  compare:
    "Compare-mode insight: the same clock and window across two charts so you can judge relative strength, divergent structure, and which name is doing the heavy lifting in the move.",
  "relative strength":
    "Who is leading the pair on this timeframe: streaking highs, stalled pullbacks, and which chart is making the cleaner impulse all feed into whether rotation or mean reversion is the cleaner base case.",
  divergence:
    "When paths between related charts stop agreeing—one makes extremes the other won’t—that tension often resolves with catch-up, mean reversion, or a fresh leg once one side snaps back into line.",
  volatility:
    "Range expansion, wick asymmetry, and one-off spikes versus the other leg of a pair; helps separate shared macro moves from stress that is concentrated in a single name or venue.",
};

/**
 * Human-readable description for the insight category strip (not just the short label).
 */
export function descriptionForInsightArticleCategory(category: string): string {
  const key = category.trim().toLowerCase();
  const hit = INSIGHT_CATEGORY_DESCRIPTION_BY_KEY[key];
  if (hit) return hit;
  return `This note is filed under "${category.trim()}": read it as the editorial lens for the headline and body below—how the authors want you to weight context, timeframe, and conflict with other signals.`;
}

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
