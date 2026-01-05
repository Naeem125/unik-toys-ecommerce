import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/auth"

// Valid order statuses
const VALID_STATUSES = ['pending', 'confirmed', 'on_hold', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'refunded', 'cancelled', 'payment_failed']

// Valid status transitions (from -> to)
const VALID_TRANSITIONS = {
    'pending': ['confirmed', 'cancelled', 'payment_failed', 'on_hold'],
    'confirmed': ['processing', 'cancelled', 'on_hold'],
    'payment_failed': ['pending', 'cancelled'],
    'on_hold': ['confirmed', 'processing', 'cancelled'],
    'processing': ['shipped', 'cancelled', 'on_hold'],
    'shipped': ['out_for_delivery', 'delivered'],
    'out_for_delivery': ['delivered'],
    'delivered': ['returned', 'refunded'],
    'returned': ['refunded'],
    'refunded': [], // Final state
    'cancelled': [] // Final state
}

// Get single order
export const GET = requireAdmin(async (request, { params }) => {
    try {
        const { id } = params

        // Get order
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", id)
            .single()

        if (orderError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Get order history
        const { data: history, error: historyError } = await supabaseAdmin
            .from("order_history")
            .select("*")
            .eq("order_id", id)
            .order("created_at", { ascending: true })

        // Get user details
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(order.user_id)

        return NextResponse.json({
            order: {
                ...order,
                user_name: userData?.user?.user_metadata?.name || userData?.user?.email || "Unknown",
                user_email: userData?.user?.email || "N/A"
            },
            history: history || []
        }, { status: 200 })
    } catch (error) {
        console.error("Error fetching order:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})

// Update order (status, tracking, notes)
export const PUT = requireAdmin(async (request, { params, user }) => {
    try {
        const { id } = params
        const { status, tracking_number, notes } = await request.json()

        // Get current order
        const { data: currentOrder, error: fetchError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", id)
            .single()

        if (fetchError || !currentOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Validate status transition
        if (status && status !== currentOrder.status) {
            const allowedTransitions = VALID_TRANSITIONS[currentOrder.status] || []
            if (!allowedTransitions.includes(status)) {
                return NextResponse.json({
                    error: `Invalid status transition. Cannot change from "${currentOrder.status}" to "${status}"`
                }, { status: 400 })
            }

            if (!VALID_STATUSES.includes(status)) {
                return NextResponse.json({ error: "Invalid status" }, { status: 400 })
            }
        }

        // Build update object
        const updates = {}
        if (status !== undefined) updates.status = status
        if (tracking_number !== undefined) updates.tracking_number = tracking_number || null
        if (notes !== undefined) updates.notes = notes || null

        // Update order
        const { data: updatedOrder, error: updateError } = await supabaseAdmin
            .from("orders")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (updateError) {
            console.error("Error updating order:", updateError)
            return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
        }

        // Determine user role for history entry
        const userRole = user.user_metadata?.role || 'admin'
        const changedByType = userRole === 'superadmin' ? 'superadmin' : 'admin'

        // Create manual history entry
        if (status && status !== currentOrder.status) {
            await supabaseAdmin
                .from("order_history")
                .insert({
                    order_id: id,
                    status: status,
                    previous_status: currentOrder.status,
                    tracking_number: tracking_number || updatedOrder.tracking_number,
                    notes: notes || null,
                    changed_by: user.id,
                    changed_by_type: changedByType,
                    metadata: {
                        updated_by: user.email || user.id,
                        reason: 'Admin update'
                    }
                })
        } else if (tracking_number && tracking_number !== currentOrder.tracking_number) {
            // Track tracking number update separately
            await supabaseAdmin
                .from("order_history")
                .insert({
                    order_id: id,
                    status: updatedOrder.status,
                    previous_status: updatedOrder.status,
                    tracking_number: tracking_number,
                    changed_by: user.id,
                    changed_by_type: changedByType,
                    metadata: {
                        updated_by: user.email || user.id,
                        action: 'tracking_number_updated'
                    }
                })
        }

        return NextResponse.json({ order: updatedOrder }, { status: 200 })
    } catch (error) {
        console.error("Error updating order:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})
