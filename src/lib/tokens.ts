/** Spot pair for Binance; `coingeckoId` is used when Binance is geo-blocked. */
export const MARKETS = [
  {
    id: "BTC",
    label: "Bitcoin",
    symbol: "BTCUSDT",
    coingeckoId: "bitcoin",
    iconSlug: "btc",
  },
  {
    id: "ETH",
    label: "Ethereum",
    symbol: "ETHUSDT",
    coingeckoId: "ethereum",
    iconSlug: "eth",
  },
  {
    id: "SOL",
    label: "Solana",
    symbol: "SOLUSDT",
    coingeckoId: "solana",
    iconSlug: "sol",
  },
  {
    id: "BNB",
    label: "BNB",
    symbol: "BNBUSDT",
    coingeckoId: "binancecoin",
    iconSlug: "bnb",
  },
  {
    id: "XRP",
    label: "XRP",
    symbol: "XRPUSDT",
    coingeckoId: "ripple",
    iconSlug: "xrp",
  },
  {
    id: "DOGE",
    label: "Dogecoin",
    symbol: "DOGEUSDT",
    coingeckoId: "dogecoin",
    iconSlug: "doge",
  },
] as const;

export type Market = (typeof MARKETS)[number];

export function marketBySymbol(symbol: string): Market | undefined {
  return MARKETS.find((m) => m.symbol === symbol);
}

/** PNG from spothq/cryptocurrency-icons (MIT) via jsDelivr — no API key. */
export function cryptoIconUrl(iconSlug: string): string {
  const s = iconSlug.toLowerCase();
  return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@0.18.1/128/color/${encodeURIComponent(s)}.png`;
}
