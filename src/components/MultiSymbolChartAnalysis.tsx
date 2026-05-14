import type { ReactNode } from "react";

import type { InsightArticlePayload } from "@/lib/insight-view-payload";

export type InsightCard = {
  category: string;
  headline: string;
  body: string;
  icon: ReactNode;
};

function IconTrendLevels() {
  return (
    <svg
      className="h-[2.25rem] w-[2.25rem] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19h16" />
      <path d="M8 15V9l4-5 4 5v6" />
      <path d="M8 11h8" />
    </svg>
  );
}

function IconPatterns() {
  return (
    <svg
      className="h-[2.25rem] w-[2.25rem] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="8.5" y="14" width="7" height="7" rx="1" />
      <path d="M6.5 10v2.5h5M17.5 10v2.5h-5" />
    </svg>
  );
}

function IconOutside() {
  return (
    <svg
      className="h-[2.25rem] w-[2.25rem] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="5" r="2.25" />
      <circle cx="6" cy="17" r="2.25" />
      <circle cx="18" cy="17" r="2.25" />
      <path d="M10.2 6.8L7.5 14.2M13.8 6.8l2.7 7.4M9 17h6" />
    </svg>
  );
}

function IconTrading() {
  return (
    <svg
      className="h-[2.25rem] w-[2.25rem] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 18h16" />
      <path d="M6 14l4-8 4 5 4-9" />
      <circle cx="18" cy="5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconVolume() {
  return (
    <svg
      className="h-[2.25rem] w-[2.25rem] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 20V10M12 20V4M18 20v-8" />
    </svg>
  );
}

function IconDivergence() {
  return (
    <svg
      className="h-[2.25rem] w-[2.25rem] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 16l6-8 6 5 4-7" />
      <path d="M4 20h16" opacity="0.5" />
    </svg>
  );
}

const SINGLE_CHART_CARDS: InsightCard[] = [
  {
    category: "Trend & Levels",
    headline: "Doji Spotted",
    body: "Three consecutive Doji candles are appearing, indicating significant market indecision and a potential trend reversal point.",
    icon: <IconTrendLevels />,
  },
  {
    category: "Patterns & Shapes",
    headline: "Critical Resistance Test",
    body: "Price is approaching the $50,000 historical resistance level where it has reversed three times previously.",
    icon: <IconPatterns />,
  },
  {
    category: "Outside Influences",
    headline: "Fundamental Override Signal",
    body: "Positive regulatory news is creating bullish sentiment that could override the technical bearish pattern currently forming on the chart.",
    icon: <IconOutside />,
  },
  {
    category: "Trading",
    headline: "Weak Breakout",
    body: "The recent price move shows declining volume, suggesting weak conviction and a higher risk of a false breakout.",
    icon: <IconTrading />,
  },
  {
    category: "Volume",
    headline: "Absorption at lows",
    body: "Heavy prints on the bid are soaking up sell pressure without new lows, often a precursor to a short-term bounce.",
    icon: <IconVolume />,
  },
  {
    category: "Inter-market",
    headline: "ETH–BTC spread widening",
    body: "Ether is outperforming Bitcoin on this timeframe; risk-on rotation within crypto majors may continue if the ratio holds.",
    icon: <IconDivergence />,
  },
];

function buildCompareChartCards(left: string, right: string): InsightCard[] {
  return [
    {
      category: "Compare",
      headline: "Side-by-side candles",
      body: `${left} (Chart A) and ${right} (Chart B) share the same 1h clock, so swing structure, session prints, and local extremes line up for a direct read across both names.`,
      icon: <IconPatterns />,
    },
    {
      category: "Relative strength",
      headline: "Who is leading?",
      body: `Watch how ${right} moves against ${left}: if Chart B strings higher highs while Chart A stalls, it often flags a short rotation into ${right} before the pair mean-reverts.`,
      icon: <IconTrendLevels />,
    },
    {
      category: "Divergence",
      headline: "Paths decoupling?",
      body: `When ${left} prints a higher high but ${right} fails (or the reverse), treat it as a tension build—mean reversion or a fresh leg usually follows whichever chart snaps back first.`,
      icon: <IconDivergence />,
    },
    {
      category: "Volatility",
      headline: "Dispersion check",
      body: `Wider wicks on one chart versus the other in the same window usually mean isolated headline or liquidity stress on that leg—not necessarily the whole ${left}/${right} complex.`,
      icon: <IconTrading />,
    },
    {
      category: "Volume",
      headline: "Participation skew",
      body: "If selling volume clusters on one symbol while the other holds bid depth, fades against the thinner book tend to resolve faster—bias which chart you lean on first.",
      icon: <IconVolume />,
    },
    {
      category: "Trading",
      headline: "Pair the thesis",
      body: `Anchor on ${left} and confirm with ${right}: size only when both agree on direction, or when the laggard catches up with expanding range and cleaner continuation.`,
      icon: <IconOutside />,
    },
  ];
}

const INSIGHT_MARK_BOX =
  "flex h-[3.5rem] w-[3.5rem] shrink-0 items-center justify-center rounded-[0.375rem] border-[0.0625rem] border-v-border bg-v-panel text-v-subtle";

const INSIGHT_CARD_BODY_MAX_CHARS = 100;

function truncateInsightDisplayText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}…`;
}

function InsightCardArticle({
  card,
  onOpen,
}: {
  card: InsightCard;
  onOpen?: (article: InsightArticlePayload) => void;
}) {
  const bodyPreview = truncateInsightDisplayText(
    card.body,
    INSIGHT_CARD_BODY_MAX_CHARS,
  );

  return (
    <button
      type="button"
      className="flex min-h-0 min-w-0 flex-1 cursor-pointer flex-col items-stretch gap-[1.3125rem] rounded-[0.25rem] border-[0.0625rem] border-v-border bg-[#171717] p-[2.5rem] text-left font-inherit transition-[background-color,border-color] hover:border-v-muted/40 hover:bg-[#1c1c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v-muted/35 active:bg-[#141414]"
      onClick={() =>
        onOpen?.({
          category: card.category,
          headline: card.headline,
          body: card.body,
        })
      }
    >
      <span className="self-start font-insight text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-v-muted">
        View Strategy
      </span>
      <div className="flex min-w-0 items-center gap-[1.3125rem]">
        <div className={INSIGHT_MARK_BOX}>{card.icon}</div>
        <p className="min-w-0 flex-1 text-[1.3125rem] font-medium leading-tight text-v-subtle">
          {card.category}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-[1.3125rem]">
        <h3 className="font-insight text-[1.4375rem] font-semibold leading-snug text-foreground">
          {card.headline}
        </h3>
        <p className="font-insight text-[1.3125rem] leading-relaxed text-v-muted">
          {bodyPreview}
        </p>
      </div>
    </button>
  );
}

export type MultiSymbolChartAnalysisProps = {
  /** When true, Chart B is loaded — show compare-focused insight cards. */
  dualChart?: boolean;
  chartALabel?: string;
  chartBLabel?: string;
  /** Persist chart + open `/insight` with article text (markets dashboard only). */
  onInsightArticleOpen?: (article: InsightArticlePayload) => void;
};

export function MultiSymbolChartAnalysis({
  dualChart = false,
  chartALabel = "Chart A",
  chartBLabel = "Chart B",
  onInsightArticleOpen,
}: MultiSymbolChartAnalysisProps) {
  const cards: InsightCard[] = dualChart
    ? buildCompareChartCards(chartALabel, chartBLabel)
    : SINGLE_CHART_CARDS;
  const cardRows: InsightCard[][] = [
    cards.slice(0, 3),
    cards.slice(3, 6),
  ];

  return (
    <section className="mt-[2.5rem] flex w-full min-w-0 shrink-0 flex-col gap-[2.5rem] pb-[0.5rem]">
      {cardRows.map((row) => (
        <div
          key={row.map((c) => c.headline).join("-")}
          className="flex w-full min-w-0 shrink-0 items-start gap-[2.25rem]"
        >
          {row.map((card) => (
            <InsightCardArticle
              key={card.headline}
              card={card}
              onOpen={onInsightArticleOpen}
            />
          ))}
        </div>
      ))}
    </section>
  );
}
