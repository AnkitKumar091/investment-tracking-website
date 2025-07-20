"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert as AlertComponent } from "@/components/ui/alert"
import { enhancedStockService } from "@/lib/enhanced-stock-service"
import { Plus, Bell, TrendingUp, TrendingDown, Target, AlertTriangle, Trash2, Settings, Activity } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface WatchlistItem {
  id: string
  symbol: string
  name: string
  currentPrice: number
  targetPrice?: number
  stopLoss?: number
  alertType: "price" | "volume" | "percentage"
  alertValue: number
  isActive: boolean
  createdAt: number
  triggeredAt?: number
}

interface WatchlistAlert {
  id: string
  symbol: string
  type: string
  message: string
  timestamp: number
  isRead: boolean
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [alerts, setAlerts] = useState<WatchlistAlert[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    symbol: "",
    targetPrice: "",
    stopLoss: "",
    alertType: "price" as "price" | "volume" | "percentage",
    alertValue: "",
  })
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadWatchlist()
    loadStocks()

    // Start monitoring alerts
    const interval = setInterval(checkAlerts, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const loadWatchlist = () => {
    const saved = localStorage.getItem("watchlist")
    if (saved) {
      setWatchlist(JSON.parse(saved))
    }
  }

  const saveWatchlist = (items: WatchlistItem[]) => {
    localStorage.setItem("watchlist", JSON.stringify(items))
    setWatchlist(items)
  }

  const loadStocks = async () => {
    try {
      const stockData = await enhancedStockService.getAllStocks()
      setStocks(stockData)
    } catch (error) {
      console.error("Failed to load stocks:", error)
    }
  }

  const addToWatchlist = async () => {
    if (!newItem.symbol || !newItem.alertValue) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Get stock info
      const stock = stocks.find((s) => s.symbol === newItem.symbol.toUpperCase())
      if (!stock) {
        throw new Error("Stock not found")
      }

      const item: WatchlistItem = {
        id: `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: newItem.symbol.toUpperCase(),
        name: stock.name,
        currentPrice: stock.price,
        targetPrice: newItem.targetPrice ? Number.parseFloat(newItem.targetPrice) : undefined,
        stopLoss: newItem.stopLoss ? Number.parseFloat(newItem.stopLoss) : undefined,
        alertType: newItem.alertType,
        alertValue: Number.parseFloat(newItem.alertValue),
        isActive: true,
        createdAt: Date.now(),
      }

      const updatedWatchlist = [...watchlist, item]
      saveWatchlist(updatedWatchlist)

      // Reset form
      setNewItem({
        symbol: "",
        targetPrice: "",
        stopLoss: "",
        alertType: "price",
        alertValue: "",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Added to Watchlist",
        description: `${item.symbol} has been added to your watchlist`,
      })

      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add to watchlist",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeFromWatchlist = (id: string) => {
    const updatedWatchlist = watchlist.filter((item) => item.id !== id)
    saveWatchlist(updatedWatchlist)
    toast({
      title: "Removed",
      description: "Item removed from watchlist",
    })
  }

  const toggleAlert = (id: string) => {
    const updatedWatchlist = watchlist.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
    saveWatchlist(updatedWatchlist)
  }

  const checkAlerts = async () => {
    if (watchlist.length === 0) return

    try {
      const currentStocks = await enhancedStockService.getAllStocks()
      const newAlerts: WatchlistAlert[] = []

      for (const item of watchlist) {
        if (!item.isActive) continue

        const stock = currentStocks.find((s) => s.symbol === item.symbol)
        if (!stock) continue

        // Update current price
        const updatedWatchlist = watchlist.map((w) => (w.id === item.id ? { ...w, currentPrice: stock.price } : w))
        setWatchlist(updatedWatchlist)

        // Check alerts
        let alertTriggered = false
        let alertMessage = ""

        switch (item.alertType) {
          case "price":
            if (stock.price >= item.alertValue) {
              alertTriggered = true
              alertMessage = `${item.symbol} reached target price of ₹${item.alertValue}`
            }
            break
          case "percentage":
            const changePercent = Math.abs(stock.changePercent)
            if (changePercent >= item.alertValue) {
              alertTriggered = true
              alertMessage = `${item.symbol} moved ${changePercent.toFixed(2)}% (Alert: ${item.alertValue}%)`
            }
            break
          case "volume":
            if (stock.volume >= item.alertValue) {
              alertTriggered = true
              alertMessage = `${item.symbol} volume reached ${stock.volume.toLocaleString()}`
            }
            break
        }

        // Check target and stop loss
        if (item.targetPrice && stock.price >= item.targetPrice) {
          alertTriggered = true
          alertMessage = `🎯 ${item.symbol} hit target price of ₹${item.targetPrice}`
        }

        if (item.stopLoss && stock.price <= item.stopLoss) {
          alertTriggered = true
          alertMessage = `⚠️ ${item.symbol} hit stop loss at ₹${item.stopLoss}`
        }

        if (alertTriggered) {
          const alert: WatchlistAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            symbol: item.symbol,
            type: item.alertType,
            message: alertMessage,
            timestamp: Date.now(),
            isRead: false,
          }

          newAlerts.push(alert)

          // Show browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Stock Alert", {
              body: alertMessage,
              icon: "/placeholder-logo.png",
            })
          }

          // Show toast
          toast({
            title: "Alert Triggered",
            description: alertMessage,
          })
        }
      }

      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts, ...prev])
      }
    } catch (error) {
      console.error("Error checking alerts:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const getAlertBadge = (type: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      price: "default",
      volume: "secondary",
      percentage: "destructive",
    }
    return <Badge variant={variants[type] || "default"}>{type}</Badge>
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
            Smart Watchlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your favorite stocks with intelligent alerts and notifications
          </p>
        </div>

        {/* Alert Summary */}
        {alerts.length > 0 && (
          <AlertComponent className="mb-8 bg-yellow-50 border-yellow-200">
            <Bell className="h-4 w-4" />
            <div className="text-sm text-gray-600 mt-1">
              You have {alerts.filter((a) => !a.isRead).length} unread alerts from your watchlist
            </div>
          </AlertComponent>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Watchlist */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      My Watchlist
                    </CardTitle>
                    <CardDescription>{watchlist.length} stocks being monitored</CardDescription>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stock
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Watchlist</DialogTitle>
                        <DialogDescription>
                          Set up alerts for price movements, volume spikes, or percentage changes
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="symbol">Stock Symbol</Label>
                          <Input
                            id="symbol"
                            placeholder="e.g., RELIANCE.NS"
                            value={newItem.symbol}
                            onChange={(e) => setNewItem({ ...newItem, symbol: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="targetPrice">Target Price (Optional)</Label>
                            <Input
                              id="targetPrice"
                              type="number"
                              step="0.01"
                              placeholder="Target price"
                              value={newItem.targetPrice}
                              onChange={(e) => setNewItem({ ...newItem, targetPrice: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stopLoss">Stop Loss (Optional)</Label>
                            <Input
                              id="stopLoss"
                              type="number"
                              step="0.01"
                              placeholder="Stop loss price"
                              value={newItem.stopLoss}
                              onChange={(e) => setNewItem({ ...newItem, stopLoss: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Alert Type</Label>
                          <select
                            className="w-full p-2 border rounded-md"
                            value={newItem.alertType}
                            onChange={(e) => setNewItem({ ...newItem, alertType: e.target.value as any })}
                          >
                            <option value="price">Price Alert</option>
                            <option value="percentage">Percentage Change</option>
                            <option value="volume">Volume Alert</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="alertValue">
                            Alert Value (
                            {newItem.alertType === "price" ? "₹" : newItem.alertType === "percentage" ? "%" : "Volume"})
                          </Label>
                          <Input
                            id="alertValue"
                            type="number"
                            step={newItem.alertType === "price" ? "0.01" : "1"}
                            placeholder={`Enter ${newItem.alertType} value`}
                            value={newItem.alertValue}
                            onChange={(e) => setNewItem({ ...newItem, alertValue: e.target.value })}
                          />
                        </div>

                        <Button
                          onClick={addToWatchlist}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {loading ? "Adding..." : "Add to Watchlist"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {watchlist.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No stocks in your watchlist yet.</p>
                    <p className="text-sm">Add stocks to start monitoring price movements and get alerts.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>Target/Stop</TableHead>
                        <TableHead>Alert</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {watchlist.map((item) => {
                        const stock = stocks.find((s) => s.symbol === item.symbol)
                        const priceChange = stock ? stock.changePercent : 0

                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.symbol.replace(".NS", "")}</div>
                                <div className="text-sm text-gray-600">{item.name}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{formatCurrency(item.currentPrice)}</div>
                                <div
                                  className={`text-sm flex items-center gap-1 ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {priceChange >= 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  {priceChange.toFixed(2)}%
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {item.targetPrice && (
                                  <div className="text-green-600">T: {formatCurrency(item.targetPrice)}</div>
                                )}
                                {item.stopLoss && (
                                  <div className="text-red-600">SL: {formatCurrency(item.stopLoss)}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                {getAlertBadge(item.alertType)}
                                <div className="text-xs text-gray-600 mt-1">
                                  {item.alertType === "price" && `₹${item.alertValue}`}
                                  {item.alertType === "percentage" && `${item.alertValue}%`}
                                  {item.alertType === "volume" && item.alertValue.toLocaleString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.isActive ? "default" : "secondary"}>
                                {item.isActive ? "Active" : "Paused"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => toggleAlert(item.id)}>
                                  <Settings className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => removeFromWatchlist(item.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts Panel */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Alerts
                </CardTitle>
                <CardDescription>{alerts.filter((a) => !a.isRead).length} unread alerts</CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No alerts yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {alerts.slice(0, 10).map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border ${
                          alert.isRead ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{alert.symbol}</div>
                            <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                          {alert.type === "price" && <Target className="h-4 w-4 text-blue-600 mt-1" />}
                          {alert.type === "volume" && <Activity className="h-4 w-4 text-green-600 mt-1" />}
                          {alert.type === "percentage" && <AlertTriangle className="h-4 w-4 text-orange-600 mt-1" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
