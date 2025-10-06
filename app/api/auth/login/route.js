import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Sign in user with Supabase
    const { user, session, error } = await supabaseHelpers.signInUser(email, password)

    if (error) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create response with session token in cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
        role: user.user_metadata?.role || 'user'
      },
    })

    if (session?.access_token) {
      response.cookies.set("supabase-access-token", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })
    }

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
