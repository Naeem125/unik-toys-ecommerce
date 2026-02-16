import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/auth"

// Helper to get the single settings row (create one with defaults if missing)
async function getOrCreateSettings() {
    const { data, error } = await supabaseAdmin
        .from("store_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

    if (error && error.code !== "PGRST116") {
        throw error
    }

    if (data) return data

    const { data: inserted, error: insertError } = await supabaseAdmin
        .from("store_settings")
        .insert({
            shipping_free_threshold: 3000,
            shipping_default_cost: 300,
            shipping_message: "Free shipping on orders over Rs 3000!",
        })
        .select("*")
        .single()

    if (insertError) throw insertError
    return inserted
}

export const GET = requireAdmin(async () => {
    try {
        const settings = await getOrCreateSettings()

        return NextResponse.json(
            {
                freeShippingThreshold: Number(settings.shipping_free_threshold ?? 0),
                defaultShippingCost: Number(settings.shipping_default_cost ?? 0),
                shippingMessage: settings.shipping_message ?? "",
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error fetching shipping settings:", error)
        return NextResponse.json({ error: "Failed to load shipping settings" }, { status: 500 })
    }
})

export const PUT = requireAdmin(async (request) => {
    try {
        const { freeShippingThreshold, defaultShippingCost, shippingMessage } = await request.json()

        const settings = await getOrCreateSettings()

        const threshold =
            typeof freeShippingThreshold === "number" && !Number.isNaN(freeShippingThreshold)
                ? freeShippingThreshold
                : settings.shipping_free_threshold

        const cost =
            typeof defaultShippingCost === "number" && !Number.isNaN(defaultShippingCost)
                ? defaultShippingCost
                : settings.shipping_default_cost

        const { data, error } = await supabaseAdmin
            .from("store_settings")
            .update({
                shipping_free_threshold: threshold,
                shipping_default_cost: cost,
                shipping_message: shippingMessage ?? settings.shipping_message,
                updated_at: new Date().toISOString(),
            })
            .eq("id", settings.id)
            .select("*")
            .single()

        if (error) {
            console.error("Error updating shipping settings:", error)
            return NextResponse.json({ error: "Failed to update shipping settings" }, { status: 500 })
        }

        return NextResponse.json(
            {
                freeShippingThreshold: Number(data.shipping_free_threshold ?? 0),
                defaultShippingCost: Number(data.shipping_default_cost ?? 0),
                shippingMessage: data.shipping_message ?? "",
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error saving shipping settings:", error)
        return NextResponse.json({ error: "Failed to save shipping settings" }, { status: 500 })
    }
})


