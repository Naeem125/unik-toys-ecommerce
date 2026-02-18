import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

function getPrimaryImageUrl(images) {
  if (!Array.isArray(images)) return ""
  const primary = images.find((img) => img?.isPrimary) || images[0]
  return primary?.url || ""
}

export async function POST(request) {
  try {
    const body = await request.json()
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : []

    if (!ids.length) {
      return NextResponse.json(
        { products: [] },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      )
    }

    const { data, error } = await supabase
      .from("products")
      .select("id,name,price,compare_price,stock,images,is_active")
      .in("id", ids)

    if (error) throw error

    const products = (data || []).map((p) => ({
      ...p,
      // Normalized helpers for the frontend/cart
      comparePrice: p.compare_price,
      image: getPrimaryImageUrl(p.images),
    }))

    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  } catch (error) {
    console.error("Get products by ids error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


