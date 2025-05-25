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
      className="fixed top-0 left-0 right-0 z-[99999] bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-600/95 backdrop-blur-xl border-b border-white/20 shadow-2xl"
      style={{
        zIndex: 99999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(59, 130, 246, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-white/30">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white drop-shadow-lg">InvestTracker</span>
                <div className="text-xs text-white/80 font-medium">AI-Powered</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
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
                className="relative text-white/90 hover:text-white transition-colors duration-300 font-medium group px-3 py-2 rounded-lg hover:bg-white/10"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="h-5 w-5 text-white/80 hover:text-white transition-colors cursor-pointer" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-300 text-white border border-white/20"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="hidden xl:inline font-medium max-w-32 truncate">
                        {user.email?.split("@")[0]}
                      </span>
                      <ChevronDown className="h-3 w-3 text-white/80" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white/95 backdrop-blur-xl border-white/20 z-[100000] shadow-2xl"
                  >
                    <DropdownMenuItem className="text-gray-700">{user.email}</DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="text-red-600 hover:bg-red-50">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-white text-blue-600 hover:bg-white/90 font-semibold">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-white/10 backdrop-blur-sm p-3 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 z-[100000] bg-gradient-to-r from-blue-600/98 via-purple-600/98 to-indigo-600/98 backdrop-blur-xl border-t border-white/20 shadow-2xl">
            <div className="px-4 py-6 space-y-4">
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
                  className="block text-white hover:text-white/80 transition-colors duration-300 font-medium py-3 px-4 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                <div className="pt-4 border-t border-white/20 space-y-4">
                  <div className="flex items-center space-x-3 px-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{user.email?.split("@")[0]}</div>
                      <div className="text-white/70 text-sm">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    variant="ghost"
                    className="w-full text-left text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors py-3 px-4 rounded-lg"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/20 space-y-3">
                  <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-white hover:bg-white/10 border border-white/20">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold">
                      Get Started
                    </Button>
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
