"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  intradayService,
  type IntradayData,
  type TechnicalIndicator,
  type MarketDepth,
} from "@/lib/services/intraday-service"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function ChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE.NS")
  const [interval, setInterval] = useState<"1m" | "5m" | "15m" | "1h">("5m")
  const [chartType, setChartType] = useState<"line" | "candlestick" | "area">("line")
  const [intradayData, setIntradayData] = useState<IntradayData[]>([])
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>([])
  const [marketDepth, setMarketDepth] = useState<MarketDepth | null>(null)
  const [loading, setLoading] = useState(false)
  const [realTimeData, setRealTimeData] = useState<IntradayData | null>(null)

  const popularSymbols = [
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

  useEffect(() => {
    loadChartData()
  }, [selectedSymbol, interval])

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = intradayService.subscribeToRealTime(selectedSymbol, (data) => {
      setRealTimeData(data)
      // Update the last data point in the chart
      setIntradayData((prev) => {
        const newData = [...prev]
        if (newData.length > 0) {
          newData[newData.length - 1] = data
        }
        return newData
      })
    })

    return unsubscribe
  }, [selectedSymbol])

  const loadChartData = async () => {
    setLoading(true)
    try {
      const [chartData, indicators, depth] = await Promise.all([
        intradayService.getIntradayData(selectedSymbol, interval, 1),
        intradayService.getTechnicalIndicators(selectedSymbol),
        intradayService.getMarketDepth(selectedSymbol),
      ])

      setIntradayData(chartData)
      setTechnicalIndicators(indicators)
      setMarketDepth(depth)
    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: "Failed to load chart data. Using demo data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatChartData = (data: IntradayData[]) => {
    return data.map((item) => ({
      ...item,
      time: new Date(item.timestamp).toLocaleTimeString(),
      date: new Date(item.timestamp).toLocaleDateString(),
    }))
  }

  const getSignalBadge = (signal: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      BUY: "default",
      SELL: "destructive",
      HOLD: "secondary",
    }
    return <Badge variant={variants[signal] || "secondary"}>{signal}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          <p className="text-blue-600">{`Open: ${formatCurrency(data.open)}`}</p>
          <p className="text-green-600">{`High: ${formatCurrency(data.high)}`}</p>
          <p className="text-red-600">{`Low: ${formatCurrency(data.low)}`}</p>
          <p className="text-purple-600">{`Close: ${formatCurrency(data.close)}`}</p>
          <p className="text-gray-600">{`Volume: ${data.volume.toLocaleString()}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Advanced Charts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Professional charting with technical analysis and real-time data
          </p>
        </div>

        {/* Chart Controls */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Chart Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Symbol</label>
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {popularSymbols.map((symbol) => (
                      <SelectItem key={symbol} value={symbol}>
                        {symbol.replace(".NS", "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Interval</label>
                <Select value={interval} onValueChange={(value: "1m" | "5m" | "15m" | "1h") => setInterval(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Minute</SelectItem>
                    <SelectItem value="5m">5 Minutes</SelectItem>
                    <SelectItem value="15m">15 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Chart Type</label>
                <Select
                  value={chartType}
                  onValueChange={(value: "line" | "candlestick" | "area") => setChartType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="candlestick">Candlestick</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={loadChartData}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Price Display */}
        {realTimeData && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{selectedSymbol.replace(".NS", "")}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-3xl font-bold">{formatCurrency(realTimeData.close)}</span>
                    <div className="flex items-center gap-1">
                      {realTimeData.close > realTimeData.open ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <span
                        className={`font-medium ${realTimeData.close > realTimeData.open ? "text-green-600" : "text-red-600"}`}
                      >
                        {(((realTimeData.close - realTimeData.open) / realTimeData.open) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Volume</div>
                  <div className="text-lg font-semibold">{realTimeData.volume.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mt-2">
                    H: {formatCurrency(realTimeData.high)} | L: {formatCurrency(realTimeData.low)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Price Chart - {selectedSymbol.replace(".NS", "")}</CardTitle>
                <CardDescription>
                  {interval} interval • {chartType} chart • Real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "line" && (
                      <LineChart data={formatChartData(intradayData)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                    )}
                    {chartType === "area" && (
                      <AreaChart data={formatChartData(intradayData)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="url(#colorPrice)" />
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Volume Chart */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle>Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatChartData(intradayData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="volume" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Technical Indicators */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Technical Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {technicalIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{indicator.name}</div>
                        <div className="text-sm text-gray-600">{indicator.value}</div>
                      </div>
                      {getSignalBadge(indicator.signal)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Depth */}
            {marketDepth && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Market Depth</CardTitle>
                  <CardDescription>Level 2 Order Book</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="bids" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="bids">Bids</TabsTrigger>
                      <TabsTrigger value="asks">Asks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bids" className="space-y-2">
                      {marketDepth.bids.map((bid, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-green-600">{formatCurrency(bid.price)}</span>
                          <span>{bid.quantity}</span>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="asks" className="space-y-2">
                      {marketDepth.asks.map((ask, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-red-600">{formatCurrency(ask.price)}</span>
                          <span>{ask.quantity}</span>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
