"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import AdminLayout from "@/components/admin/AdminLayout"
import { Settings, Store, Truck, DollarSign, Mail, Save } from "lucide-react"

export default function AdminSettingsPage() {
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    // Site Settings
    const [siteSettings, setSiteSettings] = useState({
        siteName: "Unik Toys",
        siteDescription: "Your one-stop shop for amazing toys",
        contactEmail: "bilalamin1226@gmail.com",
        supportEmail: "support@uniktoys.com",
        phone: "+923324719938",
        address: "123 Toy Street, Fun City, FC 12345",
    })

    // Shipping Settings
    const [shippingSettings, setShippingSettings] = useState({
        freeShippingThreshold: 3000,
        defaultShippingCost: 300,
        shippingMessage: "Free shipping on orders over Rs 3000!",
    })

    // Tax Settings
    const [taxSettings, setTaxSettings] = useState({
        taxRate: 8,
        taxEnabled: true,
    })

    const handleSiteChange = (field, value) => {
        setSiteSettings(prev => ({ ...prev, [field]: value }))
    }

    const handleShippingChange = (field, value) => {
        setShippingSettings(prev => ({ ...prev, [field]: value }))
    }

    const handleTaxChange = (field, value) => {
        setTaxSettings(prev => ({ ...prev, [field]: value }))
    }

    useEffect(() => {
        const loadShippingSettings = async () => {
            try {
                const res = await fetch("/api/admin/settings/shipping")
                if (!res.ok) return
                const data = await res.json()
                setShippingSettings({
                    freeShippingThreshold: data.freeShippingThreshold ?? 3000,
                    defaultShippingCost: data.defaultShippingCost ?? 300,
                    shippingMessage: data.shippingMessage || "Free shipping on orders over Rs 3000!",
                })
            } catch (err) {
                console.error("Failed to load shipping settings", err)
            }
        }
        loadShippingSettings()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setSuccess(false)
        setError("")

        try {
            const res = await fetch("/api/admin/settings/shipping", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    freeShippingThreshold: Number(shippingSettings.freeShippingThreshold) || 0,
                    defaultShippingCost: Number(shippingSettings.defaultShippingCost) || 0,
                    shippingMessage: shippingSettings.shippingMessage || "",
                }),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                setError(data.error || "Failed to save shipping settings")
            } else {
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            }
        } catch (error) {
            console.error("Error saving settings:", error)
            setError("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600">Manage your store settings and configuration</p>
                    </div>
                </div>

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        ✅ Settings saved successfully!
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Site Settings */}
                <Card className="py-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5" />
                            Site Settings
                        </CardTitle>
                        <CardDescription>General information about your store</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="siteName">Site Name</Label>
                                <Input
                                    id="siteName"
                                    value={siteSettings.siteName}
                                    onChange={(e) => handleSiteChange("siteName", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="contactEmail">Contact Email</Label>
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    value={siteSettings.contactEmail}
                                    onChange={(e) => handleSiteChange("contactEmail", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="supportEmail">Support Email</Label>
                                <Input
                                    id="supportEmail"
                                    type="email"
                                    value={siteSettings.supportEmail}
                                    onChange={(e) => handleSiteChange("supportEmail", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={siteSettings.phone}
                                    onChange={(e) => handleSiteChange("phone", e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="siteDescription">Site Description</Label>
                            <Textarea
                                id="siteDescription"
                                value={siteSettings.siteDescription}
                                onChange={(e) => handleSiteChange("siteDescription", e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Store Address</Label>
                            <Textarea
                                id="address"
                                value={siteSettings.address}
                                onChange={(e) => handleSiteChange("address", e.target.value)}
                                rows={2}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Shipping Settings */}
                <Card className="py-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Shipping Settings
                        </CardTitle>
                        <CardDescription>Configure shipping costs and thresholds</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (PKR)</Label>
                                <Input
                                    id="freeShippingThreshold"
                                    type="number"
                                    step="0.01"
                                    value={shippingSettings.freeShippingThreshold}
                                    onChange={(e) => handleShippingChange("freeShippingThreshold", parseFloat(e.target.value))}
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    Orders above this amount get free shipping
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="defaultShippingCost">Default Shipping Cost (PKR)</Label>
                                <Input
                                    id="defaultShippingCost"
                                    type="number"
                                    step="0.01"
                                    value={shippingSettings.defaultShippingCost}
                                    onChange={(e) => handleShippingChange("defaultShippingCost", parseFloat(e.target.value))}
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    Standard shipping cost for orders below threshold
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="shippingMessage">Shipping Promotion Message</Label>
                            <Input
                                id="shippingMessage"
                                value={shippingSettings.shippingMessage}
                                onChange={(e) => handleShippingChange("shippingMessage", e.target.value)}
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Displayed in the header to promote free shipping
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tax Settings - these are not used in the app */}
                {/* <Card className="py-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Tax Settings
                        </CardTitle>
                        <CardDescription>Configure tax rates and calculations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                id="taxEnabled"
                                type="checkbox"
                                checked={taxSettings.taxEnabled}
                                onChange={(e) => handleTaxChange("taxEnabled", e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="taxEnabled">Enable Tax Calculation</Label>
                        </div>

                        {taxSettings.taxEnabled && (
                            <div className="max-w-md">
                                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    step="0.01"
                                    value={taxSettings.taxRate}
                                    onChange={(e) => handleTaxChange("taxRate", parseFloat(e.target.value))}
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                    Tax percentage applied to orders
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card> */}

                {/* Email Settings - these are not used in the app */}
                {/* <Card className="py-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Email Notifications
                        </CardTitle>
                        <CardDescription>Configure email notification settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    id="orderConfirmation"
                                    type="checkbox"
                                    defaultChecked
                                    className="rounded"
                                />
                                <Label htmlFor="orderConfirmation">Send order confirmation emails</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    id="shippingUpdates"
                                    type="checkbox"
                                    defaultChecked
                                    className="rounded"
                                />
                                <Label htmlFor="shippingUpdates">Send shipping update emails</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    id="adminNotifications"
                                    type="checkbox"
                                    defaultChecked
                                    className="rounded"
                                />
                                <Label htmlFor="adminNotifications">Notify admin of new orders</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card> */}

                {/* Save Button (Bottom) */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#b88a44] hover:bg-orange-700"
                        size="lg"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save All Settings"}
                    </Button>
                </div>
            </div>
        </AdminLayout>
    )
}
