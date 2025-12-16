"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, User, Menu, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { formatPrice } from "@/lib/utils"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuth()
  const { cart, cartItemCount } = useCart()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  const userNavigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    ...(user ? [{ name: "Orders", href: "/dashboard/orders" }] : []),
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ]

  return (
    <header className="shadow-xl border-b-2 border-amber-400/30" style={{ background: 'linear-gradient(to right, #b88a49, #d4a574, #b88a49)' }}>
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 px-4 rounded-lg text-sm text-white border-b border-white/20" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Free shipping on orders over {formatPrice(50)}!</span>
          </div>
          <div className="flex items-center gap-4">
            {!user && (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-white hover:text-white/80 font-medium transition-colors duration-200 hover:underline">
                  Login
                </Link>
                <span className="text-white/60">|</span>
                <Link href="/register" className="text-white hover:text-white/80 font-medium transition-colors duration-200 hover:underline">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="Unik Toys"
                width={160}
                height={80}
                className="h-16 w-auto transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {userNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-white hover:text-white/80 font-semibold transition-all duration-200 group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Search and Cart */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="Search toys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 pr-12 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-200 backdrop-blur-sm"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-10 p-0 text-white shadow-lg transition-all duration-200 hover:shadow-amber-500/25"
                  style={{ backgroundColor: '#b88a49' }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* User Profile */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:border-white/50 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-white/25"
                    style={{
                      backgroundColor: 'rgba(240, 233, 216, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#b88a49'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(240, 233, 216, 0.1)'
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-2 border-amber-200 shadow-xl w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="hover:bg-amber-50 transition-colors cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="hover:bg-amber-50 transition-colors cursor-pointer">
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 text-red-600 transition-colors cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative group">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-white/20 border-white/30 text-white hover:border-white/50 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-white/25"
                style={{
                  backgroundColor: 'rgba(240, 233, 216, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#b88a49'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(240, 233, 216, 0.1)'
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Cart</span>
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-2 border-white shadow-lg animate-bounce"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden bg-white/20 border-white/30 text-white hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(240, 233, 216, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#b88a49'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(240, 233, 216, 0.1)'
                  }}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="border-l-2 border-white/30" style={{ background: 'linear-gradient(to bottom, #b88a49, #d4a574)' }}>
                <nav className="flex flex-col space-y-6 mt-8">
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-xl font-semibold text-white hover:text-white/80 transition-colors duration-200 hover:underline decoration-white"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-6 border-t border-white/30">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Search toys..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="text-white"
                        style={{ backgroundColor: '#b88a49' }}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
