import type { InsightArticlePayload } from "@/lib/insight-view-payload";

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

  return (
    <>
      <p className="m-0 mb-[0.375rem] font-insight text-[1.3125rem] font-medium leading-snug text-v-muted">
        {subtitle}
      </p>
      <h2 className="m-0 mb-[2.25rem] font-mono text-[2.625rem] font-light leading-tight tracking-tight text-foreground">
        {title}
      </h2>
    </>
  );
}
