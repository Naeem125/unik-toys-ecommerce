import { Suspense } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { Toaster } from "@/components/ui/sonner"
import BotpressIframe from "../components/ai-configrations/BotpressIframe"
import './globals.css'

export const metadata = {
  metadataBase: new URL('https://uniktoys.pk'),
  title: {
    default: 'Unik Toys – Die-Cast Cars Online Store in Pakistan | COD Available',
    template: '%s | Unik Toys',
  },
  description:
    "Unik Toys is your trusted online toy store in Pakistan. Explore die-cast cars, action figures, educational toys, and more with fast delivery and Cash on Delivery available nationwide.",
  generator: 'v0.app',
  keywords: [
    'unik toys',
    'uniktoys',
    'unique toys',
    'unique toys pakistan',
    'online toy store pakistan',
    'kids toys pakistan',
    'educational toys pakistan',
    'action figures pakistan',
    'toy cars',
    'dolls and playsets',
  ],
  openGraph: {
    title: 'Unik Toys - Unique Online Toy Store in Pakistan',
    description:
      "Shop unique toys for kids in Pakistan. Educational toys, action figures, cars, dolls and more with fast nationwide delivery.",
    url: 'https://uniktoys.pk',
    siteName: 'Unik Toys',
    locale: 'en_PK',
    type: 'website',
  },
  alternates: {
    canonical: 'https://uniktoys.pk',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 min-h-screen">
        <BotpressIframe />
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-700 font-medium">Loading Unik Toys...</p>
          </div>
        </div>}>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
