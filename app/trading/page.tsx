"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { tradingService, type Order, type Position, type Account } from "@/lib/services/trading-service"
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function TradingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [account, setAccount] = useState<Account>({
    balance: 0,
    availableMargin: 0,
    usedMargin: 0,
    totalPnl: 0,
    dayPnl: 0,
  })
  const [orderForm, setOrderForm] = useState({
    symbol: "",
    type: "BUY" as "BUY" | "SELL",
    orderType: "MARKET" as "MARKET" | "LIMIT" | "STOP_LOSS",
    quantity: "",
    price: "",
    stopPrice: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load initial data
    setOrders(tradingService.getOrders())
    setPositions(tradingService.getPositions())
    setAccount(tradingService.getAccount())

    // Start real-time updates
    tradingService.startRealTimeUpdates()

    // Subscribe to trading updates
    const unsubscribe = tradingService.subscribe((data) => {
      switch (data.type) {
        case "ORDER_PLACED":
        case "ORDER_EXECUTED":
        case "ORDER_CANCELLED":
        case "ORDER_REJECTED":
          setOrders(tradingService.getOrders())
          setPositions(tradingService.getPositions())
          setAccount(tradingService.getAccount())

          if (data.type === "ORDER_EXECUTED") {
            toast({
              title: "Order Executed",
              description: `${data.order.type} ${data.order.quantity} shares of ${data.order.symbol}`,
            })
          } else if (data.type === "ORDER_REJECTED") {
            toast({
              title: "Order Rejected",
              description: data.error,
              variant: "destructive",
            })
          }
          break
        case "POSITIONS_UPDATED":
          setPositions(data.positions)
          setAccount(data.account)
          break
      }
    })

    return unsubscribe
  }, [])

  const handlePlaceOrder = async () => {
    if (!orderForm.symbol || !orderForm.quantity) {
      toast({
        title: "Invalid Order",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await tradingService.placeOrder({
        symbol: orderForm.symbol.toUpperCase(),
        type: orderForm.type,
        orderType: orderForm.orderType,
        quantity: Number.parseInt(orderForm.quantity),
        price: orderForm.price ? Number.parseFloat(orderForm.price) : undefined,
        stopPrice: orderForm.stopPrice ? Number.parseFloat(orderForm.stopPrice) : undefined,
      })

      // Reset form
      setOrderForm({
        symbol: "",
        type: "BUY",
        orderType: "MARKET",
        quantity: "",
        price: "",
        stopPrice: "",
      })

      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully",
      })
    } catch (error) {
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    const success = await tradingService.cancelOrder(orderId)
    if (success) {
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully",
      })
    } else {
      toast({
        title: "Cancel Failed",
        description: "Unable to cancel order",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      PENDING: "outline",
      EXECUTED: "default",
      CANCELLED: "secondary",
      REJECTED: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
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
            Trading Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Professional trading with real-time execution and portfolio management
          </p>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Margin</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(account.availableMargin)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Used Margin</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(account.usedMargin)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              {account.totalPnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${account.totalPnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(account.totalPnl)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
              <CardDescription>Execute trades with real-time market data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., RELIANCE.NS"
                  value={orderForm.symbol}
                  onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <Select
                    value={orderForm.type}
                    onValueChange={(value: "BUY" | "SELL") => setOrderForm({ ...orderForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Execution</Label>
                  <Select
                    value={orderForm.orderType}
                    onValueChange={(value: "MARKET" | "LIMIT" | "STOP_LOSS") =>
                      setOrderForm({ ...orderForm, orderType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARKET">Market</SelectItem>
                      <SelectItem value="LIMIT">Limit</SelectItem>
                      <SelectItem value="STOP_LOSS">Stop Loss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Number of shares"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                />
              </div>

              {orderForm.orderType === "LIMIT" && (
                <div className="space-y-2">
                  <Label htmlFor="price">Limit Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="Price per share"
                    value={orderForm.price}
                    onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                  />
                </div>
              )}

              {orderForm.orderType === "STOP_LOSS" && (
                <div className="space-y-2">
                  <Label htmlFor="stopPrice">Stop Price</Label>
                  <Input
                    id="stopPrice"
                    type="number"
                    step="0.01"
                    placeholder="Stop loss price"
                    value={orderForm.stopPrice}
                    onChange={(e) => setOrderForm({ ...orderForm, stopPrice: e.target.value })}
                  />
                </div>
              )}

              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>

          {/* Positions and Orders */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="positions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="positions">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Current Positions</CardTitle>
                    <CardDescription>Your active trading positions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {positions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No positions found. Place your first trade to get started.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Avg Price</TableHead>
                            <TableHead>Current Price</TableHead>
                            <TableHead>P&L</TableHead>
                            <TableHead>Market Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {positions.map((position) => (
                            <TableRow key={position.symbol}>
                              <TableCell className="font-medium">{position.symbol}</TableCell>
                              <TableCell>{position.quantity}</TableCell>
                              <TableCell>{formatCurrency(position.averagePrice)}</TableCell>
                              <TableCell>{formatCurrency(position.currentPrice)}</TableCell>
                              <TableCell className={position.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                                {formatCurrency(position.pnl)}
                                <div className="text-xs">({position.pnlPercent.toFixed(2)}%)</div>
                              </TableCell>
                              <TableCell>{formatCurrency(position.marketValue)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>Your recent trading orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No orders found. Place your first order to see it here.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{new Date(order.timestamp).toLocaleTimeString()}</TableCell>
                              <TableCell className="font-medium">{order.symbol}</TableCell>
                              <TableCell>
                                <Badge variant={order.type === "BUY" ? "default" : "secondary"}>{order.type}</Badge>
                              </TableCell>
                              <TableCell>{order.quantity}</TableCell>
                              <TableCell>
                                {order.executedPrice
                                  ? formatCurrency(order.executedPrice)
                                  : order.price
                                    ? formatCurrency(order.price)
                                    : "Market"}
                              </TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell>
                                {order.status === "PENDING" && (
                                  <Button variant="outline" size="sm" onClick={() => handleCancelOrder(order.id)}>
                                    Cancel
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
