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
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Calendar,
  Pause,
  Play,
  Square,
  DollarSign,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

interface SIPInvestment {
  id: string
  fund_name: string
  fund_house: string
  category: string
  monthly_amount: number
  start_date: string
  next_installment: string
  total_invested: number
  current_value: number
  installments_completed: number
  expected_installments: number
  status: "active" | "paused" | "stopped"
  nav: number
  total_units: number
  returns: number
  returns_percentage: number
  auto_debit: boolean
}

const SIP_FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "weekly", label: "Weekly" },
]

// Mock data for demonstration
const mockSIPInvestments: SIPInvestment[] = [
  {
    id: "1",
    fund_name: "SBI Blue Chip Fund",
    fund_house: "SBI Mutual Fund",
    category: "Large Cap",
    monthly_amount: 5000,
    start_date: "2023-01-01",
    next_installment: "2024-02-01",
    total_invested: 60000,
    current_value: 62340,
    installments_completed: 12,
    expected_installments: 60,
    status: "active",
    nav: 125.5,
    total_units: 496.81,
    returns: 2340,
    returns_percentage: 3.9,
    auto_debit: true,
  },
  {
    id: "2",
    fund_name: "HDFC Top 100 Fund",
    fund_house: "HDFC Mutual Fund",
    category: "Large Cap",
    monthly_amount: 3000,
    start_date: "2023-06-01",
    next_installment: "2024-02-01",
    total_invested: 24000,
    current_value: 25120,
    installments_completed: 8,
    expected_installments: 36,
    status: "active",
    nav: 890.45,
    total_units: 28.23,
    returns: 1120,
    returns_percentage: 4.67,
    auto_debit: true,
  },
  {
    id: "3",
    fund_name: "Axis Bluechip Fund",
    fund_house: "Axis Mutual Fund",
    category: "Large Cap",
    monthly_amount: 2000,
    start_date: "2023-03-01",
    next_installment: "2024-02-01",
    total_invested: 22000,
    current_value: 21890,
    installments_completed: 11,
    expected_installments: 24,
    status: "paused",
    nav: 67.89,
    total_units: 322.45,
    returns: -110,
    returns_percentage: -0.5,
    auto_debit: false,
  },
]

export default function SIPPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [sipInvestments, setSipInvestments] = useState<SIPInvestment[]>(mockSIPInvestments)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const [newSIP, setNewSIP] = useState({
    fund_name: "",
    fund_house: "",
    category: "",
    monthly_amount: "",
    start_date: "",
    frequency: "monthly",
    expected_installments: "",
    auto_debit: true,
  })

  useEffect(() => {
    setIsVisible(true)
    // Auto-login for demo purposes if no user
    if (!loading && !user) {
      // For demo purposes, we'll show the page content anyway
      console.log("Demo mode: showing SIP page")
    }
  }, [user, loading, router])

  const handleAddSIP = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const nextInstallmentDate = new Date(newSIP.start_date)
      nextInstallmentDate.setMonth(nextInstallmentDate.getMonth() + 1)

      const newSIPInvestment: SIPInvestment = {
        id: Date.now().toString(),
        fund_name: newSIP.fund_name,
        fund_house: newSIP.fund_house,
        category: newSIP.category,
        monthly_amount: Number.parseFloat(newSIP.monthly_amount),
        start_date: newSIP.start_date,
        next_installment: nextInstallmentDate.toISOString().split("T")[0],
        expected_installments: Number.parseInt(newSIP.expected_installments),
        installments_completed: 0,
        total_invested: 0,
        current_value: 0,
        total_units: 0,
        nav: 0,
        returns: 0,
        returns_percentage: 0,
        status: "active",
        auto_debit: newSIP.auto_debit,
      }

      setSipInvestments([...sipInvestments, newSIPInvestment])
      setIsAddDialogOpen(false)
      setNewSIP({
        fund_name: "",
        fund_house: "",
        category: "",
        monthly_amount: "",
        start_date: "",
        frequency: "monthly",
        expected_installments: "",
        auto_debit: true,
      })

      alert("SIP created successfully!")
    } catch (error) {
      console.error("Error adding SIP:", error)
      alert("Failed to create SIP. Please try again.")
    }
  }

  const handleSIPAction = async (sipId: string, action: "pause" | "resume" | "stop") => {
    try {
      const newStatus = action === "pause" ? "paused" : action === "resume" ? "active" : "stopped"

      setSipInvestments(sipInvestments.map((sip) => (sip.id === sipId ? { ...sip, status: newStatus } : sip)))

      alert(`SIP ${action}d successfully!`)
    } catch (error) {
      console.error(`Error ${action}ing SIP:`, error)
      alert(`Failed to ${action} SIP. Please try again.`)
    }
  }

  const activeSIPs = sipInvestments.filter((sip) => sip.status === "active")
  const totalSIPAmount = sipInvestments.reduce((sum, sip) => sum + sip.monthly_amount, 0)
  const totalSIPInvested = sipInvestments.reduce((sum, sip) => sum + sip.total_invested, 0)
  const totalSIPValue = sipInvestments.reduce((sum, sip) => sum + sip.current_value, 0)
  const totalSIPReturns = totalSIPValue - totalSIPInvested
  const totalSIPReturnsPercentage = totalSIPInvested > 0 ? (totalSIPReturns / totalSIPInvested) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="text-center animate-bounce-in">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading SIP investments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 pt-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className={`mb-8 transition-all duration-1000 ${isVisible ? "animate-slide-in-down" : "opacity-0"}`}>
            <div className="text-center mb-6">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient relative">
                SIP Investments
                <Sparkles className="absolute -top-2 -right-8 h-6 w-6 text-yellow-400 animate-bounce" />
              </h1>
              <p className="text-gray-600 mt-3 text-xl">
                Systematic Investment Plan - Invest regularly, grow consistently
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Active SIPs</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900">{activeSIPs.length}</div>
                <p className="text-xs text-gray-500 mt-1">Running investments</p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Monthly SIP Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900">₹{totalSIPAmount.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Total monthly investment</p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-gray-900">₹{totalSIPInvested.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Via SIP investments</p>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${totalSIPReturns >= 0 ? "from-green-400/10 to-emerald-400/10" : "from-red-400/10 to-pink-400/10"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">SIP Returns</CardTitle>
                {totalSIPReturns >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent className="relative z-10">
                <div className={`text-2xl font-bold ${totalSIPReturns >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalSIPReturns >= 0 ? "+" : ""}₹{totalSIPReturns.toLocaleString()}
                </div>
                <p className={`text-xs mt-1 ${totalSIPReturns >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalSIPReturnsPercentage >= 0 ? "+" : ""}
                  {totalSIPReturnsPercentage.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Add SIP Button */}
          <div className="mb-8 flex justify-end">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Start New SIP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Start New SIP</DialogTitle>
                  <DialogDescription>Set up a systematic investment plan for regular investing</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddSIP} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fund_name">Fund Name</Label>
                      <Input
                        id="fund_name"
                        value={newSIP.fund_name}
                        onChange={(e) => setNewSIP({ ...newSIP, fund_name: e.target.value })}
                        placeholder="e.g., SBI Blue Chip Fund"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fund_house">Fund House</Label>
                      <Input
                        id="fund_house"
                        value={newSIP.fund_house}
                        onChange={(e) => setNewSIP({ ...newSIP, fund_house: e.target.value })}
                        placeholder="e.g., SBI Mutual Fund"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newSIP.category}
                        onChange={(e) => setNewSIP({ ...newSIP, category: e.target.value })}
                        placeholder="e.g., Large Cap"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monthly_amount">Monthly Amount (₹)</Label>
                      <Input
                        id="monthly_amount"
                        type="number"
                        value={newSIP.monthly_amount}
                        onChange={(e) => setNewSIP({ ...newSIP, monthly_amount: e.target.value })}
                        placeholder="5000"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newSIP.start_date}
                        onChange={(e) => setNewSIP({ ...newSIP, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={newSIP.frequency}
                        onValueChange={(value) => setNewSIP({ ...newSIP, frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SIP_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expected_installments">Expected Installments</Label>
                      <Input
                        id="expected_installments"
                        type="number"
                        value={newSIP.expected_installments}
                        onChange={(e) => setNewSIP({ ...newSIP, expected_installments: e.target.value })}
                        placeholder="60"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_debit"
                      checked={newSIP.auto_debit}
                      onChange={(e) => setNewSIP({ ...newSIP, auto_debit: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="auto_debit">Enable Auto Debit</Label>
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Start SIP
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* SIP Investments List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sipInvestments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No SIP investments found</p>
                <p className="text-gray-400">Start your first SIP to begin systematic investing!</p>
              </div>
            ) : (
              sipInvestments.map((sip, index) => (
                <Card
                  key={sip.id}
                  className="card-hover bg-white/95 backdrop-blur-sm border-white/50 animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-1">{sip.fund_name}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {sip.fund_house} • {sip.category}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          sip.status === "active" ? "default" : sip.status === "paused" ? "secondary" : "destructive"
                        }
                      >
                        {sip.status.charAt(0).toUpperCase() + sip.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Monthly Amount</p>
                        <p className="font-bold text-lg">₹{sip.monthly_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Invested</p>
                        <p className="font-bold text-lg">₹{sip.total_invested.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Installments</p>
                        <p className="font-medium">
                          {sip.installments_completed}/{sip.expected_installments}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Next Date</p>
                        <p className="font-medium">{new Date(sip.next_installment).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {sip.total_invested > 0 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Current Value</span>
                          <span className="font-bold">₹{sip.current_value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Returns</span>
                          <span className={`font-bold ${sip.returns >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {sip.returns >= 0 ? "+" : ""}₹{sip.returns.toLocaleString()}
                            <span className="text-sm ml-1">
                              ({sip.returns_percentage >= 0 ? "+" : ""}
                              {sip.returns_percentage.toFixed(2)}%)
                            </span>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {sip.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSIPAction(sip.id, "pause")}
                          className="flex-1"
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {sip.status === "paused" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSIPAction(sip.id, "resume")}
                          className="flex-1"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      {sip.status !== "stopped" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSIPAction(sip.id, "stop")}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Stop
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
