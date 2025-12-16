import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { requireAdmin } from "@/lib/auth"
import { getUserFromRequest } from "@/lib/auth"

export const GET = requireAdmin(async (request) => {
    try {
        // Get all users from Supabase Auth
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

        if (error) {
            console.error("Error fetching users:", error)
            return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
        }

        // Get order statistics for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const { data: orders } = await supabaseAdmin
                    .from("orders")
                    .select("total")
                    .eq("user_id", user.id)

                const totalOrders = orders?.length || 0
                const totalSpent = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

                return {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.email,
                    role: user.user_metadata?.role || "user",
                    created_at: user.created_at,
                    last_sign_in: user.last_sign_in_at,
                    totalOrders,
                    totalSpent,
                }
            })
        )

        return NextResponse.json({ users: usersWithStats }, { status: 200 })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})

// Create new user
export const POST = requireAdmin(async (request, { user: currentUser }) => {
    try {
        const { email, password, name, role } = await request.json()

        // Validate input
        if (!email || !password || !name || !role) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        if (!["admin", "user"].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
        }

        // Check permissions: only superadmin can create admin accounts
        const currentUserRole = currentUser.user_metadata?.role
        if (role === "admin" && currentUserRole !== "superadmin") {
            return NextResponse.json({
                error: "Only superadmin can create admin accounts"
            }, { status: 403 })
        }

        // Create user using Supabase Admin
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                name,
                role
            }
        })

        if (error) {
            console.error("Error creating user:", error)
            return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 })
        }

        // Return user data in the same format as GET
        const newUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email,
            role: data.user.user_metadata?.role || "user",
            created_at: data.user.created_at,
            last_sign_in: data.user.last_sign_in_at,
            totalOrders: 0,
            totalSpent: 0,
        }

        return NextResponse.json({ user: newUser }, { status: 201 })
    } catch (error) {
        console.error("Error creating user:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})

// Update user role
export const PATCH = requireAdmin(async (request, { user: currentUser }) => {
    try {
        const { userId, role } = await request.json()

        if (!userId || !role || !["admin", "user"].includes(role)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        // Get the target user to check their current role
        const { data: targetUserData } = await supabaseAdmin.auth.admin.getUserById(userId)
        const targetUserRole = targetUserData?.user?.user_metadata?.role

        // Prevent changing superadmin role
        if (targetUserRole === "superadmin") {
            return NextResponse.json({
                error: "Cannot modify superadmin account"
            }, { status: 403 })
        }

        // Check permissions: only superadmin can promote to admin
        const currentUserRole = currentUser.user_metadata?.role
        if (role === "admin" && currentUserRole !== "superadmin") {
            return NextResponse.json({
                error: "Only superadmin can create admin accounts"
            }, { status: 403 })
        }

        // Update user metadata
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { role }
        })

        if (error) {
            console.error("Error updating user:", error)
            return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
        }

        return NextResponse.json({ user: data.user }, { status: 200 })
    } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
})

