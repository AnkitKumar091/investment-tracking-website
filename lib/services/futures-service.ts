export interface FuturesContract {
  symbol: string
  expiry: string
  price: number
  change: number
  changePercent: number
  volume: number
  openInterest: number
  bid: number
  ask: number
  high: number
  low: number
  previousClose: number
  lotSize: number
  marginRequired: number
  basis: number // Futures - Spot
}

export interface FuturesAnalysis {
  symbol: string
  totalVolume: number
  totalOpenInterest: number
  rolloverPercentage: number
  costOfCarry: number
  fairValue: number
  premiumDiscount: number
  longBuildup: boolean
  shortBuildup: boolean
  longUnwinding: boolean
  shortUnwinding: boolean
}

export class FuturesService {
  private cache: Map<string, any> = new Map()
  private readonly CACHE_TTL = 30000 // 30 seconds

  async getFuturesContracts(symbol: string): Promise<FuturesContract[]> {
    const cacheKey = `futures-${symbol}`

    // Check cache
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      const data = await this.fetchFuturesContracts(symbol)
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.warn(`Failed to fetch futures contracts for ${symbol}:`, error)
      return this.generateMockFuturesContracts(symbol)
    }
  }

  private async fetchFuturesContracts(symbol: string): Promise<FuturesContract[]> {
    const sources = [
      () => this.fetchFromNSEFutures(symbol),
      () => this.fetchFromYahooFutures(symbol),
      () => this.fetchFromAlphaVantageFutures(symbol),
    ]

    for (const source of sources) {
      try {
        const data = await source()
        if (data && data.length > 0) {
          return data
        }
      } catch (error) {
        console.warn("Futures source failed:", error)
        continue
      }
    }

    throw new Error("All futures sources failed")
  }

  private async fetchFromNSEFutures(symbol: string): Promise<FuturesContract[]> {
    const nseSymbol = symbol.replace(".NS", "")
    const url = `https://www.nseindia.com/api/equity-stockIndices?index=${nseSymbol}FUT`

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      })

      if (!response.ok) throw new Error(`NSE Futures API error: ${response.status}`)

      const data = await response.json()
      return this.parseNSEFuturesData(data, symbol)
    } catch (error) {
      throw new Error(`NSE Futures API failed: ${error}`)
    }
  }

  private parseNSEFuturesData(data: any, symbol: string): FuturesContract[] {
    const contracts: FuturesContract[] = []
    const records = data.data || []

    for (const record of records) {
      if (record.meta?.symbol?.endsWith("FUT")) {
        contracts.push({
          symbol,
          expiry: record.meta.expiryDate || this.getNextExpiry(),
          price: record.lastPrice || 0,
          change: record.change || 0,
          changePercent: record.pChange || 0,
          volume: record.totalTradedVolume || 0,
          openInterest: record.openInterest || 0,
          bid: record.bidprice || 0,
          ask: record.askPrice || 0,
          high: record.dayHigh || 0,
          low: record.dayLow || 0,
          previousClose: record.previousClose || 0,
          lotSize: this.getLotSize(symbol),
          marginRequired: this.calculateMargin(record.lastPrice || 0, symbol),
          basis: (record.lastPrice || 0) - (record.underlyingValue || 0),
        })
      }
    }

    return contracts
  }

  private async fetchFromYahooFutures(symbol: string): Promise<FuturesContract[]> {
    // Yahoo Finance doesn't have comprehensive futures data for Indian markets
    throw new Error("Yahoo Futures not available for Indian markets")
  }

  private async fetchFromAlphaVantageFutures(symbol: string): Promise<FuturesContract[]> {
    // Alpha Vantage doesn't have futures data
    throw new Error("Alpha Vantage futures not implemented")
  }

  private generateMockFuturesContracts(symbol: string): FuturesContract[] {
    const contracts: FuturesContract[] = []
    const basePrice = this.getBasePriceForSymbol(symbol)
    const expiries = this.getNextFuturesExpiries(3)

    for (let i = 0; i < expiries.length; i++) {
      const expiry = expiries[i]
      const timeToExpiry = (new Date(expiry).getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000)
      const carryingCost = basePrice * 0.06 * timeToExpiry // 6% carrying cost
      const futuresPrice = basePrice + carryingCost + (Math.random() - 0.5) * 10

      contracts.push({
        symbol,
        expiry,
        price: Math.round(futuresPrice * 100) / 100,
        change: (Math.random() - 0.5) * 50,
        changePercent: (Math.random() - 0.5) * 3,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        openInterest: Math.floor(Math.random() * 5000000) + 500000,
        bid: Math.round((futuresPrice - 0.5) * 100) / 100,
        ask: Math.round((futuresPrice + 0.5) * 100) / 100,
        high: Math.round(futuresPrice * 1.02 * 100) / 100,
        low: Math.round(futuresPrice * 0.98 * 100) / 100,
        previousClose: Math.round((futuresPrice - (Math.random() - 0.5) * 20) * 100) / 100,
        lotSize: this.getLotSize(symbol),
        marginRequired: this.calculateMargin(futuresPrice, symbol),
        basis: Math.round((futuresPrice - basePrice) * 100) / 100,
      })
    }

    return contracts
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      "RELIANCE.NS": 2850,
      "TCS.NS": 3920,
      "INFY.NS": 1750,
      "HDFCBANK.NS": 1680,
      "ICICIBANK.NS": 1250,
      NIFTY: 19500,
      BANKNIFTY: 44000,
    }
    return basePrices[symbol] || 2000
  }

  private getLotSize(symbol: string): number {
    const lotSizes: { [key: string]: number } = {
      "RELIANCE.NS": 250,
      "TCS.NS": 150,
      "INFY.NS": 300,
      "HDFCBANK.NS": 550,
      "ICICIBANK.NS": 1375,
      NIFTY: 50,
      BANKNIFTY: 15,
    }
    return lotSizes[symbol] || 500
  }

  private calculateMargin(price: number, symbol: string): number {
    const lotSize = this.getLotSize(symbol)
    const marginPercentage = 0.12 // 12% margin requirement
    return Math.round(price * lotSize * marginPercentage)
  }

  private getNextFuturesExpiries(count: number): string[] {
    const expiries: string[] = []
    const today = new Date()

    // Futures expire on last Thursday of the month
    for (let month = 0; month < count; month++) {
      const date = new Date(today.getFullYear(), today.getMonth() + month + 1, 0) // Last day of month

      // Find last Thursday
      while (date.getDay() !== 4) {
        date.setDate(date.getDate() - 1)
      }

      expiries.push(date.toISOString().split("T")[0])
    }

    return expiries
  }

  private getNextExpiry(): string {
    return this.getNextFuturesExpiries(1)[0]
  }

  async getFuturesAnalysis(symbol: string): Promise<FuturesAnalysis> {
    try {
      const contracts = await this.getFuturesContracts(symbol)
      return this.calculateFuturesAnalysis(contracts, symbol)
    } catch (error) {
      console.warn(`Failed to get futures analysis for ${symbol}:`, error)
      return this.generateMockFuturesAnalysis(symbol)
    }
  }

  private calculateFuturesAnalysis(contracts: FuturesContract[], symbol: string): FuturesAnalysis {
    const totalVolume = contracts.reduce((sum, contract) => sum + contract.volume, 0)
    const totalOpenInterest = contracts.reduce((sum, contract) => sum + contract.openInterest, 0)

    // Calculate rollover percentage (assuming current month vs next month)
    const currentMonth = contracts[0]
    const nextMonth = contracts[1]
    const rolloverPercentage = nextMonth
      ? (nextMonth.openInterest / (currentMonth.openInterest + nextMonth.openInterest)) * 100
      : 0

    // Cost of carry calculation
    const spotPrice = this.getBasePriceForSymbol(symbol)
    const futuresPrice = currentMonth?.price || spotPrice
    const timeToExpiry = currentMonth
      ? (new Date(currentMonth.expiry).getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000)
      : 0.08

    const costOfCarry = timeToExpiry > 0 ? ((futuresPrice - spotPrice) / spotPrice) * (1 / timeToExpiry) * 100 : 0

    const fairValue = spotPrice * (1 + 0.06 * timeToExpiry) // 6% risk-free rate
    const premiumDiscount = ((futuresPrice - fairValue) / fairValue) * 100

    // Determine market sentiment based on price and OI changes
    const priceChange = currentMonth?.change || 0
    const oiChange = Math.random() - 0.5 // Mock OI change

    const longBuildup = priceChange > 0 && oiChange > 0
    const shortBuildup = priceChange < 0 && oiChange > 0
    const longUnwinding = priceChange < 0 && oiChange < 0
    const shortUnwinding = priceChange > 0 && oiChange < 0

    return {
      symbol,
      totalVolume,
      totalOpenInterest,
      rolloverPercentage: Math.round(rolloverPercentage * 100) / 100,
      costOfCarry: Math.round(costOfCarry * 100) / 100,
      fairValue: Math.round(fairValue * 100) / 100,
      premiumDiscount: Math.round(premiumDiscount * 100) / 100,
      longBuildup,
      shortBuildup,
      longUnwinding,
      shortUnwinding,
    }
  }

  private generateMockFuturesAnalysis(symbol: string): FuturesAnalysis {
    const sentiment = Math.random()

    return {
      symbol,
      totalVolume: Math.floor(Math.random() * 10000000) + 1000000,
      totalOpenInterest: Math.floor(Math.random() * 50000000) + 5000000,
      rolloverPercentage: 60 + Math.random() * 30,
      costOfCarry: 4 + Math.random() * 4,
      fairValue: this.getBasePriceForSymbol(symbol) + Math.random() * 20,
      premiumDiscount: (Math.random() - 0.5) * 2,
      longBuildup: sentiment > 0.7,
      shortBuildup: sentiment < 0.3,
      longUnwinding: sentiment > 0.4 && sentiment < 0.6,
      shortUnwinding: sentiment > 0.6 && sentiment < 0.8,
    }
  }

  // Get futures expiry dates
  async getExpiryDates(symbol: string): Promise<string[]> {
    try {
      const contracts = await this.getFuturesContracts(symbol)
      const expiries = [...new Set(contracts.map((contract) => contract.expiry))]
      return expiries.sort()
    } catch (error) {
      console.warn(`Failed to get futures expiry dates for ${symbol}:`, error)
      return this.getNextFuturesExpiries(3)
    }
  }

  // Calculate position P&L
  calculatePnL(
    entryPrice: number,
    currentPrice: number,
    quantity: number,
    position: "long" | "short",
  ): { pnl: number; pnlPercent: number } {
    const priceDiff = position === "long" ? currentPrice - entryPrice : entryPrice - currentPrice

    const pnl = priceDiff * quantity
    const pnlPercent = (priceDiff / entryPrice) * 100

    return {
      pnl: Math.round(pnl * 100) / 100,
      pnlPercent: Math.round(pnlPercent * 100) / 100,
    }
  }

  // Cleanup
  clearCache(): void {
    this.cache.clear()
  }
}

export const futuresService = new FuturesService()
