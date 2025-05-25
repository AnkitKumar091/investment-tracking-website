import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Navbar } from "@/components/layout/navbar"

export const metadata: Metadata = {
  title: "InvestTracker - AI-Powered Investment Platform",
  description:
    "Transform your investment journey with intelligent analytics, real-time insights, and stunning visualizations",
  keywords: "investment, portfolio, tracking, AI, analytics, finance, stocks, trading",
  authors: [{ name: "InvestTracker Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#667eea",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="overflow-x-hidden antialiased">
        <AuthProvider>
          <div className="relative min-h-screen">
            <Navbar />
            <main className="relative z-10">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
