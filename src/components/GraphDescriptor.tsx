import type { ReactNode } from "react";

const ROOT =
  "flex h-[6.75rem] shrink-0 items-center justify-between gap-[0.75rem] bg-[#0a0a0a] px-[1.3125rem] py-[1rem] font-light";

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
