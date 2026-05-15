/** Spot pair for Binance; `coingeckoId` is used when Binance is geo-blocked. App tracks ten majors only. */
export const MARKETS = [
  {
    id: "BTC",
    label: "Bitcoin",
    symbol: "BTCUSDT",
    coingeckoId: "bitcoin",
    iconSlug: "btc",
  },
  {
    id: "SOL",
    label: "Solana",
    symbol: "SOLUSDT",
    coingeckoId: "solana",
    iconSlug: "sol",
  },
  {
    id: "XRP",
    label: "XRP",
    symbol: "XRPUSDT",
    coingeckoId: "ripple",
    iconSlug: "xrp",
  },
  {
    id: "ADA",
    label: "Cardano",
    symbol: "ADAUSDT",
    coingeckoId: "cardano",
    iconSlug: "ada",
  },
  {
    id: "AVAX",
    label: "Avalanche",
    symbol: "AVAXUSDT",
    coingeckoId: "avalanche-2",
    iconSlug: "avax",
  },
  {
    id: "ATOM",
    label: "Cosmos",
    symbol: "ATOMUSDT",
    coingeckoId: "cosmos",
    iconSlug: "atom",
  },
  {
    id: "LTC",
    label: "Litecoin",
    symbol: "LTCUSDT",
    coingeckoId: "litecoin",
    iconSlug: "ltc",
  },
  {
    id: "TRX",
    label: "TRON",
    symbol: "TRXUSDT",
    coingeckoId: "tron",
    iconSlug: "trx",
  },
  {
    id: "OP",
    label: "Optimism",
    symbol: "OPUSDT",
    coingeckoId: "optimism",
    iconSlug: "op",
  },
  {
    id: "NEAR",
    label: "NEAR",
    symbol: "NEARUSDT",
    coingeckoId: "near",
    iconSlug: "near",
  },
] as const;

export type Market = (typeof MARKETS)[number];

/**
 * Dashboard crypto sidebar: fixed pairs and default order.
 * Do not derive this list from live % or “gainers” filters — keeps the UI stable when demo or quote data changes.
 */
const SIDEBAR_MARKET_IDS = [
  "BTC",
  "SOL",
  "XRP",
  "ADA",
  "AVAX",
  "ATOM",
  "LTC",
  "TRX",
  "OP",
  "NEAR",
] as const;

export const SIDEBAR_MARKETS: Market[] = SIDEBAR_MARKET_IDS.map((id) => {
  const m = MARKETS.find((x) => x.id === id);
  if (!m) throw new Error(`tokens: SIDEBAR_MARKET_IDS missing ${id}`);
  return m;
});

export function marketBySymbol(symbol: string): Market | undefined {
  return MARKETS.find((m) => m.symbol === symbol);
}

/** PNG from spothq/cryptocurrency-icons (MIT) via jsDelivr — no API key. */
export function cryptoIconUrl(iconSlug: string): string {
  const s = iconSlug.toLowerCase();
  return `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@0.18.1/128/color/${encodeURIComponent(s)}.png`;
}
