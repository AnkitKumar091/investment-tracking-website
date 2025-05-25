"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  Search,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Sparkles,
  Star,
} from "lucide-react"
import { stockService, type Stock } from "@/lib/stock-service"
import { useAuth } from "@/contexts/auth-context"
import { saveTradeToDatabase } from "@/app/actions/trading"

export default function MarketPage() {
  const { user } = useAuth()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false)
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState("")
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [limitPrice, setLimitPrice] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [tradeResult, setTradeResult] = useState<{
    success: boolean
    message: string
    show: boolean
  }>({ success: false, message: "", show: false })

  useEffect(() => {
    setIsVisible(true)
    const allStocks = stockService.getAllStocks()
    setStocks(allStocks)

    // Subscribe to real-time updates for all stocks
    const unsubscribers = allStocks.map((stock) =>
      stockService.subscribeToStock(stock.symbol, (updatedStock) => {
        setStocks((prev) => prev.map((s) => (s.symbol === updatedStock.symbol ? updatedStock : s)))
      }),
    )

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [])

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleTrade = async () => {
    if (!selectedStock || !user) return

    setIsExecuting(true)
    setTradeResult({ success: false, message: "", show: false })

    try {
      console.log("Starting trade execution...")

      // Execute the trade through stock service
      const result = await stockService.executeOrder(
        selectedStock.symbol,
        tradeType,
        Number(quantity),
        orderType,
        limitPrice ? Number(limitPrice) : undefined,
      )

      console.log("Stock service result:", result)

      if (result.success) {
        // Save to database using server action
        const tradeData = {
          stock_symbol: selectedStock.symbol,
          stock_name: selectedStock.name,
          type: tradeType,
          quantity: result.executedQuantity,
          price: result.executedPrice,
          total_amount: result.executedPrice * result.executedQuantity,
          order_id: result.orderId,
          executed_at: new Date().toISOString(),
        }

        console.log("Saving trade data:", tradeData)

        const dbResult = await saveTradeToDatabase(user.id, tradeData)

        console.log("Database result:", dbResult)

        if (dbResult.success) {
          setTradeResult({
            success: true,
            message: `✅ Trade Executed Successfully!\n\n${tradeType.toUpperCase()}: ${result.executedQuantity} shares of ${selectedStock.symbol}\nPrice: ₹${result.executedPrice}\nTotal: ₹${(result.executedPrice * result.executedQuantity).toFixed(2)}\nOrder ID: ${result.orderId}`,
            show: true,
          })

          // Reset form
          setQuantity("")
          setLimitPrice("")

          // Close dialog after showing success for 4 seconds
          setTimeout(() => {
            setIsTradeDialogOpen(false)
            setTradeResult({ success: false, message: "", show: false })
          }, 4000)
        } else {
          setTradeResult({
            success: false,
            message: `❌ Trade executed but failed to save to database:\n${dbResult.error}`,
            show: true,
          })
        }
      } else {
        setTradeResult({
          success: false,
          message: `❌ Trade failed:\n${result.message}`,
          show: true,
        })
      }
    } catch (error) {
      console.error("Trade execution error:", error)
      setTradeResult({
        success: false,
        message: `❌ Failed to execute trade:\n${error instanceof Error ? error.message : "Unknown error"}`,
        show: true,
      })
    }

    setIsExecuting(false)
  }

  const openTradeDialog = (stock: Stock, type: "buy" | "sell") => {
    setSelectedStock(stock)
    setTradeType(type)
    setTradeResult({ success: false, message: "", show: false })
    setQuantity("")
    setLimitPrice("")
    setOrderType("market")
    setIsTradeDialogOpen(true)
  }

  const getSectorColor = (sector: string) => {
    const colors: Record<string, string> = {
      "Information Technology": "bg-blue-100 text-blue-800",
      Banking: "bg-green-100 text-green-800",
      "Oil & Gas": "bg-purple-100 text-purple-800",
      FMCG: "bg-orange-100 text-orange-800",
      Telecom: "bg-pink-100 text-pink-800",
      Automobile: "bg-red-100 text-red-800",
    }
    return colors[sector] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-float-slow"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="particles">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
              background: i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#6366f1" : "#8b5cf6",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className={`mb-8 transition-all duration-1000 ${isVisible ? "animate-slide-in-down" : "opacity-0"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-center sm:text-left">
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient relative">
                  Live Stock Market
                  <Sparkles className="absolute -top-2 -right-8 h-6 w-6 text-yellow-400 animate-bounce" />
                </h1>
                <p
                  className="text-gray-600 mt-3 text-xl flex items-center justify-center sm:justify-start animate-fade-in-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  <Activity className="h-5 w-5 mr-2 text-green-500 animate-pulse" />
                  Real-time Indian stock prices and trading
                </p>
              </div>

              {/* Enhanced Search */}
              <div className="relative w-full sm:w-80 animate-slide-in-left" style={{ animationDelay: "0.5s" }}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-wiggle" />
                <Input
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/90 backdrop-blur-sm border-white/50 focus:ring-2 focus:ring-blue-500 hover-glow transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Market Overview */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Market Status</CardTitle>
                <Zap className="h-4 w-4 text-green-500 animate-pulse" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-green-600 animate-heartbeat">OPEN</div>
                <div className="text-xs text-gray-500 mt-1">Markets are active</div>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Total Stocks</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-500 hover-rotate" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900 animate-zoom-in">{stocks.length}</div>
                <div className="text-xs text-gray-500 mt-1">Available for trading</div>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Gainers</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500 animate-bounce" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-green-600 animate-flip-in">
                  {stocks.filter((s) => s.changePercent > 0).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Stocks up today</div>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Losers</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500 animate-wiggle" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-red-600 animate-slide-in-up">
                  {stocks.filter((s) => s.changePercent < 0).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Stocks down today</div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Stock List */}
          <Card
            className={`card-hover bg-white/90 backdrop-blur-sm border-white/50 transition-all duration-1000 delay-500 relative overflow-hidden ${isVisible ? "animate-slide-in-up" : "opacity-0"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500 animate-pulse" />
                Live Stock Prices
                <Star className="ml-2 h-5 w-5 text-yellow-400 animate-bounce" />
              </CardTitle>
              <CardDescription>Real-time Indian stock market data with buy/sell options</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Symbol</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Company</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700">Price</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700">Change</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700">Change %</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-700">Volume</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStocks.map((stock, index) => (
                        <tr
                          key={stock.symbol}
                          className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-500 hover-lift"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="py-4 px-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 animate-rotate-in">
                                {stock.symbol.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 animate-fade-in-left">{stock.symbol}</div>
                                <Badge className={`text-xs ${getSectorColor(stock.sector)} hover-glow`}>
                                  {stock.sector}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="font-medium text-gray-900 animate-fade-in-right">{stock.name}</div>
                            <div className="text-sm text-gray-500">Market Cap: {stock.marketCap}</div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="font-bold text-lg text-gray-900 animate-zoom-in">
                              ₹{stock.price.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div
                              className={`font-bold flex items-center justify-end animate-bounce-in ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {stock.change >= 0 ? (
                                <ArrowUpRight className="h-4 w-4 mr-1 animate-bounce" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 mr-1 animate-wiggle" />
                              )}
                              ₹{Math.abs(stock.change).toFixed(2)}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div
                              className={`font-bold animate-flip-in ${stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {stock.changePercent >= 0 ? "+" : ""}
                              {stock.changePercent.toFixed(2)}%
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right text-sm text-gray-600 animate-slide-in-up">
                            {stock.volume.toLocaleString()}
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex justify-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => openTradeDialog(stock, "buy")}
                                className="bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 transition-all duration-300 btn-animate hover-glow"
                                disabled={!user}
                              >
                                Buy
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openTradeDialog(stock, "sell")}
                                className="border-red-300 text-red-600 hover:bg-red-50 transform hover:scale-105 transition-all duration-300 btn-animate hover-bounce"
                                disabled={!user}
                              >
                                Sell
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {filteredStocks.map((stock, index) => (
                    <Card
                      key={stock.symbol}
                      className="card-hover bg-white/95 backdrop-blur-sm border-white/50 animate-slide-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3 animate-rotate-in">
                              {stock.symbol.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 animate-fade-in-left">{stock.symbol}</h3>
                              <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                              <Badge className={`text-xs mt-1 ${getSectorColor(stock.sector)} hover-glow`}>
                                {stock.sector}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xl text-gray-900 animate-zoom-in">
                              ₹{stock.price.toFixed(2)}
                            </div>
                            <div
                              className={`font-bold text-sm flex items-center animate-bounce-in ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {stock.change >= 0 ? (
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                              )}
                              {stock.changePercent >= 0 ? "+" : ""}
                              {stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div className="bg-gray-50 rounded-lg p-2 hover-glow">
                            <p className="text-gray-600">Change</p>
                            <p
                              className={`font-bold animate-flip-in ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              ₹{Math.abs(stock.change).toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 hover-glow">
                            <p className="text-gray-600">Volume</p>
                            <p className="font-bold text-gray-900 animate-slide-in-up">
                              {stock.volume.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => openTradeDialog(stock, "buy")}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 transition-all duration-300 btn-animate hover-glow"
                            disabled={!user}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1 animate-wiggle" />
                            Buy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openTradeDialog(stock, "sell")}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 transform hover:scale-105 transition-all duration-300 btn-animate hover-bounce"
                            disabled={!user}
                          >
                            <DollarSign className="h-4 w-4 mr-1 animate-heartbeat" />
                            Sell
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {!user && (
                <div className="text-center py-8 bg-blue-50 rounded-lg mt-6 animate-bounce-in">
                  <p className="text-blue-600 font-medium">Please sign in to start trading stocks</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Trading Dialog */}
          <Dialog open={isTradeDialogOpen} onOpenChange={setIsTradeDialogOpen}>
            <DialogContent className="w-[95vw] max-w-md mx-auto animate-bounce-in bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                  {tradeType === "buy" ? (
                    <ShoppingCart className="h-5 w-5 mr-2 text-green-600 animate-wiggle" />
                  ) : (
                    <DollarSign className="h-5 w-5 mr-2 text-red-600 animate-heartbeat" />
                  )}
                  {tradeType === "buy" ? "Buy" : "Sell"} {selectedStock?.symbol}
                  <Sparkles className="ml-2 h-4 w-4 text-yellow-400 animate-bounce" />
                </DialogTitle>
                <DialogDescription>
                  {selectedStock?.name} - Current Price: ₹{selectedStock?.price.toFixed(2)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {tradeResult.show && (
                  <Alert
                    className={
                      tradeResult.success
                        ? "border-green-200 bg-green-50 animate-slide-in-down"
                        : "border-red-200 bg-red-50 animate-wiggle"
                    }
                  >
                    <div className="flex items-start">
                      {tradeResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 animate-bounce flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 animate-wiggle flex-shrink-0" />
                      )}
                      <AlertDescription
                        className={`whitespace-pre-line text-sm ${tradeResult.success ? "text-green-800" : "text-red-800"}`}
                      >
                        {tradeResult.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderType" className="text-gray-900">
                      Order Type
                    </Label>
                    <Select value={orderType} onValueChange={(value: "market" | "limit") => setOrderType(value)}>
                      <SelectTrigger className="bg-white hover-glow">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-gray-900">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Number of shares"
                      className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 bg-white hover-glow"
                    />
                  </div>
                </div>

                {orderType === "limit" && (
                  <div className="space-y-2 animate-slide-in-down">
                    <Label htmlFor="limitPrice" className="text-gray-900">
                      Limit Price (₹)
                    </Label>
                    <Input
                      id="limitPrice"
                      type="number"
                      step="0.01"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="Enter limit price"
                      className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 bg-white hover-glow"
                    />
                  </div>
                )}

                {quantity && selectedStock && (
                  <div className="bg-gray-50 rounded-lg p-4 animate-zoom-in hover-glow">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estimated Total:</span>
                      <span className="font-bold text-lg text-gray-900 animate-heartbeat">
                        ₹
                        {(
                          (orderType === "limit" && limitPrice ? Number(limitPrice) : selectedStock.price) *
                          Number(quantity)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleTrade}
                  disabled={!quantity || isExecuting || (orderType === "limit" && !limitPrice)}
                  className={`w-full transform hover:scale-105 transition-all duration-300 btn-animate ${
                    tradeType === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isExecuting ? (
                    <div className="flex items-center">
                      <div className="spinner mr-2"></div>
                      Executing<span className="loading-dots"></span>
                    </div>
                  ) : (
                    `${tradeType === "buy" ? "Buy" : "Sell"} ${quantity || 0} Shares`
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
