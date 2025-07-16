import { useState, useEffect } from 'react'
import { Plus, Search, Upload, Download, Edit, Trash2, Image as ImageIcon, Link as LinkIcon, GripVertical } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'

interface Product {
  id: string
  sku: string
  title: string
  specifications: string
  description: string
  images: string[]
  links: string[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    sku: '',
    title: '',
    specifications: '',
    description: '',
    images: [] as string[],
    links: [] as string[]
  })
  const [imageInput, setImageInput] = useState('')
  const [linkInput, setLinkInput] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadProducts = async () => {
    try {
      setLoading(true)
      // Simulate API call - replace with actual database query
      const mockProducts: Product[] = [
        {
          id: '1',
          sku: 'SKU001',
          title: 'Wireless Bluetooth Headphones',
          specifications: 'Bluetooth 5.0, 20hr battery, Noise cancellation',
          description: 'Premium wireless headphones with active noise cancellation',
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'],
          links: ['https://example.com/product1'],
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          sku: 'SKU002',
          title: 'Smart Watch Series X',
          specifications: 'GPS, Heart rate monitor, Waterproof',
          description: 'Advanced smartwatch with health monitoring features',
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'],
          links: ['https://example.com/product2'],
          sortOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setProducts(mockProducts)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sku || !formData.title) {
      toast({
        title: 'Error',
        description: 'SKU and Title are required',
        variant: 'destructive'
      })
      return
    }

    try {
      const productData = {
        ...formData,
        id: editingProduct?.id || Date.now().toString(),
        sortOrder: editingProduct?.sortOrder || products.length + 1,
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? productData : p))
        toast({
          title: 'Success',
          description: 'Product updated successfully'
        })
      } else {
        setProducts([...products, productData])
        toast({
          title: 'Success',
          description: 'Product added successfully'
        })
      }

      resetForm()
      setIsAddDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id))
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      })
    }
  }

  const handleEdit = (product: Product) => {
    setFormData({
      sku: product.sku,
      title: product.title,
      specifications: product.specifications,
      description: product.description,
      images: product.images,
      links: product.links
    })
    setEditingProduct(product)
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      sku: '',
      title: '',
      specifications: '',
      description: '',
      images: [],
      links: []
    })
    setImageInput('')
    setLinkInput('')
  }

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()]
      })
      setImageInput('')
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const addLink = () => {
    if (linkInput.trim()) {
      setFormData({
        ...formData,
        links: [...formData.links, linkInput.trim()]
      })
      setLinkInput('')
    }
  }

  const removeLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index)
    })
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(products, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'products.json'
    link.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Products exported successfully'
    })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedProducts = JSON.parse(event.target?.result as string)
          setProducts(importedProducts)
          toast({
            title: 'Success',
            description: 'Products imported successfully'
          })
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Invalid file format',
            variant: 'destructive'
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const filteredProducts = products.filter(product =>
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-file"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('import-file')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingProduct(null) }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Enter SKU"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter product title"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="specifications">Specifications</Label>
                  <Input
                    id="specifications"
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    placeholder="Enter specifications"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>
                
                {/* Images Section */}
                <div>
                  <Label>Images</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Enter image URL"
                    />
                    <Button type="button" onClick={addImage}>Add</Button>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                          <span className="text-sm truncate">{image}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Links Section */}
                <div>
                  <Label>Links</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      placeholder="Enter link URL"
                    />
                    <Button type="button" onClick={addLink}>Add</Button>
                  </div>
                  {formData.links.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.links.map((link, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                          <span className="text-sm truncate">{link}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLink(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setEditingProduct(null)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update' : 'Add'} Product
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search by SKU or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-slate-400 mb-4">
                <Package className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <GripVertical className="h-4 w-4 text-slate-400" />
                      <Badge variant="secondary">{product.sku}</Badge>
                      <h3 className="text-lg font-semibold text-slate-900">{product.title}</h3>
                    </div>
                    
                    {product.specifications && (
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Specs:</strong> {product.specifications}
                      </p>
                    )}
                    
                    {product.description && (
                      <p className="text-slate-700 mb-3">{product.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      {product.images.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <ImageIcon className="h-4 w-4" />
                          <span>{product.images.length} image{product.images.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {product.links.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <LinkIcon className="h-4 w-4" />
                          <span>{product.links.length} link{product.links.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Images Preview */}
                {product.images.length > 0 && (
                  <div className="mt-4 flex space-x-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="h-16 w-16 object-cover rounded border flex-shrink-0"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}