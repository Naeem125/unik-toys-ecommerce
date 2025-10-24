import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"

export const PUT = requireAdmin(async (request, { params }) => {
  try {
    const updates = await request.json()
    
    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Admin update order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
