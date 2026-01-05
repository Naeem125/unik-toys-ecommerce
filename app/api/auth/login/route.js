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
    const data = await supabaseHelpers.signInUser(email, password)
    const { user, session } = data

    // Create response with session token in cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        role: user.user_metadata?.role
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token
      }
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

    // Handle authentication errors (invalid credentials)
    if (error?.name === 'AuthApiError' || error?.status === 400) {
      const errorMessage = error?.message || "Invalid email or password"
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      )
    }

    // Handle network/DNS errors
    const isNetworkError = error?.code === 'ENOTFOUND' ||
                          error?.cause?.code === 'ENOTFOUND' ||
                          error?.message?.includes('fetch failed') ||
                          error?.message?.includes('getaddrinfo')

    if (isNetworkError || (error?.__isAuthError && error?.status === 0)) {
      return NextResponse.json(
        { error: "Cannot connect to authentication service. Please try again later." },
        { status: 503 }
      )
    }

    // Handle validation errors
    if (error?.status === 422 || error?.code === 'validation_failed') {
      return NextResponse.json(
        { error: error?.message || "Invalid request data" },
        { status: 400 }
      )
    }

    // Generic server error for unexpected errors
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    )
  }
}
