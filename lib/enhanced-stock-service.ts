import { dataAggregator } from "./api/data-aggregator"

interface Stock {
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

export class EnhancedStockService {
  private updateInterval: NodeJS.Timeout | null = null
  private subscribers: ((stocks: Stock[]) => void)[] = []
  private currentStocks: Stock[] = []

  private indianStocks = [
    "RELIANCE.NS",
    "TCS.NS",
    "INFY.NS",
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "HINDUNILVR.NS",
    "ITC.NS",
    "SBIN.NS",
    "BHARTIARTL.NS",
    "KOTAKBANK.NS",
  ]

  async getAllStocks(): Promise<Stock[]> {
    try {
      const stockData = await dataAggregator.getMultipleStocks(this.indianStocks)
      this.currentStocks = stockData.map((stock) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        marketCap: stock.marketCap,
        high: stock.high,
        low: stock.low,
        previousClose: stock.previousClose,
        sector: stock.sector,
      }))

      return this.currentStocks
    } catch (error) {
      console.error("Error fetching stocks:", error)
      // Return mock data as fallback
      return this.generateFallbackStocks()
    }
  }

  async getStock(symbol: string): Promise<Stock | null> {
    try {
      const stockData = await dataAggregator.getSingleStock(symbol)
      if (!stockData) return null

      return {
        symbol: stockData.symbol,
        name: stockData.name,
        price: stockData.price,
        change: stockData.change,
        changePercent: stockData.changePercent,
        volume: stockData.volume,
        marketCap: stockData.marketCap,
        high: stockData.high,
        low: stockData.low,
        previousClose: stockData.previousClose,
        sector: stockData.sector,
      }
    } catch (error) {
      console.error(`Error fetching stock ${symbol}:`, error)
      return null
    }
  }

  startRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    // Update every 5 seconds
    this.updateInterval = setInterval(async () => {
      try {
        const updatedStocks = await this.getAllStocks()
        this.notifySubscribers(updatedStocks)
      } catch (error) {
        console.error("Error in real-time update:", error)
      }
    }, 5000)
  }

  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  subscribe(callback: (stocks: Stock[]) => void): () => void {
    this.subscribers.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  private notifySubscribers(stocks: Stock[]): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(stocks)
      } catch (error) {
        console.error("Error in subscriber callback:", error)
      }
    })
  }

  private generateFallbackStocks(): Stock[] {
    const mockData = [
      { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd", price: 2850, sector: "Energy" },
      { symbol: "TCS.NS", name: "Tata Consultancy Services", price: 3920, sector: "IT" },
      { symbol: "INFY.NS", name: "Infosys Limited", price: 1750, sector: "IT" },
      { symbol: "HDFCBANK.NS", name: "HDFC Bank Limited", price: 1680, sector: "Banking" },
      { symbol: "ICICIBANK.NS", name: "ICICI Bank Limited", price: 1250, sector: "Banking" },
      { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever Ltd", price: 2650, sector: "FMCG" },
      { symbol: "ITC.NS", name: "ITC Limited", price: 485, sector: "FMCG" },
      { symbol: "SBIN.NS", name: "State Bank of India", price: 820, sector: "Banking" },
      { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Limited", price: 1580, sector: "Telecom" },
      { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", price: 1890, sector: "Banking" },
    ]

    return mockData.map((stock) => {
      const volatility = 0.02
      const randomChange = (Math.random() - 0.5) * volatility * 2
      const currentPrice = stock.price * (1 + randomChange)
      const change = currentPrice - stock.price
      const changePercent = (change / stock.price) * 100

      return {
        symbol: stock.symbol,
        name: stock.name,
        price: Math.round(currentPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
        high: Math.round(currentPrice * 1.02 * 100) / 100,
        low: Math.round(currentPrice * 0.98 * 100) / 100,
        previousClose: stock.price,
        sector: stock.sector,
      }
    })
  }
}

export const enhancedStockService = new EnhancedStockService()
