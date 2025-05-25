"use client"

import Link from "next/link"
import {
  TrendingUp,
  Shield,
  BarChart3,
  PieChart,
  DollarSign,
  Target,
  ArrowRight,
  Star,
  Sparkles,
  Zap,
  Globe,
  Users,
  Award,
  ChevronRight,
  Play,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsVisible(true)

    // Mouse tracking for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Scroll animation observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".scroll-reveal")
    elements.forEach((el) => observer.observe(el))

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Dynamic Background with Morphing Blobs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>

        {/* Morphing Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-morphing-blob"></div>
        <div
          className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-morphing-blob"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-morphing-blob"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Interactive Mouse Follower */}
        <div
          className="absolute w-64 h-64 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 transition-all duration-1000 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 128,
            top: mousePosition.y - 128,
          }}
        ></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? "animate-slide-in-elegant" : "opacity-0"}`}>
            <div className="inline-flex items-center px-6 py-3 rounded-full glass-card mb-8">
              <Sparkles className="h-5 w-5 text-yellow-400 mr-2 animate-float-elegant" />
              <span className="text-white font-medium">Welcome to the Future of Investment Tracking</span>
              <ChevronRight className="h-4 w-4 text-white/60 ml-2" />
            </div>

            <h1 className="heading-primary text-white mb-6">
              <span className="block">Transform Your</span>
              <span className="block gradient-text-success animate-gradient-shift">Investment Journey</span>
              <span className="block">with Intelligence</span>
            </h1>
          </div>

          <div
            className={`transition-all duration-1000 delay-300 ${isVisible ? "animate-slide-in-elegant" : "opacity-0"}`}
          >
            <p className="text-body max-w-4xl mx-auto mb-12">
              Experience the next generation of portfolio management with AI-powered insights, real-time analytics, and
              stunning visualizations that make complex data simple.
            </p>
          </div>

          <div
            className={`transition-all duration-1000 delay-500 ${isVisible ? "animate-scale-in-elegant" : "opacity-0"}`}
          >
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/signup">
                <button className="btn-primary group">
                  <span className="flex items-center">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </Link>
              <Link href="/market">
                <button className="btn-secondary group">
                  <span className="flex items-center">
                    <Play className="mr-2 h-5 w-5" />
                    Explore Live Market
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div
            className={`transition-all duration-1000 delay-700 ${isVisible ? "animate-scale-in-elegant" : "opacity-0"}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { value: "50K+", label: "Active Investors", icon: Users },
                { value: "$2.5B+", label: "Assets Managed", icon: TrendingUp },
                { value: "99.9%", label: "Uptime Guarantee", icon: Shield },
              ].map((stat, index) => (
                <div key={index} className="modern-card text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2 gradient-text-success">{stat.value}</div>
                  <div className="text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 scroll-reveal">
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
              <Zap className="h-4 w-4 text-yellow-400 mr-2" />
              <span className="text-white/80 text-sm font-medium">Powerful Features</span>
            </div>
            <h2 className="heading-secondary text-white mb-6">
              Everything You Need to
              <span className="gradient-text-warning"> Dominate Markets</span>
            </h2>
            <p className="text-body max-w-3xl mx-auto">
              Our cutting-edge platform combines advanced analytics with intuitive design to give you the competitive
              edge in today's fast-paced markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Real-Time Intelligence",
                description:
                  "Advanced AI algorithms analyze market patterns and provide instant insights for smarter investment decisions.",
                gradient: "from-blue-500 to-cyan-500",
                delay: "0s",
              },
              {
                icon: BarChart3,
                title: "Predictive Analytics",
                description:
                  "Machine learning models forecast market trends and identify potential opportunities before they happen.",
                gradient: "from-purple-500 to-pink-500",
                delay: "0.1s",
              },
              {
                icon: PieChart,
                title: "Smart Diversification",
                description:
                  "Automated portfolio optimization ensures perfect balance across asset classes and risk levels.",
                gradient: "from-green-500 to-teal-500",
                delay: "0.2s",
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                description:
                  "Military-grade encryption and multi-factor authentication protect your financial data 24/7.",
                gradient: "from-red-500 to-orange-500",
                delay: "0.3s",
              },
              {
                icon: DollarSign,
                title: "Transaction Intelligence",
                description:
                  "Smart categorization and tax optimization tools maximize your returns and minimize complexity.",
                gradient: "from-indigo-500 to-purple-500",
                delay: "0.4s",
              },
              {
                icon: Target,
                title: "Goal Achievement",
                description:
                  "AI-powered goal tracking with personalized strategies to reach your financial milestones faster.",
                gradient: "from-pink-500 to-rose-500",
                delay: "0.5s",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="scroll-reveal modern-card group interactive-hover"
                style={{ animationDelay: feature.delay }}
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-all duration-300 animate-glow-pulse`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:gradient-text-success transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 scroll-reveal">
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6">
              <Award className="h-4 w-4 text-yellow-400 mr-2" />
              <span className="text-white/80 text-sm font-medium">Trusted Worldwide</span>
            </div>
            <h2 className="heading-secondary text-white mb-6">
              Join the Elite Circle of
              <span className="gradient-text-warning"> Successful Investors</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Portfolio Manager at Goldman Sachs",
                content:
                  "This platform revolutionized how I manage $500M+ portfolios. The AI insights are incredibly accurate and have improved our returns by 23%.",
                rating: 5,
                avatar: "SC",
                gradient: "from-blue-500 to-purple-600",
              },
              {
                name: "Michael Rodriguez",
                role: "Hedge Fund Manager",
                content:
                  "The predictive analytics helped me identify market opportunities 3 weeks before they materialized. Absolutely game-changing technology.",
                rating: 5,
                avatar: "MR",
                gradient: "from-purple-500 to-pink-600",
              },
              {
                name: "Emily Watson",
                role: "Investment Advisor",
                content:
                  "My clients' satisfaction increased 40% since using this platform. The visualizations make complex data incredibly easy to understand.",
                rating: 5,
                avatar: "EW",
                gradient: "from-green-500 to-teal-600",
              },
            ].map((testimonial, index) => (
              <div key={index} className="scroll-reveal modern-card group">
                <div className="flex items-center mb-6">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center text-white font-bold mr-4`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-white/60">{testimonial.role}</div>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-white/80 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="scroll-reveal">
            <div className="inline-flex items-center px-6 py-3 rounded-full glass-card mb-8">
              <Globe className="h-5 w-5 text-blue-400 mr-2 animate-float-elegant" />
              <span className="text-white font-medium">Join 50,000+ Smart Investors</span>
            </div>

            <h2 className="heading-secondary text-white mb-6">
              Ready to <span className="gradient-text-success">Transform</span> Your Financial Future?
            </h2>

            <p className="text-body mb-12">
              Start your journey with the most advanced investment platform ever created. Your future self will thank
              you.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/signup">
                <button className="btn-primary group animate-glow-pulse">
                  <span className="flex items-center">
                    Begin Your Transformation
                    <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  </span>
                </button>
              </Link>
              <Link href="/about">
                <button className="btn-secondary group">
                  <span className="flex items-center">
                    Learn Our Story
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <Link href="/signup">
        <div className="floating-action micro-bounce">
          <TrendingUp className="h-6 w-6" />
        </div>
      </Link>
    </div>
  )
}
