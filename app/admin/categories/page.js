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
import { Plus, Edit, Trash2, X } from "lucide-react"
import { supabase, supabaseHelpers } from "@/lib/supabase"

export default function AdminCategories() {
  const { user, loading } = useAuth()

  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sort_order: 0,
    image: null, // Changed to handle file object
    is_active: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const categoriesData = await supabaseHelpers.getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to fetch categories")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)

    setFormData(prev => ({
      ...prev,
      image: {
        file,
        url: previewUrl
      }
    }))

    // Clear the input value
    e.target.value = null
  }

  const removeImage = () => {
    if (formData.image?.url && !formData.image.url.startsWith("http")) {
      URL.revokeObjectURL(formData.image.url)
    }
    setFormData(prev => ({
      ...prev,
      image: null
    }))
  }

  const uploadImage = async () => {
    if (!formData.image) return null

    // If image already has a URL that starts with http (already uploaded), return it
    if (formData.image.url?.startsWith("http") && !formData.image.file) {
      return formData.image.url
    }

    const file = formData.image.file
    if (!file) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `categories/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = fileName

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file)

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`)
      }

      const { data: publicUrlData } = supabase
        .storage
        .from("product-images")
        .getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Upload image if there's a new one
      const imageUrl = await uploadImage();

      const categoryData = {
        name: formData.name,
        description: formData.description,
        image: imageUrl || formData.image?.url || "",
        sort_order: formData.sort_order,
        slug: slugify(formData.name),
        is_active: formData.is_active
      };


      // 🔄 Use Supabase helpers instead of API fetch
      if (editingCategory) {
        await supabaseHelpers.updateCategory(editingCategory.id, categoryData);
      } else {
        await supabaseHelpers.createCategory(categoryData);
      }

      // Refresh category list and reset state
      await fetchCategories();
      setIsDialogOpen(false);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
      setError("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      sort_order: category.sort_order || 0,
      image: category.image ? { url: category.image } : null,
      is_active: category.is_active ?? true
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      await supabaseHelpers.deleteCategory(categoryId)
      await fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      setError("Failed to delete category")
    }
  }

  const resetForm = () => {
    // Clean up any object URLs
    if (formData.image?.url && !formData.image.url.startsWith("http")) {
      URL.revokeObjectURL(formData.image.url)
    }

    setEditingCategory(null)
    setFormData({
      name: "",
      description: "",
      sort_order: 0,
      image: null,
      is_active: true
    })
    setError("")
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
              <Button className="bg-[#b88a44] hover:bg-orange-700">
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
                  <Label htmlFor="image">Category Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="mt-3 relative w-32 h-32 border rounded overflow-hidden">
                      <img
                        src={formData.image.url}
                        alt="Category preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-[#b88a44] hover:bg-orange-700"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : editingCategory ? "Update" : "Create"} Category
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
                  <div key={category.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {/* Category Image */}
                    {category.image && (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-sm text-gray-500">Sort: {category.sort_order}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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
                <Button onClick={() => setIsDialogOpen(true)} className="mt-4 bg-[#b88a44] hover:bg-orange-700">
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