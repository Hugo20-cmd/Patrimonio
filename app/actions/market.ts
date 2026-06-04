'use server'

// ─── Cache ────────────────────────────────────────────────────────────────────
const quoteCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 min

const BRAPI_BASE   = 'https://brapi.dev/api'
const FINNHUB_BASE = 'https://finnhub.io/api/v1'

function brapiToken()   { return process.env.BRAPI_TOKEN   || '' }
function finnhubToken() { return process.env.FINNHUB_TOKEN || '' }

// ─── Detector de mercado ──────────────────────────────────────────────────────
// Tickers BR terminam com dígitos: PETR4, BOVA11, JEPI39, MXRF11, etc.
// Tickers US são apenas letras: JEPI, SPY, QQQ, SCHW, etc.
function isUSATicker(ticker: string): boolean {
  if (ticker.startsWith('BINANCE:')) return true
  return /^[A-Z]+$/.test(ticker.trim().toUpperCase())
}

// ─── BRAPI — busca um ativo brasileiro ───────────────────────────────────────
async function fetchBrapi(ticker: string) {
  const res = await fetch(
    `${BRAPI_BASE}/quote/${ticker}?token=${brapiToken()}`,
    { next: { revalidate: 300 } }
  )
  const json = await res.json()
  if (!json.results?.length) return null
  const r = json.results[0]
  return {
    symbol:        r.symbol,
    shortName:     r.shortName,
    longName:      r.longName,
    currency:      r.currency || 'BRL',
    price:         r.regularMarketPrice,
    change:        r.regularMarketChange,
    changePercent: r.regularMarketChangePercent,
    dayHigh:       r.regularMarketDayHigh,
    dayLow:        r.regularMarketDayLow,
    volume:        r.regularMarketVolume,
    previousClose: r.regularMarketPreviousClose,
    marketCap:     r.marketCap,
    fiftyTwoWeekHigh: r.fiftyTwoWeekHigh,
    fiftyTwoWeekLow:  r.fiftyTwoWeekLow,
    priceEarnings:    r.priceEarnings,
    earningsPerShare: r.earningsPerShare,
    logoUrl:       r.logourl,
    updatedAt:     r.regularMarketTime,
    market:        'BR',
  }
}

// ─── FINNHUB — busca um ativo americano ──────────────────────────────────────
async function fetchFinnhub(ticker: string) {
  const [quoteRes, profileRes] = await Promise.all([
    fetch(`${FINNHUB_BASE}/quote?symbol=${ticker}&token=${finnhubToken()}`, { next: { revalidate: 300 } }),
    fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${ticker}&token=${finnhubToken()}`, { next: { revalidate: 3600 } }),
  ])

  const quote   = await quoteRes.json()
  const profile = await profileRes.json()

  // c = current price, d = change, dp = % change, h = high, l = low, pc = previous close
  if (!quote.c || quote.c === 0) return null

  const nameFallback = ticker.startsWith('BINANCE:') ? ticker.replace('BINANCE:', '').replace('USDT', '') + ' (Crypto)' : ticker;

  return {
    symbol:        ticker,
    shortName:     profile.name || nameFallback,
    longName:      profile.name || nameFallback,
    currency:      profile.currency || 'USD',
    price:         quote.c,
    change:        quote.d,
    changePercent: quote.dp,
    dayHigh:       quote.h,
    dayLow:        quote.l,
    volume:        0,
    previousClose: quote.pc,
    marketCap:     profile.marketCapitalization ? profile.marketCapitalization * 1_000_000 : 0,
    fiftyTwoWeekHigh: quote['52WeekHigh'] || 0,
    fiftyTwoWeekLow:  quote['52WeekLow']  || 0,
    priceEarnings:    profile.peRatioTTM || null,
    earningsPerShare: profile.epsTTM     || null,
    logoUrl:       profile.logo          || null,
    updatedAt:     new Date(quote.t * 1000).toISOString(),
    market:        'US',
    exchange:      profile.exchange,
    industry:      profile.finnhubIndustry,
  }
}

// ─── Finnhub search ──────────────────────────────────────────────────────────
async function searchFinnhub(query: string) {
  const res = await fetch(
    `${FINNHUB_BASE}/search?q=${encodeURIComponent(query)}&token=${finnhubToken()}`,
    { next: { revalidate: 600 } }
  )
  const json = await res.json()
  if (!json.result) return []

  return json.result
    .filter((r: any) => r.type === 'ETP' || r.type === 'Common Stock') // ETFs e ações
    .slice(0, 8)
    .map((r: any) => ({
      symbol:  r.symbol,
      name:    r.description,
      close:   0,
      change:  0,
      logoUrl: null,
      market:  'US',
      type:    r.type === 'ETP' ? 'ETF EUA' : 'Ação EUA',
    }))
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export async function getQuote(ticker: string) {
  const key = ticker.toUpperCase().trim()
  const cached = quoteCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data

  try {
    const data = isUSATicker(key) ? await fetchFinnhub(key) : await fetchBrapi(key)
    if (data) quoteCache.set(key, { data, timestamp: Date.now() })
    return data
  } catch (err) {
    console.error(`[market] Erro ao buscar ${key}:`, err)
    return null
  }
}

export async function getMultipleQuotes(tickers: string[]) {
  if (!tickers?.length) return []

  const results: any[] = []
  const toFetch: string[] = []

  for (const t of tickers) {
    const key    = t.toUpperCase().trim()
    const cached = quoteCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      results.push(cached.data)
    } else {
      toFetch.push(key)
    }
  }

  if (!toFetch.length) return results

  // Separar BR e US
  const brTickers = toFetch.filter((t) => !isUSATicker(t))
  const usTickers = toFetch.filter((t) => isUSATicker(t))

  const fetchTasks: Promise<any>[] = []

  // Brapi — busca em lote
  if (brTickers.length) {
    fetchTasks.push(
      fetch(`${BRAPI_BASE}/quote/${brTickers.join(',')}?token=${brapiToken()}`, { next: { revalidate: 300 } })
        .then((r) => r.json())
        .then((json) => {
          if (!json.results) return
          for (const r of json.results) {
            const formatted = {
              symbol: r.symbol, shortName: r.shortName, longName: r.longName,
              currency: r.currency || 'BRL', price: r.regularMarketPrice,
              change: r.regularMarketChange, changePercent: r.regularMarketChangePercent,
              dayHigh: r.regularMarketDayHigh, dayLow: r.regularMarketDayLow,
              volume: r.regularMarketVolume, previousClose: r.regularMarketPreviousClose,
              marketCap: r.marketCap, fiftyTwoWeekHigh: r.fiftyTwoWeekHigh,
              fiftyTwoWeekLow: r.fiftyTwoWeekLow, priceEarnings: r.priceEarnings,
              earningsPerShare: r.earningsPerShare, logoUrl: r.logourl,
              updatedAt: r.regularMarketTime, market: 'BR',
            }
            quoteCache.set(r.symbol, { data: formatted, timestamp: Date.now() })
            results.push(formatted)
          }
        })
        .catch((e) => console.error('[market] Brapi batch error:', e))
    )
  }

  // Finnhub — busca individual (não tem endpoint em lote)
  for (const t of usTickers) {
    fetchTasks.push(
      fetchFinnhub(t)
        .then((data) => {
          if (data) {
            quoteCache.set(t, { data, timestamp: Date.now() })
            results.push(data)
          }
        })
        .catch((e) => console.error(`[market] Finnhub error ${t}:`, e))
    )
  }

  await Promise.all(fetchTasks)
  return results
}

export async function searchAsset(query: string) {
  if (!query || query.length < 1) return []

  const searchUpper = query.toUpperCase().trim()

  // 1. Hardcoded Criptos e Tesouros Fictícios para o Simulador
  const localAssets = [
    { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin (Crypto)', type: 'Cripto', market: 'US' },
    { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum (Crypto)', type: 'Cripto', market: 'US' },
    { symbol: 'BINANCE:SOLUSDT', name: 'Solana (Crypto)', type: 'Cripto', market: 'US' },
    { symbol: 'BINANCE:DOGEUSDT', name: 'Dogecoin (Crypto)', type: 'Cripto', market: 'US' },
    { symbol: 'SGOV', name: 'iShares 0-3 Month Treasury Bond ETF', type: 'Tesouro EUA', market: 'US' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF EUA', market: 'US' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF EUA', market: 'US' },
    { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', type: 'ETF EUA', market: 'US' },
  ].filter(a => a.symbol.includes(searchUpper) || a.name.toUpperCase().includes(searchUpper));

  // 2. Busca Brapi (BR)
  const brapiPromise = fetch(`${BRAPI_BASE}/quote/list?search=${encodeURIComponent(query)}&token=${brapiToken()}&limit=5`, { next: { revalidate: 600 } })
    .then(r => r.json())
    .then(json => {
      if (!json.stocks) return [];
      return json.stocks.map((s: any) => ({
        symbol:  s.stock,
        name:    s.name,
        type:    s.type === 'fund' ? 'FII / ETF BR' : 'Ação BR',
        market:  'BR',
      }));
    }).catch(() => []);

  // 3. Busca Finnhub (US)
  const finnhubPromise = searchFinnhub(query).catch(() => []);

  const [brapiRes, finnhubRes] = await Promise.all([brapiPromise, finnhubPromise]);

  const combined = [...localAssets, ...brapiRes, ...finnhubRes];
  
  // Remove duplicates by symbol
  const unique = Array.from(new Map(combined.map(item => [item.symbol, item])).values());
  
  return unique.slice(0, 10);
}

export async function getExchangeRate() {
  const cached = quoteCache.get('USDBRL')
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION * 6) return cached.data // 30 mins cache

  try {
    const res = await fetch(`https://brapi.dev/api/v2/currency?currency=USD-BRL&token=${brapiToken()}`, { next: { revalidate: 1800 } })
    const json = await res.json()
    if (json.currency?.[0]?.bidPrice) {
      const rate = parseFloat(json.currency[0].bidPrice)
      quoteCache.set('USDBRL', { data: rate, timestamp: Date.now() })
      return rate
    }
  } catch (err) {
    console.error('[market] Error fetching exchange rate:', err)
  }
  return 5.0 // Fallback
}
