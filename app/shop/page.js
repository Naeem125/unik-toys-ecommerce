"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ProductCard from "@/components/products/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  // Dummy products for demonstration
  const getDummyProducts = () => [
    {
      id: 'dummy-1',
      name: 'Premium Building Blocks Set',
      description: 'High-quality wooden building blocks for creative play and learning.',
      price: 24.99,
      comparePrice: 34.99,
      images: [{ url: '/placeholder.svg?height=300&width=300&query=building+blocks', alt: 'Building Blocks' }],
      stock: 15,
      is_featured: false,
      slug: 'premium-building-blocks-set',
      category: { name: 'Educational Toys', slug: 'educational' }
    },
    {
      id: 'dummy-2',
      name: 'Remote Control Car',
      description: 'Fast and durable RC car with LED lights and rechargeable battery.',
      price: 89.99,
      comparePrice: 119.99,
      images: [{ url: '/placeholder.svg?height=300&width=300&query=rc+car', alt: 'Remote Control Car' }],
      stock: 8,
      is_featured: true,
      slug: 'remote-control-car',
      category: { name: 'Remote Control', slug: 'remote-control' }
    }
  ]

  const searchParams = useSearchParams()

  useEffect(() => {
    const category = searchParams.get("category") || "all"
    const search = searchParams.get("search") || ""
    const featured = searchParams.get("featured") || ""

    setSelectedCategory(category)
    setSearchQuery(search)

    fetchCategories()
    fetchProducts(1, category, search, featured)
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProducts = async (page = 1, category = "", search = "", featured = "") => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      })

      if (category) params.append("category", category)
      if (search) params.append("search", search)
      if (featured) params.append("featured", featured)

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      setProducts(data.products || [])
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append("search", searchQuery)
    if (selectedCategory) params.append("category", selectedCategory)
    window.history.pushState({}, "", `/shop?${params}`)
    fetchProducts(1, selectedCategory, searchQuery)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    const params = new URLSearchParams()
    if (category) params.append("category", category)
    if (searchQuery) params.append("search", searchQuery)
    window.history.pushState({}, "", `/shop?${params}`)
    fetchProducts(1, category, searchQuery)
  }

  const handlePageChange = (page) => {
    fetchProducts(page, selectedCategory, searchQuery)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shop All Toys</h1>
          <p className="text-gray-600">Discover our amazing collection of toys for all ages</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search toys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                window.history.pushState({}, "", "/shop")
                fetchProducts(1)
              }}
            >
              Clear Filters
            </Button>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
                <button
                  onClick={() => {
                    setSearchQuery("")
                    fetchProducts(1, selectedCategory)
                  }}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCategory && selectedCategory !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {categories.find((c) => c.slug === selectedCategory)?.name}
                <button
                  onClick={() => {
                    setSelectedCategory("all")
                    fetchProducts(1, "", searchQuery)
                  }}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {products.length} of {pagination.total} products
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {/* Add dummy products if we have less than 8 products */}
            {products.length < 8 && getDummyProducts().slice(0, 8 - products.length).map((dummyProduct) => (
              <ProductCard key={dummyProduct.id} product={dummyProduct} />
            ))}
          </div>
        ) : (
          <div>
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg mb-4">No products found matching your criteria.</p>
              <Button
                variant="outline"
                className="mb-8"
                style={{
                  backgroundColor: '#f0e9d8',
                  borderColor: '#b88a49',
                  color: '#b88a49'
                }}
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  fetchProducts(1)
                }}
              >
                View All Products
              </Button>
            </div>
            {/* Show dummy products when no products found */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getDummyProducts().map((dummyProduct) => (
                <ProductCard key={dummyProduct.id} product={dummyProduct} />
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              {[...Array(pagination.pages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={pagination.page === i + 1 ? "default" : "outline"}
                  onClick={() => handlePageChange(i + 1)}
                  className={pagination.page === i + 1 ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
