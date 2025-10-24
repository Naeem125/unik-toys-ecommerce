import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"

export const GET = requireAdmin(async () => {
  try {
    const categories = await supabaseHelpers.getCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Admin get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const POST = requireAdmin(async (request) => {
  try {
    const categoryData = await request.json()
    const category = await supabaseHelpers.createCategory(categoryData)
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Admin create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
