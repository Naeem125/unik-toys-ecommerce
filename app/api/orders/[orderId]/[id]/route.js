import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAuth } from "@/lib/auth"

export const GET = requireAuth(async (request, { user, params }) => {
    try {
        const { id } = params

        // Get the specific order
        const { data: order, error } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", id)
            .single()

        if (error) {
            console.error("Error fetching order:", error)
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Verify the order belongs to the user (unless they're admin)
        if (order.user_id !== user.id && user.user_metadata?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        return NextResponse.json({ order }, { status: 200 })
    } catch (error) {
        console.error("Error fetching order:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})
