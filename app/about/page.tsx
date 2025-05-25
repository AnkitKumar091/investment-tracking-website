import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Shield, Target } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About InvestTracker</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to democratize investment tracking and help everyone make informed financial decisions
            with confidence.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-800">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-green-700 max-w-4xl mx-auto">
                To provide individuals with powerful, easy-to-use tools for tracking and analyzing their investments,
                enabling them to build wealth and achieve their financial goals through informed decision-making.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We believe in complete transparency in all our processes and pricing, with no hidden fees or
                  surprises.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your financial data is protected with bank-level security measures and industry-standard encryption.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>User-Centric</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every feature we build is designed with our users in mind, focusing on simplicity and effectiveness.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We continuously innovate to provide cutting-edge tools that help you stay ahead in your investment
                  journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="mb-6">
                InvestTracker was born out of a simple frustration: the lack of accessible, comprehensive tools for
                everyday investors to track and analyze their portfolios. Our founders, experienced in both technology
                and finance, recognized that while institutional investors had access to sophisticated tracking tools,
                individual investors were left with spreadsheets and basic apps.
              </p>
              <p className="mb-6">
                Founded in 2024, we set out to bridge this gap by creating a platform that combines the power of
                professional-grade analytics with the simplicity that everyday investors need. Our team of developers,
                designers, and financial experts work tirelessly to ensure that managing your investments is not just
                possible, but enjoyable.
              </p>
              <p>
                Today, InvestTracker serves thousands of investors worldwide, helping them make informed decisions and
                build wealth for their future. We're just getting started on our mission to democratize investment
                tracking and financial literacy.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose InvestTracker?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">5K+</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Active Users</h3>
              <p className="text-gray-600">Trusted by thousands of investors worldwide</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">99.9%</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Uptime</h3>
              <p className="text-gray-600">Reliable platform you can count on</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">24/7</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Support</h3>
              <p className="text-gray-600">Always here when you need assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
