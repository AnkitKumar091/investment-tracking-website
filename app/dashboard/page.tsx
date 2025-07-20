"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Edit,
  Trash2,
  BarChart3,
  Sparkles,
  Star,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Investment {
  id: string
  name: string
  amount: number
  initial_value: number
  current_value: number
  purchase_date: string
  notes?: string
}

// Mock data for demo purposes
const mockInvestments: Investment[] = [
  {
    id: "1",
    name: "Reliance Industries",
    amount: 50,
    initial_value: 125000,
    current_value: 142500,
    purchase_date: "2024-01-15",
    notes: "Large cap stock with good fundamentals",
  },
  {
    id: "2",
    name: "HDFC Bank",
    amount: 25,
    initial_value: 37500,
    current_value: 41250,
    purchase_date: "2024-02-10",
    notes: "Banking sector investment",
  },
  {
    id: "3",
    name: "Nifty 50 ETF",
    amount: 100,
    initial_value: 15000,
    current_value: 16800,
    purchase_date: "2024-03-05",
    notes: "Diversified index fund",
  },
]

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    amount: "",
    initial_value: "",
    current_value: "",
    purchase_date: "",
    notes: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchInvestments()
      setIsVisible(true)
    }
  }, [user])

  const fetchInvestments = async () => {
    if (!user) return

    try {
      // Check if this is a mock user (for demo purposes)
      if (
        user.id.includes("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".substring(0, 8)) ||
        localStorage.getItem("mock-user")
      ) {
        // Use mock data for demo
        setInvestments(mockInvestments)
        return
      }

      // Try to fetch from database for real users
      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setInvestments(data)
      } else {
        console.error("Error fetching investments:", error)
        // Fallback to mock data if database fails
        setInvestments(mockInvestments)
      }
    } catch (error) {
      console.error("Error in fetchInvestments:", error)
      // Fallback to mock data
      setInvestments(mockInvestments)
    }
  }

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault()

    const newInv: Investment = {
      id: Date.now().toString(),
      name: newInvestment.name,
      amount: Number.parseFloat(newInvestment.amount),
      initial_value: Number.parseFloat(newInvestment.initial_value),
      current_value: Number.parseFloat(newInvestment.current_value),
      purchase_date: newInvestment.purchase_date,
      notes: newInvestment.notes,
    }

    try {
      // Check if this is a mock user
      if (
        user?.id.includes("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".substring(0, 8)) ||
        localStorage.getItem("mock-user")
      ) {
        // Add to local state for demo
        setInvestments((prev) => [newInv, ...prev])
      } else {
        // Try to add to database for real users
        const { error } = await supabase.from("investments").insert([
          {
            ...newInvestment,
            user_id: user?.id,
            amount: Number.parseFloat(newInvestment.amount),
            initial_value: Number.parseFloat(newInvestment.initial_value),
            current_value: Number.parseFloat(newInvestment.current_value),
            category_id: null,
          },
        ])

        if (!error) {
          fetchInvestments()
        } else {
          console.error("Error adding investment:", error)
          // Fallback to local state
          setInvestments((prev) => [newInv, ...prev])
        }
      }

      setIsAddDialogOpen(false)
      setNewInvestment({
        name: "",
        amount: "",
        initial_value: "",
        current_value: "",
        purchase_date: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error in handleAddInvestment:", error)
      alert("Failed to add investment. Please try again.")
    }
  }

  const handleEditInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingInvestment) return

    try {
      // Check if this is a mock user
      if (
        user?.id.includes("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".substring(0, 8)) ||
        localStorage.getItem("mock-user")
      ) {
        // Update local state for demo
        setInvestments((prev) => prev.map((inv) => (inv.id === editingInvestment.id ? editingInvestment : inv)))
      } else {
        // Try to update in database for real users
        const { error } = await supabase
          .from("investments")
          .update({
            name: editingInvestment.name,
            amount: editingInvestment.amount,
            initial_value: editingInvestment.initial_value,
            current_value: editingInvestment.current_value,
            purchase_date: editingInvestment.purchase_date,
            notes: editingInvestment.notes,
          })
          .eq("id", editingInvestment.id)

        if (!error) {
          fetchInvestments()
        } else {
          console.error("Error updating investment:", error)
          // Fallback to local state
          setInvestments((prev) => prev.map((inv) => (inv.id === editingInvestment.id ? editingInvestment : inv)))
        }
      }

      setIsEditDialogOpen(false)
      setEditingInvestment(null)
    } catch (error) {
      console.error("Error in handleEditInvestment:", error)
      alert("Failed to update investment. Please try again.")
    }
  }

  const handleDeleteInvestment = async (id: string) => {
    if (confirm("Are you sure you want to delete this investment?")) {
      try {
        // Check if this is a mock user
        if (
          user?.id.includes("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".substring(0, 8)) ||
          localStorage.getItem("mock-user")
        ) {
          // Remove from local state for demo
          setInvestments((prev) => prev.filter((inv) => inv.id !== id))
        } else {
          // Try to delete from database for real users
          const { error } = await supabase.from("investments").delete().eq("id", id)

          if (!error) {
            fetchInvestments()
          } else {
            console.error("Error deleting investment:", error)
            // Fallback to local state
            setInvestments((prev) => prev.filter((inv) => inv.id !== id))
          }
        }
      } catch (error) {
        console.error("Error in handleDeleteInvestment:", error)
        alert("Failed to delete investment. Please try again.")
      }
    }
  }

  const openEditDialog = (investment: Investment) => {
    setEditingInvestment(investment)
    setIsEditDialogOpen(true)
  }

  const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0)
  const totalInvested = investments.reduce((sum, inv) => sum + inv.initial_value, 0)
  const totalGainLoss = totalValue - totalInvested
  const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center animate-bounce-in">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg animate-typewriter">Loading your portfolio</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-24 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-float-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className={`mb-8 transition-all duration-1000 ${isVisible ? "animate-slide-in-down" : "opacity-0"}`}>
            <div className="text-center mb-6">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-600 to-emerald-600 bg-clip-text text-transparent animate-gradient relative">
                Investment Dashboard
                <Sparkles className="absolute -top-2 -right-8 h-6 w-6 text-yellow-400 animate-bounce" />
              </h1>
              <p className="text-gray-600 mt-3 text-xl animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                Track and manage your investment portfolio with confidence
              </p>
            </div>
          </div>

          {/* Enhanced Summary Cards */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Total Portfolio Value</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-all duration-300 animate-pulse-glow">
                  <DollarSign className="h-4 w-4 text-green-600 animate-wiggle" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 animate-bounce-in">
                  ₹{totalValue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total value of all investments</div>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-all duration-300 hover-rotate">
                  <PieChart className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 animate-zoom-in">
                  ₹{totalInvested.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Total amount invested</div>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${totalGainLoss >= 0 ? "from-green-400/10 to-emerald-400/10" : "from-red-400/10 to-pink-400/10"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Total Gain/Loss</CardTitle>
                <div
                  className={`p-2 rounded-lg transition-all duration-300 hover-bounce ${totalGainLoss >= 0 ? "bg-green-100 group-hover:bg-green-200" : "bg-red-100 group-hover:bg-red-200"}`}
                >
                  {totalGainLoss >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 animate-heartbeat" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 animate-wiggle" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div
                  className={`text-2xl sm:text-3xl font-bold animate-flip-in ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ₹{Math.abs(totalGainLoss).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {totalGainLoss >= 0 ? "Profit" : "Loss"} from investments
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gainLossPercentage >= 0 ? "from-green-400/10 to-emerald-400/10" : "from-red-400/10 to-pink-400/10"} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-gray-600">Return %</CardTitle>
                <div
                  className={`p-2 rounded-lg transition-all duration-300 hover-glow ${gainLossPercentage >= 0 ? "bg-green-100 group-hover:bg-green-200" : "bg-red-100 group-hover:bg-red-200"}`}
                >
                  <BarChart3
                    className={`h-4 w-4 animate-rotate-in ${gainLossPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div
                  className={`text-2xl sm:text-3xl font-bold animate-slide-in-up ${gainLossPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {gainLossPercentage.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Portfolio performance</div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Investments Table */}
          <Card
            className={`card-hover bg-white/90 backdrop-blur-sm border-white/50 transition-all duration-1000 delay-500 relative overflow-hidden ${isVisible ? "animate-slide-in-up" : "opacity-0"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                    Your Investments
                    <Star className="ml-2 h-5 w-5 text-yellow-400 animate-bounce" />
                  </CardTitle>
                  <CardDescription className="text-gray-600">Manage your investment portfolio</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-300 animate-pulse-glow group btn-animate">
                      <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                      Add Investment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md mx-auto animate-bounce-in">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-900">Add New Investment</DialogTitle>
                      <DialogDescription>Enter the details of your new investment.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddInvestment} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Investment Name
                        </Label>
                        <Input
                          id="name"
                          value={newInvestment.name}
                          onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                          required
                          placeholder="e.g., Reliance Industries, Bitcoin, Nifty 50 ETF"
                          className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                            Shares/Units
                          </Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={newInvestment.amount}
                            onChange={(e) => setNewInvestment({ ...newInvestment, amount: e.target.value })}
                            required
                            placeholder="10"
                            className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="initial_value" className="text-sm font-medium text-gray-700">
                            Initial Value (₹)
                          </Label>
                          <Input
                            id="initial_value"
                            type="number"
                            step="0.01"
                            value={newInvestment.initial_value}
                            onChange={(e) => setNewInvestment({ ...newInvestment, initial_value: e.target.value })}
                            required
                            placeholder="50000"
                            className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="current_value" className="text-sm font-medium text-gray-700">
                            Current Value (₹)
                          </Label>
                          <Input
                            id="current_value"
                            type="number"
                            step="0.01"
                            value={newInvestment.current_value}
                            onChange={(e) => setNewInvestment({ ...newInvestment, current_value: e.target.value })}
                            required
                            placeholder="55000"
                            className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="purchase_date" className="text-sm font-medium text-gray-700">
                            Purchase Date
                          </Label>
                          <Input
                            id="purchase_date"
                            type="date"
                            value={newInvestment.purchase_date}
                            onChange={(e) => setNewInvestment({ ...newInvestment, purchase_date: e.target.value })}
                            required
                            className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                          Notes (Optional)
                        </Label>
                        <Input
                          id="notes"
                          value={newInvestment.notes}
                          onChange={(e) => setNewInvestment({ ...newInvestment, notes: e.target.value })}
                          placeholder="Add any notes about this investment"
                          className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-300 btn-animate"
                      >
                        Add Investment
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {investments.length === 0 ? (
                <div className="text-center py-12 animate-fade-in-up">
                  <div className="animate-float mb-4">
                    <PieChart className="h-16 w-16 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-lg mb-4">No investments found</p>
                  <p className="text-gray-400">Add your first investment to get started!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Name</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">Shares/Units</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">Initial Value</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">Current Value</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">Gain/Loss</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">Return %</th>
                          <th className="text-right py-3 px-2 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investments.map((investment, index) => {
                          const gainLoss = investment.current_value - investment.initial_value
                          const returnPercentage = (gainLoss / investment.initial_value) * 100

                          return (
                            <tr
                              key={investment.id}
                              className="border-b border-gray-100 hover:bg-green-50/50 transition-all duration-500 hover-lift"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <td className="py-4 px-2">
                                <div className="font-medium text-gray-900 animate-fade-in-left">{investment.name}</div>
                                {investment.notes && (
                                  <div className="text-sm text-gray-500 mt-1">{investment.notes}</div>
                                )}
                              </td>
                              <td className="py-4 px-2 text-right font-medium animate-fade-in-right">
                                {investment.amount}
                              </td>
                              <td className="py-4 px-2 text-right font-medium animate-zoom-in">
                                ₹{investment.initial_value.toLocaleString()}
                              </td>
                              <td className="py-4 px-2 text-right font-medium animate-bounce-in">
                                ₹{investment.current_value.toLocaleString()}
                              </td>
                              <td
                                className={`py-4 px-2 text-right font-bold animate-flip-in ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {gainLoss >= 0 ? "+" : "-"}₹{Math.abs(gainLoss).toLocaleString()}
                              </td>
                              <td
                                className={`py-4 px-2 text-right font-bold animate-slide-in-up ${returnPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {returnPercentage >= 0 ? "+" : ""}
                                {returnPercentage.toFixed(2)}%
                              </td>
                              <td className="py-4 px-2 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(investment)}
                                    className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover-bounce"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteInvestment(investment.id)}
                                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 hover-wiggle"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {investments.map((investment, index) => {
                      const gainLoss = investment.current_value - investment.initial_value
                      const returnPercentage = (gainLoss / investment.initial_value) * 100

                      return (
                        <Card
                          key={investment.id}
                          className="card-hover bg-white/95 backdrop-blur-sm border-white/50 animate-slide-in-up"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 animate-fade-in-left">
                                  {investment.name}
                                </h3>
                                <p className="text-sm text-gray-600">{investment.amount} shares/units</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(investment)}
                                  className="hover:bg-blue-50 transition-all duration-300 hover-bounce"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteInvestment(investment.id)}
                                  className="hover:bg-red-50 hover:text-red-600 transition-all duration-300 hover-wiggle"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="bg-gray-50 rounded-lg p-3 hover-glow">
                                <p className="text-gray-600 font-medium">Initial Value</p>
                                <p className="font-bold text-lg animate-zoom-in">
                                  ₹{investment.initial_value.toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3 hover-glow">
                                <p className="text-gray-600 font-medium">Current Value</p>
                                <p className="font-bold text-lg animate-bounce-in">
                                  ₹{investment.current_value.toLocaleString()}
                                </p>
                              </div>
                              <div
                                className={`rounded-lg p-3 hover-glow ${gainLoss >= 0 ? "bg-green-50" : "bg-red-50"}`}
                              >
                                <p className="text-gray-600 font-medium">Gain/Loss</p>
                                <p
                                  className={`font-bold text-lg animate-flip-in ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {gainLoss >= 0 ? "+" : "-"}₹{Math.abs(gainLoss).toLocaleString()}
                                </p>
                              </div>
                              <div
                                className={`rounded-lg p-3 hover-glow ${returnPercentage >= 0 ? "bg-green-50" : "bg-red-50"}`}
                              >
                                <p className="text-gray-600 font-medium">Return %</p>
                                <p
                                  className={`font-bold text-lg animate-slide-in-up ${returnPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {returnPercentage >= 0 ? "+" : ""}
                                  {returnPercentage.toFixed(2)}%
                                </p>
                              </div>
                            </div>

                            {investment.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                  <strong>Notes:</strong> {investment.notes}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Investment Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="w-[95vw] max-w-md mx-auto animate-bounce-in">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">Edit Investment</DialogTitle>
                <DialogDescription>Update the details of your investment.</DialogDescription>
              </DialogHeader>
              {editingInvestment && (
                <form onSubmit={handleEditInvestment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                      Investment Name
                    </Label>
                    <Input
                      id="edit-name"
                      value={editingInvestment.name}
                      onChange={(e) => setEditingInvestment({ ...editingInvestment, name: e.target.value })}
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-amount" className="text-sm font-medium text-gray-700">
                        Shares/Units
                      </Label>
                      <Input
                        id="edit-amount"
                        type="number"
                        step="0.01"
                        value={editingInvestment.amount}
                        onChange={(e) =>
                          setEditingInvestment({ ...editingInvestment, amount: Number.parseFloat(e.target.value) })
                        }
                        required
                        className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-initial_value" className="text-sm font-medium text-gray-700">
                        Initial Value (₹)
                      </Label>
                      <Input
                        id="edit-initial_value"
                        type="number"
                        step="0.01"
                        value={editingInvestment.initial_value}
                        onChange={(e) =>
                          setEditingInvestment({
                            ...editingInvestment,
                            initial_value: Number.parseFloat(e.target.value),
                          })
                        }
                        required
                        className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-current_value" className="text-sm font-medium text-gray-700">
                        Current Value (₹)
                      </Label>
                      <Input
                        id="edit-current_value"
                        type="number"
                        step="0.01"
                        value={editingInvestment.current_value}
                        onChange={(e) =>
                          setEditingInvestment({
                            ...editingInvestment,
                            current_value: Number.parseFloat(e.target.value),
                          })
                        }
                        required
                        className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-purchase_date" className="text-sm font-medium text-gray-700">
                        Purchase Date
                      </Label>
                      <Input
                        id="edit-purchase_date"
                        type="date"
                        value={editingInvestment.purchase_date}
                        onChange={(e) => setEditingInvestment({ ...editingInvestment, purchase_date: e.target.value })}
                        required
                        className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-notes" className="text-sm font-medium text-gray-700">
                      Notes (Optional)
                    </Label>
                    <Input
                      id="edit-notes"
                      value={editingInvestment.notes || ""}
                      onChange={(e) => setEditingInvestment({ ...editingInvestment, notes: e.target.value })}
                      placeholder="Add any notes about this investment"
                      className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-300 btn-animate"
                  >
                    Update Investment
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
