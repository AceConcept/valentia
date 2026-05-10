import { NextRequest, NextResponse } from "next/server";

import type { Candle } from "@/lib/candles";
import { marketBySymbol } from "@/lib/tokens";

const BINANCE_KLINES = "https://api.binance.com/api/v3/klines";

/** CoinGecko `days` — larger range yields more bars (coarse intraday / 4h style). */
function coingeckoDaysForLimit(limit: number): number {
  if (limit <= 60) return 7;
  if (limit <= 180) return 30;
  return 90;
}

function candlesFromBinanceKlines(klines: string[][]): Candle[] {
  return klines.map((k) => ({
    time: Math.floor(Number(k[0]) / 1000),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
  }));
}

/** CoinGecko OHLC rows: [timestamp_ms, open, high, low, close] */
function candlesFromCoinGecko(rows: number[][], limit: number): Candle[] {
  const sorted = [...rows].sort((a, b) => a[0] - b[0]);
  const slice = sorted.slice(-limit);
  return slice.map((row) => ({
    time: Math.floor(row[0] / 1000),
    open: row[1],
    high: row[2],
    low: row[3],
    close: row[4],
  }));
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "BTCUSDT";
  const interval = req.nextUrl.searchParams.get("interval") ?? "1h";
  const limitRaw = req.nextUrl.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitRaw) || 200, 1), 1000);

  const binanceUrl = `${BINANCE_KLINES}?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`;

  const binanceRes = await fetch(binanceUrl, {
    next: { revalidate: 60 },
    headers: { Accept: "application/json" },
  });

  if (binanceRes.ok) {
    const klines = (await binanceRes.json()) as string[][];
    const candles = candlesFromBinanceKlines(klines);
    return NextResponse.json({
      symbol,
      interval,
      candles,
      source: "binance" as const,
    });
  }

  const binanceBody = await binanceRes.text();
  let binanceMsg = binanceBody.slice(0, 300);
  try {
    const j = JSON.parse(binanceBody) as { msg?: string };
    if (typeof j.msg === "string") binanceMsg = j.msg;
  } catch {
    /* keep raw slice */
  }

  const market = marketBySymbol(symbol);
  if (!market) {
    return NextResponse.json(
      {
        error: "Upstream rejected request",
        detail: binanceMsg,
        symbol,
      },
      { status: 502 },
    );
  }

  const days = coingeckoDaysForLimit(limit);
  const cgUrl = `https://api.coingecko.com/api/v3/coins/${market.coingeckoId}/ohlc?vs_currency=usd&days=${days}`;

  const cgRes = await fetch(cgUrl, {
    next: { revalidate: 120 },
    headers: { Accept: "application/json" },
  });

  if (!cgRes.ok) {
    const cgText = await cgRes.text();
    return NextResponse.json(
      {
        error: "Upstream rejected request",
        detail: `${binanceMsg} | CoinGecko: ${cgText.slice(0, 160)}`,
        symbol,
      },
      { status: 502 },
    );
  }

  const ohlc = (await cgRes.json()) as number[][];
  const candles = candlesFromCoinGecko(ohlc, limit);

  return NextResponse.json({
    symbol,
    interval,
    candles,
    source: "coingecko" as const,
    quote: "usd" as const,
    note:
      "Binance is unavailable in your region; showing CoinGecko OHLC (USD). Candle spacing follows CoinGecko granularity.",
  });
}
