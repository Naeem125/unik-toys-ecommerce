import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"

export const GET = requireAdmin(async () => {
  try {
    const products = await supabaseHelpers.getProducts({})
    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
})

export const POST = requireAdmin(async (request) => {
  try {
    const productData = await request.json()
    const product = await supabaseHelpers.createProduct(productData)
    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
})