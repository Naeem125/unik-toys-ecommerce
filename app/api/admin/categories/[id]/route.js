import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"

export const PUT = requireAdmin(async (request, { params }) => {
  try {
    const updates = await request.json()
    const category = await supabaseHelpers.updateCategory(params.id, updates)
    return NextResponse.json({ category })
  } catch (error) {
    console.error("Admin update category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const DELETE = requireAdmin(async (request, { params }) => {
  try {
    await supabaseHelpers.deleteCategory(params.id)
    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Admin delete category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
