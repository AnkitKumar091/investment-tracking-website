import { type NextRequest, NextResponse } from "next/server"
import { dataAggregator } from "@/lib/api/data-aggregator"
import { rateLimiter } from "@/lib/api/rate-limiter"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get("symbols")
    const query = searchParams.get("query")
    const type = searchParams.get("type") || "stocks"

    // Rate limiting by IP
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"
    if (!(await rateLimiter.checkLimit("api-endpoint", clientIP))) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    if (type === "mutual-funds") {
      if (query) {
        const funds = await dataAggregator.searchMutualFunds(query)
        return NextResponse.json({ data: funds, source: "api" })
      } else {
        return NextResponse.json({ error: "Query parameter required for mutual funds" }, { status: 400 })
      }
    } else {
      // Default to stocks
      if (symbols) {
        const symbolList = symbols.split(",").map((s) => s.trim())
        const stocks = await dataAggregator.getMultipleStocks(symbolList)
        return NextResponse.json({ data: stocks, source: "api" })
      } else {
        // Return default Indian stocks
        const defaultSymbols = [
          "RELIANCE.NS",
          "TCS.NS",
          "INFY.NS",
          "HDFCBANK.NS",
          "ICICIBANK.NS",
          "HINDUNILVR.NS",
          "ITC.NS",
          "SBIN.NS",
          "BHARTIARTL.NS",
          "KOTAKBANK.NS",
        ]
        const stocks = await dataAggregator.getMultipleStocks(defaultSymbols)
        return NextResponse.json({ data: stocks, source: "api" })
      }
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, symbol, schemeCode } = body

    // Rate limiting by IP
    const clientIP = request.headers.get("x-forwarded-for") || "unknown"
    if (!(await rateLimiter.checkLimit("api-endpoint", clientIP))) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    switch (action) {
      case "get-stock":
        if (!symbol) {
          return NextResponse.json({ error: "Symbol required" }, { status: 400 })
        }
        const stock = await dataAggregator.getSingleStock(symbol)
        return NextResponse.json({ data: stock, source: "api" })

      case "get-mutual-fund":
        if (!schemeCode) {
          return NextResponse.json({ error: "Scheme code required" }, { status: 400 })
        }
        const fund = await dataAggregator.getMutualFundDetails(schemeCode)
        return NextResponse.json({ data: fund, source: "api" })

      case "health-check":
        const health = await dataAggregator.checkAPIHealth()
        return NextResponse.json({ health, timestamp: new Date().toISOString() })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
