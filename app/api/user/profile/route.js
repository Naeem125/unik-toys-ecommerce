// import { NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import User from "@/models/User"
// import { requireAuth } from "@/lib/auth"

// export const PUT = requireAuth(async (request, { user }) => {
//   try {
//     const updates = await request.json()
//     await connectDB()

//     // Don't allow email updates
//     delete updates.email

//     const updatedUser = await User.findByIdAndUpdate(user.id, updates, {
//       new: true,
//       runValidators: true,
//     }).select("-password")

//     if (!updatedUser) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 })
//     }

//     return NextResponse.json({ user: updatedUser })
//   } catch (error) {
//     console.error("Update profile error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// })
