import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Category from "@/models/Category"
import { requireAdmin } from "@/lib/auth"

export const GET = requireAdmin(async () => {
  try {
    await connectDB()

    const categories = await Category.find().sort({ sortOrder: 1, name: 1 }).lean()

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Admin get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const POST = requireAdmin(async (request) => {
  try {
    const categoryData = await request.json()
    await connectDB()

    const category = new Category(categoryData)
    await category.save()

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Admin create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
