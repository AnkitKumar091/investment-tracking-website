import { YahooFinanceAPI } from "./providers/yahoo-finance"
import { AlphaVantageAPI } from "./providers/alpha-vantage"
import { MutualFundAPI } from "./providers/mutual-fund-api"
import { stockCache, mutualFundCache } from "./cache-service"
import { rateLimiter } from "./rate-limiter"

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  high: number
  low: number
  previousClose: number
  sector: string
  source: string
}

interface MutualFundData {
  schemeCode: string
  schemeName: string
  nav: number
  date: string
  fundHouse: string
  category: string
  source: string
}

export class DataAggregator {
  private yahooAPI: YahooFinanceAPI
  private alphaVantageAPI: AlphaVantageAPI
  private mutualFundAPI: MutualFundAPI

  constructor() {
    this.yahooAPI = new YahooFinanceAPI()
    this.alphaVantageAPI = new AlphaVantageAPI()
    this.mutualFundAPI = new MutualFundAPI()
  }

  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    const cacheKey = `stocks:${symbols.join(",")}`

    // Try cache first
    const cached = stockCache.get<StockData[]>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Check rate limit
      if (!(await rateLimiter.checkLimit("yahoo-finance"))) {
        console.log("Rate limit exceeded for Yahoo Finance, using mock data")
        return this.generateMockStockData(symbols)
      }

      // Try Yahoo Finance first
      const quotes = await this.yahooAPI.getQuotes(symbols)
      const stockData: StockData[] = quotes.map((quote) => ({
        ...quote,
        source: "yahoo-finance",
      }))

      // Cache the results for 30 seconds
      stockCache.set(cacheKey, stockData, 30)
      return stockData
    } catch (error) {
      console.log("Yahoo Finance failed, trying Alpha Vantage...")

      try {
        // Fallback to Alpha Vantage for first symbol only (due to rate limits)
        if (await rateLimiter.checkLimit("alpha-vantage")) {
          const quote = await this.alphaVantageAPI.getQuote(symbols[0])
          const stockData: StockData[] = [
            {
              ...quote,
              marketCap: 0,
              sector: "Unknown",
              source: "alpha-vantage",
            },
          ]

          // Add mock data for remaining symbols
          const mockData = this.generateMockStockData(symbols.slice(1))
          stockData.push(...mockData)

          stockCache.set(cacheKey, stockData, 30)
          return stockData
        }
      } catch (alphaError) {
        console.log("Alpha Vantage also failed")
      }

      // Final fallback to mock data
      console.log("All APIs failed, using mock data")
      const mockData = this.generateMockStockData(symbols)
      stockCache.set(cacheKey, mockData, 30)
      return mockData
    }
  }

  async getSingleStock(symbol: string): Promise<StockData | null> {
    const stocks = await this.getMultipleStocks([symbol])
    return stocks[0] || null
  }

  async searchMutualFunds(query: string): Promise<MutualFundData[]> {
    const cacheKey = `mf-search:${query}`

    // Try cache first
    const cached = mutualFundCache.get<MutualFundData[]>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Check rate limit
      if (!(await rateLimiter.checkLimit("mutual-fund-api"))) {
        console.log("Rate limit exceeded for Mutual Fund API, using mock data")
        return this.generateMockMutualFundData()
      }

      const schemes = await this.mutualFundAPI.searchSchemes(query)
      const mutualFundData: MutualFundData[] = schemes.map((scheme) => ({
        ...scheme,
        source: "mutual-fund-api",
      }))

      // Cache for 5 minutes
      mutualFundCache.set(cacheKey, mutualFundData, 300)
      return mutualFundData
    } catch (error) {
      console.log("Mutual Fund API failed, using mock data")
      const mockData = this.generateMockMutualFundData()
      mutualFundCache.set(cacheKey, mockData, 300)
      return mockData
    }
  }

  async getMutualFundDetails(schemeCode: string): Promise<MutualFundData | null> {
    const cacheKey = `mf-details:${schemeCode}`

    // Try cache first
    const cached = mutualFundCache.get<MutualFundData>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      if (!(await rateLimiter.checkLimit("mutual-fund-api"))) {
        return this.generateMockMutualFundData()[0] || null
      }

      const scheme = await this.mutualFundAPI.getSchemeDetails(schemeCode)
      if (!scheme) return null

      const mutualFundData: MutualFundData = {
        ...scheme,
        source: "mutual-fund-api",
      }

      // Cache for 5 minutes
      mutualFundCache.set(cacheKey, mutualFundData, 300)
      return mutualFundData
    } catch (error) {
      console.log(`Failed to get mutual fund details for ${schemeCode}`)
      return null
    }
  }

  private generateMockStockData(symbols: string[]): StockData[] {
    const mockData: { [key: string]: Partial<StockData> } = {
      "RELIANCE.NS": { name: "Reliance Industries Ltd", price: 2850, sector: "Energy" },
      "TCS.NS": { name: "Tata Consultancy Services", price: 3920, sector: "IT" },
      "INFY.NS": { name: "Infosys Limited", price: 1750, sector: "IT" },
      "HDFCBANK.NS": { name: "HDFC Bank Limited", price: 1680, sector: "Banking" },
      "ICICIBANK.NS": { name: "ICICI Bank Limited", price: 1250, sector: "Banking" },
      "HINDUNILVR.NS": { name: "Hindustan Unilever Ltd", price: 2650, sector: "FMCG" },
      "ITC.NS": { name: "ITC Limited", price: 485, sector: "FMCG" },
      "SBIN.NS": { name: "State Bank of India", price: 820, sector: "Banking" },
      "BHARTIARTL.NS": { name: "Bharti Airtel Limited", price: 1580, sector: "Telecom" },
      "KOTAKBANK.NS": { name: "Kotak Mahindra Bank", price: 1890, sector: "Banking" },
    }

    return symbols.map((symbol) => {
      const base = mockData[symbol] || { name: symbol, price: 1000, sector: "Others" }
      const volatility = 0.02
      const randomChange = (Math.random() - 0.5) * volatility * 2
      const currentPrice = base.price! * (1 + randomChange)
      const change = currentPrice - base.price!
      const changePercent = (change / base.price!) * 100

      return {
        symbol,
        name: base.name!,
        price: Math.round(currentPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
        high: Math.round(currentPrice * 1.02 * 100) / 100,
        low: Math.round(currentPrice * 0.98 * 100) / 100,
        previousClose: base.price!,
        sector: base.sector!,
        source: "mock",
      }
    })
  }

  private generateMockMutualFundData(): MutualFundData[] {
    return [
      {
        schemeCode: "120503",
        schemeName: "SBI Large Cap Fund - Direct Plan - Growth",
        nav: 85.45,
        date: new Date().toISOString().split("T")[0],
        fundHouse: "SBI",
        category: "Large Cap",
        source: "mock",
      },
      {
        schemeCode: "120504",
        schemeName: "HDFC Top 100 Fund - Direct Plan - Growth",
        nav: 920.3,
        date: new Date().toISOString().split("T")[0],
        fundHouse: "HDFC",
        category: "Large Cap",
        source: "mock",
      },
      {
        schemeCode: "120505",
        schemeName: "ICICI Prudential Bluechip Fund - Direct Plan - Growth",
        nav: 78.25,
        date: new Date().toISOString().split("T")[0],
        fundHouse: "ICICI",
        category: "Large Cap",
        source: "mock",
      },
    ]
  }

  // Health check methods
  async checkAPIHealth(): Promise<{ [key: string]: boolean }> {
    const health = {
      "yahoo-finance": false,
      "alpha-vantage": false,
      "mutual-fund-api": false,
    }

    try {
      await this.yahooAPI.getQuotes(["AAPL"])
      health["yahoo-finance"] = true
    } catch (error) {
      // API is down
    }

    try {
      await this.alphaVantageAPI.getQuote("AAPL")
      health["alpha-vantage"] = true
    } catch (error) {
      // API is down
    }

    try {
      await this.mutualFundAPI.searchSchemes("SBI")
      health["mutual-fund-api"] = true
    } catch (error) {
      // API is down
    }

    return health
  }
}

export const dataAggregator = new DataAggregator()
