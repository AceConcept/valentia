import type { ReactNode } from "react";

type InsightCard = {
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

const CARDS: InsightCard[] = [
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

const CARD_ROWS: InsightCard[][] = [CARDS.slice(0, 3), CARDS.slice(3, 6)];

const INSIGHT_MARK_BOX =
  "flex h-[3.5rem] w-[3.5rem] shrink-0 items-center justify-center rounded-[0.375rem] border-[0.0625rem] border-v-border bg-v-panel text-v-subtle";

function InsightCardArticle({ card }: { card: InsightCard }) {
  return (
    <button
      type="button"
      className="flex h-[19.75rem] min-w-0 flex-1 cursor-pointer flex-col gap-[1.3125rem] rounded-[0.5rem] border-[0.0625rem] border-v-border bg-[#171717] p-[2.5rem] text-left font-inherit transition-[background-color,border-color] hover:border-v-muted/40 hover:bg-[#1c1c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v-muted/35 active:bg-[#141414]"
    >
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
          {card.body}
        </p>
      </div>
    </button>
  );
}

export function MultiSymbolChartAnalysis() {
  return (
    <section className="mt-[1.5rem] flex w-full min-w-0 shrink-0 flex-col gap-[2.5rem] pb-[0.5rem]">
      {CARD_ROWS.map((row) => (
        <div
          key={row.map((c) => c.headline).join("-")}
          className="flex w-full min-w-0 shrink-0 gap-[2.25rem]"
        >
          {row.map((card) => (
            <InsightCardArticle key={card.headline} card={card} />
          ))}
        </div>
      ))}
    </section>
  );
}
