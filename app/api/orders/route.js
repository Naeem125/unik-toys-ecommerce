import { NextResponse } from "next/server"
import { supabase, supabaseHelpers } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"

export const POST = requireAuth(async (request, { user }) => {
  try {
    const { items, shippingAddress, paymentInfo } = await request.json()

    // Validate items and calculate total
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await supabaseHelpers.getProductBySlug(item.slug || item.id)
      if (!product || !product.is_active) {
        return NextResponse.json({ error: `Product ${item.name} not found` }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0]?.url || "",
      })

      // Update product stock
      await supabaseHelpers.updateProduct(product.id, {
        stock: product.stock - item.quantity
      })
    }

    // Calculate shipping and tax
    const shippingCost = subtotal >= 50 ? 0 : 9.99
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + shippingCost + tax

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const orderData = {
      order_number: orderNumber,
      user_id: user.id,
      items: orderItems,
      shipping_address: shippingAddress,
      payment_info: paymentInfo,
      subtotal,
      shipping_cost: shippingCost,
      tax,
      total,
      status: 'pending'
    }

    const order = await supabaseHelpers.createOrder(orderData)

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const GET = requireAuth(async (request, { user }) => {
  try {
    const orders = await supabaseHelpers.getUserOrders(user.id)
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
