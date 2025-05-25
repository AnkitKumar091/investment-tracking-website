import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get the user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    const user = users.users.find((u) => u.email === email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If the email is not confirmed, confirm it
    if (!user.email_confirmed_at) {
      // This requires admin privileges, which is why we use the service role key
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirmed_at: new Date().toISOString(),
      })

      if (updateError) {
        return NextResponse.json({ error: "Failed to confirm email" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error confirming email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
