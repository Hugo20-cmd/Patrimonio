'use server'

// í¢ÂÂí¢ÂÂí¢ÂÂ Cache í¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂ
const quoteCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 min

const BRAPI_BASE   = 'https://brapi.dev/api'
const FINNHUB_BASE = 'https://finnhub.io/api/v1'

function brapiToken()   { return process.env.BRAPI_TOKEN   || '' }
function finnhubToken() { return process.env.FINNHUB_TOKEN || '' }

// í¢ÂÂí¢ÂÂí¢ÂÂ Detector de mercado í¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂ
// Tickers BR terminam com dí­Â­gitos: PETR4, BOVA11, JEPI39, MXRF11, etc.
// Tickers US são apenas letras: JEPI, SPY, QQQ, SCHW, etc.
function isUSATicker(ticker: string): boolean {
  return /^[A-Z]+$/.test(ticker.trim().toUpperCase())
}

// í¢ÂÂí¢ÂÂí¢ÂÂ BRAPI í¢ÂÂ busca um ativo brasileiro í¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂ
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

// í¢ÂÂí¢ÂÂí¢ÂÂ FINNHUB í¢ÂÂ busca um ativo americano í¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂ
async function fetchFinnhub(ticker: string) {
  const [quoteRes, profileRes] = await Promise.all([
    fetch(`${FINNHUB_BASE}/quote?symbol=${ticker}&token=${finnhubToken()}`, { next: { revalidate: 300 } }),
    fetch(`${FINNHUB_BASE}/stock/profile2?symbol=${ticker}&token=${finnhubToken()}`, { next: { revalidate: 3600 } }),
  ])

  const quote   = await quoteRes.json()
  const profile = await profileRes.json()

  // c = current price, d = change, dp = % change, h = high, l = low, pc = previous close
  if (!quote.c || quote.c === 0) return null

  return {
    symbol:        ticker,
    shortName:     profile.name || ticker,
    longName:      profile.name || ticker,
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

// í¢ÂÂí¢ÂÂí¢ÂÂ Finnhub search í¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂ
async function searchFinnhub(query: string) {
  const res = await fetch(
    `${FINNHUB_BASE}/search?q=${encodeURIComponent(query)}&token=${finnhubToken()}`,
    { next: { revalidate: 600 } }
  )
  const json = await res.json()
  if (!json.result) return []

  return json.result
    .filter((r: any) => r.type === 'ETP' || r.type === 'Common Stock') // ETFs e açí­Âµes
    .slice(0, 8)
    .map((r: any) => ({
      symbol:  r.symbol,
      name:    r.description,
      close:   0,
      change:  0,
      logoUrl: null,
      market:  'US',
    }))
}

// í¢ÂÂí¢ÂÂí¢ÂÂ PUBLIC API í¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂí¢ÂÂ

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

  // Brapi í¢ÂÂ busca em lote
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

  // Finnhub í¢ÂÂ busca individual (não tem endpoint em lote)
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

  const isUS = isUSATicker(query.replace(/\d/g, '')) && !/\d/.test(query)

  if (isUS) {
    // Busca na Finnhub para tickers americanos
    return searchFinnhub(query)
  }

  // Busca na Brapi para tickers brasileiros
  try {
    const res = await fetch(
      `${BRAPI_BASE}/quote/list?search=${encodeURIComponent(query)}&token=${brapiToken()}&limit=10`,
      { next: { revalidate: 600 } }
    )
    const json = await res.json()
    if (!json.stocks) return []
    return json.stocks.map((s: any) => ({
      symbol:  s.stock,
      name:    s.name,
      close:   s.close,
      change:  s.change,
      volume:  s.volume,
      marketCap: s.market_cap,
      logoUrl: s.logo,
      sector:  s.sector,
      type:    s.type,
      market:  'BR',
    }))
  } catch (err) {
    console.error('[market] Brapi search error:', err)
    return []
  }
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
