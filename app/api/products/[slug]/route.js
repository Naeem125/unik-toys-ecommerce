import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"

export async function GET(request, { params }) {
  try {
    const product = await supabaseHelpers.getProductBySlug(params.slug)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
