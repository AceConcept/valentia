/** Spot pair for Binance; `coingeckoId` is used when Binance is geo-blocked. */
export const MARKETS = [
  { id: "BTC", label: "Bitcoin", symbol: "BTCUSDT", coingeckoId: "bitcoin" },
  { id: "ETH", label: "Ethereum", symbol: "ETHUSDT", coingeckoId: "ethereum" },
  { id: "SOL", label: "Solana", symbol: "SOLUSDT", coingeckoId: "solana" },
  { id: "BNB", label: "BNB", symbol: "BNBUSDT", coingeckoId: "binancecoin" },
  { id: "XRP", label: "XRP", symbol: "XRPUSDT", coingeckoId: "ripple" },
  { id: "DOGE", label: "Dogecoin", symbol: "DOGEUSDT", coingeckoId: "dogecoin" },
] as const;

export type Market = (typeof MARKETS)[number];

export function marketBySymbol(symbol: string): Market | undefined {
  return MARKETS.find((m) => m.symbol === symbol);
}
