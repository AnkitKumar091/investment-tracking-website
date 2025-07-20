"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Generate a proper UUID v4
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Mock user data for preview environment
const createMockUser = (email: string, fullName: string): User => ({
  id: generateUUID(),
  email,
  user_metadata: { full_name: fullName },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: "authenticated",
  confirmation_sent_at: null,
  confirmed_at: new Date().toISOString(),
  recovery_sent_at: null,
  email_change_sent_at: null,
  new_email: null,
  invited_at: null,
  action_link: null,
  phone: null,
  phone_confirmed_at: null,
  phone_change_sent_at: null,
  new_phone: null,
  is_anonymous: false,
  identities: [],
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem("mock-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user:", error)
        localStorage.removeItem("mock-user")
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Basic validation
      if (!email || !password) {
        setLoading(false)
        return { error: "Email and password are required" }
      }

      if (!email.includes("@")) {
        setLoading(false)
        return { error: "Please enter a valid email address" }
      }

      if (password.length < 6) {
        setLoading(false)
        return { error: "Password must be at least 6 characters long" }
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock authentication - always succeeds for demo
      const mockUser = createMockUser(email, email.split("@")[0])
      setUser(mockUser)
      localStorage.setItem("mock-user", JSON.stringify(mockUser))

      setLoading(false)
      return { error: undefined }
    } catch (err: any) {
      setLoading(false)
      return { error: err.message || "Failed to sign in" }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)

      // Basic validation
      if (!email || !password || !fullName) {
        setLoading(false)
        return { error: "All fields are required" }
      }

      if (!email.includes("@")) {
        setLoading(false)
        return { error: "Please enter a valid email address" }
      }

      if (password.length < 6) {
        setLoading(false)
        return { error: "Password must be at least 6 characters long" }
      }

      if (fullName.length < 2) {
        setLoading(false)
        return { error: "Full name must be at least 2 characters long" }
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock registration - always succeeds and auto-signs in
      const mockUser = createMockUser(email, fullName)
      setUser(mockUser)
      localStorage.setItem("mock-user", JSON.stringify(mockUser))

      setLoading(false)
      return { error: undefined }
    } catch (err: any) {
      setLoading(false)
      return { error: err.message || "Failed to sign up" }
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem("mock-user")
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
