import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Product from "@/models/Product"
import { requireAuth } from "@/lib/auth"

export const POST = requireAuth(async (request, { user }) => {
  try {
    const { items, shippingAddress, paymentInfo } = await request.json()

    await connectDB()

    // Validate items and calculate total
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.id)
      if (!product || !product.isActive) {
        return NextResponse.json({ error: `Product ${item.name} not found` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0]?.url || "",
      })

      // Update product stock
      product.stock -= item.quantity
      await product.save()
    }

    // Calculate shipping and tax
    const shippingCost = subtotal >= 50 ? 0 : 9.99
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + shippingCost + tax

    // Create order
    const order = new Order({
      user: user.id,
      items: orderItems,
      shippingAddress,
      paymentInfo,
      subtotal,
      shippingCost,
      tax,
      total,
    })

    await order.save()

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const GET = requireAuth(async (request, { user }) => {
  try {
    await connectDB()

    const orders = await Order.find({ user: user.id }).sort({ createdAt: -1 }).populate("items.product", "name slug")

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
