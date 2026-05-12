import type { ReactNode } from "react";

const ROOT =
  "flex min-h-0 items-center justify-between gap-[0.75rem] border-b-[0.0625rem] border-v-border bg-[color:var(--v-chart-bg)] px-[1.3125rem] py-[1rem]";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Top bar for a chart/graph panel (pair, chart id, timeframe, actions). */
export function GraphDescriptor({ children, className }: Props) {
  return (
    <div className={className ? `${ROOT} ${className}` : ROOT}>{children}</div>
  );
}
