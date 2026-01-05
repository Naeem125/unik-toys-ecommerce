"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { Package, Search, Eye, ArrowLeft, Calendar, DollarSign, MapPin, User, Table2, List } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function OrderHistory() {
  const { user, loading } = useAuth()
  const { addToCart } = useCart()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [reorderingOrderId, setReorderingOrderId] = useState(null)
  const [viewMode, setViewMode] = useState("table") // "table" or "list"

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard/orders")
      return
    }

    if (user) {
      fetchOrders()
    }
  }, [user, loading, router])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items?.some((item) => item.name?.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "out_for_delivery":
        return "bg-cyan-50 text-cyan-700 border-cyan-200"
      case "processing":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "on_hold":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "returned":
        return "bg-red-50 text-red-700 border-red-200"
      case "refunded":
        return "bg-gray-100 text-gray-700 border-gray-300"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      case "payment_failed":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const handleReorder = async (order) => {
    if (!order?.items || order.items.length === 0) {
      toast.error("No items to reorder")
      return
    }

    try {
      setReorderingOrderId(order.id)
      let addedCount = 0
      let failedCount = 0

      // Add each item from the order to the cart
      for (const item of order.items) {
        try {
          // Construct product object from order item
          // Order items have: id, name, price, quantity, image
          const product = {
            id: item.id,
            name: item.name,
            price: item.price,
            images: item.image ? [{ url: item.image }] : [],
            stock: item.stock || 0, // Default stock if not available
          }

          // Add to cart with the original quantity
          addToCart(product, item.quantity)
          addedCount++
        } catch (error) {
          console.error(`Error adding item ${item.name} to cart:`, error)
          failedCount++
        }
      }

      if (addedCount > 0) {
        toast.success(
          `${addedCount} item${addedCount > 1 ? 's' : ''} added to cart${failedCount > 0 ? ` (${failedCount} failed)` : ''}`
        )
        // Redirect to cart page after a short delay
        setTimeout(() => {
          router.push("/cart")
        }, 1000)
      } else {
        toast.error("Failed to add items to cart")
      }
    } catch (error) {
      console.error("Error reordering:", error)
      toast.error("Failed to reorder items")
    } finally {
      setReorderingOrderId(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20 w-full">
        <Header />
        <div className="flex-1 container mx-auto text-center flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b88a44] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/20 w-full">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
              <p className="text-gray-600">View and track all your orders</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex border-gray-200 hover:bg-gray-50">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-8 border border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Search className="h-5 w-5 text-[#b88a44]" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search by order number or product..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-gray-200 focus:border-[#b88a44] focus:ring-[#b88a44]/20 transition-all"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-white border-gray-200 focus:border-[#b88a44]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders View */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border border-gray-200 shadow-sm bg-white/80">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex justify-between">
                        <div className="bg-gray-200 h-6 rounded w-1/4"></div>
                        <div className="bg-gray-200 h-6 rounded w-1/6"></div>
                      </div>
                      <div className="bg-gray-200 h-4 rounded w-1/3"></div>
                      <div className="bg-gray-200 h-24 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <Card className="border border-gray-200 shadow-sm bg-white/90">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Your Orders</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="h-9"
                  >
                    <Table2 className="h-4 w-4 mr-2" />
                    Table
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-9"
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === "table" ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {order.order_number}
                            </TableCell>
                            <TableCell>
                              {formatDate(order.created_at)}
                            </TableCell>
                            <TableCell>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</TableCell>
                            <TableCell className="font-semibold">
                              {formatPrice(order.total || 0)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                {order.status === "delivered" && (
                                  <Button
                                    size="sm"
                                    className="bg-[#b88a44] hover:bg-[#a67a3a] text-white"
                                    onClick={() => handleReorder(order)}
                                    disabled={reorderingOrderId === order.id}
                                  >
                                    {reorderingOrderId === order.id ? "Adding..." : "Buy Again"}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="space-y-5">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="border border-gray-200 shadow-sm bg-white/90 backdrop-blur-sm hover:shadow-md hover:border-[#b88a44]/30 transition-all duration-300 overflow-hidden">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border-b border-amber-100/50 px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2.5 rounded-lg shadow-sm border border-amber-100">
                          <Package className="h-5 w-5 text-[#b88a44]" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">Order #{order.order_number}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(order.status)} border font-medium`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <span className="font-bold text-xl text-gray-900">{formatPrice(order.total || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Order Items Preview */}
                    <div className="space-y-3 mb-6">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                          <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <Image
                              src={item.image || "/placeholder.svg?height=64&width=64&query=toy"}
                              alt={item.name || 'Product'}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <p className="text-sm text-gray-500 pl-20 font-medium">
                          + {order.items.length - 2} more items...
                        </p>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-gray-600 hidden sm:block">
                        <span className="font-medium text-gray-700">Ship to:</span> {order.shipping_address?.name}
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          className="flex-1 sm:flex-none border-gray-200 hover:bg-gray-50 hover:border-[#b88a44]"
                          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {order.status === "delivered" && (
                          <Button 
                            className="flex-1 sm:flex-none bg-[#b88a44] hover:bg-[#a67a3a] text-white"
                            onClick={() => handleReorder(order)}
                            disabled={reorderingOrderId === order.id}
                          >
                            {reorderingOrderId === order.id ? "Adding..." : "Buy Again"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-gray-200 shadow-sm bg-white/90">
              <CardContent className="text-center py-16">
                <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
                  <Package className="h-10 w-10 text-[#b88a44]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchQuery || statusFilter !== "all"
                    ? "We couldn't find any orders matching your search criteria. Try adjusting your filters."
                    : "You haven't placed any orders yet. Start shopping to find the perfect toys!"}
                </p>
                <Button asChild className="bg-[#b88a44] hover:bg-[#a67a3a] text-white px-8">
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
