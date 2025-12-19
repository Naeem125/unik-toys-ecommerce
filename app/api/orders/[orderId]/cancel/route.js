import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAuth } from "@/lib/auth"

// Statuses that allow user cancellation
const CANCELLABLE_STATUSES = ['pending', 'confirmed']

export const POST = requireAuth(async (request, { params, user }) => {
    try {
        const { orderId } = params
        const { reason } = await request.json()

        // Get order
        const { data: order, error: fetchError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single()

        if (fetchError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Verify order belongs to user
        if (order.user_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Check if order can be cancelled
        if (!CANCELLABLE_STATUSES.includes(order.status)) {
            return NextResponse.json({
                error: `Order cannot be cancelled. Current status: ${order.status}. Only orders with status "pending" or "confirmed" can be cancelled.`
            }, { status: 400 })
        }

        // Check if already cancelled
        if (order.status === 'cancelled') {
            return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 })
        }

        // Update order to cancelled
        const { data: updatedOrder, error: updateError } = await supabaseAdmin
            .from("orders")
            .update({
                status: 'cancelled',
                cancelled_by: user.id,
                cancelled_at: new Date().toISOString(),
                cancellation_reason: reason || 'Cancelled by user'
            })
            .eq("id", orderId)
            .select()
            .single()

        if (updateError) {
            console.error("Error cancelling order:", updateError)
            return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
        }

        // Create history entry
        await supabaseAdmin
            .from("order_history")
            .insert({
                order_id: orderId,
                status: 'cancelled',
                previous_status: order.status,
                changed_by: user.id,
                changed_by_type: 'user',
                notes: reason || 'Cancelled by user',
                metadata: {
                    cancellation_reason: reason || 'Cancelled by user',
                    cancelled_by: user.email || user.id
                }
            })

        return NextResponse.json({
            order: updatedOrder,
            message: "Order cancelled successfully"
        }, { status: 200 })
    } catch (error) {
        console.error("Error cancelling order:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})

