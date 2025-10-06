import { Suspense } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import './globals.css'

export const metadata = {
  title: 'Unik Toys - Premium Toy Collection',
  description: 'Discover amazing toys at unbeatable prices. From educational toys to action figures, we have everything to spark your child\'s imagination.',
  generator: 'v0.app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 min-h-screen">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-700 font-medium">Loading Unik Toys...</p>
          </div>
        </div>}>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
