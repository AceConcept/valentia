import type { InsightArticlePayload } from "@/lib/insight-view-payload";

const TOOLBAR_BTN =
  "inline-flex h-[2rem] shrink-0 items-center justify-center rounded-[0.375rem] border-[0.0625rem] border-[rgba(128,128,128,1)] bg-transparent px-[1rem] font-mono text-[1.25rem] font-light uppercase leading-none tracking-[0.08em] text-v-subtle transition-[border-color,color,background-color] duration-150 hover:border-v-muted hover:text-foreground";

type Props = {
  /** When a second compare chart is loaded, copy reflects compare mode. */
  multiToken?: boolean;
  /** Insight route / expanded article: category + headline in the strip. */
  article?: InsightArticlePayload | null;
  /** Chart A label when no article (e.g. token name). */
  chartLabel?: string;
};

export function SingleTokenChartToolbar({
  multiToken = false,
  article = null,
  chartLabel = "Markets",
}: Props) {
  const subtitle =
    article !== null
      ? article.category
      : multiToken
        ? "Compare charts"
        : "Chart analysis";

  const title =
    article !== null
      ? article.headline
      : multiToken
        ? "Multi-token session"
        : chartLabel;

  const barHeading =
    article !== null
      ? article.category
      : multiToken
        ? "Multi-token chart analysis"
        : "Single token chart analysis";

  return (
    <>
      {article !== null ? (
        <>
          <p className="m-0 mb-[0.375rem] font-insight text-[1.3125rem] font-medium leading-snug text-v-muted">
            {subtitle}
          </p>
          <h2 className="m-0 mb-[1.25rem] font-mono text-[2.625rem] font-light leading-tight tracking-tight text-foreground">
            {title}
          </h2>
        </>
      ) : null}

      {article === null ? (
        <div className="v-hide-scrollbar mb-[2.25rem] flex h-[4.75rem] w-full min-w-0 shrink-0 items-center gap-x-[2rem] overflow-x-auto rounded-[0.375rem] border-[0.0625rem] border-v-border bg-[#0a0a0a] px-[1.3125rem]">
          <p className="m-0 shrink-0 font-mono text-[1.25rem] font-light uppercase leading-none tracking-[0.12em] text-[#9ab5a4]">
            {barHeading}
          </p>
          <div className="flex shrink-0 items-center gap-[0.75rem]">
            <button type="button" className={`${TOOLBAR_BTN} gap-[0.25rem]`}>
              <span
                className="h-[0.5rem] w-[0.5rem] shrink-0 rounded-full bg-[var(--v-candle-up)] shadow-[0_0_0.375rem_rgba(89,227,94,0.45)]"
                aria-hidden
              />
              <span className="normal-case tracking-normal">Live</span>
            </button>
            <button type="button" className={TOOLBAR_BTN}>
              Trade info
            </button>
            <button type="button" className={TOOLBAR_BTN}>
              Recent trades
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
