"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AdminLayout from "@/components/admin/AdminLayout"
import { useAuth } from "@/contexts/AuthContext"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"

export default function AdminProducts() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
      return
    }

    if (user && user.role === "admin") {
      fetchProducts()
    }
  }, [user, loading, router])

  const fetchProducts = async (page = 1, search = "") => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      })

      if (search) params.append("search", search)

      const response = await fetch(`/api/admin/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products || [])
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
      } else {
        setError(data.error || "Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to fetch products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts(1, searchQuery)
  }

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchProducts(pagination.page, searchQuery)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      setError("Failed to delete product")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user || user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Access denied</div>
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                    <div className="bg-gray-200 w-16 h-16 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-gray-200 h-4 rounded w-1/3"></div>
                      <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product._id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={product.images?.[0]?.url || "/placeholder.svg?height=64&width=64&query=toy"}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{product.shortDescription}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-orange-600">${product.price}</span>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {product.isFeatured && <Badge variant="outline">Featured</Badge>}
                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${product.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/products/${product._id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/products/new">Add your first product</Link>
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => fetchProducts(pagination.page - 1, searchQuery)}
                  >
                    Previous
                  </Button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={pagination.page === i + 1 ? "default" : "outline"}
                      onClick={() => fetchProducts(i + 1, searchQuery)}
                      className={pagination.page === i + 1 ? "bg-orange-600 hover:bg-orange-700" : ""}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => fetchProducts(pagination.page + 1, searchQuery)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
