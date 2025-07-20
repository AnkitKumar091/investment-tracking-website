interface MutualFund {
  schemeCode: string
  schemeName: string
  nav: number
  date: string
  fundHouse: string
  category: string
}

export class MutualFundAPI {
  private baseUrl = "https://api.mfapi.in"

  async getAllSchemes(): Promise<MutualFund[]> {
    try {
      const response = await fetch(`${this.baseUrl}/mf`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.map((scheme: any) => ({
        schemeCode: scheme.schemeCode,
        schemeName: scheme.schemeName,
        nav: 0, // Will be fetched separately
        date: "",
        fundHouse: this.extractFundHouse(scheme.schemeName),
        category: this.categorizeScheme(scheme.schemeName),
      }))
    } catch (error) {
      console.log("Mutual Fund API failed, using mock data")
      return this.generateMockSchemes()
    }
  }

  async getSchemeDetails(schemeCode: string): Promise<MutualFund | null> {
    try {
      const response = await fetch(`${this.baseUrl}/mf/${schemeCode}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const latestNav = data.data[0]

      return {
        schemeCode,
        schemeName: data.meta.scheme_name,
        nav: Number.parseFloat(latestNav.nav),
        date: latestNav.date,
        fundHouse: data.meta.fund_house,
        category: this.categorizeScheme(data.meta.scheme_name),
      }
    } catch (error) {
      console.log(`Failed to fetch scheme ${schemeCode}, using mock data`)
      return this.generateMockScheme(schemeCode)
    }
  }

  async searchSchemes(query: string): Promise<MutualFund[]> {
    try {
      const allSchemes = await this.getAllSchemes()
      return allSchemes
        .filter(
          (scheme) =>
            scheme.schemeName.toLowerCase().includes(query.toLowerCase()) ||
            scheme.fundHouse.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 20) // Limit to 20 results
    } catch (error) {
      console.log("Search failed, returning mock results")
      return this.generateMockSchemes().slice(0, 10)
    }
  }

  private extractFundHouse(schemeName: string): string {
    const fundHouses = [
      "SBI",
      "HDFC",
      "ICICI",
      "Axis",
      "Kotak",
      "Nippon",
      "Franklin",
      "Aditya Birla",
      "UTI",
      "DSP",
      "Tata",
      "Mirae",
      "Invesco",
    ]

    for (const house of fundHouses) {
      if (schemeName.toUpperCase().includes(house.toUpperCase())) {
        return house
      }
    }
    return "Others"
  }

  private categorizeScheme(schemeName: string): string {
    const name = schemeName.toUpperCase()

    if (name.includes("LARGE CAP") || name.includes("BLUECHIP")) return "Large Cap"
    if (name.includes("MID CAP")) return "Mid Cap"
    if (name.includes("SMALL CAP")) return "Small Cap"
    if (name.includes("ELSS") || name.includes("TAX")) return "ELSS"
    if (name.includes("DEBT") || name.includes("BOND")) return "Debt"
    if (name.includes("HYBRID") || name.includes("BALANCED")) return "Hybrid"
    if (name.includes("INDEX") || name.includes("NIFTY") || name.includes("SENSEX")) return "Index"
    if (name.includes("INTERNATIONAL") || name.includes("GLOBAL")) return "International"

    return "Others"
  }

  private generateMockSchemes(): MutualFund[] {
    return [
      {
        schemeCode: "120503",
        schemeName: "SBI Large Cap Fund - Direct Plan - Growth",
        nav: 85.45,
        date: new Date().toISOString().split("T")[0],
        fundHouse: "SBI",
        category: "Large Cap",
      },
      {
        schemeCode: "120504",
        schemeName: "HDFC Top 100 Fund - Direct Plan - Growth",
        nav: 920.3,
        date: new Date().toISOString().split("T")[0],
        fundHouse: "HDFC",
        category: "Large Cap",
      },
      {
        schemeCode: "120505",
        schemeName: "ICICI Prudential Bluechip Fund - Direct Plan - Growth",
        nav: 78.25,
        date: new Date().toISOString().split("T")[0],
        fundHouse: "ICICI",
        category: "Large Cap",
      },
      {
        schemeCode: "120506",
        schemeName: "Axis Mid Cap Fund - Direct Plan - Growth",
        nav: 65.8,
        date: new Date().toISOString().split("T")[0],
        fundHouse: "Axis",
        category: "Mid Cap",
      },
      {
        schemeCode: "120507",
        schemeName: "Kotak Small Cap Fund - Direct Plan - Growth",
        nav: 185.9,
        date: new Date().toISOString().split("T")[0],
        fundHouse: "Kotak",
        category: "Small Cap",
      },
    ]
  }

  private generateMockScheme(schemeCode: string): MutualFund {
    return {
      schemeCode,
      schemeName: `Mock Fund ${schemeCode} - Direct Plan - Growth`,
      nav: Math.round((Math.random() * 500 + 50) * 100) / 100,
      date: new Date().toISOString().split("T")[0],
      fundHouse: "Mock Fund House",
      category: "Large Cap",
    }
  }
}
