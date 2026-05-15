import type { CSSProperties, ReactNode } from "react";

import { CryptoIcon } from "@/components/CryptoIcon";
import {
  descriptionForInsightArticleCategory,
  type InsightArticlePayload,
} from "@/lib/insight-view-payload";
import { MARKETS, marketBySymbol } from "@/lib/tokens";

/** 36×36px at default root — `2.25rem` scales with user font size. */
function InsightInfoMark({ className }: { className?: string }) {
  return (
    <span
      className={`flex h-[2.25rem] w-[2.25rem] shrink-0 items-center justify-center rounded-full bg-[#2f7fff] text-[1rem] font-bold leading-none text-white ${className ?? ""}`}
      aria-hidden
    >
      !
    </span>
  );
}

export const STRATEGY_SUBTITLE =
  "Analyze all strategy for candles of 15 hours, with a custom analysis, built for in a modern environment, keep track when going long or short.";

export function InsightArticleStrategyHeader() {
  return (
    <header className="flex flex-col gap-[0.875rem]">
      <h1 className="font-insight text-[2rem] font-light tracking-normal text-foreground">
        Overall Strategy
      </h1>
      <p className="font-insight text-[1.125rem] leading-relaxed text-[rgba(160,160,160,1)]">
        {STRATEGY_SUBTITLE}
      </p>
    </header>
  );
}

const ALERT_SHORT =
  "The alert has been triggered for short, the momentum is currently on a bearish trend, indicating the theory that market is entering into the challenge zone for the shorties.";

const ALERT_RISK =
  "The market is currently below the resistance range, the price target as well as a price target level has been met, with a plan to hold your long as the market stabilizes.";

const SECTION_A =
  "CryptoRunners is a community focused on the Metaverse, designed to help. Some investors share their favorite industry complex color blueprints with each other.";

const SECTION_B =
  "The platform allows players to create, share, like, and comment on game through the many elements visible that can be placed directly into the game. Users can organize theory into into collections, upload new blueprints, and interact with the community. (Image community and like)";

const SECTION_COMBINED = `${SECTION_A}\n\n${SECTION_B}`;

/** Strategic Summary banner — title size in `rem` (16px root). */
const STRATEGIC_SUMMARY_LABEL_STYLE: CSSProperties = {
  fontSize: "1.5625rem", // 25px
};

/** Strategic Summary title span (pipe unchanged). */
const STRATEGIC_SUMMARY_TITLE_STYLE: CSSProperties = {
  paddingTop: "0px",
  color: "rgba(233, 233, 233, 1)",
  fontWeight: 200,
};

function TextBlock({ children }: { children: ReactNode }) {
  return (
    <p
      className="article-text m-0 whitespace-pre-line"
      style={{ fontSize: "21px", lineHeight: "150%" }}
    >
      {children}
    </p>
  );
}

export function InsightArticleDetailPanel({
  article,
  dualChart = false,
  leftSymbol = MARKETS[0]!.symbol,
  rightSymbol = null,
}: {
  article: InsightArticlePayload;
  /** When true with `rightSymbol`, section headings use chart A / chart B icons instead of the info mark. */
  dualChart?: boolean;
  leftSymbol?: string;
  rightSymbol?: string | null;
}) {
  const primaryMarket = marketBySymbol(leftSymbol) ?? MARKETS[0]!;
  const secondaryMarket = rightSymbol ? marketBySymbol(rightSymbol) : undefined;
  const usePairIcons = dualChart && secondaryMarket !== undefined;

  return (
    <div className="flex w-full min-w-0 flex-col items-stretch justify-start gap-[88px]">
      <div className="flex min-h-0 w-full min-w-0 max-w-full shrink-0 flex-col rounded-[0.5rem] border-[0.0625rem] border-v-border bg-[#171717] px-[1.25rem] py-[2.5rem]">
        <div className="flex min-h-0 w-full min-w-0 flex-col gap-[2.5rem] px-[20px]">
          <div className="flex min-h-0 min-w-0 w-[100%] flex-col gap-[20px]">
            <div className="flex h-[40px] w-full min-w-0 shrink-0 items-center gap-[1rem]">
              <InsightInfoMark />
              <p className="m-0 min-w-0 font-mono text-[20px] font-semibold capitalize tracking-[0.12em] text-foreground [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace]">
                Short alert
              </p>
            </div>
            <div className="min-h-0 min-w-0 w-full">
              <p className="m-0 break-words font-mono text-[1.125rem] leading-[150%] text-[#a0a0a0]">
                {ALERT_SHORT}
              </p>
            </div>
          </div>

          <div className="box-border flex min-h-0 w-full min-w-0 max-w-full flex-col gap-[20px] self-stretch rounded-[0.5rem] border-[0.0625rem] border-v-border bg-[#141414] px-[1.75rem] py-[1.625rem]">
            <div className="flex h-[40px] w-full min-w-0 shrink-0 items-center gap-[1rem]">
              <InsightInfoMark />
              <p className="m-0 min-w-0 font-mono text-[20px] font-semibold capitalize tracking-[0.12em] text-foreground [font-family:var(--font-ibm-plex-mono),ui-monospace,monospace]">
                Risk Assessment
              </p>
            </div>
            <div className="min-h-0 min-w-0 w-full">
              <p className="m-0 break-words font-mono text-[1.125rem] leading-[150%] text-[#a0a0a0]">
                {ALERT_RISK}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-auto">
      <div className="flex w-full min-w-0 justify-center">
        <div className="inline-flex max-w-full min-w-0 items-stretch">
        <div className="flex shrink-0 items-stretch" aria-hidden>
          <div className="w-px shrink-0 self-stretch bg-gradient-to-b from-white to-black" />
          <div className="w-[70px] shrink-0" />
        </div>
        <div className="flex w-[1420px] shrink-0 flex-col gap-16">
        <div className="relative h-[64px] w-full min-w-0 shrink-0 bg-[url('/info-page/title-bg.jpg')] bg-cover bg-center bg-no-repeat">
          <p
            className="absolute left-[1rem] top-1/2 m-0 -translate-y-1/2 font-insight font-semibold tracking-[0.14em] text-v-muted"
            style={STRATEGIC_SUMMARY_LABEL_STYLE}
          >
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--v-candle-up)]"
              aria-hidden
            >
              |
            </span>
            <span
              className="inline-block pl-[0.65em]"
              style={STRATEGIC_SUMMARY_TITLE_STYLE}
            >
              Strategic Summary
            </span>
          </p>
        </div>

        <div className="flex min-w-0 w-full flex-col gap-16">
          <h2
            className="font-insight text-[3.125rem] font-light leading-tight text-foreground [font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif]"
          >
            {article.headline}
          </h2>

          <div className="flex max-w-full flex-col gap-[0.5rem]">
            <p className="m-0 font-insight text-[1.25rem] font-medium uppercase tracking-[0.08em] text-v-muted">
              {article.category}
            </p>
            <p className="article-text m-0">
              {descriptionForInsightArticleCategory(article.category)}
            </p>
          </div>

          <div className="flex flex-col gap-[1.25rem]">
            <h3 className="font-insight text-[1.5rem] font-normal text-foreground">
              Crypto Bull Run Analysis
            </h3>
            <TextBlock>{article.body}</TextBlock>
          </div>

          <div className="flex flex-col gap-[1.25rem]">
            <h3 className="font-insight text-[1.5rem] font-normal text-foreground">
              Crypto Bull Run Analysis
            </h3>
            <TextBlock>{SECTION_COMBINED}</TextBlock>
          </div>

          <div className="flex flex-col gap-[1.25rem]">
            <div className="flex min-w-0 flex-col gap-[1rem]">
              <div className="flex items-center gap-[0.75rem]">
                {usePairIcons ? (
                  <CryptoIcon
                    iconSlug={primaryMarket.iconSlug}
                    label={primaryMarket.label}
                    className="h-[2.25rem] w-[2.25rem] shrink-0"
                  />
                ) : (
                  <InsightInfoMark />
                )}
                <h3 className="min-w-0 font-insight text-[1.25rem] font-light uppercase tracking-[0.06em] text-foreground">
                  Crypto Bull Run Analysis
                </h3>
              </div>
              <TextBlock>{SECTION_COMBINED}</TextBlock>
            </div>
          </div>

          <div className="flex flex-col gap-[1.25rem]">
            <div className="flex min-w-0 flex-col gap-[1rem]">
              <div className="flex items-center gap-[0.75rem]">
                {usePairIcons && secondaryMarket ? (
                  <CryptoIcon
                    iconSlug={secondaryMarket.iconSlug}
                    label={secondaryMarket.label}
                    className="h-[2.25rem] w-[2.25rem] shrink-0"
                  />
                ) : (
                  <InsightInfoMark />
                )}
                <h3 className="min-w-0 font-insight text-[1.25rem] font-light uppercase tracking-[0.06em] text-foreground">
                  Analyzing the Bull Run Line
                </h3>
              </div>
              <TextBlock>{SECTION_COMBINED}</TextBlock>
            </div>
          </div>
        </div>
        </div>
        <div className="flex shrink-0 items-stretch" aria-hidden>
          <div className="w-[70px] shrink-0" />
          <div className="w-px shrink-0 self-stretch bg-gradient-to-b from-white to-black" />
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
