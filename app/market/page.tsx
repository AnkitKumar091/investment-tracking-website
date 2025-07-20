"use client"

import { useState, useEffect } from "react"
import { enhancedStockService } from "@/lib/enhanced-stock-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Search, RefreshCw, Activity, AlertCircle } from "lucide-react"

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

export default function MarketPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [isRealTimeActive, setIsRealTimeActive] = useState(false)

  const loadStocks = async () => {
    try {
      setLoading(true)
      setError(null)
      const stockData = await enhancedStockService.getAllStocks()
      setStocks(stockData)
    } catch (err) {
      console.error("Error loading stocks:", err)
      setError("Failed to load market data. Showing demo data.")
      // Set demo data as fallback
      setStocks([
        {
          symbol: "RELIANCE.NS",
          name: "Reliance Industries Ltd",
          price: 2850.75,
          change: 45.3,
          changePercent: 1.62,
          volume: 5420000,
          marketCap: 1925000000000,
          high: 2865.0,
          low: 2820.5,
          previousClose: 2805.45,
          sector: "Energy",
        },
        {
          symbol: "TCS.NS",
          name: "Tata Consultancy Services",
          price: 3920.25,
          change: -28.75,
          changePercent: -0.73,
          volume: 2180000,
          marketCap: 1430000000000,
          high: 3955.0,
          low: 3910.0,
          previousClose: 3949.0,
          sector: "IT",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStocks()
  }, [])

  const toggleRealTime = () => {
    if (isRealTimeActive) {
      enhancedStockService.stopRealTimeUpdates()
      setIsRealTimeActive(false)
    } else {
      enhancedStockService.startRealTimeUpdates()
      const unsubscribe = enhancedStockService.subscribe((updatedStocks) => {
        setStocks(updatedStocks)
      })
      setIsRealTimeActive(true)

      // Cleanup on component unmount
      return () => {
        unsubscribe()
        enhancedStockService.stopRealTimeUpdates()
      }
    }
  }

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.sector.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`
    if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`
    if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`
    return num.toLocaleString("en-IN")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-4">
            Live Market Data
          </h1>
          <p className="text-xl text-gray-600 mb-6">Real-time Indian stock market prices and analytics</p>

          {error && (
            <Alert className="mb-6 max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search stocks, sectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={loadStocks}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              onClick={toggleRealTime}
              variant={isRealTimeActive ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              {isRealTimeActive ? "Stop Live" : "Start Live"}
            </Button>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Market Cap</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(stocks.reduce((sum, stock) => sum + stock.marketCap, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Volume</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(stocks.reduce((sum, stock) => sum + stock.volume, 0))}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Gainers</p>
                  <p className="text-2xl font-bold">{stocks.filter((stock) => stock.change > 0).length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Losers</p>
                  <p className="text-2xl font-bold">{stocks.filter((stock) => stock.change < 0).length}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock) => (
            <Card
              key={stock.symbol}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white/80 backdrop-blur-sm border-white/50"
              onClick={() => setSelectedStock(stock)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">{stock.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {stock.symbol} • {stock.sector}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={stock.change >= 0 ? "default" : "destructive"}
                    className={stock.change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {stock.change >= 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(stock.price)}</span>
                    <div className={`flex items-center gap-1 ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="font-medium">
                        {stock.change >= 0 ? "+" : ""}
                        {formatCurrency(stock.change)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">Volume</p>
                      <p>{formatNumber(stock.volume)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Market Cap</p>
                      <p>{formatNumber(stock.marketCap)}</p>
                    </div>
                    <div>
                      <p className="font-medium">High</p>
                      <p>{formatCurrency(stock.high)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Low</p>
                      <p>{formatCurrency(stock.low)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStocks.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No stocks found matching your search.</p>
          </div>
        )}

        {/* Live Update Indicator */}
        {isRealTimeActive && (
          <div className="fixed bottom-4 right-4 z-50">
            <Card className="bg-green-500 text-white shadow-lg">
              <CardContent className="p-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Updates Active</span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
