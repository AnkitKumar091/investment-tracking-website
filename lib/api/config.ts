export const API_CONFIG = {
  // Yahoo Finance Configuration
  YAHOO_FINANCE: {
    BASE_URLS: [
      "https://query1.finance.yahoo.com/v7/finance/quote",
      "https://query2.finance.yahoo.com/v7/finance/quote",
    ],
    CORS_PROXIES: [
      "https://api.allorigins.win/raw?url=",
      "https://cors-anywhere.herokuapp.com/",
      "https://api.codetabs.com/v1/proxy?quest=",
    ],
    RATE_LIMIT: {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
    },
    TIMEOUT: 10000, // 10 seconds
  },

  // Alpha Vantage Configuration
  ALPHA_VANTAGE: {
    BASE_URL: "https://www.alphavantage.co/query",
    API_KEY: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "demo",
    RATE_LIMIT: {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
    },
    TIMEOUT: 15000, // 15 seconds
  },

  // Mutual Fund API Configuration
  MUTUAL_FUND_API: {
    BASE_URL: "https://api.mfapi.in",
    RATE_LIMIT: {
      maxRequests: 200,
      windowMs: 60 * 1000, // 1 minute
    },
    TIMEOUT: 10000, // 10 seconds
  },

  // Cache Configuration
  CACHE: {
    STOCK_TTL: 30 * 1000, // 30 seconds
    MUTUAL_FUND_TTL: 5 * 60 * 1000, // 5 minutes
    SEARCH_TTL: 10 * 60 * 1000, // 10 minutes
    MAX_STOCK_ENTRIES: 500,
    MAX_MF_ENTRIES: 200,
    MAX_GENERAL_ENTRIES: 100,
  },

  // Default Indian Stocks
  DEFAULT_STOCKS: [
    "RELIANCE.NS",
    "TCS.NS",
    "INFY.NS",
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "HINDUNILVR.NS",
    "ITC.NS",
    "SBIN.NS",
    "BHARTIARTL.NS",
    "MARUTI.NS",
  ],

  // Retry Configuration
  RETRY: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
  },
}

export default API_CONFIG
