export interface IntradayData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TechnicalIndicator {
  name: string
  value: number
  signal: "BUY" | "SELL" | "HOLD"
  timestamp: number
}

export interface MarketDepth {
  bids: Array<{ price: number; quantity: number }>
  asks: Array<{ price: number; quantity: number }>
  timestamp: number
}

export class IntradayService {
  private wsConnections: Map<string, WebSocket> = new Map()
  private dataCache: Map<string, IntradayData[]> = new Map()
  private subscribers: Map<string, ((data: IntradayData) => void)[]> = new Map()

  async getIntradayData(
    symbol: string,
    interval: "1m" | "5m" | "15m" | "1h" = "5m",
    days = 1,
  ): Promise<IntradayData[]> {
    const cacheKey = `${symbol}-${interval}-${days}`

    // Check cache first
    if (this.dataCache.has(cacheKey)) {
      return this.dataCache.get(cacheKey)!
    }

    try {
      // Try multiple data sources
      const data = await this.fetchFromMultipleSources(symbol, interval, days)
      this.dataCache.set(cacheKey, data)

      // Cache for 1 minute
      setTimeout(() => this.dataCache.delete(cacheKey), 60000)

      return data
    } catch (error) {
      console.warn(`Failed to fetch intraday data for ${symbol}:`, error)
      return this.generateMockIntradayData(symbol, interval, days)
    }
  }

  private async fetchFromMultipleSources(symbol: string, interval: string, days: number): Promise<IntradayData[]> {
    const sources = [
      () => this.fetchFromYahooFinance(symbol, interval, days),
      () => this.fetchFromAlphaVantage(symbol, interval),
      () => this.fetchFromTiingo(symbol, interval, days),
    ]

    for (const source of sources) {
      try {
        const data = await source()
        if (data && data.length > 0) {
          return data
        }
      } catch (error) {
        console.warn("Intraday source failed:", error)
        continue
      }
    }

    throw new Error("All intraday sources failed")
  }

  private async fetchFromYahooFinance(symbol: string, interval: string, days: number): Promise<IntradayData[]> {
    const intervalMap: { [key: string]: string } = {
      "1m": "1m",
      "5m": "5m",
      "15m": "15m",
      "1h": "1h",
    }

    const range = days === 1 ? "1d" : `${days}d`
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${intervalMap[interval]}&range=${range}`

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Yahoo Finance API error: ${response.status}`)

    const data = await response.json()
    const result = data.chart.result[0]

    if (!result || !result.timestamp) {
      throw new Error("Invalid Yahoo Finance response")
    }

    const timestamps = result.timestamp
    const quotes = result.indicators.quote[0]

    return timestamps
      .map((timestamp: number, index: number) => ({
        timestamp: timestamp * 1000,
        open: quotes.open[index] || 0,
        high: quotes.high[index] || 0,
        low: quotes.low[index] || 0,
        close: quotes.close[index] || 0,
        volume: quotes.volume[index] || 0,
      }))
      .filter((item: IntradayData) => item.close > 0)
  }

  private async fetchFromAlphaVantage(symbol: string, interval: string): Promise<IntradayData[]> {
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "demo"
    const intervalMap: { [key: string]: string } = {
      "1m": "1min",
      "5m": "5min",
      "15m": "15min",
      "1h": "60min",
    }

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${intervalMap[interval]}&apikey=${apiKey}`

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Alpha Vantage API error: ${response.status}`)

    const data = await response.json()
    const timeSeries = data[`Time Series (${intervalMap[interval]})`]

    if (!timeSeries) {
      throw new Error("Invalid Alpha Vantage response")
    }

    return Object.entries(timeSeries)
      .map(([timestamp, values]: [string, any]) => ({
        timestamp: new Date(timestamp).getTime(),
        open: Number.parseFloat(values["1. open"]),
        high: Number.parseFloat(values["2. high"]),
        low: Number.parseFloat(values["3. low"]),
        close: Number.parseFloat(values["4. close"]),
        volume: Number.parseInt(values["5. volume"]),
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  private async fetchFromTiingo(symbol: string, interval: string, days: number): Promise<IntradayData[]> {
    const apiKey = process.env.NEXT_PUBLIC_TIINGO_API_KEY || "demo"
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const url = `https://api.tiingo.com/iex/${symbol}/prices?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}&resampleFreq=${interval}&token=${apiKey}`

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Tiingo API error: ${response.status}`)

    const data = await response.json()

    return data.map((item: any) => ({
      timestamp: new Date(item.date).getTime(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }))
  }

  private generateMockIntradayData(symbol: string, interval: string, days: number): IntradayData[] {
    const data: IntradayData[] = []
    const now = Date.now()
    const intervalMs = this.getIntervalMs(interval)
    const totalPoints = Math.floor((days * 24 * 60 * 60 * 1000) / intervalMs)

    // Base price for the symbol
    const basePrice = this.getBasePriceForSymbol(symbol)
    let currentPrice = basePrice

    for (let i = totalPoints; i >= 0; i--) {
      const timestamp = now - i * intervalMs

      // Generate realistic price movement
      const volatility = 0.002 // 0.2% volatility per interval
      const change = (Math.random() - 0.5) * volatility * currentPrice

      const open = currentPrice
      const close = currentPrice + change
      const high = Math.max(open, close) * (1 + Math.random() * 0.005)
      const low = Math.min(open, close) * (1 - Math.random() * 0.005)
      const volume = Math.floor(Math.random() * 100000) + 10000

      data.push({
        timestamp,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume,
      })

      currentPrice = close
    }

    return data
  }

  private getIntervalMs(interval: string): number {
    const intervals: { [key: string]: number } = {
      "1m": 60 * 1000,
      "5m": 5 * 60 * 1000,
      "15m": 15 * 60 * 1000,
      "1h": 60 * 60 * 1000,
    }
    return intervals[interval] || 5 * 60 * 1000
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      "RELIANCE.NS": 2850,
      "TCS.NS": 3920,
      "INFY.NS": 1750,
      "HDFCBANK.NS": 1680,
      "ICICIBANK.NS": 1250,
      "HINDUNILVR.NS": 2650,
      "ITC.NS": 485,
      "SBIN.NS": 820,
      "BHARTIARTL.NS": 1580,
      "KOTAKBANK.NS": 1890,
    }
    return basePrices[symbol] || 1000
  }

  // Technical Indicators
  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicator[]> {
    try {
      const intradayData = await this.getIntradayData(symbol, "5m", 1)
      return this.calculateTechnicalIndicators(intradayData)
    } catch (error) {
      console.warn(`Failed to calculate technical indicators for ${symbol}:`, error)
      return this.generateMockTechnicalIndicators()
    }
  }

  private calculateTechnicalIndicators(data: IntradayData[]): TechnicalIndicator[] {
    const indicators: TechnicalIndicator[] = []
    const closes = data.map((d) => d.close)
    const volumes = data.map((d) => d.volume)

    // RSI (14-period)
    const rsi = this.calculateRSI(closes, 14)
    indicators.push({
      name: "RSI (14)",
      value: Math.round(rsi * 100) / 100,
      signal: rsi > 70 ? "SELL" : rsi < 30 ? "BUY" : "HOLD",
      timestamp: Date.now(),
    })

    // Moving Averages
    const sma20 = this.calculateSMA(closes, 20)
    const sma50 = this.calculateSMA(closes, 50)
    const currentPrice = closes[closes.length - 1]

    indicators.push({
      name: "SMA (20)",
      value: Math.round(sma20 * 100) / 100,
      signal: currentPrice > sma20 ? "BUY" : "SELL",
      timestamp: Date.now(),
    })

    indicators.push({
      name: "SMA (50)",
      value: Math.round(sma50 * 100) / 100,
      signal: currentPrice > sma50 ? "BUY" : "SELL",
      timestamp: Date.now(),
    })

    // MACD
    const macd = this.calculateMACD(closes)
    indicators.push({
      name: "MACD",
      value: Math.round(macd.macd * 100) / 100,
      signal: macd.macd > macd.signal ? "BUY" : "SELL",
      timestamp: Date.now(),
    })

    // Volume analysis
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
    const currentVolume = volumes[volumes.length - 1]

    indicators.push({
      name: "Volume",
      value: Math.round(currentVolume),
      signal: currentVolume > avgVolume * 1.5 ? "BUY" : "HOLD",
      timestamp: Date.now(),
    })

    return indicators
  }

  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50

    let gains = 0
    let losses = 0

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) gains += change
      else losses -= change
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1]

    const slice = prices.slice(-period)
    return slice.reduce((a, b) => a + b, 0) / period
  }

  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macd = ema12 - ema26

    // For simplicity, using SMA instead of EMA for signal line
    const macdLine = [macd]
    const signal = this.calculateSMA(macdLine, 9)
    const histogram = macd - signal

    return { macd, signal, histogram }
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0
    if (prices.length === 1) return prices[0]

    const multiplier = 2 / (period + 1)
    let ema = prices[0]

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier)
    }

    return ema
  }

  private generateMockTechnicalIndicators(): TechnicalIndicator[] {
    return [
      {
        name: "RSI (14)",
        value: 45 + Math.random() * 30,
        signal: Math.random() > 0.5 ? "BUY" : "HOLD",
        timestamp: Date.now(),
      },
      {
        name: "SMA (20)",
        value: 2800 + Math.random() * 100,
        signal: "BUY",
        timestamp: Date.now(),
      },
      {
        name: "MACD",
        value: (Math.random() - 0.5) * 10,
        signal: Math.random() > 0.5 ? "BUY" : "SELL",
        timestamp: Date.now(),
      },
    ]
  }

  // Market Depth
  async getMarketDepth(symbol: string): Promise<MarketDepth> {
    try {
      // In a real implementation, this would fetch from a real-time data provider
      return this.generateMockMarketDepth(symbol)
    } catch (error) {
      console.warn(`Failed to fetch market depth for ${symbol}:`, error)
      return this.generateMockMarketDepth(symbol)
    }
  }

  private generateMockMarketDepth(symbol: string): MarketDepth {
    const basePrice = this.getBasePriceForSymbol(symbol)
    const bids: Array<{ price: number; quantity: number }> = []
    const asks: Array<{ price: number; quantity: number }> = []

    // Generate 5 levels of bids and asks
    for (let i = 0; i < 5; i++) {
      bids.push({
        price: Math.round((basePrice - (i + 1) * 0.5) * 100) / 100,
        quantity: Math.floor(Math.random() * 1000) + 100,
      })

      asks.push({
        price: Math.round((basePrice + (i + 1) * 0.5) * 100) / 100,
        quantity: Math.floor(Math.random() * 1000) + 100,
      })
    }

    return {
      bids: bids.sort((a, b) => b.price - a.price),
      asks: asks.sort((a, b) => a.price - b.price),
      timestamp: Date.now(),
    }
  }

  // Real-time subscriptions
  subscribeToRealTime(symbol: string, callback: (data: IntradayData) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, [])
    }

    this.subscribers.get(symbol)!.push(callback)

    // Start real-time updates for this symbol
    this.startRealTimeUpdates(symbol)

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(symbol)
      if (subs) {
        const index = subs.indexOf(callback)
        if (index > -1) {
          subs.splice(index, 1)
        }

        if (subs.length === 0) {
          this.stopRealTimeUpdates(symbol)
        }
      }
    }
  }

  private startRealTimeUpdates(symbol: string): void {
    if (this.wsConnections.has(symbol)) return

    // Simulate real-time updates with setInterval
    const interval = setInterval(() => {
      const mockData = this.generateMockRealTimeData(symbol)
      const subscribers = this.subscribers.get(symbol) || []
      subscribers.forEach((callback) => {
        try {
          callback(mockData)
        } catch (error) {
          console.error("Error in real-time callback:", error)
        }
      })
    }, 1000) // Update every second

    // Store the interval ID as a mock WebSocket
    this.wsConnections.set(symbol, interval as any)
  }

  private stopRealTimeUpdates(symbol: string): void {
    const connection = this.wsConnections.get(symbol)
    if (connection) {
      clearInterval(connection as any)
      this.wsConnections.delete(symbol)
    }
  }

  private generateMockRealTimeData(symbol: string): IntradayData {
    const basePrice = this.getBasePriceForSymbol(symbol)
    const volatility = 0.001
    const change = (Math.random() - 0.5) * volatility * basePrice

    const price = basePrice + change

    return {
      timestamp: Date.now(),
      open: price,
      high: price * (1 + Math.random() * 0.002),
      low: price * (1 - Math.random() * 0.002),
      close: price,
      volume: Math.floor(Math.random() * 10000) + 1000,
    }
  }

  // Cleanup
  destroy(): void {
    // Close all WebSocket connections
    this.wsConnections.forEach((ws, symbol) => {
      this.stopRealTimeUpdates(symbol)
    })

    this.wsConnections.clear()
    this.subscribers.clear()
    this.dataCache.clear()
  }
}

export const intradayService = new IntradayService()
