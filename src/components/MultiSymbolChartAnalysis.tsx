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
      width="20"
      height="20"
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
      width="20"
      height="20"
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
      width="20"
      height="20"
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
      width="20"
      height="20"
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
      width="20"
      height="20"
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
      width="20"
      height="20"
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

function InsightCardArticle({ card }: { card: InsightCard }) {
  return (
    <article className="flex min-w-0 flex-1 flex-col gap-[0.75rem] rounded-[0.5rem] border-[0.0625rem] border-v-border bg-[#161616] p-[1.125rem]">
      <div className="flex h-[2.25rem] w-[2.25rem] shrink-0 items-center justify-center rounded-[0.375rem] border-[0.0625rem] border-v-border bg-v-panel text-v-subtle">
        {card.icon}
      </div>
      <div className="min-w-0">
        <p className="text-[0.8125rem] font-medium text-v-subtle">
          {card.category}
        </p>
        <h3 className="mt-[0.25rem] text-[1.0625rem] font-semibold leading-snug text-foreground">
          {card.headline}
        </h3>
        <p className="mt-[0.5rem] text-[0.875rem] leading-relaxed text-v-muted">
          {card.body}
        </p>
      </div>
    </article>
  );
}

export function MultiSymbolChartAnalysis() {
  return (
    <section className="mt-[1.5rem] flex w-full min-w-0 shrink-0 flex-col gap-[2.5rem] pb-[0.5rem]">
      <h2 className="w-full shrink-0 text-left text-[0.875rem] font-medium uppercase tracking-[0.12em] text-v-muted">
        Multi-symbol chart analysis
      </h2>
      {CARD_ROWS.map((row) => (
        <div
          key={row.map((c) => c.headline).join("-")}
          className="flex w-full min-w-0 shrink-0 gap-[2.5rem]"
        >
          {row.map((card) => (
            <InsightCardArticle key={card.headline} card={card} />
          ))}
        </div>
      ))}
    </section>
  );
}
