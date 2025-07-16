import { useState, useEffect } from 'react'
import { Plus, Search, Upload, Download, Edit, Trash2, Image as ImageIcon, Link as LinkIcon, GripVertical, X } from 'lucide-react'
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
  userId: string
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
  const [linkInput, setLinkInput] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadProducts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadProducts = async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      if (!user) return

      // 使用本地存储作为临时解决方案
      const storedProducts = localStorage.getItem(`products_${user.id}`)
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts))
      } else {
        // 示例数据
        const mockProducts: Product[] = [
          {
            id: '1',
            sku: 'SKU001',
            title: '无线蓝牙耳机',
            specifications: '蓝牙5.0, 20小时续航, 主动降噪',
            description: '高品质无线耳机，具有主动降噪功能',
            images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'],
            links: ['https://example.com/product1'],
            sortOrder: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: user.id
          },
          {
            id: '2',
            sku: 'SKU002',
            title: '智能手表 Series X',
            specifications: 'GPS, 心率监测, 防水',
            description: '先进的智能手表，具有健康监测功能',
            images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'],
            links: ['https://example.com/product2'],
            sortOrder: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: user.id
          }
        ]
        setProducts(mockProducts)
        localStorage.setItem(`products_${user.id}`, JSON.stringify(mockProducts))
      }
    } catch (error) {
      console.error('加载产品失败:', error)
      toast({
        title: '错误',
        description: '加载产品失败',
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
        title: '错误',
        description: 'SKU和标题为必填项',
        variant: 'destructive'
      })
      return
    }

    try {
      const user = await blink.auth.me()
      if (!user) return

      const productData = {
        ...formData,
        userId: user.id,
        sortOrder: editingProduct?.sortOrder || products.length + 1,
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (editingProduct) {
        const updatedProducts = products.map(p => p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p)
        setProducts(updatedProducts)
        localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))
        toast({
          title: '成功',
          description: '产品更新成功'
        })
      } else {
        const newProduct = { ...productData, id: Date.now().toString() }
        const updatedProducts = [...products, newProduct]
        setProducts(updatedProducts)
        localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))
        toast({
          title: '成功',
          description: '产品添加成功'
        })
      }

      resetForm()
      setIsAddDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('保存产品失败:', error)
      toast({
        title: '错误',
        description: '保存产品失败',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个产品吗？')) {
      try {
        const user = await blink.auth.me()
        if (!user) return

        const updatedProducts = products.filter(p => p.id !== id)
        setProducts(updatedProducts)
        localStorage.setItem(`products_${user.id}`, JSON.stringify(updatedProducts))
        toast({
          title: '成功',
          description: '产品删除成功'
        })
      } catch (error) {
        console.error('删除产品失败:', error)
        toast({
          title: '错误',
          description: '删除产品失败',
          variant: 'destructive'
        })
      }
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
    setLinkInput('')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '错误',
        description: '请选择图片文件',
        variant: 'destructive'
      })
      return
    }

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '错误',
        description: '图片大小不能超过5MB',
        variant: 'destructive'
      })
      return
    }

    try {
      setUploadingImage(true)
      
      // 使用Blink SDK上传图片
      const { publicUrl } = await blink.storage.upload(
        file,
        `products/${Date.now()}-${file.name}`,
        { upsert: true }
      )

      setFormData({
        ...formData,
        images: [...formData.images, publicUrl]
      })

      toast({
        title: '成功',
        description: '图片上传成功'
      })
    } catch (error) {
      console.error('图片上传失败:', error)
      toast({
        title: '错误',
        description: '图片上传失败',
        variant: 'destructive'
      })
    } finally {
      setUploadingImage(false)
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
      title: '成功',
      description: '产品数据导出成功'
    })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const importedProducts = JSON.parse(event.target?.result as string)
          const user = await blink.auth.me()
          if (!user) return

          // 为导入的产品添加用户ID
          const productsWithUserId = importedProducts.map((product: any) => ({
            ...product,
            userId: user.id,
            id: undefined // 让数据库生成新的ID
          }))

          // 批量添加产品
          const existingProducts = JSON.parse(localStorage.getItem(`products_${user.id}`) || '[]')
          const allProducts = [...existingProducts, ...productsWithUserId.map((p: any) => ({ ...p, id: Date.now().toString() + Math.random() }))]
          setProducts(allProducts)
          localStorage.setItem(`products_${user.id}`, JSON.stringify(allProducts))
          toast({
            title: '成功',
            description: '产品数据导入成功'
          })
        } catch (error) {
          console.error('导入失败:', error)
          toast({
            title: '错误',
            description: '文件格式无效',
            variant: 'destructive'
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    link.target = '_blank'
    link.click()
  }

  const downloadAllImages = (product: Product) => {
    product.images.forEach((imageUrl, index) => {
      setTimeout(() => {
        downloadImage(imageUrl, `${product.sku}-image-${index + 1}.jpg`)
      }, index * 500) // 延迟下载避免浏览器阻止
    })
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
          <h1 className="text-3xl font-bold text-slate-900">产品管理</h1>
          <p className="text-slate-600 mt-1">管理您的产品目录</p>
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
            导入数据
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingProduct(null) }}>
                <Plus className="h-4 w-4 mr-2" />
                添加产品
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? '编辑产品' : '添加新产品'}
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
                      placeholder="输入SKU"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">标题 *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="输入产品标题"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="specifications">规格</Label>
                  <Input
                    id="specifications"
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    placeholder="输入产品规格"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="输入产品描述"
                    rows={3}
                  />
                </div>
                
                {/* Images Section */}
                <div>
                  <Label>产品图片</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={uploadingImage}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? '上传中...' : '上传图片'}
                    </Button>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`产品图片 ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Links Section */}
                <div>
                  <Label>产品链接</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      placeholder="输入链接URL"
                    />
                    <Button type="button" onClick={addLink}>添加</Button>
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
                    取消
                  </Button>
                  <Button type="submit">
                    {editingProduct ? '更新' : '添加'}产品
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
          placeholder="按SKU或标题搜索..."
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
              <h3 className="text-lg font-medium text-slate-900 mb-2">未找到产品</h3>
              <p className="text-slate-600">
                {searchTerm ? '尝试调整搜索条件' : '开始添加您的第一个产品'}
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
                        <strong>规格:</strong> {product.specifications}
                      </p>
                    )}
                    
                    {product.description && (
                      <p className="text-slate-700 mb-3">{product.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      {product.images.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <ImageIcon className="h-4 w-4" />
                          <span>{product.images.length} 张图片</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadAllImages(product)}
                            className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                          >
                            下载全部
                          </Button>
                        </div>
                      )}
                      {product.links.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <LinkIcon className="h-4 w-4" />
                          <span>{product.links.length} 个链接</span>
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
                      <div key={index} className="relative group flex-shrink-0">
                        <img
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          className="h-16 w-16 object-cover rounded border cursor-pointer"
                          onClick={() => window.open(image, '_blank')}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadImage(image, `${product.sku}-${index + 1}.jpg`)}
                          className="absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded text-xs"
                        >
                          下载
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Links */}
                {product.links.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {product.links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm block truncate"
                      >
                        {link}
                      </a>
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