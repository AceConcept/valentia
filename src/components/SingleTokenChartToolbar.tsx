const TOOLBAR_BTN =
  "inline-flex h-[2rem] shrink-0 items-center justify-center rounded-[0.375rem] border-[0.0625rem] border-v-border bg-transparent px-[1rem] font-mono text-[1.25rem] font-medium uppercase leading-none tracking-[0.08em] text-v-subtle transition-[border-color,color,background-color] duration-150 hover:border-v-muted hover:text-foreground";

export function SingleTokenChartToolbar() {
  return (
    <div className="mb-[2.25rem] flex h-[4.75rem] w-full min-w-0 shrink-0 items-center gap-x-[2rem] overflow-x-auto rounded-[0.375rem] border-[0.0625rem] border-v-border bg-[#141414] px-[1.25rem]">
      <h2 className="m-0 shrink-0 font-mono text-[1.25rem] font-medium uppercase leading-none tracking-[0.12em] text-[#9ab5a4]">
        Single token chart analysis
      </h2>
      <div className="flex shrink-0 items-center gap-[0.75rem]">
        <button type="button" className={`${TOOLBAR_BTN} gap-[0.25rem]`}>
          <span
            className="h-[0.5rem] w-[0.5rem] shrink-0 rounded-full bg-[var(--v-candle-up)] shadow-[0_0_0.375rem_rgba(92,225,198,0.45)]"
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
  );
}
