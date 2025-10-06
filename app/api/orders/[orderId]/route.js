import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import { requireAuth } from "@/lib/auth"

export const GET = requireAuth(async (request, { params, user }) => {
  try {
    await connectDB()

    const order = await Order.findOne({
      _id: params.orderId,
      user: user.id,
    }).populate("items.product", "name slug")

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
