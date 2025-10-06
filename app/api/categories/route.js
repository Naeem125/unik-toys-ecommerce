import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"

export async function GET() {
  try {
    const categories = await supabaseHelpers.getCategories()

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
