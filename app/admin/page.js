"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { supabaseHelpers } from "@/lib/supabase"
import { Plus, Save, Edit, Trash2 } from "lucide-react"

export default function AdminPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingProduct, setEditingProduct] = useState(null)

  // Form state
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
    dimensions: { length: "", width: "", height: "" },
    age_range: { min: "", max: "" },
    tags: "",
    is_featured: false,
    images: [{ url: "", alt: "", isPrimary: true }]
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

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, ...value } : item
      )
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      // Generate slug from name
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
        dimensions: {
          length: parseFloat(formData.dimensions.length) || null,
          width: parseFloat(formData.dimensions.width) || null,
          height: parseFloat(formData.dimensions.height) || null
        },
        age_range: {
          min: parseInt(formData.age_range.min) || null,
          max: parseInt(formData.age_range.max) || null
        },
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      if (editingProduct) {
        await supabaseHelpers.updateProduct(editingProduct.id, productData)
        setSuccess("Product updated successfully!")
      } else {
        await supabaseHelpers.createProduct(productData)
        setSuccess("Product created successfully!")
      }

      // Reset form
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
        dimensions: { length: "", width: "", height: "" },
        age_range: { min: "", max: "" },
        tags: "",
        is_featured: false,
        images: [{ url: "", alt: "", isPrimary: true }]
      })
      setEditingProduct(null)
      fetchData()
    } catch (error) {
      console.error("Error saving product:", error)
      setError("Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
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
      dimensions: product.dimensions || { length: "", width: "", height: "" },
      age_range: product.age_range || { min: "", max: "" },
      tags: product.tags ? product.tags.join(', ') : "",
      is_featured: product.is_featured || false,
      images: product.images || [{ url: "", alt: "", isPrimary: true }]
    })
  }

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await supabaseHelpers.deleteProduct(productId)
      setSuccess("Product deleted successfully!")
      fetchData()
    } catch (error) {
      console.error("Error deleting product:", error)
      setError("Failed to delete product")
    }
  }

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: "", alt: "", isPrimary: false }]
    }))
  }

  const removeImageField = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-700 font-medium">Loading admin panel...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage products and categories</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingProduct ? "Edit Product" : "Add New Product"}
              </CardTitle>
              <CardDescription>
                {editingProduct ? "Update product information" : "Create a new product"}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Enter SKU"
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
                    placeholder="Enter product description"
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
                    placeholder="Enter short description"
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
                      placeholder="0.00"
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
                      placeholder="0.00"
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
                      placeholder="0"
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
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                {/* Images */}
                <div>
                  <Label>Images</Label>
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Image URL"
                        value={image.url}
                        onChange={(e) => handleArrayInputChange('images', index, { url: e.target.value })}
                      />
                      <Input
                        placeholder="Alt text"
                        value={image.alt}
                        onChange={(e) => handleArrayInputChange('images', index, { alt: e.target.value })}
                      />
                      {formData.images.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImageField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageField}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full"
                  style={{ backgroundColor: '#b88a49' }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </Button>

                {editingProduct && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
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
                        dimensions: { length: "", width: "", height: "" },
                        age_range: { min: "", max: "" },
                        tags: "",
                        is_featured: false,
                        images: [{ url: "", alt: "", isPrimary: true }]
                      })
                    }}
                    className="w-full"
                  >
                    Cancel Edit
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Products List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
              <CardDescription>Manage existing products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">${product.price}</p>
                      <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}