import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"

export const PUT = requireAuth(async (request, { user }) => {
  try {
    const updates = await request.json()
    
    // Don't allow email updates
    delete updates.email

    // Update user metadata in Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: updates.name || user.user_metadata?.name,
        ...updates
      }
    })

    if (error) throw error

    // Return updated user info
    const updatedUser = {
      id: user.id,
      email: user.email,
      name: data.user.user_metadata?.name || user.email,
      role: data.user.user_metadata?.role || 'user',
      ...updates
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
