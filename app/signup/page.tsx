"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, UserPlus, Sparkles, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const { signUp, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
    // Redirect if already logged in
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await signUp(email, password, fullName)
    if (result.error) {
      setError(result.error)
    } else {
      router.push("/dashboard")
    }
  }

  if (user && !loading) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
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
        {[...Array(15)].map((_, i) => (
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

      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div
          className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}
        >
          <div className="mb-8">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-green-600 to-emerald-600 bg-clip-text text-transparent animate-gradient relative">
              Join Us Today
              <Sparkles className="absolute -top-2 -right-8 h-8 w-8 text-yellow-400 animate-bounce" />
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mt-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              Start your investment journey
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4 mb-8">
            <div
              className="flex items-center justify-center lg:justify-start space-x-3 animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="p-2 bg-green-100 rounded-lg animate-pulse-glow">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">Track your portfolio performance</span>
            </div>
            <div
              className="flex items-center justify-center lg:justify-start space-x-3 animate-fade-in-up"
              style={{ animationDelay: "0.7s" }}
            >
              <div className="p-2 bg-blue-100 rounded-lg animate-pulse-glow">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">Secure and reliable platform</span>
            </div>
            <div
              className="flex items-center justify-center lg:justify-start space-x-3 animate-fade-in-up"
              style={{ animationDelay: "0.9s" }}
            >
              <div className="p-2 bg-purple-100 rounded-lg animate-pulse-glow">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">Real-time market data</span>
            </div>
          </div>

          {/* Demo notice */}
          <div
            className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg p-4 animate-fade-in-up"
            style={{ animationDelay: "1.1s" }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-5 w-5 text-green-600 animate-bounce" />
              <span className="font-semibold text-green-800">Demo Mode Active</span>
            </div>
            <p className="text-green-700 text-sm">Create any account instantly - no verification required for demo!</p>
            <p className="text-green-600 text-xs mt-1 font-medium">Try: John Doe / john@example.com / password123</p>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? "animate-slide-in-right" : "opacity-0"}`}>
          <Card className="card-hover bg-white/90 backdrop-blur-sm border-white/50 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                <UserPlus className="mr-2 h-6 w-6 text-green-600 animate-wiggle" />
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-600">
                Join thousands of investors managing their portfolios
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create a password (min 6 characters)"
                      autoComplete="new-password"
                      className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-green-500 hover-glow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover-bounce"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50 animate-shake">
                    <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all duration-300 btn-animate relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </div>
                  )}
                </Button>

                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200 hover:underline"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
