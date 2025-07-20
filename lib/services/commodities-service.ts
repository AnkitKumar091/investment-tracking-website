export interface CommodityPrice {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  previousClose: number
  unit: string
  exchange: string
  category: "metals" | "energy" | "agriculture" | "currency"
}

export interface CommodityAnalysis {
  symbol: string
  trend: "bullish" | "bearish" | "sideways"
  support: number[]
  resistance: number[]
  volatility: number
  seasonality: string
  fundamentalFactors: string[]
}

export class CommoditiesService {
  private cache: Map<string, any> = new Map()
  private readonly CACHE_TTL = 60000 // 1 minute

  private readonly COMMODITIES = [
    // Metals
    { symbol: "GOLD", name: "Gold", unit: "USD/oz", category: "metals" as const, exchange: "COMEX" },
    { symbol: "SILVER", name: "Silver", unit: "USD/oz", category: "metals" as const, exchange: "COMEX" },
    { symbol: "COPPER", name: "Copper", unit: "USD/lb", category: "metals" as const, exchange: "COMEX" },
    { symbol: "PLATINUM", name: "Platinum", unit: "USD/oz", category: "metals" as const, exchange: "NYMEX" },

    // Energy
    { symbol: "CRUDE", name: "Crude Oil WTI", unit: "USD/bbl", category: "energy" as const, exchange: "NYMEX" },
    { symbol: "BRENT", name: "Brent Crude", unit: "USD/bbl", category: "energy" as const, exchange: "ICE" },
    { symbol: "NATGAS", name: "Natural Gas", unit: "USD/MMBtu", category: "energy" as const, exchange: "NYMEX" },

    // Agriculture
    { symbol: "WHEAT", name: "Wheat", unit: "USD/bu", category: "agriculture" as const, exchange: "CBOT" },
    { symbol: "CORN", name: "Corn", unit: "USD/bu", category: "agriculture" as const, exchange: "CBOT" },
    { symbol: "SOYBEAN", name: "Soybeans", unit: "USD/bu", category: "agriculture" as const, exchange: "CBOT" },
    { symbol: "COTTON", name: "Cotton", unit: "USD/lb", category: "agriculture" as const, exchange: "ICE" },

    // Currency
    { symbol: "DXY", name: "US Dollar Index", unit: "Index", category: "currency" as const, exchange: "ICE" },
    { symbol: "EURUSD", name: "EUR/USD", unit: "Rate", category: "currency" as const, exchange: "Forex" },
    { symbol: "GBPUSD", name: "GBP/USD", unit: "Rate", category: "currency" as const, exchange: "Forex" },
    { symbol: "USDINR", name: "USD/INR", unit: "Rate", category: "currency" as const, exchange: "NSE" },
  ]

  async getAllCommodities(): Promise<CommodityPrice[]> {
    const cacheKey = "all-commodities"

    // Check cache
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      const data = await this.fetchAllCommodities()
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.warn("Failed to fetch commodities data:", error)
      return this.generateMockCommoditiesData()
    }
  }

  async getCommodity(symbol: string): Promise<CommodityPrice | null> {
    const commodities = await this.getAllCommodities()
    return commodities.find((c) => c.symbol === symbol) || null
  }

  async getCommoditiesByCategory(
    category: "metals" | "energy" | "agriculture" | "currency",
  ): Promise<CommodityPrice[]> {
    const commodities = await this.getAllCommodities()
    return commodities.filter((c) => c.category === category)
  }

  private async fetchAllCommodities(): Promise<CommodityPrice[]> {
    const sources = [
      () => this.fetchFromAlphaVantage(),
      () => this.fetchFromYahooFinance(),
      () => this.fetchFromQuandl(),
    ]

    for (const source of sources) {
      try {
        const data = await source()
        if (data && data.length > 0) {
          return data
        }
      } catch (error) {
        console.warn("Commodities source failed:", error)
        continue
      }
    }

    throw new Error("All commodities sources failed")
  }

  private async fetchFromAlphaVantage(): Promise<CommodityPrice[]> {
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "demo"
    const commodities: CommodityPrice[] = []

    // Alpha Vantage has limited commodity data
    const availableSymbols = ["WTI", "BRENT", "NATURAL_GAS"]

    for (const symbol of availableSymbols) {
      try {
        const url = `https://www.alphavantage.co/query?function=${symbol}&interval=daily&apikey=${apiKey}`
        const response = await fetch(url)

        if (!response.ok) continue

        const data = await response.json()
        const parsed = this.parseAlphaVantageCommodity(data, symbol)
        if (parsed) commodities.push(parsed)
      } catch (error) {
        console.warn(`Failed to fetch ${symbol} from Alpha Vantage:`, error)
      }
    }

    return commodities
  }

  private parseAlphaVantageCommodity(data: any, symbol: string): CommodityPrice | null {
    try {
      const timeSeries = data.data || []
      if (timeSeries.length === 0) return null

      const latest = timeSeries[0]
      const previous = timeSeries[1]

      const commodityInfo =
        this.COMMODITIES.find((c) => c.symbol.toLowerCase().includes(symbol.toLowerCase())) || this.COMMODITIES[0]

      return {
        symbol: commodityInfo.symbol,
        name: commodityInfo.name,
        price: Number.parseFloat(latest.value),
        change: Number.parseFloat(latest.value) - Number.parseFloat(previous?.value || latest.value),
        changePercent: previous
          ? ((Number.parseFloat(latest.value) - Number.parseFloat(previous.value)) /
              Number.parseFloat(previous.value)) *
            100
          : 0,
        volume: 0, // Not available in Alpha Vantage commodity data
        high: Number.parseFloat(latest.value) * 1.02,
        low: Number.parseFloat(latest.value) * 0.98,
        previousClose: Number.parseFloat(previous?.value || latest.value),
        unit: commodityInfo.unit,
        exchange: commodityInfo.exchange,
        category: commodityInfo.category,
      }
    } catch (error) {
      return null
    }
  }

  private async fetchFromYahooFinance(): Promise<CommodityPrice[]> {
    const commodities: CommodityPrice[] = []

    // Yahoo Finance commodity symbols
    const yahooSymbols = [
      { yahoo: "GC=F", local: "GOLD" },
      { yahoo: "SI=F", local: "SILVER" },
      { yahoo: "CL=F", local: "CRUDE" },
      { yahoo: "BZ=F", local: "BRENT" },
      { yahoo: "NG=F", local: "NATGAS" },
      { yahoo: "ZW=F", local: "WHEAT" },
      { yahoo: "ZC=F", local: "CORN" },
      { yahoo: "DX-Y.NYB", local: "DXY" },
      { yahoo: "EURUSD=X", local: "EURUSD" },
      { yahoo: "USDINR=X", local: "USDINR" },
    ]

    for (const { yahoo, local } of yahooSymbols) {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahoo}`
        const response = await fetch(url)

        if (!response.ok) continue

        const data = await response.json()
        const parsed = this.parseYahooCommodity(data, local)
        if (parsed) commodities.push(parsed)
      } catch (error) {
        console.warn(`Failed to fetch ${yahoo} from Yahoo Finance:`, error)
      }
    }

    return commodities
  }

  private parseYahooCommodity(data: any, symbol: string): CommodityPrice | null {
    try {
      const result = data.chart?.result?.[0]
      if (!result) return null

      const meta = result.meta
      const commodityInfo = this.COMMODITIES.find((c) => c.symbol === symbol)
      if (!commodityInfo) return null

      return {
        symbol,
        name: commodityInfo.name,
        price: meta.regularMarketPrice || 0,
        change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
        changePercent:
          meta.regularMarketPrice && meta.previousClose
            ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
            : 0,
        volume: meta.regularMarketVolume || 0,
        high: meta.regularMarketDayHigh || 0,
        low: meta.regularMarketDayLow || 0,
        previousClose: meta.previousClose || 0,
        unit: commodityInfo.unit,
        exchange: commodityInfo.exchange,
        category: commodityInfo.category,
      }
    } catch (error) {
      return null
    }
  }

  private async fetchFromQuandl(): Promise<CommodityPrice[]> {
    // Placeholder for Quandl fetch implementation
    return []
  }

  private generateMockCommoditiesData(): CommodityPrice[] {
    // Placeholder for mock data generation
    return []
  }
}
