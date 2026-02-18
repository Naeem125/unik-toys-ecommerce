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
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  const searchParams = useSearchParams()

  useEffect(() => {
    const category = searchParams.get("category") || "all"
    const search = searchParams.get("search") || ""
    const sort = searchParams.get("sortBy") || "newest"

    setSelectedCategory(category)
    setSearchQuery(search)
    setSortBy(sort)

    fetchCategories()
    fetchProducts(1, category, search, sort, true)
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error("Failed to fetch categories", err)
    }
  }

  const fetchProducts = async (page, category, search, sort, isInitial = false) => {
    if (isInitial) setInitialLoading(true)
    else setLoading(true)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        category,
        search,
        sortBy: sort
      })

      const res = await fetch(`/api/products?${params}&t=${Date.now()}`, {
        cache: "no-store",
      })
      const data = await res.json()
      setProducts(data.products || [])
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
    } catch (err) {
      console.error("Failed to fetch products", err)
    } finally {
      if (isInitial) setInitialLoading(false)
      else setLoading(false)
    }
  }

  const updateUrlAndFetch = (category, search, sort) => {
    const params = new URLSearchParams()
    if (category && category !== "all") params.set("category", category)
    if (search) params.set("search", search)
    if (sort && sort !== "newest") params.set("sortBy", sort)
    window.history.pushState({}, "", `/shop?${params.toString()}`)
    fetchProducts(1, category, search, sort)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateUrlAndFetch(selectedCategory, searchQuery, sortBy)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    updateUrlAndFetch(category, searchQuery, sortBy)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    updateUrlAndFetch(selectedCategory, searchQuery, value)
  }

  const handlePageChange = (page) => {
    fetchProducts(page, selectedCategory, searchQuery, sortBy)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Build a compact list of pages to display (with ellipsis)
  const getVisiblePages = () => {
    const total = pagination.pages
    const current = pagination.page
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const pages = new Set([1, total, current])

    if (current - 1 > 1) pages.add(current - 1)
    if (current + 1 < total) pages.add(current + 1)
    if (current - 2 > 1) pages.add(current - 2)
    if (current + 2 < total) pages.add(current + 2)

    return Array.from(pages).sort((a, b) => a - b)
  }

  const visiblePages = getVisiblePages()

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
                  <SelectItem key={category.id ?? category._id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={handleSortChange}>
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

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSortBy("newest")
                updateUrlAndFetch("all", "", "newest")
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
                    updateUrlAndFetch(selectedCategory, "", sortBy)
                  }}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {categories.find((c) => c.slug === selectedCategory)?.name}
                <button
                  onClick={() => {
                    setSelectedCategory("all")
                    updateUrlAndFetch("all", searchQuery, sortBy)
                  }}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {(loading || initialLoading) ? (
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
              <ProductCard key={product.id ?? product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg mb-4">No products found matching your criteria.</p>
            <Button
              variant="outline"
              className="mb-8"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSortBy("newest")
                updateUrlAndFetch("all", "", "newest")
              }}
            >
              View All Products
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              {visiblePages.map((page, index) => {
                const prevPage = visiblePages[index - 1]
                const showDots = prevPage && page - prevPage > 1

                return (
                  <div key={page} className="flex items-center gap-2">
                    {showDots && (
                      <span className="px-1 text-gray-400 text-sm select-none">
                        …
                      </span>
                    )}
                    <Button
                      variant={pagination.page === page ? "default" : "outline"}
                      size="icon"
                      className="w-8 h-8 text-sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  </div>
                )
              })}
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
