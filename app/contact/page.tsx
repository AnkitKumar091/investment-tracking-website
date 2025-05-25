"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    const { error } = await supabase.from("contact_messages").insert([formData])

    if (error) {
      setError("Failed to send message. Please try again.")
    } else {
      setSuccess(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }

    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-light pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Have questions about InvestTracker? We'd love to hear from you. Send us a message and we'll respond as soon
            as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Contact Information</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Reach out to us through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-gray-600 dark:text-gray-300">support@investtracker.in</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                    <p className="text-gray-600 dark:text-gray-300">+91 22 4567 8900</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Address</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      123 Nariman Point
                      <br />
                      Mumbai, Maharashtra 400021
                      <br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Business Hours</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Monday - Friday: 9:00 AM - 6:00 PM IST
                      <br />
                      Saturday: 10:00 AM - 4:00 PM IST
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Is my financial data secure?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Yes, we use bank-level encryption and security measures to protect your data.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">How much does InvestTracker cost?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We offer a free tier with basic features and premium plans starting at ₹799/month.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                    Can I import my existing portfolio?
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Yes, we support importing from CSV files and many popular Indian brokers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Send us a Message</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Thank you for your message! We'll get back to you soon.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-900 dark:text-white">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        className="bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-900 dark:text-white">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                        className="bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-900 dark:text-white">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this regarding?"
                      className="bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-900 dark:text-white">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us how we can help you..."
                      className="bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
