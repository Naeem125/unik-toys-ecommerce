// import { NextResponse } from "next/server"
// import connectDB from "@/lib/mongodb"
// import Category from "@/models/Category"
// import { requireAdmin } from "@/lib/auth"

// export const PUT = requireAdmin(async (request, { params }) => {
//   try {
//     const updates = await request.json()
//     await connectDB()

//     const category = await Category.findByIdAndUpdate(params.id, updates, {
//       new: true,
//       runValidators: true,
//     })

//     if (!category) {
//       return NextResponse.json({ error: "Category not found" }, { status: 404 })
//     }

//     return NextResponse.json({ category })
//   } catch (error) {
//     console.error("Admin update category error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// })

// export const DELETE = requireAdmin(async (request, { params }) => {
//   try {
//     await connectDB()

//     const category = await Category.findByIdAndDelete(params.id)

//     if (!category) {
//       return NextResponse.json({ error: "Category not found" }, { status: 404 })
//     }

//     return NextResponse.json({ message: "Category deleted successfully" })
//   } catch (error) {
//     console.error("Admin delete category error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// })
