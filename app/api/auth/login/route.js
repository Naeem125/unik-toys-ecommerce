import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/auth-helpers-nextjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const cookieStore = cookies()
    // Collect cookie changes here so we can apply them to the response after sign-in
    let cookieChanges = []

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          cookieChanges = cookiesToSet
        },
      },
    })

    // Sign in user with Supabase on the server so auth cookies get set
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    const { user, session } = data

    // Create response with user + session for client-side Supabase
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

    // Apply Supabase-managed auth cookies to the response
    cookieChanges.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

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
