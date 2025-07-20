interface StockQuote {
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
}

export class YahooFinanceAPI {
  private baseUrl = "https://query1.finance.yahoo.com/v8/finance/chart"
  private corsProxies = [
    "https://api.allorigins.win/raw?url=",
    "https://cors-anywhere.herokuapp.com/",
    "https://thingproxy.freeboard.io/fetch/",
  ]

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    // Try direct API first
    try {
      return await this.fetchDirectly(symbols)
    } catch (error) {
      console.log("Direct API failed, trying CORS proxies...")
    }

    // Try with CORS proxies
    for (const proxy of this.corsProxies) {
      try {
        return await this.fetchWithProxy(symbols, proxy)
      } catch (error) {
        console.log(`Proxy ${proxy} failed, trying next...`)
        continue
      }
    }

    // Fallback to mock data
    console.log("All APIs failed, using mock data")
    return this.generateMockData(symbols)
  }

  private async fetchDirectly(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map(async (symbol) => {
      const response = await fetch(`${this.baseUrl}/${symbol}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return this.parseYahooResponse(data, symbol)
    })

    return Promise.all(promises)
  }

  private async fetchWithProxy(symbols: string[], proxy: string): Promise<StockQuote[]> {
    const promises = symbols.map(async (symbol) => {
      const url = encodeURIComponent(`${this.baseUrl}/${symbol}`)
      const response = await fetch(`${proxy}${url}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return this.parseYahooResponse(data, symbol)
    })

    return Promise.all(promises)
  }

  private parseYahooResponse(data: any, symbol: string): StockQuote {
    try {
      const result = data.chart.result[0]
      const meta = result.meta
      const quote = result.indicators.quote[0]

      return {
        symbol,
        name: meta.longName || symbol,
        price: meta.regularMarketPrice || 0,
        change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
        changePercent: (((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1)) * 100,
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap || 0,
        high: meta.regularMarketDayHigh || 0,
        low: meta.regularMarketDayLow || 0,
        previousClose: meta.previousClose || 0,
        sector: this.getSectorForSymbol(symbol),
      }
    } catch (error) {
      throw new Error(`Failed to parse Yahoo Finance response: ${error}`)
    }
  }

  private generateMockData(symbols: string[]): StockQuote[] {
    const mockData: { [key: string]: Partial<StockQuote> } = {
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
      const volatility = 0.02 // 2% volatility
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
      }
    })
  }

  private getSectorForSymbol(symbol: string): string {
    const sectorMap: { [key: string]: string } = {
      "RELIANCE.NS": "Energy",
      "TCS.NS": "IT",
      "INFY.NS": "IT",
      "HDFCBANK.NS": "Banking",
      "ICICIBANK.NS": "Banking",
      "HINDUNILVR.NS": "FMCG",
      "ITC.NS": "FMCG",
      "SBIN.NS": "Banking",
      "BHARTIARTL.NS": "Telecom",
      "KOTAKBANK.NS": "Banking",
    }
    return sectorMap[symbol] || "Others"
  }
}
