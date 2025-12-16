"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "@/components/admin/AdminLayout"
import { supabase, supabaseHelpers } from "@/lib/supabase"
import { Plus, Edit, Trash2, X } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function AdminProducts() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    short_description: "",
    price: "",
    compare_price: "",
    category_id: "",
    stock: "",
    sku: "",
    weight: "",
    weight_unit: "kg",
    dimensions: { length: "", width: "", height: "" },
    tags: "",
    is_featured: false,
    images: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        supabaseHelpers.getCategories(),
        supabaseHelpers.getProducts({})
      ])
      setCategories(categoriesData)
      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleObjectInputChange = (field, subField, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value
      }
    }))
  }

  const handleFileChange = (e) => {
    const files = e.target.files
    if (!files) return

    const newImages = Array.from(files).map(file => ({
      file,
      url: URL.createObjectURL(file)
    }))

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))

    e.target.value = null
  }

  const removeImage = (index) => {
    setFormData(prev => {
      URL.revokeObjectURL(prev.images[index].url)
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }
    })
  }

  const uploadImages = async () => {
    const uploadedImages = []

    for (let i = 0; i < formData.images.length; i++) {
      const img = formData.images[i]
      if (img.url.startsWith("http")) {
        uploadedImages.push({ url: img.url, alt: "" })
        continue
      }
      const file = img.file
      if (!file) continue

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

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

      uploadedImages.push({ url: publicUrlData.publicUrl, alt: "" })
    }

    return uploadedImages
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const uploadedImages = await uploadImages()

      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const productData = {
        ...formData,
        slug,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        stock: parseInt(formData.stock),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        weight_unit: formData.weight ? formData.weight_unit : null,
        dimensions: {
          length: parseFloat(formData.dimensions.length) || null,
          width: parseFloat(formData.dimensions.width) || null,
          height: parseFloat(formData.dimensions.height) || null
        },
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: uploadedImages
      }

      if (editingProduct) {
        await supabaseHelpers.updateProduct(editingProduct.id, productData)
      } else {
        await supabaseHelpers.createProduct(productData)
      }

      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error) {
      console.error("Error saving product:", error)
      setError(error.message || "Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    const images = (product.images || []).map(img => ({ url: img.url }))

    setEditingProduct(product)
    setFormData({
      name: product.name || "",
      description: product.description || "",
      short_description: product.short_description || "",
      price: product.price || "",
      compare_price: product.compare_price || "",
      category_id: product.category_id || "",
      stock: product.stock || "",
      sku: product.sku || "",
      weight: product.weight || "",
      weight_unit: product.weight_unit || "kg",
      dimensions: product.dimensions || { length: "", width: "", height: "" },
      tags: product.tags ? product.tags.join(', ') : "",
      is_featured: product.is_featured || false,
      images
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await supabaseHelpers.deleteProduct(productId)
      fetchData()
    } catch (error) {
      console.error("Error deleting product:", error)
      setError("Failed to delete product")
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      description: "",
      short_description: "",
      price: "",
      compare_price: "",
      category_id: "",
      stock: "",
      sku: "",
      weight: "",
      weight_unit: "kg",
      dimensions: { length: "", width: "", height: "" },
      tags: "",
      is_featured: false,
      images: []
    })
    setError("")
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : "Unknown"
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
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your products</p>
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
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="compare_price">Compare Price</Label>
                    <Input
                      id="compare_price"
                      name="compare_price"
                      type="number"
                      step="0.01"
                      value={formData.compare_price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category_id">Category *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                {/* Dimensions */}
                <div>
                  <Label className="mb-2 block">Dimensions (inches, optional)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dim_length" className="text-sm text-gray-600">Length</Label>
                      <Input
                        id="dim_length"
                        type="number"
                        step="0.1"
                        value={formData.dimensions.length}
                        onChange={(e) => handleObjectInputChange('dimensions', 'length', e.target.value)}
                        placeholder="12.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dim_width" className="text-sm text-gray-600">Width</Label>
                      <Input
                        id="dim_width"
                        type="number"
                        step="0.1"
                        value={formData.dimensions.width}
                        onChange={(e) => handleObjectInputChange('dimensions', 'width', e.target.value)}
                        placeholder="8.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dim_height" className="text-sm text-gray-600">Height</Label>
                      <Input
                        id="dim_height"
                        type="number"
                        step="0.1"
                        value={formData.dimensions.height}
                        onChange={(e) => handleObjectInputChange('dimensions', 'height', e.target.value)}
                        placeholder="6.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <Label className="mb-2 block">Weight (optional)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="2.5"
                      />
                    </div>
                    <div>
                      <Select value={formData.weight_unit} onValueChange={(value) => setFormData(prev => ({ ...prev, weight_unit: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="g">Grams (g)</SelectItem>
                          <SelectItem value="lb">Pounds (lb)</SelectItem>
                          <SelectItem value="oz">Ounces (oz)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="is_featured"
                    name="is_featured"
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <Label htmlFor="is_featured">Featured Product</Label>
                </div>

                <div>
                  <Label htmlFor="images">Images</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative w-20 h-20 border rounded overflow-hidden">
                        <img src={image.url} alt="" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="bg-[#b88a44] hover:bg-orange-700">
                    {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
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

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
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
            ) : products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {product.images && product.images[0] && (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.short_description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{formatPrice(product.price)}</Badge>
                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                          Stock: {product.stock}
                        </Badge>
                        {product.is_featured && <Badge>Featured</Badge>}
                        <span className="text-sm text-gray-500">{getCategoryName(product.category_id)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
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
                <p className="text-gray-500">No products found</p>
                <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                  Add your first product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}