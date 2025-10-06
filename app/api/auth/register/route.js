import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Create user with Supabase
    const { data, error } = await supabaseHelpers.createUser({
      name,
      email,
      password
    })

    if (error) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    // Create response
    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email,
          role: data.user.user_metadata?.role || 'user'
        },
      },
      { status: 201 },
    )

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
