"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  TrendingUp,
  Search,
  Filter,
  PieChart,
  DollarSign,
  Star,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react"

interface MutualFund {
  id: string
  name: string
  scheme_code: string
  fund_house: string
  category: string
  nav: number
  units: number
  invested_amount: number
  current_value: number
  returns: number
  returns_percentage: number
  investment_type: "lumpsum" | "sip"
  purchase_date: string
  expense_ratio: number
  is_direct: boolean
}

interface SIPInvestment {
  id: string
  fund_name: string
  monthly_amount: number
  start_date: string
  next_installment: string
  total_invested: number
  current_value: number
  installments_completed: number
  status: "active" | "paused" | "stopped"
}

const FUND_CATEGORIES = [
  "Large Cap",
  "Mid Cap",
  "Small Cap",
  "Multi Cap",
  "Flexi Cap",
  "ELSS",
  "Debt",
  "Hybrid",
  "Index",
  "Sectoral",
  "International",
]

const FUND_HOUSES = [
  "SBI Mutual Fund",
  "HDFC Mutual Fund",
  "ICICI Prudential",
  "Axis Mutual Fund",
  "Kotak Mahindra",
  "Nippon India",
  "UTI Mutual Fund",
  "Aditya Birla Sun Life",
  "DSP Mutual Fund",
  "Franklin Templeton",
]

// Mock data for demonstration
const mockMutualFunds: MutualFund[] = [
  {
    id: "1",
    name: "SBI Blue Chip Fund",
    scheme_code: "125497",
    fund_house: "SBI Mutual Fund",
    category: "Large Cap",
    nav: 125.5,
    units: 79.681,
    invested_amount: 10000,
    current_value: 10005.67,
    returns: 5.67,
    returns_percentage: 0.057,
    investment_type: "lumpsum",
    purchase_date: "2024-01-15",
    expense_ratio: 1.25,
    is_direct: true,
  },
  {
    id: "2",
    name: "HDFC Top 100 Fund",
    scheme_code: "100016",
    fund_house: "HDFC Mutual Fund",
    category: "Large Cap",
    nav: 890.45,
    units: 11.234,
    invested_amount: 10000,
    current_value: 10456.78,
    returns: 456.78,
    returns_percentage: 4.57,
    investment_type: "sip",
    purchase_date: "2023-12-01",
    expense_ratio: 1.15,
    is_direct: true,
  },
  {
    id: "3",
    name: "Axis Bluechip Fund",
    scheme_code: "120503",
    fund_house: "Axis Mutual Fund",
    category: "Large Cap",
    nav: 67.89,
    units: 147.234,
    invested_amount: 10000,
    current_value: 9998.45,
    returns: -1.55,
    returns_percentage: -0.016,
    investment_type: "lumpsum",
    purchase_date: "2024-02-10",
    expense_ratio: 1.05,
    is_direct: false,
  },
]

export default function MutualFundsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>(mockMutualFunds)
  const [sipInvestments, setSipInvestments] = useState<SIPInvestment[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("all-funds")
  const [isVisible, setIsVisible] = useState(false)

  const [newInvestment, setNewInvestment] = useState({
    name: "",
    scheme_code: "",
    fund_house: "",
    category: "",
    nav: "",
    units: "",
    invested_amount: "",
    investment_type: "lumpsum" as "lumpsum" | "sip",
    purchase_date: "",
    expense_ratio: "",
    is_direct: true,
  })

  useEffect(() => {
    setIsVisible(true)
    // Auto-login for demo purposes if no user
    if (!loading && !user) {
      // For demo purposes, we'll show the page content anyway
      console.log("Demo mode: showing mutual funds page")
    }
  }, [user, loading, router])

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const currentValue = Number.parseFloat(newInvestment.nav) * Number.parseFloat(newInvestment.units)
      const investedAmount = Number.parseFloat(newInvestment.invested_amount)
      const returns = currentValue - investedAmount
      const returnsPercentage = (returns / investedAmount) * 100

      const newFund: MutualFund = {
        id: Date.now().toString(),
        name: newInvestment.name,
        scheme_code: newInvestment.scheme_code,
        fund_house: newInvestment.fund_house,
        category: newInvestment.category,
        nav: Number.parseFloat(newInvestment.nav),
        units: Number.parseFloat(newInvestment.units),
        invested_amount: investedAmount,
        current_value: currentValue,
        returns: returns,
        returns_percentage: returnsPercentage,
        investment_type: newInvestment.investment_type,
        purchase_date: newInvestment.purchase_date,
        expense_ratio: Number.parseFloat(newInvestment.expense_ratio),
        is_direct: newInvestment.is_direct,
      }

      setMutualFunds([...mutualFunds, newFund])
      setIsAddDialogOpen(false)
      setNewInvestment({
        name: "",
        scheme_code: "",
        fund_house: "",
        category: "",
        nav: "",
        units: "",
        invested_amount: "",
        investment_type: "lumpsum",
        purchase_date: "",
        expense_ratio: "",
        is_direct: true,
      })

      alert("Mutual fund investment added successfully!")
    } catch (error) {
      console.error("Error adding mutual fund:", error)
      alert("Failed to add mutual fund. Please try again.")
    }
  }

  const filteredFunds = mutualFunds.filter((fund) => {
    const matchesSearch =
      fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.fund_house.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || fund.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalInvested = mutualFunds.reduce((sum, fund) => sum + fund.invested_amount, 0)
  const totalCurrentValue = mutualFunds.reduce((sum, fund) => sum + fund.current_value, 0)
  const totalReturns = totalCurrentValue - totalInvested
  const totalReturnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

  const activeSIPs = sipInvestments.filter((sip) => sip.status === "active").length
  const totalSIPInvested = sipInvestments.reduce((sum, sip) => sum + sip.total_invested, 0)
  const totalSIPValue = sipInvestments.reduce((sum, sip) => sum + sip.current_value, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center animate-bounce-in">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading mutual funds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 relative overflow-hidden">
      {/* Animated Background */}
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
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`mb-8 transition-all duration-1000 ${isVisible ? "animate-slide-in-down" : "opacity-0"}`}>
            <div className="text-center mb-6">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient relative">
                Mutual Funds
                <Sparkles className="absolute -top-2 -right-8 h-6 w-6 text-yellow-400 animate-bounce" />
              </h1>
              <p className="text-gray-600 mt-3 text-xl">Invest in direct mutual funds with zero commission</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900">₹{totalInvested.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Across all mutual funds</p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Current Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900">₹{totalCurrentValue.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Portfolio value</p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${totalReturns >= 0 ? "from-green-400/10 to-emerald-400/10" : "from-red-400/10 to-pink-400/10"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Total Returns</CardTitle>
                {totalReturns >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent className="relative z-10">
                <div className={`text-2xl font-bold ${totalReturns >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalReturns >= 0 ? "+" : ""}₹{totalReturns.toLocaleString()}
                </div>
                <p className={`text-xs mt-1 ${totalReturns >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalReturnsPercentage >= 0 ? "+" : ""}
                  {totalReturnsPercentage.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Active SIPs</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900">{activeSIPs}</div>
                <p className="text-xs text-gray-500 mt-1">Running investments</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="all-funds">All Funds</TabsTrigger>
              <TabsTrigger value="lumpsum">Lumpsum</TabsTrigger>
              <TabsTrigger value="direct-funds">Direct Funds</TabsTrigger>
            </TabsList>

            <TabsContent value="all-funds">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search mutual funds..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {FUND_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Investment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Mutual Fund Investment</DialogTitle>
                      <DialogDescription>Enter the details of your mutual fund investment</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddInvestment} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Fund Name</Label>
                          <Input
                            id="name"
                            value={newInvestment.name}
                            onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                            placeholder="e.g., SBI Blue Chip Fund"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheme_code">Scheme Code</Label>
                          <Input
                            id="scheme_code"
                            value={newInvestment.scheme_code}
                            onChange={(e) => setNewInvestment({ ...newInvestment, scheme_code: e.target.value })}
                            placeholder="e.g., 125497"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fund_house">Fund House</Label>
                          <Select
                            value={newInvestment.fund_house}
                            onValueChange={(value) => setNewInvestment({ ...newInvestment, fund_house: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select fund house" />
                            </SelectTrigger>
                            <SelectContent>
                              {FUND_HOUSES.map((house) => (
                                <SelectItem key={house} value={house}>
                                  {house}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newInvestment.category}
                            onValueChange={(value) => setNewInvestment({ ...newInvestment, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {FUND_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nav">Current NAV (₹)</Label>
                          <Input
                            id="nav"
                            type="number"
                            step="0.01"
                            value={newInvestment.nav}
                            onChange={(e) => setNewInvestment({ ...newInvestment, nav: e.target.value })}
                            placeholder="125.50"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="units">Units</Label>
                          <Input
                            id="units"
                            type="number"
                            step="0.001"
                            value={newInvestment.units}
                            onChange={(e) => setNewInvestment({ ...newInvestment, units: e.target.value })}
                            placeholder="100.500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invested_amount">Invested Amount (₹)</Label>
                          <Input
                            id="invested_amount"
                            type="number"
                            step="0.01"
                            value={newInvestment.invested_amount}
                            onChange={(e) => setNewInvestment({ ...newInvestment, invested_amount: e.target.value })}
                            placeholder="10000"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="investment_type">Investment Type</Label>
                          <Select
                            value={newInvestment.investment_type}
                            onValueChange={(value: "lumpsum" | "sip") =>
                              setNewInvestment({ ...newInvestment, investment_type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lumpsum">Lumpsum</SelectItem>
                              <SelectItem value="sip">SIP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="purchase_date">Purchase Date</Label>
                          <Input
                            id="purchase_date"
                            type="date"
                            value={newInvestment.purchase_date}
                            onChange={(e) => setNewInvestment({ ...newInvestment, purchase_date: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expense_ratio">Expense Ratio (%)</Label>
                          <Input
                            id="expense_ratio"
                            type="number"
                            step="0.01"
                            value={newInvestment.expense_ratio}
                            onChange={(e) => setNewInvestment({ ...newInvestment, expense_ratio: e.target.value })}
                            placeholder="1.25"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_direct"
                          checked={newInvestment.is_direct}
                          onChange={(e) => setNewInvestment({ ...newInvestment, is_direct: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="is_direct">Direct Fund (No Commission)</Label>
                      </div>

                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Add Investment
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Funds List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredFunds.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-4">No mutual funds found</p>
                    <p className="text-gray-400">Add your first mutual fund investment to get started!</p>
                  </div>
                ) : (
                  filteredFunds.map((fund, index) => (
                    <Card
                      key={fund.id}
                      className="card-hover bg-white/95 backdrop-blur-sm border-white/50 animate-slide-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-900 mb-1">{fund.name}</CardTitle>
                            <CardDescription className="text-sm text-gray-600">
                              {fund.fund_house} • {fund.category}
                              {fund.is_direct && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Direct
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">NAV</div>
                            <div className="font-bold text-gray-900">₹{fund.nav.toFixed(2)}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Invested</p>
                            <p className="font-bold text-lg">₹{fund.invested_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Current Value</p>
                            <p className="font-bold text-lg">₹{fund.current_value.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Units</p>
                            <p className="font-medium">{fund.units.toFixed(3)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Returns</p>
                            <p className={`font-bold ${fund.returns >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {fund.returns >= 0 ? "+" : ""}₹{fund.returns.toLocaleString()}
                              <span className="text-sm ml-1">
                                ({fund.returns_percentage >= 0 ? "+" : ""}
                                {fund.returns_percentage.toFixed(2)}%)
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Expense Ratio: {fund.expense_ratio}%</span>
                          <span>{fund.investment_type === "sip" ? "SIP" : "Lumpsum"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="lumpsum">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredFunds
                  .filter((fund) => fund.investment_type === "lumpsum")
                  .map((fund, index) => (
                    <Card key={fund.id} className="card-hover bg-white/95 backdrop-blur-sm border-white/50">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">{fund.name}</CardTitle>
                        <CardDescription>
                          {fund.fund_house} • {fund.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Invested</p>
                            <p className="font-bold text-lg">₹{fund.invested_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Current Value</p>
                            <p className="font-bold text-lg">₹{fund.current_value.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="direct-funds">
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h3 className="font-semibold text-green-800">Direct Mutual Funds</h3>
                    <p className="text-sm text-green-700">
                      Save on commission fees with direct mutual fund investments
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredFunds
                  .filter((fund) => fund.is_direct)
                  .map((fund, index) => (
                    <Card key={fund.id} className="card-hover bg-white/95 backdrop-blur-sm border-white/50">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">{fund.name}</CardTitle>
                        <CardDescription>
                          {fund.fund_house} • {fund.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Invested</p>
                            <p className="font-bold text-lg">₹{fund.invested_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Returns</p>
                            <p className={`font-bold ${fund.returns >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {fund.returns >= 0 ? "+" : ""}₹{fund.returns.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
