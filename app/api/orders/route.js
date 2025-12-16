import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAuth } from "@/lib/auth"

export const POST = requireAuth(async (request, { user }) => {
    try {
        const { items, shippingAddress, paymentInfo, subtotal, shippingCost, tax, total } = await request.json()

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

        // Create order using admin client to bypass RLS
        const { data: order, error } = await supabaseAdmin
            .from("orders")
            .insert({
                order_number: orderNumber,
                user_id: user.id,
                items: items,
                shipping_address: shippingAddress,
                payment_info: paymentInfo,
                subtotal: subtotal,
                shipping_cost: shippingCost,
                tax: tax,
                total: total,
                status: "pending",
            })
            .select()
            .single()

        if (error) {
            console.error("Error creating order:", error)
            return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 })
        }

        return NextResponse.json({ order }, { status: 201 })
    } catch (error) {
        console.error("Order creation error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})

export const GET = requireAuth(async (request, { user }) => {
    try {
        // Get user's orders using admin client
        const { data: orders, error } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching orders:", error)
            return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
        }

        return NextResponse.json({ orders }, { status: 200 })
    } catch (error) {
        console.error("Error fetching orders:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})
