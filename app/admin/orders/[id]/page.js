"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import AdminLayout from "@/components/admin/AdminLayout"
import { ArrowLeft, Save, Package, User, Mail, MapPin, Truck, Calendar, DollarSign } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
    { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'returned', label: 'Returned', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-200 text-gray-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-200 text-red-900' },
    { value: 'payment_failed', label: 'Payment Failed', color: 'bg-red-100 text-red-800' }
]

export default function AdminOrderDetailPage({ params }) {
    const router = useRouter()
    const { id } = params || {}
    const [order, setOrder] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        status: '',
        tracking_number: '',
        notes: ''
    })

    useEffect(() => {
        if (id) {
            fetchOrder()
        }
    }, [id])

    const fetchOrder = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/orders/${id}`)
            if (response.ok) {
                const data = await response.json()
                setOrder(data.order)
                setHistory(data.history || [])
                setFormData({
                    status: data.order.status || '',
                    tracking_number: data.order.tracking_number || '',
                    notes: data.order.notes || ''
                })
            } else {
                toast.error("Failed to load order")
            }
        } catch (error) {
            console.error("Error fetching order:", error)
            toast.error("Failed to load order")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const response = await fetch(`/api/admin/orders/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                toast.success("Order updated successfully")
                fetchOrder() // Refresh data
            } else {
                toast.error(data.error || "Failed to update order")
            }
        } catch (error) {
            console.error("Error updating order:", error)
            toast.error("Failed to update order")
        } finally {
            setSaving(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ""
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getStatusColor = (status) => {
        const statusOption = STATUS_OPTIONS.find(s => s.value === status)
        return statusOption?.color || "bg-gray-100 text-gray-800"
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b88a44] mx-auto"></div>
                    <p className="mt-4">Loading order details...</p>
                </div>
            </AdminLayout>
        )
    }

    if (!order) {
        return (
            <AdminLayout>
                <Card>
                    <CardContent className="py-16 text-center">
                        <p className="text-gray-600">Order not found</p>
                        <Button onClick={() => router.push("/admin/orders")} className="mt-4">
                            Back to Orders
                        </Button>
                    </CardContent>
                </Card>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/admin/orders")}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Orders
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
                        <p className="text-gray-600 mt-1">Manage order status and tracking</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Management */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Management Form */}
                        <Card className="border-none shadow-md py-2">
                            <CardHeader>
                                <CardTitle>Update Order</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Order Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tracking">Tracking Number</Label>
                                    <Input
                                        id="tracking"
                                        placeholder="Enter tracking number"
                                        value={formData.tracking_number}
                                        onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Order Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add internal notes..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={4}
                                    />
                                </div>

                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full bg-[#b88a44] hover:bg-orange-700"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Order History Timeline */}
                        <Card className="border-none shadow-md py-2">
                            <CardHeader>
                                <CardTitle>Order History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {history.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No history available</p>
                                ) : (
                                    <div className="space-y-4">
                                        {history.map((entry, index) => (
                                            <div key={entry.id} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        index === history.length - 1 ? 'bg-[#b88a44]' : 'bg-gray-300'
                                                    }`} />
                                                    {index < history.length - 1 && (
                                                        <div className="w-0.5 h-full bg-gray-200 mt-1" />
                                                    )}
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge className={getStatusColor(entry.status)}>
                                                            {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1)}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">
                                                            {entry.changed_by_type === 'superadmin' ? 'Superadmin' : 
                                                             entry.changed_by_type === 'admin' ? 'Admin' : 
                                                             entry.changed_by_type === 'user' ? 'User' : 'Unknown'}
                                                        </span>
                                                    </div>
                                                    {entry.tracking_number && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                            <Truck className="h-3 w-3" />
                                                            <span className="font-mono">{entry.tracking_number}</span>
                                                        </div>
                                                    )}
                                                    {entry.notes && (
                                                        <p className="text-sm text-gray-600 mb-1">{entry.notes}</p>
                                                    )}
                                                    <p className="text-xs text-gray-400">{formatDate(entry.created_at)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Order Details */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <Card className="border-none shadow-md py-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span>{order.user_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span>{order.user_email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{formatDate(order.created_at)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Address */}
                        {order.shipping_address && (
                            <Card className="border-none shadow-md py-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Shipping Address
                                    </CardTitle>
                            </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p className="font-medium">{order.shipping_address.name}</p>
                                    <p>{order.shipping_address.street}</p>
                                    <p>
                                        {order.shipping_address.city}, {order.shipping_address.state}{" "}
                                        {order.shipping_address.zipCode}
                                    </p>
                                    <p>{order.shipping_address.country}</p>
                                    {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Items */}
                        <Card className="border-none shadow-md py-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Items ({order.items?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
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
                                <Separator className="my-4" />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span>{formatPrice(order.subtotal || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping:</span>
                                        <span>{formatPrice(order.shipping_cost || 0)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-[#b88a44]">{formatPrice(order.total || 0)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

