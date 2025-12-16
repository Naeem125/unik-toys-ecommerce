"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "@/components/admin/AdminLayout"
import { Package, Calendar, DollarSign, User, Mail, MapPin } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/admin/orders")
            if (response.ok) {
                const data = await response.json()
                setOrders(data.orders || [])
            } else {
                setError("Failed to load orders")
            }
        } catch (error) {
            console.error("Error fetching orders:", error)
            setError("Failed to load orders")
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            processing: "bg-purple-100 text-purple-800",
            shipped: "bg-indigo-100 text-indigo-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        }
        return colors[status] || "bg-gray-100 text-gray-800"
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b88a44] mx-auto"></div>
                    <p className="mt-4">Loading orders...</p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
                    <p className="text-gray-600">Manage and view all customer orders</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {orders.filter((o) => o.status === "pending").length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Delivered</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {orders.filter((o) => o.status === "delivered").length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-[#b88a44]">
                                    {formatPrice(orders.reduce((sum, o) => sum + (o.total || 0), 0))}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                            <p className="text-gray-600">Orders will appear here once customers start placing them.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4 py-4">
                        {orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="bg-gray-50 border-b">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-lg mb-2">Order #{order.order_number}</CardTitle>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(order.created_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4" />
                                                    <span>{order.user_name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-4 w-4" />
                                                    <span>{order.user_email}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span className="font-semibold">{formatPrice(order.total || 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Order Items */}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Items ({order.items?.length || 0})
                                            </h3>
                                            <div className="space-y-2">
                                                {order.items?.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                                                        <div>
                                                            <p className="font-medium text-sm">{item.name}</p>
                                                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping Address */}
                                        {order.shipping_address && (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    Shipping Address
                                                </h3>
                                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                                    <p className="font-medium text-gray-900">{order.shipping_address.name}</p>
                                                    {order.shipping_address.email && <p>{order.shipping_address.email}</p>}
                                                    {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                                                    <p>{order.shipping_address.street}</p>
                                                    <p>
                                                        {order.shipping_address.city}
                                                        {order.shipping_address.state && `, ${order.shipping_address.state}`}{" "}
                                                        {order.shipping_address.zipCode}
                                                    </p>
                                                    <p>{order.shipping_address.country}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="border-t mt-6 pt-4">
                                        <div className="flex justify-end">
                                            <div className="w-full md:w-1/2 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Subtotal:</span>
                                                    <span>{formatPrice(order.subtotal || 0)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Shipping:</span>
                                                    <span>{formatPrice(order.shipping_cost || 0)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Tax:</span>
                                                    <span>{formatPrice(order.tax || 0)}</span>
                                                </div>
                                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                                    <span>Total:</span>
                                                    <span className="text-[#b88a44]">{formatPrice(order.total || 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
