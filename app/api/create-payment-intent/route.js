// import { NextResponse } from "next/server"
// import Stripe from "stripe"
// import { requireAuth } from "@/lib/auth"

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// export const POST = requireAuth(async (request, { user }) => {
//   try {
//     const { amount, currency = "usd" } = await request.json()

//     // Create payment intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(amount * 100), // Convert to cents
//       currency,
//       metadata: {
//         userId: user.id,
//       },
//     })

//     return NextResponse.json({
//       clientSecret: paymentIntent.client_secret,
//     })
//   } catch (error) {
//     console.error("Payment intent error:", error)
//     return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
//   }
// })
