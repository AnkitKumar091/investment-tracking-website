"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { TrendingUp, Menu, X, User, ChevronDown, Sparkles, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass-navbar" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 animate-glow-pulse">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-float-elegant opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">InvestTracker</span>
                <div className="text-xs text-white/60 font-medium">AI-Powered</div>
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {[
              { href: "/", label: "Home" },
              { href: "/market", label: "Live Market" },
              ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-white/80 hover:text-white transition-colors duration-300 font-medium group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="h-5 w-5 text-white/60 hover:text-white transition-colors cursor-pointer" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3 glass-card px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-300 text-white"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="hidden xl:inline font-medium max-w-32 truncate">
                        {user.email?.split("@")[0]}
                      </span>
                      <ChevronDown className="h-3 w-3 text-white/60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card border-white/20">
                    <DropdownMenuItem className="text-white/80">{user.email}</DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="text-red-400 hover:bg-red-500/20">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="btn-secondary">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="btn-primary">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="glass-card p-3 rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`absolute inset-0 h-6 w-6 text-white transition-all duration-500 ${
                    isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                  }`}
                />
                <X
                  className={`absolute inset-0 h-6 w-6 text-white transition-all duration-500 ${
                    isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                  }`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="glass-card rounded-2xl mt-4 p-6 space-y-4">
              {[
                { href: "/", label: "Home" },
                { href: "/market", label: "Live Market" },
                ...(user ? [{ href: "/dashboard", label: "Dashboard" }] : []),
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-white hover:text-blue-300 transition-colors duration-300 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                <div className="pt-4 border-t border-white/20 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.email?.split("@")[0]}</div>
                      <div className="text-white/60 text-sm">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    variant="ghost"
                    className="w-full text-left text-red-400 hover:text-red-300 transition-colors py-2"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/20 space-y-3">
                  <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="btn-secondary w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button className="btn-primary w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
