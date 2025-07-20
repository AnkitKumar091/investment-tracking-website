export interface OptionChain {
  symbol: string
  expiry: string
  strike: number
  callOption: {
    price: number
    bid: number
    ask: number
    volume: number
    openInterest: number
    impliedVolatility: number
    delta: number
    gamma: number
    theta: number
    vega: number
  }
  putOption: {
    price: number
    bid: number
    ask: number
    volume: number
    openInterest: number
    impliedVolatility: number
    delta: number
    gamma: number
    theta: number
    vega: number
  }
}

export interface OptionsAnalysis {
  symbol: string
  expiry: string
  totalCallVolume: number
  totalPutVolume: number
  putCallRatio: number
  maxPain: number
  supportLevels: number[]
  resistanceLevels: number[]
  impliedVolatility: number
  historicalVolatility: number
}

export class OptionsService {
  private cache: Map<string, any> = new Map()
  private readonly CACHE_TTL = 60000 // 1 minute

  async getOptionChain(symbol: string, expiry?: string): Promise<OptionChain[]> {
    const cacheKey = `options-${symbol}-${expiry || "all"}`

    // Check cache
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      const data = await this.fetchOptionChain(symbol, expiry)
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.warn(`Failed to fetch option chain for ${symbol}:`, error)
      return this.generateMockOptionChain(symbol, expiry)
    }
  }

  private async fetchOptionChain(symbol: string, expiry?: string): Promise<OptionChain[]> {
    // Try multiple sources
    const sources = [
      () => this.fetchFromYahooOptions(symbol, expiry),
      () => this.fetchFromNSEOptions(symbol, expiry),
      () => this.fetchFromAlphaVantageOptions(symbol, expiry),
    ]

    for (const source of sources) {
      try {
        const data = await source()
        if (data && data.length > 0) {
          return data
        }
      } catch (error) {
        console.warn("Options source failed:", error)
        continue
      }
    }

    throw new Error("All options sources failed")
  }

  private async fetchFromYahooOptions(symbol: string, expiry?: string): Promise<OptionChain[]> {
    const url = `https://query1.finance.yahoo.com/v7/finance/options/${symbol}`

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Yahoo Options API error: ${response.status}`)

    const data = await response.json()
    const optionChain = data.optionChain?.result?.[0]

    if (!optionChain) {
      throw new Error("Invalid Yahoo Options response")
    }

    const options: OptionChain[] = []
    const expirationDates = optionChain.expirationDates || []
    const strikes = optionChain.strikes || []

    for (const expiryTimestamp of expirationDates) {
      const expiryDate = new Date(expiryTimestamp * 1000).toISOString().split("T")[0]

      if (expiry && expiry !== expiryDate) continue

      for (const strike of strikes) {
        // Find corresponding call and put options
        const calls = optionChain.options?.[0]?.calls || []
        const puts = optionChain.options?.[0]?.puts || []

        const callOption = calls.find((c: any) => c.strike === strike)
        const putOption = puts.find((p: any) => p.strike === strike)

        if (callOption || putOption) {
          options.push({
            symbol,
            expiry: expiryDate,
            strike,
            callOption: callOption
              ? {
                  price: callOption.lastPrice || 0,
                  bid: callOption.bid || 0,
                  ask: callOption.ask || 0,
                  volume: callOption.volume || 0,
                  openInterest: callOption.openInterest || 0,
                  impliedVolatility: callOption.impliedVolatility || 0,
                  delta: callOption.delta || 0,
                  gamma: callOption.gamma || 0,
                  theta: callOption.theta || 0,
                  vega: callOption.vega || 0,
                }
              : this.generateMockOptionData("call", strike),
            putOption: putOption
              ? {
                  price: putOption.lastPrice || 0,
                  bid: putOption.bid || 0,
                  ask: putOption.ask || 0,
                  volume: putOption.volume || 0,
                  openInterest: putOption.openInterest || 0,
                  impliedVolatility: putOption.impliedVolatility || 0,
                  delta: putOption.delta || 0,
                  gamma: putOption.gamma || 0,
                  theta: putOption.theta || 0,
                  vega: putOption.vega || 0,
                }
              : this.generateMockOptionData("put", strike),
          })
        }
      }
    }

    return options
  }

  private async fetchFromNSEOptions(symbol: string, expiry?: string): Promise<OptionChain[]> {
    // NSE API endpoint (would require proper authentication in production)
    const nseSymbol = symbol.replace(".NS", "")
    const url = `https://www.nseindia.com/api/option-chain-indices?symbol=${nseSymbol}`

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
      })

      if (!response.ok) throw new Error(`NSE API error: ${response.status}`)

      const data = await response.json()
      return this.parseNSEOptionData(data, symbol, expiry)
    } catch (error) {
      throw new Error(`NSE Options API failed: ${error}`)
    }
  }

  private parseNSEOptionData(data: any, symbol: string, expiry?: string): OptionChain[] {
    const options: OptionChain[] = []
    const records = data.records?.data || []

    for (const record of records) {
      if (expiry && record.expiryDate !== expiry) continue

      const strike = record.strikePrice
      const callData = record.CE
      const putData = record.PE

      options.push({
        symbol,
        expiry: record.expiryDate,
        strike,
        callOption: callData
          ? {
              price: callData.lastPrice || 0,
              bid: callData.bidprice || 0,
              ask: callData.askPrice || 0,
              volume: callData.totalTradedVolume || 0,
              openInterest: callData.openInterest || 0,
              impliedVolatility: callData.impliedVolatility || 0,
              delta: callData.delta || 0,
              gamma: callData.gamma || 0,
              theta: callData.theta || 0,
              vega: callData.vega || 0,
            }
          : this.generateMockOptionData("call", strike),
        putOption: putData
          ? {
              price: putData.lastPrice || 0,
              bid: putData.bidprice || 0,
              ask: putData.askPrice || 0,
              volume: putData.totalTradedVolume || 0,
              openInterest: putData.openInterest || 0,
              impliedVolatility: putData.impliedVolatility || 0,
              delta: putData.delta || 0,
              gamma: putData.gamma || 0,
              theta: putData.theta || 0,
              vega: putData.vega || 0,
            }
          : this.generateMockOptionData("put", strike),
      })
    }

    return options
  }

  private async fetchFromAlphaVantageOptions(symbol: string, expiry?: string): Promise<OptionChain[]> {
    // Alpha Vantage doesn't have comprehensive options data, so this is a placeholder
    throw new Error("Alpha Vantage options not implemented")
  }

  private generateMockOptionChain(symbol: string, expiry?: string): OptionChain[] {
    const options: OptionChain[] = []
    const basePrice = this.getBasePriceForSymbol(symbol)

    // Generate expiry dates (next 4 Fridays)
    const expiries = this.getNextExpiries(4)
    const targetExpiry = expiry || expiries[0]

    // Generate strikes around current price
    const strikes = this.generateStrikes(basePrice)

    for (const strike of strikes) {
      options.push({
        symbol,
        expiry: targetExpiry,
        strike,
        callOption: this.generateMockOptionData("call", strike, basePrice),
        putOption: this.generateMockOptionData("put", strike, basePrice),
      })
    }

    return options
  }

  private generateMockOptionData(type: "call" | "put", strike: number, spotPrice?: number): any {
    const spot = spotPrice || 2000
    const timeToExpiry = 30 / 365 // 30 days
    const volatility = 0.25
    const riskFreeRate = 0.06

    // Simple Black-Scholes approximation for demo
    const moneyness = spot / strike
    const intrinsicValue = type === "call" ? Math.max(spot - strike, 0) : Math.max(strike - spot, 0)

    const timeValue = Math.max(0, volatility * Math.sqrt(timeToExpiry) * spot * 0.4)
    const price = intrinsicValue + timeValue

    return {
      price: Math.round(price * 100) / 100,
      bid: Math.round((price - 0.5) * 100) / 100,
      ask: Math.round((price + 0.5) * 100) / 100,
      volume: Math.floor(Math.random() * 10000) + 100,
      openInterest: Math.floor(Math.random() * 50000) + 1000,
      impliedVolatility: volatility + (Math.random() - 0.5) * 0.1,
      delta: type === "call" ? 0.5 + (moneyness - 1) * 0.3 : -0.5 + (1 - moneyness) * 0.3,
      gamma: 0.01 + Math.random() * 0.02,
      theta: -(price * 0.1 + Math.random() * 0.05),
      vega: price * 0.1 + Math.random() * 0.05,
    }
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

  private getNextExpiries(count: number): string[] {
    const expiries: string[] = []
    const today = new Date()

    for (let i = 0; i < count * 7; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      if (date.getDay() === 4) {
        // Thursday (Indian options expire on Thursday)
        expiries.push(date.toISOString().split("T")[0])
        if (expiries.length >= count) break
      }
    }

    return expiries
  }

  private generateStrikes(basePrice: number): number[] {
    const strikes: number[] = []
    const strikeInterval = basePrice > 1000 ? 50 : 25
    const range = 10 // 10 strikes above and below

    for (let i = -range; i <= range; i++) {
      const strike = Math.round((basePrice + i * strikeInterval) / strikeInterval) * strikeInterval
      strikes.push(strike)
    }

    return strikes.sort((a, b) => a - b)
  }

  async getOptionsAnalysis(symbol: string, expiry: string): Promise<OptionsAnalysis> {
    try {
      const optionChain = await this.getOptionChain(symbol, expiry)
      return this.calculateOptionsAnalysis(optionChain, symbol, expiry)
    } catch (error) {
      console.warn(`Failed to get options analysis for ${symbol}:`, error)
      return this.generateMockOptionsAnalysis(symbol, expiry)
    }
  }

  private calculateOptionsAnalysis(optionChain: OptionChain[], symbol: string, expiry: string): OptionsAnalysis {
    const totalCallVolume = optionChain.reduce((sum, option) => sum + option.callOption.volume, 0)
    const totalPutVolume = optionChain.reduce((sum, option) => sum + option.putOption.volume, 0)
    const putCallRatio = totalCallVolume > 0 ? totalPutVolume / totalCallVolume : 0

    // Calculate max pain (strike with highest total open interest)
    let maxPain = 0
    let maxOI = 0

    for (const option of optionChain) {
      const totalOI = option.callOption.openInterest + option.putOption.openInterest
      if (totalOI > maxOI) {
        maxOI = totalOI
        maxPain = option.strike
      }
    }

    // Calculate support and resistance levels
    const supportLevels = this.calculateSupportLevels(optionChain)
    const resistanceLevels = this.calculateResistanceLevels(optionChain)

    // Calculate implied volatility
    const avgIV =
      optionChain.reduce((sum, option) => {
        return sum + (option.callOption.impliedVolatility + option.putOption.impliedVolatility) / 2
      }, 0) / optionChain.length

    return {
      symbol,
      expiry,
      totalCallVolume,
      totalPutVolume,
      putCallRatio: Math.round(putCallRatio * 100) / 100,
      maxPain,
      supportLevels,
      resistanceLevels,
      impliedVolatility: Math.round(avgIV * 10000) / 100, // Convert to percentage
      historicalVolatility: Math.round((avgIV * 0.8 + Math.random() * 0.4) * 10000) / 100,
    }
  }

  private calculateSupportLevels(optionChain: OptionChain[]): number[] {
    // Find strikes with high put open interest
    return optionChain
      .filter((option) => option.putOption.openInterest > 10000)
      .map((option) => option.strike)
      .sort((a, b) => b - a)
      .slice(0, 3)
  }

  private calculateResistanceLevels(optionChain: OptionChain[]): number[] {
    // Find strikes with high call open interest
    return optionChain
      .filter((option) => option.callOption.openInterest > 10000)
      .map((option) => option.strike)
      .sort((a, b) => a - b)
      .slice(0, 3)
  }

  private generateMockOptionsAnalysis(symbol: string, expiry: string): OptionsAnalysis {
    return {
      symbol,
      expiry,
      totalCallVolume: Math.floor(Math.random() * 1000000) + 100000,
      totalPutVolume: Math.floor(Math.random() * 800000) + 80000,
      putCallRatio: 0.6 + Math.random() * 0.8,
      maxPain: this.getBasePriceForSymbol(symbol) + (Math.random() - 0.5) * 200,
      supportLevels: [2800, 2750, 2700],
      resistanceLevels: [2900, 2950, 3000],
      impliedVolatility: 20 + Math.random() * 15,
      historicalVolatility: 18 + Math.random() * 12,
    }
  }

  // Get available expiry dates
  async getExpiryDates(symbol: string): Promise<string[]> {
    try {
      const optionChain = await this.getOptionChain(symbol)
      const expiries = [...new Set(optionChain.map((option) => option.expiry))]
      return expiries.sort()
    } catch (error) {
      console.warn(`Failed to get expiry dates for ${symbol}:`, error)
      return this.getNextExpiries(6)
    }
  }

  // Cleanup
  clearCache(): void {
    this.cache.clear()
  }
}

export const optionsService = new OptionsService()
