"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Shield,
  Globe,
  Zap,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Activity,
  Target,
  Sparkles,
} from "lucide-react"

const marketData = [
  { symbol: "NIFTY", price: "21,737.60", change: "+1.2%", trend: "up" },
  { symbol: "SENSEX", price: "71,595.49", change: "+0.8%", trend: "up" },
  { symbol: "BANKNIFTY", price: "46,821.35", change: "-0.3%", trend: "down" },
  { symbol: "RELIANCE", price: "2,456.80", change: "+2.1%", trend: "up" },
]

const features = [
  {
    icon: BarChart3,
    title: "Real-time Trading",
    description: "Execute trades with live market data and professional tools",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: PieChart,
    title: "Portfolio Analytics",
    description: "Advanced analytics and insights for your investment portfolio",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Target,
    title: "Smart Alerts",
    description: "Intelligent notifications for price targets and market movements",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Activity,
    title: "Technical Analysis",
    description: "Professional charting tools with advanced technical indicators",
    color: "from-orange-500 to-red-500",
  },
]

const stats = [
  { label: "Active Users", value: "50K+", icon: Users },
  { label: "Total Trades", value: "2M+", icon: TrendingUp },
  { label: "Assets Tracked", value: "10K+", icon: BarChart3 },
  { label: "Success Rate", value: "94%", icon: Star },
]

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setIsVisible(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
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

      <div className="relative z-10 pt-24">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`text-center transition-all duration-1000 ${isVisible ? "animate-slide-in-down" : "opacity-0"}`}
            >
              <div className="flex justify-center items-center mb-6">
                <Badge variant="secondary" className="bg-green-100 text-green-800 animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  LIVE MARKET DATA
                </Badge>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 animate-gradient relative">
                Professional Investment
                <br />
                <span className="relative">
                  Trading Platform
                  <Sparkles className="absolute -top-4 -right-8 h-8 w-8 text-yellow-400 animate-bounce" />
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Trade stocks, mutual funds, and SIPs with real-time data, advanced analytics, and professional-grade
                tools. Start your investment journey today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link href="/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 group">
                    Start Trading Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/market">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
                    View Live Market
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Bank-level Security
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-blue-600" />
                  Global Markets
                </div>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-yellow-600" />
                  Real-time Data
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Market Data */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Live Market Overview</h2>
                <p className="text-gray-600">Real-time data updated every second</p>
                <p className="text-sm text-gray-500 mt-2">Last updated: {currentTime.toLocaleTimeString()}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {marketData.map((item, index) => (
                  <Card
                    key={item.symbol}
                    className="card-hover bg-white/90 backdrop-blur-sm border-white/50 animate-slide-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-bold">{item.symbol}</CardTitle>
                        {item.trend === "up" ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{item.price}</div>
                      <div className={`text-sm font-medium ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {item.change}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Trading Tools</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Everything you need to make informed investment decisions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <Card
                      key={feature.title}
                      className="card-hover bg-white/90 backdrop-blur-sm border-white/50 group animate-slide-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader>
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`transition-all duration-1000 delay-700 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Investors</h2>
                <p className="text-gray-600">Join thousands of successful traders</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="text-center animate-slide-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                      <div className="text-gray-600">{stat.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className={`transition-all duration-1000 delay-900 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Start Your Investment Journey?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of investors who trust our platform for their trading needs
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center mt-8 text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                No hidden fees • Free to start • Cancel anytime
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
