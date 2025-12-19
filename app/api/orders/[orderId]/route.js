import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAuth } from "@/lib/auth"

export const GET = requireAuth(async (request, { user, params }) => {
    try {
        const { orderId } = params

        // Get the specific order
        const { data: order, error } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single()

        if (error) {
            console.error("Error fetching order:", error)
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Verify the order belongs to the user (unless they're admin)
        if (order.user_id !== user.id && user.user_metadata?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Get order history
        const { data: history } = await supabaseAdmin
            .from("order_history")
            .select("*")
            .eq("order_id", orderId)
            .order("created_at", { ascending: true })

        return NextResponse.json({
            order,
            history: history || []
        }, { status: 200 })
    } catch (error) {
        console.error("Error fetching order:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})
