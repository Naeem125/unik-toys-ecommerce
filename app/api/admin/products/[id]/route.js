import { NextResponse } from "next/server"
import { supabaseHelpers } from "@/lib/supabase"

export async function PUT(request, { params }) {
  try {
    const productData = await request.json()
    const product = await supabaseHelpers.updateProduct(params.id, productData)
    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await supabaseHelpers.deleteProduct(params.id)
    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}