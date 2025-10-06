import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 12

    // Build filters for Supabase
    const filters = {
      category,
      search,
      featured: featured === "true",
      limit,
      sortBy: "newest"
    }

    const products = await supabaseHelpers.getProducts(filters)

    return NextResponse.json({
      products,
      pagination: {
        page: 1,
        limit: products.length,
        total: products.length,
        pages: 1,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
