import { NextResponse } from "next/server"
import Stripe from "stripe"
import { requireAuth } from "@/lib/auth"

// Initialize Stripe with proper error handling
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export const POST = requireAuth(async (request, { user }) => {
  try {
    if (!stripe) {
      return NextResponse.json({ 
        error: "Payment processing not configured. Please set STRIPE_SECRET_KEY environment variable." 
      }, { status: 500 })
    }

    const { amount, currency = "usd" } = await request.json()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Payment intent error:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
})
