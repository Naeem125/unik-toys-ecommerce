"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { validatePakistaniPhone } from "@/lib/utils"
import { ArrowLeft, User, MapPin } from "lucide-react"

export default function UserProfile() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [phoneError, setPhoneError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/dashboard/profile")
      return
    }

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "",
        },
      })
    }
  }, [user, loading, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")
    setPhoneError("")

    // Validate phone number if provided
    if (formData.phone && formData.phone.trim() !== "") {
      const phoneValidation = validatePakistaniPhone(formData.phone)
      if (!phoneValidation.isValid) {
        setError(phoneValidation.error || "Invalid phone number")
        setPhoneError(phoneValidation.error || "Invalid phone number")
        setIsLoading(false)
        return
      }
      // Update phone with formatted version
      setFormData((prev) => ({
        ...prev,
        phone: phoneValidation.formatted,
      }))
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Profile updated successfully!")
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      // Validate phone number in real-time
      if (field === "phone") {
        if (value.trim() === "") {
          setPhoneError("")
          setFormData((prev) => ({
            ...prev,
            [field]: value,
          }))
          return
        }
        const validation = validatePakistaniPhone(value)
        if (!validation.isValid) {
          setPhoneError(validation.error || "Invalid phone number")
          setFormData((prev) => ({
            ...prev,
            [field]: value,
          }))
        } else {
          setPhoneError("")
          // Auto-format the phone number
          setFormData((prev) => ({
            ...prev,
            [field]: validation.formatted,
          }))
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
        }))
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 w-full">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b88a44] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card className="border-none shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-orange-50 to-white border-b border-orange-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <User className="h-6 w-6 text-[#b88a44]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-gray-500">Update your personal details</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      disabled
                      className="bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+923124712934 or 03124712934"
                      className={`bg-gray-50 border-gray-200 focus:bg-white transition-colors ${
                        phoneError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                    {phoneError && (
                      <p className="text-sm text-red-600">{phoneError}</p>
                    )}
                    {!phoneError && formData.phone && (
                      <p className="text-xs text-gray-500">Valid Pakistani phone number</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="border-none shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                    <p className="text-sm text-gray-500">Your default delivery address</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange("address.street", e.target.value)}
                    placeholder="123 Main Street"
                    className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange("address.city", e.target.value)}
                      placeholder="New York"
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange("address.state", e.target.value)}
                      placeholder="NY"
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.address.zipCode}
                      onChange={(e) => handleInputChange("address.zipCode", e.target.value)}
                      placeholder="10001"
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={(e) => handleInputChange("address.country", e.target.value)}
                      placeholder="United States"
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {message && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button type="button" variant="ghost" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#b88a44] hover:bg-orange-700 min-w-[150px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
