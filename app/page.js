"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ProductCard from "@/components/products/ProductCard"
import { ArrowRight, Shield, Truck, HeartHandshake } from "lucide-react"
import { supabaseHelpers } from "@/lib/supabase"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        supabaseHelpers.getCategories(),
        supabaseHelpers.getProducts({featured:true})
      ])
    

      setFeaturedProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
          <section className="py-20" style={{ backgroundColor: '#FFFDF5' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 text-balance">
                Discover Amazing Toys at <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">Unbeatable Prices</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 text-pretty">
                From educational toys to action figures, we have everything to spark your child's imagination.
                Guaranteed lowest prices with free shipping on orders over $50!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-white shadow-lg " style={{ backgroundColor: '#b88a49' }}>
                  <Link href="/shop">
                    Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="transition-all duration-200" style={{ 
                  backgroundColor: '#f0e9d8',
                  borderColor: '#b88a49',
                  color: '#b88a49'
                }}>
                  <Link href="/shop?featured=true">View Featured</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/colorful-toy-collection-display.jpg"
                alt="Unik Toys Collection"
                width={600}
                height={500}
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 rounded-lg blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

          {/* Features Section */}
          <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: '#b88a49' }}>
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Quality Guaranteed</h3>
              <p className="text-gray-600">All our toys meet the highest safety standards and quality requirements.</p>
            </div>
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: '#b88a49' }}>
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on all orders over $50. Fast and reliable delivery.</p>
            </div>
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: '#b88a49' }}>
                <HeartHandshake className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Best Prices</h3>
              <p className="text-gray-600">Guaranteed lowest prices. If you find it cheaper, we'll match it!</p>
            </div>
          </div>
        </div>
      </section>

          {/* Categories Section */}
          <section className="py-16" style={{ backgroundColor: '#FFFDF5' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-700">Find the perfect toys for every age and interest</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/shop?category=${category.slug}`}>
                <Card className="group hover:shadow-xl transition-all duration-200 cursor-pointer bg-white backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="aspect-square mb-4 relative overflow-hidden rounded-lg">
                      <Image
                        src={category.image || "/placeholder.svg?height=200&width=200&query=toy category"}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-gray-600 transition-colors text-gray-800">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

          {/* Featured Products Section */}
          <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-700">Our most popular toys loved by kids and parents</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gradient-to-br from-amber-200 to-yellow-200 aspect-square rounded-lg mb-4"></div>
                  <div className="bg-gradient-to-r from-amber-200 to-yellow-200 h-4 rounded mb-2"></div>
                  <div className="bg-gradient-to-r from-amber-200 to-yellow-200 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="transition-all duration-200" style={{ 
              backgroundColor: '#f0e9d8',
              borderColor: '#b88a49',
              color: '#b88a49'
            }}>
              <Link href="/shop">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 text-white" style={{ background: 'linear-gradient(to right, #b88a49, #d4a574, #b88a49)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8">Get the latest news about new arrivals and special offers</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50" />
            <Button variant="secondary" className="shadow-lg font-semibold" style={{ 
              backgroundColor: '#f0e9d8',
              color: '#b88a49'
            }}>
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
