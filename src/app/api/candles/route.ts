import { NextRequest, NextResponse } from "next/server";

import type { Candle } from "@/lib/candles";
import { marketBySymbol } from "@/lib/tokens";

const BINANCE_KLINES = "https://api.binance.com/api/v3/klines";
const KRAKEN_OHLC = "https://api.kraken.com/0/public/OHLC";

/** Kraken pair names — used when Binance geo-blocks and CoinGecko CDN blocks server IPs (HTML/WAF responses). */
const KRAKEN_PAIR_BY_SYMBOL: Partial<Record<string, string>> = {
  BTCUSDT: "XXBTZUSD",
  ETHUSDT: "XETHZUSD",
  SOLUSDT: "SOLUSD",
  BNBUSDT: "BNBUSD",
  XRPUSDT: "XXRPZUSD",
  DOGEUSDT: "DOGEUSD",
};

/**
 * Standard fetch options only — avoids `next: { revalidate }`, which breaks many
 * edge deployments (e.g. Cloudflare Workers / Open Next) where Next’s fetch cache isn’t wired up.
 */
function upstreamFetchInit(): RequestInit {
  return {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      /** CDNs sometimes treat empty/default user agents as bots for datacenter IPs. */
      "User-Agent":
        "Valentia/1.0 (market dashboard; https://github.com/AceConcept/valentia)",
    },
  };
}

function describeBlockingResponse(
  status: number,
  contentType: string | null,
  bodySnippet: string,
): string | null {
  const htmlHint =
    /<html[\s>]|<!doctype\b|cloudflare/i.test(bodySnippet) ||
    contentType?.toLowerCase().includes("text/html");
  const cfRay = /cf-ray|"cloudflare"|attention required/i.test(bodySnippet);
  if (htmlHint || cfRay || status === 403 || status === 503) {
    return "Upstream returned HTML or a CDN/WAF-style page instead of JSON (often seen when an API fronts Cloudflare or rate-limits datacenter IPs).";
  }
  return null;
}

/** CoinGecko `/coins/{id}/ohlc` granularity follows `days`: beyond ~30d it uses multi-day buckets (~few dozen points). Stay ≤30d for denser candles when Binance is unavailable. */
function coingeckoDaysForLimit(limit: number): number {
  if (limit <= 60) return 7;
  return 30;
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
function candlesFromCoinGecko(rows: number[][], lim: number): Candle[] {
  const sorted = [...rows].sort((a, b) => a[0] - b[0]);
  const slice = sorted.slice(-lim);
  return slice.map((row) => ({
    time: Math.floor(row[0] / 1000),
    open: row[1],
    high: row[2],
    low: row[3],
    close: row[4],
  }));
}

/** Kraken OHLC rows: [time_unix, open, high, low, close, …] as strings */
function candlesFromKraken(rows: unknown[][], lim: number): Candle[] {
  const parsed = rows.map((row) => ({
    time: Number(row[0]),
    open: parseFloat(String(row[1])),
    high: parseFloat(String(row[2])),
    low: parseFloat(String(row[3])),
    close: parseFloat(String(row[4])),
  }));
  parsed.sort((a, b) => a.time - b.time);
  return parsed.slice(-lim);
}

/** Kraken only supports specific intervals — 60 ~= 1h is the usual match for Binance fallback. */
const KRAKEN_FALLBACK_INTERVAL = 60;

async function tryKrakenOhlc(
  symbol: string,
  limit: number,
): Promise<{ ok: true; candles: Candle[] } | { ok: false; detail: string }> {
  const pair = KRAKEN_PAIR_BY_SYMBOL[symbol];
  if (!pair) {
    return { ok: false, detail: "No Kraken OHLC mapping for symbol" };
  }

  const url = `${KRAKEN_OHLC}?pair=${encodeURIComponent(pair)}&interval=${KRAKEN_FALLBACK_INTERVAL}`;
  const res = await fetch(url, upstreamFetchInit());
  const text = await res.text();

  if (!res.ok) {
    return {
      ok: false,
      detail: `${res.status}: ${text.slice(0, 240)}`,
    };
  }

  let body: { error?: string[]; result?: Record<string, unknown> };
  try {
    body = JSON.parse(text) as typeof body;
  } catch {
    return { ok: false, detail: "Kraken: invalid JSON" };
  }

  if (body.error?.length) {
    return { ok: false, detail: body.error.join(" ") };
  }

  const result = body.result;
  if (!result || typeof result !== "object") {
    return { ok: false, detail: "Kraken: empty result" };
  }

  const seriesKey = Object.keys(result).find((k) => k !== "last");
  const rawSeries = seriesKey ? result[seriesKey] : undefined;
  if (!Array.isArray(rawSeries) || rawSeries.length === 0) {
    return { ok: false, detail: "Kraken: no OHLC rows" };
  }

  const candles = candlesFromKraken(rawSeries as unknown[][], limit);
  return candles.length === 0
    ? { ok: false, detail: "Kraken: OHLC parsing produced no candles" }
    : { ok: true, candles };
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "BTCUSDT";
  const interval = req.nextUrl.searchParams.get("interval") ?? "1h";
  const limitRaw = req.nextUrl.searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitRaw) || 200, 1), 1000);

  const binanceUrl = `${BINANCE_KLINES}?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`;

  const binanceRes = await fetch(binanceUrl, upstreamFetchInit());

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

  const cgRes = await fetch(cgUrl, upstreamFetchInit());
  const cgText = await cgRes.text();
  const cgCt = cgRes.headers.get("content-type");
  const head = cgText.slice(0, 640);

  if (!cgRes.ok) {
    const hint = describeBlockingResponse(cgRes.status, cgCt, head);
    const krakenResult = await tryKrakenOhlc(symbol, limit);
    if (krakenResult.ok) {
      return NextResponse.json({
        symbol,
        interval,
        candles: krakenResult.candles,
        source: "kraken" as const,
        quote: "usd" as const,
        note: `CoinGecko failed (HTTP ${cgRes.status})${hint ? ` — ${hint}` : ""}. Using Kraken public OHLC (USD, ~${KRAKEN_FALLBACK_INTERVAL}m buckets).`,
      });
    }
    return NextResponse.json(
      {
        error: "Upstream rejected request",
        detail: `${binanceMsg} | CoinGecko: ${cgText.slice(0, 240)}${krakenResult.ok ? "" : ` | Kraken: ${krakenResult.detail}`}`,
        symbol,
      },
      { status: 502 },
    );
  }

  const cgBlockHint = describeBlockingResponse(200, cgCt, head);
  const looksJsonArray = cgText.trimStart().startsWith("[");

  if (cgBlockHint !== null || !looksJsonArray) {
    const krakenResult = await tryKrakenOhlc(symbol, limit);
    if (krakenResult.ok) {
      return NextResponse.json({
        symbol,
        interval,
        candles: krakenResult.candles,
        source: "kraken" as const,
        quote: "usd" as const,
        note: `${
          cgBlockHint ?? "CoinGecko response was not a JSON OHLC array."
        } Using Kraken public OHLC (USD, ~${KRAKEN_FALLBACK_INTERVAL}m buckets).`,
      });
    }
    return NextResponse.json(
      {
        error: "Upstream rejected request",
        detail: `${binanceMsg} | CoinGecko unusable.${krakenResult.ok ? "" : ` Kraken: ${krakenResult.detail}`}`,
        symbol,
      },
      { status: 502 },
    );
  }

  try {
    const ohlc = JSON.parse(cgText) as unknown;
    if (!Array.isArray(ohlc))
      throw new Error("OHLC payload is not an array");

    const candles = candlesFromCoinGecko(ohlc as number[][], limit);
    return NextResponse.json({
      symbol,
      interval,
      candles,
      source: "coingecko" as const,
      quote: "usd" as const,
      note:
        "Binance is unavailable in your region; showing CoinGecko OHLC (USD). Candle spacing follows CoinGecko granularity.",
    });
  } catch {
    const krakenResult = await tryKrakenOhlc(symbol, limit);
    if (krakenResult.ok) {
      return NextResponse.json({
        symbol,
        interval,
        candles: krakenResult.candles,
        source: "kraken" as const,
        quote: "usd" as const,
        note:
          "CoinGecko OHLC JSON could not be parsed — using Kraken public OHLC (USD).",
      });
    }
    return NextResponse.json(
      {
        error: "Upstream rejected request",
        detail: `${binanceMsg} | CoinGecko: malformed JSON | Kraken: ${krakenResult.detail}`,
        symbol,
      },
      { status: 502 },
    );
  }
}
