"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  PieChart,
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  FileText,
  Download,
  Calculator,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Landmark,
  Building,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface PortfolioSummary {
  totalValue: number
  totalInvested: number
  totalReturns: number
  returnsPercentage: number
  xirr: number
}

interface AssetAllocation {
  category: string
  value: number
  percentage: number
  returns: number
  returnsPercentage: number
}

interface Investment {
  id: string
  name: string
  type: "mutual_fund" | "stock" | "fd" | "gold" | "bond"
  category: string
  invested_amount: number
  current_value: number
  returns: number
  returns_percentage: number
  purchase_date: string
  maturity_date?: string
  interest_rate?: number
}

interface TaxReport {
  financial_year: string
  short_term_gains: number
  long_term_gains: number
  total_gains: number
  tax_liability: number
}

export default function PortfolioPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalInvested: 0,
    totalReturns: 0,
    returnsPercentage: 0,
    xirr: 0,
  })
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [taxReports, setTaxReports] = useState<TaxReport[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchPortfolioData()
      setIsVisible(true)
    }
  }, [user])

  const fetchPortfolioData = async () => {
    if (!user) return

    try {
      // Fetch all investments
      const [mutualFunds, stocks, fds, gold] = await Promise.all([
        supabase.from("mutual_funds").select("*").eq("user_id", user.id),
        supabase.from("investments").select("*").eq("user_id", user.id),
        supabase.from("fixed_deposits").select("*").eq("user_id", user.id),
        supabase.from("gold_investments").select("*").eq("user_id", user.id),
      ])

      // Combine all investments
      const allInvestments: Investment[] = [
        ...(mutualFunds.data || []).map((mf) => ({
          id: mf.id,
          name: mf.name,
          type: "mutual_fund" as const,
          category: mf.category,
          invested_amount: mf.invested_amount,
          current_value: mf.current_value,
          returns: mf.returns,
          returns_percentage: mf.returns_percentage,
          purchase_date: mf.purchase_date,
        })),
        ...(stocks.data || []).map((stock) => ({
          id: stock.id,
          name: stock.name,
          type: "stock" as const,
          category: "Equity",
          invested_amount: stock.initial_value,
          current_value: stock.current_value,
          returns: stock.current_value - stock.initial_value,
          returns_percentage: ((stock.current_value - stock.initial_value) / stock.initial_value) * 100,
          purchase_date: stock.purchase_date,
        })),
        ...(fds.data || []).map((fd) => ({
          id: fd.id,
          name: fd.bank_name + " FD",
          type: "fd" as const,
          category: "Fixed Income",
          invested_amount: fd.principal_amount,
          current_value: fd.maturity_amount,
          returns: fd.maturity_amount - fd.principal_amount,
          returns_percentage: ((fd.maturity_amount - fd.principal_amount) / fd.principal_amount) * 100,
          purchase_date: fd.start_date,
          maturity_date: fd.maturity_date,
          interest_rate: fd.interest_rate,
        })),
        ...(gold.data || []).map((g) => ({
          id: g.id,
          name: "Gold Investment",
          type: "gold" as const,
          category: "Commodity",
          invested_amount: g.invested_amount,
          current_value: g.current_value,
          returns: g.current_value - g.invested_amount,
          returns_percentage: ((g.current_value - g.invested_amount) / g.invested_amount) * 100,
          purchase_date: g.purchase_date,
        })),
      ]

      setInvestments(allInvestments)

      // Calculate portfolio summary
      const totalInvested = allInvestments.reduce((sum, inv) => sum + inv.invested_amount, 0)
      const totalValue = allInvestments.reduce((sum, inv) => sum + inv.current_value, 0)
      const totalReturns = totalValue - totalInvested
      const returnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

      // Calculate XIRR (simplified calculation)
      const xirr = calculateXIRR(allInvestments)

      setPortfolioSummary({
        totalValue,
        totalInvested,
        totalReturns,
        returnsPercentage,
        xirr,
      })

      // Calculate asset allocation
      const allocation = calculateAssetAllocation(allInvestments)
      setAssetAllocation(allocation)

      // Generate tax reports
      const taxData = generateTaxReports(allInvestments)
      setTaxReports(taxData)
    } catch (error) {
      console.error("Error fetching portfolio data:", error)
    }
  }

  const calculateXIRR = (investments: Investment[]): number => {
    // Simplified XIRR calculation
    // In a real application, you would use a more sophisticated algorithm
    const totalReturns = investments.reduce((sum, inv) => sum + inv.returns, 0)
    const totalInvested = investments.reduce((sum, inv) => sum + inv.invested_amount, 0)
    const avgHoldingPeriod =
      investments.reduce((sum, inv) => {
        const daysDiff = Math.abs(new Date().getTime() - new Date(inv.purchase_date).getTime()) / (1000 * 60 * 60 * 24)
        return sum + daysDiff
      }, 0) / investments.length

    if (totalInvested === 0 || avgHoldingPeriod === 0) return 0

    const annualizedReturn = (totalReturns / totalInvested) * (365 / avgHoldingPeriod) * 100
    return Math.min(Math.max(annualizedReturn, -100), 100) // Cap between -100% and 100%
  }

  const calculateAssetAllocation = (investments: Investment[]): AssetAllocation[] => {
    const categoryMap = new Map<string, { value: number; invested: number; returns: number }>()

    investments.forEach((inv) => {
      const existing = categoryMap.get(inv.category) || { value: 0, invested: 0, returns: 0 }
      categoryMap.set(inv.category, {
        value: existing.value + inv.current_value,
        invested: existing.invested + inv.invested_amount,
        returns: existing.returns + inv.returns,
      })
    })

    const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0)

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      returns: data.returns,
      returnsPercentage: data.invested > 0 ? (data.returns / data.invested) * 100 : 0,
    }))
  }

  const generateTaxReports = (investments: Investment[]): TaxReport[] => {
    const currentYear = new Date().getFullYear()
    const reports: TaxReport[] = []

    for (let year = currentYear - 2; year <= currentYear; year++) {
      let shortTermGains = 0
      let longTermGains = 0

      investments.forEach((inv) => {
        const purchaseDate = new Date(inv.purchase_date)
        const holdingPeriod = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)

        if (inv.returns > 0) {
          if (inv.type === "mutual_fund" || inv.type === "stock") {
            if (holdingPeriod > 365) {
              longTermGains += inv.returns
            } else {
              shortTermGains += inv.returns
            }
          }
        }
      })

      const totalGains = shortTermGains + longTermGains
      const taxLiability = shortTermGains * 0.15 + longTermGains * 0.1 // Simplified tax calculation

      reports.push({
        financial_year: `${year}-${year + 1}`,
        short_term_gains: shortTermGains,
        long_term_gains: longTermGains,
        total_gains: totalGains,
        tax_liability: taxLiability,
      })
    }

    return reports
  }

  const downloadTaxReport = (year: string) => {
    const report = taxReports.find((r) => r.financial_year === year)
    if (!report) return

    const csvContent = `Financial Year,Short Term Gains,Long Term Gains,Total Gains,Tax Liability
${report.financial_year},${report.short_term_gains},${report.long_term_gains},${report.total_gains},${report.tax_liability}`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tax-report-${year}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center animate-bounce-in">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`mb-8 transition-all duration-1000 ${isVisible ? "animate-slide-in-down" : "opacity-0"}`}>
            <div className="text-center mb-6">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-600 to-teal-600 bg-clip-text text-transparent animate-gradient relative">
                Portfolio Management
                <Sparkles className="absolute -top-2 -right-8 h-6 w-6 text-yellow-400 animate-bounce" />
              </h1>
              <p className="text-gray-600 mt-3 text-xl">
                Complete portfolio tracking with XIRR calculation and tax reports
              </p>
            </div>
          </div>

          {/* Portfolio Summary Cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900">₹{portfolioSummary.totalValue.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Portfolio value</p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Invested</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{portfolioSummary.totalInvested.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">Total invested</p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${portfolioSummary.totalReturns >= 0 ? "from-green-400/10 to-emerald-400/10" : "from-red-400/10 to-pink-400/10"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Returns</CardTitle>
                {portfolioSummary.totalReturns >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent className="relative z-10">
                <div
                  className={`text-2xl font-bold ${portfolioSummary.totalReturns >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {portfolioSummary.totalReturns >= 0 ? "+" : ""}₹{portfolioSummary.totalReturns.toLocaleString()}
                </div>
                <p className={`text-xs mt-1 ${portfolioSummary.totalReturns >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {portfolioSummary.returnsPercentage >= 0 ? "+" : ""}
                  {portfolioSummary.returnsPercentage.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">XIRR</CardTitle>
                <Calculator className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className={`text-2xl font-bold ${portfolioSummary.xirr >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {portfolioSummary.xirr >= 0 ? "+" : ""}
                  {portfolioSummary.xirr.toFixed(2)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Annualized return</p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Holdings</CardTitle>
                <PieChart className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900">{investments.length}</div>
                <p className="text-xs text-gray-500 mt-1">Total investments</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="tax-reports">Tax Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Asset Allocation Chart */}
                <Card className="card-hover bg-white/95 backdrop-blur-sm border-white/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2 text-emerald-600" />
                      Asset Allocation
                    </CardTitle>
                    <CardDescription>Distribution of your investments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assetAllocation.map((asset, index) => (
                        <div key={asset.category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                                index === 0
                                  ? "from-emerald-400 to-teal-500"
                                  : index === 1
                                    ? "from-blue-400 to-indigo-500"
                                    : index === 2
                                      ? "from-purple-400 to-pink-500"
                                      : index === 3
                                        ? "from-orange-400 to-red-500"
                                        : "from-gray-400 to-gray-500"
                              }`}
                            ></div>
                            <span className="font-medium text-gray-900">{asset.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">₹{asset.value.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">{asset.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card className="card-hover bg-white/95 backdrop-blur-sm border-white/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Performance Summary
                    </CardTitle>
                    <CardDescription>Your investment performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">Overall Returns</span>
                          <span
                            className={`text-sm font-bold ${portfolioSummary.returnsPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {portfolioSummary.returnsPercentage.toFixed(2)}%
                          </span>
                        </div>
                        <Progress value={Math.min(Math.abs(portfolioSummary.returnsPercentage), 100)} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">XIRR (Annualized)</span>
                          <span
                            className={`text-sm font-bold ${portfolioSummary.xirr >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {portfolioSummary.xirr.toFixed(2)}%
                          </span>
                        </div>
                        <Progress value={Math.min(Math.abs(portfolioSummary.xirr), 100)} className="h-2" />
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-emerald-600">
                              {assetAllocation.filter((a) => a.returnsPercentage > 0).length}
                            </div>
                            <div className="text-sm text-gray-600">Profitable Assets</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-red-600">
                              {assetAllocation.filter((a) => a.returnsPercentage < 0).length}
                            </div>
                            <div className="text-sm text-gray-600">Loss Making Assets</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="allocation">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assetAllocation.map((asset, index) => (
                  <Card key={asset.category} className="card-hover bg-white/95 backdrop-blur-sm border-white/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          {asset.category === "Large Cap" && <Building className="h-5 w-5 mr-2 text-blue-600" />}
                          {asset.category === "Fixed Income" && <Landmark className="h-5 w-5 mr-2 text-green-600" />}
                          {asset.category === "Commodity" && <Coins className="h-5 w-5 mr-2 text-yellow-600" />}
                          {asset.category === "Equity" && <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />}
                          {!["Large Cap", "Fixed Income", "Commodity", "Equity"].includes(asset.category) && (
                            <PieChart className="h-5 w-5 mr-2 text-gray-600" />
                          )}
                          {asset.category}
                        </span>
                        <Badge variant={asset.returnsPercentage >= 0 ? "default" : "destructive"}>
                          {asset.returnsPercentage >= 0 ? "+" : ""}
                          {asset.returnsPercentage.toFixed(1)}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Allocation</span>
                            <span className="font-bold">{asset.percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={asset.percentage} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Value</p>
                            <p className="font-bold text-lg">₹{asset.value.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Returns</p>
                            <p
                              className={`font-bold text-lg ${asset.returns >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {asset.returns >= 0 ? "+" : ""}₹{asset.returns.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="holdings">
              <div className="space-y-6">
                {["mutual_fund", "stock", "fd", "gold"].map((type) => {
                  const typeInvestments = investments.filter((inv) => inv.type === type)
                  if (typeInvestments.length === 0) return null

                  const typeLabels = {
                    mutual_fund: "Mutual Funds",
                    stock: "Stocks",
                    fd: "Fixed Deposits",
                    gold: "Gold Investments",
                  }

                  return (
                    <Card key={type} className="card-hover bg-white/95 backdrop-blur-sm border-white/50">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          {type === "mutual_fund" && <PieChart className="h-5 w-5 mr-2 text-blue-600" />}
                          {type === "stock" && <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />}
                          {type === "fd" && <Landmark className="h-5 w-5 mr-2 text-green-600" />}
                          {type === "gold" && <Coins className="h-5 w-5 mr-2 text-yellow-600" />}
                          {typeLabels[type as keyof typeof typeLabels]}
                        </CardTitle>
                        <CardDescription>
                          {typeInvestments.length} holdings • ₹
                          {typeInvestments.reduce((sum, inv) => sum + inv.current_value, 0).toLocaleString()} value
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 font-semibold text-gray-700">Name</th>
                                <th className="text-right py-2 font-semibold text-gray-700">Invested</th>
                                <th className="text-right py-2 font-semibold text-gray-700">Current Value</th>
                                <th className="text-right py-2 font-semibold text-gray-700">Returns</th>
                                <th className="text-right py-2 font-semibold text-gray-700">%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {typeInvestments.map((inv) => (
                                <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-3">
                                    <div>
                                      <div className="font-medium text-gray-900">{inv.name}</div>
                                      <div className="text-sm text-gray-500">{inv.category}</div>
                                    </div>
                                  </td>
                                  <td className="py-3 text-right font-medium">
                                    ₹{inv.invested_amount.toLocaleString()}
                                  </td>
                                  <td className="py-3 text-right font-medium">₹{inv.current_value.toLocaleString()}</td>
                                  <td
                                    className={`py-3 text-right font-bold ${inv.returns >= 0 ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {inv.returns >= 0 ? "+" : ""}₹{inv.returns.toLocaleString()}
                                  </td>
                                  <td
                                    className={`py-3 text-right font-bold ${inv.returns_percentage >= 0 ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {inv.returns_percentage >= 0 ? "+" : ""}
                                    {inv.returns_percentage.toFixed(2)}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="tax-reports">
              <div className="space-y-6">
                <Card className="card-hover bg-white/95 backdrop-blur-sm border-white/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Capital Gains Tax Reports
                    </CardTitle>
                    <CardDescription>Download your tax reports for different financial years</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {taxReports.map((report) => (
                        <div
                          key={report.financial_year}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">FY {report.financial_year}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                              <div>
                                <p className="text-gray-600">Short Term Gains</p>
                                <p className="font-medium">₹{report.short_term_gains.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Long Term Gains</p>
                                <p className="font-medium">₹{report.long_term_gains.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Total Gains</p>
                                <p className="font-medium">₹{report.total_gains.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Tax Liability</p>
                                <p className="font-medium text-red-600">₹{report.tax_liability.toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTaxReport(report.financial_year)}
                            className="ml-4"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-hover bg-white/95 backdrop-blur-sm border-white/50">
                  <CardHeader>
                    <CardTitle>Tax Calculation Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        • <strong>Short Term Capital Gains:</strong> Holdings less than 1 year - taxed at 15%
                      </p>
                      <p>
                        • <strong>Long Term Capital Gains:</strong> Holdings more than 1 year - taxed at 10% (above ₹1
                        lakh exemption)
                      </p>
                      <p>
                        • <strong>Mutual Funds:</strong> Equity funds follow equity taxation rules
                      </p>
                      <p>
                        • <strong>Debt Funds:</strong> Different taxation rules apply (not calculated here)
                      </p>
                      <p className="text-orange-600 font-medium">
                        ⚠️ This is a simplified calculation. Please consult a tax advisor for accurate tax planning.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
