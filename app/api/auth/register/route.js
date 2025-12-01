import { NextResponse } from "next/server"
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Helper function for creating user (server-side only)
async function createUser(userData) {
  console.log("Creating user with data:", userData)
  const role = userData.role?.trim() || "user";
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      name: userData.name,
        display_name: userData.name,
      role: role
    },
  })
  if (error) throw error
  console.log("createUser data:", data)
  return data
}

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

    // Determine role based on ADMIN_EMAILS env (comma-separated)
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)

    const role = adminEmails.includes(email.toLowerCase()) ? "admin" : "user"

    // Create user with Supabase Admin
    const data = await createUser({
      name,
      email,
      password,
      role
    })

    // Return success response
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || name,
          role: data.user.user_metadata?.role || role
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    
    // Handle specific Supabase errors
    if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }
    
    return NextResponse.json(
      { error: error.message || "Internal server error" }, 
      { status: 500 }
    )
  }
}