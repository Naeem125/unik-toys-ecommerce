import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

function normalizeProduct(p) {
  if (!p) return p

  const price = typeof p.price === "string" ? Number.parseFloat(p.price) : p.price
  const compare_price =
    typeof p.compare_price === "string" ? Number.parseFloat(p.compare_price) : p.compare_price

  const normalized = {
    ...p,
    price: Number.isFinite(price) ? price : p.price,
    compare_price: Number.isFinite(compare_price) ? compare_price : p.compare_price,
  }

  normalized.comparePrice = normalized.compare_price ?? normalized.comparePrice
  normalized.isFeatured = normalized.is_featured ?? normalized.isFeatured
  normalized.category = normalized.categories ?? normalized.category
  normalized.images = Array.isArray(normalized.images) ? normalized.images : []

  return normalized
}

export async function GET(_request, { params }) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories (
          id,
          name,
          slug,
          image
        )
      `
      )
      .eq("id", params.id)
      .single()

    if (error) throw error

    const product = normalizeProduct(data)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(
      { product },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    )
  } catch (error) {
    console.error("Get product by id error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


