"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import AdminLayout from "@/components/admin/AdminLayout"
import { useAuth } from "@/contexts/AuthContext"
import { Users, Mail, Calendar, DollarSign, ShoppingBag, Shield, UserPlus } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [updating, setUpdating] = useState(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newUser, setNewUser] = useState({
        email: "",
        password: "",
        name: "",
        role: "user"
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users")
            if (response.ok) {
                const data = await response.json()
                setUsers(data.users || [])
            } else {
                setError("Failed to load users")
            }
        } catch (error) {
            console.error("Error fetching users:", error)
            setError("Failed to load users")
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        setUpdating(userId)
        try {
            const response = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, role: newRole }),
            })

            if (response.ok) {
                // Update local state
                setUsers(users.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                ))
            } else {
                setError("Failed to update user role")
            }
        } catch (error) {
            console.error("Error updating user:", error)
            setError("Failed to update user role")
        } finally {
            setUpdating(null)
        }
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()
        setCreating(true)
        setError("")

        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            })

            if (response.ok) {
                const data = await response.json()
                setUsers([...users, data.user])
                setIsCreateDialogOpen(false)
                setNewUser({ email: "", password: "", name: "", role: "user" })
            } else {
                const data = await response.json()
                setError(data.error || "Failed to create user")
            }
        } catch (error) {
            console.error("Error creating user:", error)
            setError("Failed to create user")
        } finally {
            setCreating(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const getRoleBadgeColor = (role) => {
        if (role === "superadmin") return "bg-red-100 text-red-800"
        if (role === "admin") return "bg-purple-100 text-purple-800"
        return "bg-blue-100 text-blue-800"
    }

    const isSuperAdmin = currentUser?.user_metadata?.role === "superadmin"
    const isAdmin = currentUser?.user_metadata?.role === "admin"
    const canCreateUsers = isSuperAdmin || isAdmin

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b88a44] mx-auto"></div>
                    <p className="mt-4">Loading users...</p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                        <p className="text-gray-600">Manage user accounts and permissions</p>
                    </div>
                    {canCreateUsers && (
                        <Button
                            onClick={() => setIsCreateDialogOpen(true)}
                            className="bg-[#b88a44] hover:bg-orange-700"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create User
                        </Button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="py-2">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-2">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Superadmin</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {users.filter((u) => u.role === "superadmin").length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-2">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Admin Users</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {users.filter((u) => u.role === "admin").length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-2">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Regular Users</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {users.filter((u) => u.role === "user").length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-2">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Active Orders</p>
                                <p className="text-2xl font-bold text-[#b88a44]">
                                    {users.reduce((sum, u) => sum + u.totalOrders, 0)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card className="py-2">
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={getRoleBadgeColor(user.role)}>
                                                    {user.role === "superadmin" ? (
                                                        <><Shield className="h-3 w-3 mr-1" /> Superadmin</>
                                                    ) : user.role === "admin" ? (
                                                        <><Shield className="h-3 w-3 mr-1" /> Admin</>
                                                    ) : (
                                                        <><Users className="h-3 w-3 mr-1" /> User</>
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(user.created_at)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <ShoppingBag className="h-3 w-3 text-gray-600" />
                                                    {user.totalOrders}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1 text-sm font-semibold text-[#b88a44]">
                                                    <DollarSign className="h-3 w-3" />
                                                    {formatPrice(user.totalSpent)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.role === "superadmin" ? (
                                                    <Badge className="bg-red-100 text-red-800">Protected</Badge>
                                                ) : (
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(value) => handleRoleChange(user.id, value)}
                                                        disabled={updating === user.id || !isSuperAdmin}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Create User Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                                Create a new user or admin account
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                                <p className="text-sm text-gray-600 mt-1">Minimum 6 characters</p>
                            </div>
                            <div>
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        {isSuperAdmin && <SelectItem value="admin">Admin</SelectItem>}
                                    </SelectContent>
                                </Select>
                                {!isSuperAdmin && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Only superadmin can create admin accounts
                                    </p>
                                )}
                            </div>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false)
                                        setNewUser({ email: "", password: "", name: "", role: "user" })
                                        setError("")
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={creating}
                                    className="bg-[#b88a44] hover:bg-orange-700"
                                >
                                    {creating ? "Creating..." : "Create User"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    )
}
