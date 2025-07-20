export interface Order {
  id: string
  symbol: string
  type: "BUY" | "SELL"
  orderType: "MARKET" | "LIMIT" | "STOP_LOSS"
  quantity: number
  price?: number
  stopPrice?: number
  status: "PENDING" | "EXECUTED" | "CANCELLED" | "REJECTED"
  timestamp: number
  executedPrice?: number
  executedQuantity?: number
  fees?: number
}

export interface Position {
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
  marketValue: number
}

export interface Account {
  balance: number
  availableMargin: number
  usedMargin: number
  totalPnl: number
  dayPnl: number
}

export class TradingService {
  private orders: Order[] = []
  private positions: Map<string, Position> = new Map()
  private account: Account = {
    balance: 100000, // Starting with 1 lakh
    availableMargin: 100000,
    usedMargin: 0,
    totalPnl: 0,
    dayPnl: 0,
  }
  private subscribers: ((data: any) => void)[] = []

  async placeOrder(orderData: {
    symbol: string
    type: "BUY" | "SELL"
    orderType: "MARKET" | "LIMIT" | "STOP_LOSS"
    quantity: number
    price?: number
    stopPrice?: number
  }): Promise<Order> {
    // Validate order
    const validation = await this.validateOrder(orderData)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Create order
    const order: Order = {
      id: `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...orderData,
      status: "PENDING",
      timestamp: Date.now(),
    }

    this.orders.push(order)

    // Execute order immediately for market orders (simulation)
    if (orderData.orderType === "MARKET") {
      await this.executeOrder(order)
    }

    this.notifySubscribers({ type: "ORDER_PLACED", order })
    return order
  }

  private async validateOrder(orderData: any): Promise<{ valid: boolean; error?: string }> {
    // Check quantity
    if (orderData.quantity <= 0) {
      return { valid: false, error: "Quantity must be greater than 0" }
    }

    // Check available margin for buy orders
    if (orderData.type === "BUY") {
      const estimatedValue = orderData.quantity * (orderData.price || 1000) // Rough estimate
      const requiredMargin = estimatedValue * 0.2 // 20% margin

      if (requiredMargin > this.account.availableMargin) {
        return { valid: false, error: "Insufficient margin" }
      }
    }

    // Check position for sell orders
    if (orderData.type === "SELL") {
      const position = this.positions.get(orderData.symbol)
      if (!position || position.quantity < orderData.quantity) {
        return { valid: false, error: "Insufficient quantity to sell" }
      }
    }

    return { valid: true }
  }

  private async executeOrder(order: Order): Promise<void> {
    try {
      // Get current market price (using your API)
      const currentPrice = await this.getCurrentPrice(order.symbol)

      // Calculate execution price
      const executionPrice = order.orderType === "MARKET" ? currentPrice : order.price || currentPrice

      // Calculate fees (0.1% brokerage + taxes)
      const fees = executionPrice * order.quantity * 0.001

      // Update order
      order.status = "EXECUTED"
      order.executedPrice = executionPrice
      order.executedQuantity = order.quantity
      order.fees = fees

      // Update positions
      await this.updatePosition(order)

      // Update account
      this.updateAccount(order)

      this.notifySubscribers({ type: "ORDER_EXECUTED", order })
    } catch (error) {
      order.status = "REJECTED"
      this.notifySubscribers({ type: "ORDER_REJECTED", order, error })
    }
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    try {
      // Using your API key for real data
      const response = await fetch(`https://api.example.com/quote?symbol=${symbol}&apikey=687ba9517d8357.38455343`)
      const data = await response.json()
      return data.price || 1000 // Fallback price
    } catch (error) {
      // Mock price for demo
      const mockPrices: { [key: string]: number } = {
        "RELIANCE.NS": 2850,
        "TCS.NS": 3920,
        "INFY.NS": 1750,
        "HDFCBANK.NS": 1680,
        "ICICIBANK.NS": 1250,
      }
      return mockPrices[symbol] || 1000
    }
  }

  private async updatePosition(order: Order): Promise<void> {
    const symbol = order.symbol
    const existingPosition = this.positions.get(symbol)

    if (order.type === "BUY") {
      if (existingPosition) {
        // Update existing position
        const totalQuantity = existingPosition.quantity + order.quantity
        const totalValue =
          existingPosition.averagePrice * existingPosition.quantity + order.executedPrice! * order.quantity
        const newAveragePrice = totalValue / totalQuantity

        existingPosition.quantity = totalQuantity
        existingPosition.averagePrice = newAveragePrice
      } else {
        // Create new position
        this.positions.set(symbol, {
          symbol,
          quantity: order.quantity,
          averagePrice: order.executedPrice!,
          currentPrice: order.executedPrice!,
          pnl: 0,
          pnlPercent: 0,
          marketValue: order.executedPrice! * order.quantity,
        })
      }
    } else if (order.type === "SELL") {
      if (existingPosition) {
        existingPosition.quantity -= order.quantity
        if (existingPosition.quantity <= 0) {
          this.positions.delete(symbol)
        }
      }
    }

    // Update current prices and P&L for all positions
    await this.updateAllPositionPrices()
  }

  private updateAccount(order: Order): void {
    const orderValue = order.executedPrice! * order.quantity
    const fees = order.fees || 0

    if (order.type === "BUY") {
      this.account.balance -= orderValue + fees
      this.account.usedMargin += orderValue * 0.2 // 20% margin
      this.account.availableMargin = this.account.balance - this.account.usedMargin
    } else if (order.type === "SELL") {
      this.account.balance += orderValue - fees
      this.account.usedMargin -= orderValue * 0.2
      this.account.availableMargin = this.account.balance - this.account.usedMargin
    }
  }

  private async updateAllPositionPrices(): Promise<void> {
    for (const [symbol, position] of this.positions) {
      try {
        const currentPrice = await this.getCurrentPrice(symbol)
        position.currentPrice = currentPrice
        position.marketValue = currentPrice * position.quantity
        position.pnl = (currentPrice - position.averagePrice) * position.quantity
        position.pnlPercent = ((currentPrice - position.averagePrice) / position.averagePrice) * 100
      } catch (error) {
        console.warn(`Failed to update price for ${symbol}:`, error)
      }
    }

    // Update account P&L
    this.account.totalPnl = Array.from(this.positions.values()).reduce((total, pos) => total + pos.pnl, 0)
  }

  // Public methods
  getOrders(): Order[] {
    return [...this.orders].sort((a, b) => b.timestamp - a.timestamp)
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values())
  }

  getAccount(): Account {
    return { ...this.account }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    const order = this.orders.find((o) => o.id === orderId)
    if (order && order.status === "PENDING") {
      order.status = "CANCELLED"
      this.notifySubscribers({ type: "ORDER_CANCELLED", order })
      return true
    }
    return false
  }

  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  private notifySubscribers(data: any): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error("Error in trading subscriber:", error)
      }
    })
  }

  // Start real-time position updates
  startRealTimeUpdates(): void {
    setInterval(async () => {
      await this.updateAllPositionPrices()
      this.notifySubscribers({
        type: "POSITIONS_UPDATED",
        positions: this.getPositions(),
        account: this.getAccount(),
      })
    }, 5000) // Update every 5 seconds
  }
}

export const tradingService = new TradingService()
