interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private configs: { [key: string]: RateLimitConfig } = {
    "yahoo-finance": { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
    "alpha-vantage": { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per minute
    "mutual-fund-api": { maxRequests: 200, windowMs: 60 * 1000 }, // 200 per minute
    default: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 per minute
  }

  async checkLimit(apiName: string, identifier = "default"): Promise<boolean> {
    const key = `${apiName}:${identifier}`
    const config = this.configs[apiName] || this.configs["default"]
    const now = Date.now()

    let entry = this.limits.get(key)

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      }
      this.limits.set(key, entry)
    }

    if (entry.count >= config.maxRequests) {
      return false // Rate limit exceeded
    }

    entry.count++
    return true
  }

  async waitForReset(apiName: string, identifier = "default"): Promise<void> {
    const key = `${apiName}:${identifier}`
    const entry = this.limits.get(key)

    if (entry && entry.resetTime > Date.now()) {
      const waitTime = entry.resetTime - Date.now()
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  getStats(apiName: string, identifier = "default"): { remaining: number; resetTime: number } {
    const key = `${apiName}:${identifier}`
    const config = this.configs[apiName] || this.configs["default"]
    const entry = this.limits.get(key)

    if (!entry || Date.now() > entry.resetTime) {
      return {
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
      }
    }

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    }
  }

  reset(apiName?: string, identifier?: string): void {
    if (apiName && identifier) {
      this.limits.delete(`${apiName}:${identifier}`)
    } else if (apiName) {
      // Reset all entries for this API
      for (const key of this.limits.keys()) {
        if (key.startsWith(`${apiName}:`)) {
          this.limits.delete(key)
        }
      }
    } else {
      // Reset all
      this.limits.clear()
    }
  }
}

export const rateLimiter = new RateLimiter()
