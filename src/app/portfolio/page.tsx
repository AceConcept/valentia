import { AppHeader } from "@/components/AppHeader";
import { AppShell } from "@/components/AppShell";
import { MarketTickerBar } from "@/components/MarketTickerBar";
import { MARKETS } from "@/lib/tokens";

export default function PortfolioPage() {
  return (
    <AppShell>
      <AppHeader />
      <MarketTickerBar selectedSymbols={[MARKETS[0].symbol]} />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center p-[2rem] text-v-muted">
        <p className="text-[1.25rem] font-medium text-v-subtle">Portfolio</p>
        <p className="mt-[0.5rem] max-w-[24rem] text-center text-[1.25rem] leading-relaxed">
          Holdings and performance will live here.
        </p>
      </main>
    </AppShell>
  );
}
