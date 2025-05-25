import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, userId } = await request.json()

    if (!email || !userId) {
      return NextResponse.json({ error: "Email and userId are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Auto-confirm the user's email
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      email_confirmed_at: new Date().toISOString(),
    })

    if (updateError) {
      console.error("Failed to confirm user:", updateError)
      return NextResponse.json({ error: "Failed to confirm user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in auto-confirm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
