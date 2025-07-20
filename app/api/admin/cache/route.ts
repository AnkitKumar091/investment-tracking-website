import { type NextRequest, NextResponse } from "next/server"
import { stockCache, mutualFundCache, generalCache } from "@/lib/api/cache-service"
import { rateLimiter } from "@/lib/api/rate-limiter"

export async function GET(request: NextRequest) {
  try {
    // Get cache statistics
    const stats = {
      stockCache: stockCache.getStats(),
      mutualFundCache: mutualFundCache.getStats(),
      generalCache: generalCache.getStats(),
      rateLimiter: {
        "yahoo-finance": rateLimiter.getStats("yahoo-finance"),
        "alpha-vantage": rateLimiter.getStats("alpha-vantage"),
        "mutual-fund-api": rateLimiter.getStats("mutual-fund-api"),
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Admin API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, cache, api } = body

    switch (action) {
      case "clear-cache":
        if (cache === "stock") {
          stockCache.clear()
        } else if (cache === "mutual-fund") {
          mutualFundCache.clear()
        } else if (cache === "general") {
          generalCache.clear()
        } else {
          // Clear all caches
          stockCache.clear()
          mutualFundCache.clear()
          generalCache.clear()
        }
        return NextResponse.json({ message: "Cache cleared successfully" })

      case "reset-rate-limit":
        if (api) {
          rateLimiter.reset(api)
        } else {
          rateLimiter.reset()
        }
        return NextResponse.json({ message: "Rate limits reset successfully" })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Admin API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
