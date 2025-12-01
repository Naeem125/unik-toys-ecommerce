// import { NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import Order from "@/models/Order"
// import { requireAdmin } from "@/lib/auth"

// export const GET = requireAdmin(async (request) => {
//   try {
//     await connectDB()

//     const { searchParams } = new URL(request.url)
//     const page = Number.parseInt(searchParams.get("page")) || 1
//     const limit = Number.parseInt(searchParams.get("limit")) || 20
//     const status = searchParams.get("status")

//     const query = {}
//     if (status) {
//       query.status = status
//     }

//     const skip = (page - 1) * limit

//     const orders = await Order.find(query)
//       .populate("user", "name email")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean()

//     const total = await Order.countDocuments(query)

//     return NextResponse.json({
//       orders,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error("Admin get orders error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// })
