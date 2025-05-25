"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return { error: undefined }
    } catch (err: any) {
      return { error: err.message || "Failed to sign in" }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Sign up the user with auto-confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          // This will auto-confirm the user without email verification
          emailRedirectTo: undefined,
        },
      })

      if (error) {
        return { error: error.message }
      }

      // If signup was successful but no session (email confirmation required)
      // We'll manually confirm the user
      if (data.user && !data.session) {
        // Auto-confirm the user by signing them in immediately
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          // If sign in fails, try to manually confirm the user
          try {
            await fetch("/api/auth/auto-confirm", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, userId: data.user.id }),
            })

            // Try signing in again after confirmation
            const { error: retrySignInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            })

            if (retrySignInError) {
              return { error: retrySignInError.message }
            }
          } catch (confirmError) {
            console.error("Auto-confirmation failed:", confirmError)
            return { error: "Account created but login failed. Please try logging in." }
          }
        }
      }

      // Insert user data into our users table
      if (data.user) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            email: email,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (insertError && insertError.code !== "23505") {
          // Ignore duplicate key errors (user already exists)
          console.error("Error inserting user data:", insertError)
        }
      }

      return { error: undefined }
    } catch (err: any) {
      return { error: err.message || "Failed to sign up" }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
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
