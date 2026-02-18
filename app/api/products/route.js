import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"

export const dynamic = "force-dynamic"

function normalizeProduct(p) {
  if (!p) return p

  const price = typeof p.price === "string" ? Number.parseFloat(p.price) : p.price
  const compare_price =
    typeof p.compare_price === "string" ? Number.parseFloat(p.compare_price) : p.compare_price

  const normalized = {
    ...p,
    // Ensure core numeric fields are numbers for UI calculations
    price: Number.isFinite(price) ? price : p.price,
    compare_price: Number.isFinite(compare_price) ? compare_price : p.compare_price,
  }

  // Backwards-compatible aliases (some UI still expects camelCase / `category`)
  normalized.comparePrice = normalized.compare_price ?? normalized.comparePrice
  normalized.isFeatured = normalized.is_featured ?? normalized.isFeatured
  normalized.category = normalized.categories ?? normalized.category

  // Ensure images is always an array
  normalized.images = Array.isArray(normalized.images) ? normalized.images : []

  return normalized
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const sortBy = searchParams.get("sortBy") || "newest"
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 12

    const filters = {
      category,
      search,
      featured: featured === "true",
      sortBy
    }

    const { data: products, count } = await supabaseHelpers.getProducts({
      ...filters,
      page,
      limit
    })

    const total = typeof count === "number" ? count : products.length
    const pages = Math.max(1, Math.ceil(total / limit))

    const normalizedProducts = (products || []).map(normalizeProduct)

    return NextResponse.json(
      {
        products: normalizedProducts,
        pagination: {
          page,
          limit,
          total,
          pages
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    )
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
