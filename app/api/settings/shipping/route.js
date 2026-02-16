import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

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

export async function GET() {
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
        console.error("Error fetching public shipping settings:", error)
        return NextResponse.json({ error: "Failed to load shipping settings" }, { status: 500 })
    }
}


