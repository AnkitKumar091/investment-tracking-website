interface AlphaVantageQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  previousClose: number
}

export class AlphaVantageAPI {
  private apiKey: string
  private baseUrl = "https://www.alphavantage.co/query"

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "demo"
  }

  async getQuote(symbol: string): Promise<AlphaVantageQuote> {
    try {
      const response = await fetch(`${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data["Error Message"] || data["Note"]) {
        throw new Error(data["Error Message"] || "API limit reached")
      }

      return this.parseAlphaVantageResponse(data, symbol)
    } catch (error) {
      console.log(`Alpha Vantage API failed for ${symbol}, using mock data`)
      return this.generateMockQuote(symbol)
    }
  }

  async searchSymbols(keywords: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${this.apiKey}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.bestMatches || []
    } catch (error) {
      console.log("Alpha Vantage search failed, returning empty results")
      return []
    }
  }

  private parseAlphaVantageResponse(data: any, symbol: string): AlphaVantageQuote {
    const quote = data["Global Quote"]
    if (!quote) {
      throw new Error("Invalid response format")
    }

    return {
      symbol,
      name: symbol,
      price: Number.parseFloat(quote["05. price"]) || 0,
      change: Number.parseFloat(quote["09. change"]) || 0,
      changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")) || 0,
      volume: Number.parseInt(quote["06. volume"]) || 0,
      high: Number.parseFloat(quote["03. high"]) || 0,
      low: Number.parseFloat(quote["04. low"]) || 0,
      previousClose: Number.parseFloat(quote["08. previous close"]) || 0,
    }
  }

  private generateMockQuote(symbol: string): AlphaVantageQuote {
    const basePrice = Math.random() * 1000 + 100
    const change = (Math.random() - 0.5) * 20
    const changePercent = (change / basePrice) * 100

    return {
      symbol,
      name: symbol,
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      high: Math.round((basePrice + Math.abs(change)) * 100) / 100,
      low: Math.round((basePrice - Math.abs(change)) * 100) / 100,
      previousClose: Math.round((basePrice - change) * 100) / 100,
    }
  }
}
