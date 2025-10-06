import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import { requireAdmin } from "@/lib/auth"

export const PUT = requireAdmin(async (request, { params }) => {
  try {
    const updates = await request.json()
    await connectDB()

    const order = await Order.findByIdAndUpdate(params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("user", "name email")

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Admin update order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
