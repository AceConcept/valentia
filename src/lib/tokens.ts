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
  {
    id: "ADA",
    label: "Cardano",
    symbol: "ADAUSDT",
    coingeckoId: "cardano",
    iconSlug: "ada",
  },
  {
    id: "DOT",
    label: "Polkadot",
    symbol: "DOTUSDT",
    coingeckoId: "polkadot",
    iconSlug: "dot",
  },
  {
    id: "AVAX",
    label: "Avalanche",
    symbol: "AVAXUSDT",
    coingeckoId: "avalanche-2",
    iconSlug: "avax",
  },
  {
    id: "LINK",
    label: "Chainlink",
    symbol: "LINKUSDT",
    coingeckoId: "chainlink",
    iconSlug: "link",
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
    id: "UNI",
    label: "Uniswap",
    symbol: "UNIUSDT",
    coingeckoId: "uniswap",
    iconSlug: "uni",
  },
  {
    id: "TRX",
    label: "TRON",
    symbol: "TRXUSDT",
    coingeckoId: "tron",
    iconSlug: "trx",
  },
  {
    id: "ARB",
    label: "Arbitrum",
    symbol: "ARBUSDT",
    coingeckoId: "arbitrum",
    iconSlug: "arb",
  },
  {
    id: "OP",
    label: "Optimism",
    symbol: "OPUSDT",
    coingeckoId: "optimism",
    iconSlug: "op",
  },
  {
    id: "APT",
    label: "Aptos",
    symbol: "APTUSDT",
    coingeckoId: "aptos",
    iconSlug: "apt",
  },
  {
    id: "NEAR",
    label: "NEAR",
    symbol: "NEARUSDT",
    coingeckoId: "near",
    iconSlug: "near",
  },
  {
    id: "FIL",
    label: "Filecoin",
    symbol: "FILUSDT",
    coingeckoId: "filecoin",
    iconSlug: "fil",
  },
  {
    id: "ICP",
    label: "Internet Computer",
    symbol: "ICPUSDT",
    coingeckoId: "internet-computer",
    iconSlug: "icp",
  },
  {
    id: "ETC",
    label: "Ethereum Classic",
    symbol: "ETCUSDT",
    coingeckoId: "ethereum-classic",
    iconSlug: "etc",
  },
  {
    id: "HBAR",
    label: "Hedera",
    symbol: "HBARUSDT",
    coingeckoId: "hedera-hashgraph",
    iconSlug: "hbar",
  },
  {
    id: "VET",
    label: "VeChain",
    symbol: "VETUSDT",
    coingeckoId: "vechain",
    iconSlug: "vet",
  },
  {
    id: "ALGO",
    label: "Algorand",
    symbol: "ALGOUSDT",
    coingeckoId: "algorand",
    iconSlug: "algo",
  },
  {
    id: "XLM",
    label: "Stellar",
    symbol: "XLMUSDT",
    coingeckoId: "stellar",
    iconSlug: "xlm",
  },
  {
    id: "SUI",
    label: "Sui",
    symbol: "SUIUSDT",
    coingeckoId: "sui",
    iconSlug: "sui",
  },
  {
    id: "SHIB",
    label: "Shiba Inu",
    symbol: "SHIBUSDT",
    coingeckoId: "shiba-inu",
    iconSlug: "shib",
  },
  {
    id: "INJ",
    label: "Injective",
    symbol: "INJUSDT",
    coingeckoId: "injective-protocol",
    iconSlug: "inj",
  },
  {
    id: "TON",
    label: "Toncoin",
    symbol: "TONUSDT",
    coingeckoId: "the-open-network",
    iconSlug: "ton",
  },
  {
    id: "STX",
    label: "Stacks",
    symbol: "STXUSDT",
    coingeckoId: "stacks",
    iconSlug: "stx",
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
