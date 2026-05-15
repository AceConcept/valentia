/**
 * Curated insight card copy for the dashboard grid. Six cards are shown per primary chart;
 * the pool has ten entries—variation comes from reordering by chart symbol (deterministic shuffle).
 */

export type InsightIconKind =
  | "trend"
  | "patterns"
  | "outside"
  | "trading"
  | "volume"
  | "divergence";

export type InsightCardContent = {
  category: string;
  headline: string;
  body: string;
  icon: InsightIconKind;
};

export const INSIGHT_CARD_CONTENT_POOL: InsightCardContent[] = [
  {
    category: "Trend & Levels",
    headline: "Doji Spotted",
    body: "Three consecutive Doji candles are appearing, indicating significant market indecision and a potential trend reversal point.",
    icon: "trend",
  },
  {
    category: "Patterns & Shapes",
    headline: "Critical Resistance Test",
    body: "Price is approaching the $50,000 historical resistance level where it has reversed three times previously.",
    icon: "patterns",
  },
  {
    category: "Outside Influences",
    headline: "Fundamental Override Signal",
    body: "Positive regulatory news is creating bullish sentiment that could override the technical bearish pattern currently forming on the chart.",
    icon: "outside",
  },
  {
    category: "Trading",
    headline: "Weak Breakout",
    body: "The recent price move shows declining volume, suggesting weak conviction and a higher risk of a false breakout.",
    icon: "trading",
  },
  {
    category: "Volume",
    headline: "Absorption at lows",
    body: "Heavy prints on the bid are soaking up sell pressure without new lows, often a precursor to a short-term bounce.",
    icon: "volume",
  },
  {
    category: "Inter-market",
    headline: "ETH–BTC spread widening",
    body: "Ether is outperforming Bitcoin on this timeframe; risk-on rotation within crypto majors may continue if the ratio holds.",
    icon: "divergence",
  },
  {
    category: "Liquidity & structure",
    headline: "Session liquidity tagged",
    body: "A prior session high–low liquidity pocket sits just under spot; majors often mean-revert into that band after a shallow sweep before picking a larger directional leg.",
    icon: "patterns",
  },
  {
    category: "Momentum",
    headline: "Volatility coil",
    body: "A sharp expansion candle followed by inside bars is common in crypto: the tape coils here before the next volatility burst, usually in the direction of the prior impulse.",
    icon: "trading",
  },
  {
    category: "Flow",
    headline: "Funding skew shifting",
    body: "Perp funding flipped from negative to mildly positive while spot held bid—levered longs are paying, but if spot takers keep lifting offers the squeeze can extend before mean reversion.",
    icon: "outside",
  },
  {
    category: "Risk",
    headline: "Weekend liquidity gap",
    body: "Weekend order books are thin; stacked stops through obvious highs or lows can gap price faster than spot fair value would suggest—size down until weekday depth returns.",
    icon: "volume",
  },
];

const SHOWN_SINGLE_CHART_CARDS = 6;

function stringToSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fisher–Yates shuffle with a deterministic PRNG from `seed`. */
function shuffleDeterministic<T>(items: readonly T[], seed: number): T[] {
  const a = [...items];
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

/** Six cards for Chart A, order and mix depend on `primarySymbol` only (stable per symbol). */
export function pickSingleChartInsightCardContents(
  primarySymbol: string,
): InsightCardContent[] {
  const seed = stringToSeed(primarySymbol);
  const shuffled = shuffleDeterministic(INSIGHT_CARD_CONTENT_POOL, seed);
  return shuffled.slice(0, SHOWN_SINGLE_CHART_CARDS);
}
