"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AdminLayout from "@/components/admin/AdminLayout"
import { useAuth } from "@/contexts/AuthContext"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function AdminCategories() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    sortOrder: 0,
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
      return
    }

    if (user && user.role === "admin") {
      fetchCategories()
    }
  }, [user, loading, router])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/categories")
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories || [])
      } else {
        setError(data.error || "Failed to fetch categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to fetch categories")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory._id}` : "/api/admin/categories"
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        fetchCategories()
        setIsDialogOpen(false)
        setEditingCategory(null)
        setFormData({ name: "", description: "", image: "", sortOrder: 0 })
      } else {
        setError(data.error || "Failed to save category")
      }
    } catch (error) {
      console.error("Error saving category:", error)
      setError("Failed to save category")
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      sortOrder: category.sortOrder || 0,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCategories()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete category")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      setError("Failed to delete category")
    }
  }

  const resetForm = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "", image: "", sortOrder: 0 })
    setError("")
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
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                    {editingCategory ? "Update" : "Create"} Category
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && !isDialogOpen && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>Categories ({categories.length})</CardTitle>
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
            ) : categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category._id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-sm text-gray-500">Sort: {category.sortOrder}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category._id)}
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
                <p className="text-gray-500">No categories found</p>
                <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                  Add your first category
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
