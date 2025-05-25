export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
  high: number
  low: number
  open: number
  previousClose: number
  sector: string
  logo?: string
}

export interface StockHistory {
  timestamp: number
  price: number
  volume: number
}

export interface TradeResult {
  success: boolean
  executedPrice: number
  executedQuantity: number
  orderId: string
  message: string
  error?: string
}

// Popular Indian and international stocks with realistic INR prices
const STOCK_DATA: Record<string, Omit<Stock, "price" | "change" | "changePercent">> = {
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd.",
    volume: 2234567,
    marketCap: "₹18.5L Cr",
    high: 2850.5,
    low: 2789.25,
    open: 2820.3,
    previousClose: 2815.45,
    sector: "Oil & Gas",
  },
  TCS: {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    volume: 1456789,
    marketCap: "₹14.2L Cr",
    high: 3890.8,
    low: 3825.9,
    open: 3860.25,
    previousClose: 3847.7,
    sector: "Information Technology",
  },
  INFY: {
    symbol: "INFY",
    name: "Infosys Limited",
    volume: 1867890,
    marketCap: "₹6.8L Cr",
    high: 1678.9,
    low: 1642.15,
    open: 1665.2,
    previousClose: 1658.5,
    sector: "Information Technology",
  },
  HDFCBANK: {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    volume: 1901234,
    marketCap: "₹12.1L Cr",
    high: 1598.75,
    low: 1564.3,
    open: 1582.8,
    previousClose: 1575.9,
    sector: "Banking",
  },
  ICICIBANK: {
    symbol: "ICICIBANK",
    name: "ICICI Bank Limited",
    volume: 2890123,
    marketCap: "₹8.9L Cr",
    high: 1248.9,
    low: 1218.45,
    open: 1235.3,
    previousClose: 1228.05,
    sector: "Banking",
  },
  HINDUNILVR: {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever Ltd.",
    volume: 1678901,
    marketCap: "₹5.8L Cr",
    high: 2458.5,
    low: 2415.2,
    open: 2440.8,
    previousClose: 2432.9,
    sector: "FMCG",
  },
  ITC: {
    symbol: "ITC",
    name: "ITC Limited",
    volume: 3876543,
    marketCap: "₹5.2L Cr",
    high: 412.3,
    low: 398.75,
    open: 405.6,
    previousClose: 403.2,
    sector: "FMCG",
  },
  SBIN: {
    symbol: "SBIN",
    name: "State Bank of India",
    volume: 4345678,
    marketCap: "₹4.8L Cr",
    high: 598.9,
    low: 585.2,
    open: 592.3,
    previousClose: 590.75,
    sector: "Banking",
  },
  BHARTIARTL: {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Limited",
    volume: 2432109,
    marketCap: "₹4.5L Cr",
    high: 889.45,
    low: 875.3,
    open: 882.2,
    previousClose: 878.8,
    sector: "Telecom",
  },
  MARUTI: {
    symbol: "MARUTI",
    name: "Maruti Suzuki India Ltd.",
    volume: 1765432,
    marketCap: "₹3.2L Cr",
    high: 10628.8,
    low: 10459.45,
    open: 10582.2,
    previousClose: 10540.9,
    sector: "Automobile",
  },
}

class StockService {
  private stocks: Map<string, Stock> = new Map()
  private history: Map<string, StockHistory[]> = new Map()
  private subscribers: Map<string, ((stock: Stock) => void)[]> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.initializeStocks()
  }

  private initializeStocks() {
    Object.entries(STOCK_DATA).forEach(([symbol, data]) => {
      const basePrice = this.getBasePriceForSymbol(symbol)
      const currentPrice = this.generateRealisticPrice(basePrice)
      const change = currentPrice - data.previousClose
      const changePercent = (change / data.previousClose) * 100

      const stock: Stock = {
        ...data,
        price: currentPrice,
        change,
        changePercent,
      }

      this.stocks.set(symbol, stock)
      this.history.set(symbol, this.generateHistoricalData(symbol, basePrice))
    })
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: Record<string, number> = {
      RELIANCE: 2820.5,
      TCS: 3860.3,
      INFY: 1665.8,
      HDFCBANK: 1582.5,
      ICICIBANK: 1235.7,
      HINDUNILVR: 2440.4,
      ITC: 405.8,
      SBIN: 592.6,
      BHARTIARTL: 882.4,
      MARUTI: 10582.4,
    }
    return basePrices[symbol] || 1000
  }

  private generateRealisticPrice(basePrice: number): number {
    // Generate realistic price movements (±2% typical daily range)
    const volatility = 0.02
    const randomChange = (Math.random() - 0.5) * 2 * volatility
    return Number((basePrice * (1 + randomChange)).toFixed(2))
  }

  private generateHistoricalData(symbol: string, basePrice: number): StockHistory[] {
    const history: StockHistory[] = []
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    // Generate 24 hours of data (hourly points)
    for (let i = 24; i >= 0; i--) {
      const timestamp = now - i * oneHour
      const price = this.generateRealisticPrice(basePrice)
      const volume = Math.floor(Math.random() * 1000000) + 500000

      history.push({ timestamp, price, volume })
    }

    return history
  }

  getAllStocks(): Stock[] {
    return Array.from(this.stocks.values())
  }

  getStock(symbol: string): Stock | undefined {
    return this.stocks.get(symbol)
  }

  getStockHistory(symbol: string): StockHistory[] {
    return this.history.get(symbol) || []
  }

  subscribeToStock(symbol: string, callback: (stock: Stock) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, [])
    }
    this.subscribers.get(symbol)!.push(callback)

    // Start real-time updates for this stock
    if (!this.intervals.has(symbol)) {
      const interval = setInterval(
        () => {
          this.updateStockPrice(symbol)
        },
        2000 + Math.random() * 3000,
      ) // Update every 2-5 seconds

      this.intervals.set(symbol, interval)
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(symbol)
      if (subs) {
        const index = subs.indexOf(callback)
        if (index > -1) {
          subs.splice(index, 1)
        }

        // Stop updates if no more subscribers
        if (subs.length === 0) {
          const interval = this.intervals.get(symbol)
          if (interval) {
            clearInterval(interval)
            this.intervals.delete(symbol)
          }
          this.subscribers.delete(symbol)
        }
      }
    }
  }

  private updateStockPrice(symbol: string) {
    const stock = this.stocks.get(symbol)
    if (!stock) return

    // Generate small price movement (±0.5% typical)
    const volatility = 0.005
    const priceChange = stock.price * (Math.random() - 0.5) * 2 * volatility
    const newPrice = Math.max(0.01, Number((stock.price + priceChange).toFixed(2)))

    const change = newPrice - stock.previousClose
    const changePercent = (change / stock.previousClose) * 100

    const updatedStock: Stock = {
      ...stock,
      price: newPrice,
      change,
      changePercent,
    }

    this.stocks.set(symbol, updatedStock)

    // Add to history
    const history = this.history.get(symbol) || []
    history.push({
      timestamp: Date.now(),
      price: newPrice,
      volume: Math.floor(Math.random() * 100000) + 50000,
    })

    // Keep only last 100 data points
    if (history.length > 100) {
      history.shift()
    }
    this.history.set(symbol, history)

    // Notify subscribers
    const subscribers = this.subscribers.get(symbol) || []
    subscribers.forEach((callback) => callback(updatedStock))
  }

  // Simulate buy/sell orders
  async executeOrder(
    symbol: string,
    type: "buy" | "sell",
    quantity: number,
    orderType: "market" | "limit",
    limitPrice?: number,
  ): Promise<TradeResult> {
    const stock = this.stocks.get(symbol)
    if (!stock) {
      return {
        success: false,
        executedPrice: 0,
        executedQuantity: 0,
        orderId: "",
        message: "Stock not found",
        error: "STOCK_NOT_FOUND",
      }
    }

    // Simulate order execution delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

    let executedPrice = stock.price

    if (orderType === "limit" && limitPrice) {
      if (type === "buy" && limitPrice < stock.price) {
        return {
          success: false,
          executedPrice: 0,
          executedQuantity: 0,
          orderId: "",
          message: `Limit price ₹${limitPrice} is below current market price ₹${stock.price}`,
          error: "LIMIT_PRICE_TOO_LOW",
        }
      }
      if (type === "sell" && limitPrice > stock.price) {
        return {
          success: false,
          executedPrice: 0,
          executedQuantity: 0,
          orderId: "",
          message: `Limit price ₹${limitPrice} is above current market price ₹${stock.price}`,
          error: "LIMIT_PRICE_TOO_HIGH",
        }
      }
      executedPrice = limitPrice
    }

    // Add small slippage for market orders
    if (orderType === "market") {
      const slippage = (Math.random() - 0.5) * 0.002 // ±0.2% slippage
      executedPrice = Number((stock.price * (1 + slippage)).toFixed(2))
    }

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return {
      success: true,
      executedPrice,
      executedQuantity: quantity,
      orderId,
      message: `${type.toUpperCase()} order executed successfully`,
    }
  }
}

export const stockService = new StockService()
