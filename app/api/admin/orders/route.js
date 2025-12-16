import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/auth"

export const GET = requireAdmin(async (request) => {
    try {
        // Get all orders with user information
        const { data: orders, error } = await supabaseAdmin
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching orders:", error)
            return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
        }

        // For each order, fetch user details
        const ordersWithUsers = await Promise.all(
            orders.map(async (order) => {
                const { data: user } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
                return {
                    ...order,
                    user_name: user?.user?.user_metadata?.name || user?.user?.email || "Unknown",
                    user_email: user?.user?.email || "N/A"
                }
            })
        )

        return NextResponse.json({ orders: ordersWithUsers }, { status: 200 })
    } catch (error) {
        console.error("Error fetching orders:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})
