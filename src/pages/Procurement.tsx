import { useState, useEffect } from 'react'
import { Plus, Search, Upload, Download, Edit, Trash2, Calendar, Package } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { useToast } from '../hooks/use-toast'

interface ProcurementRecord {
  id: string
  date: string
  sku: string
  imageUrl: string
  quantity: number
  unitPrice: number
  shippingCost: number
  totalPrice: number
  purchaseLink: string
  trackingNumber: string
  status: 'pending' | 'shipped' | 'delivered'
  createdAt: string
  updatedAt: string
}

export default function Procurement() {
  const [records, setRecords] = useState<ProcurementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ProcurementRecord | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sku: '',
    imageUrl: '',
    quantity: 1,
    unitPrice: 0,
    shippingCost: 0,
    purchaseLink: '',
    trackingNumber: '',
    status: 'pending' as const
  })
  const { toast } = useToast()

  useEffect(() => {
    loadRecords()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadRecords = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual database query
      const mockRecords: ProcurementRecord[] = [
        {
          id: '1',
          date: '2024-01-15',
          sku: 'SKU001',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
          quantity: 50,
          unitPrice: 25.99,
          shippingCost: 15.00,
          totalPrice: 1314.50,
          purchaseLink: 'https://supplier.com/order/12345',
          trackingNumber: 'TRK123456789',
          status: 'delivered',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          date: '2024-01-20',
          sku: 'SKU002',
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
          quantity: 30,
          unitPrice: 89.99,
          shippingCost: 25.00,
          totalPrice: 2724.70,
          purchaseLink: 'https://supplier.com/order/12346',
          trackingNumber: 'TRK987654321',
          status: 'shipped',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setRecords(mockRecords)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load procurement records',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sku || formData.quantity <= 0 || formData.unitPrice <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields with valid values',
        variant: 'destructive'
      })
      return
    }

    try {
      const totalPrice = (formData.quantity * formData.unitPrice) + formData.shippingCost
      
      const recordData = {
        ...formData,
        totalPrice,
        id: editingRecord?.id || Date.now().toString(),
        createdAt: editingRecord?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (editingRecord) {
        setRecords(records.map(r => r.id === editingRecord.id ? recordData : r))
        toast({
          title: 'Success',
          description: 'Procurement record updated successfully'
        })
      } else {
        setRecords([...records, recordData])
        toast({
          title: 'Success',
          description: 'Procurement record added successfully'
        })
      }

      resetForm()
      setIsAddDialogOpen(false)
      setEditingRecord(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save procurement record',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this procurement record?')) {
      setRecords(records.filter(r => r.id !== id))
      toast({
        title: 'Success',
        description: 'Procurement record deleted successfully'
      })
    }
  }

  const handleEdit = (record: ProcurementRecord) => {
    setFormData({
      date: record.date,
      sku: record.sku,
      imageUrl: record.imageUrl,
      quantity: record.quantity,
      unitPrice: record.unitPrice,
      shippingCost: record.shippingCost,
      purchaseLink: record.purchaseLink,
      trackingNumber: record.trackingNumber,
      status: record.status
    })
    setEditingRecord(record)
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      sku: '',
      imageUrl: '',
      quantity: 1,
      unitPrice: 0,
      shippingCost: 0,
      purchaseLink: '',
      trackingNumber: '',
      status: 'pending'
    })
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(records, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'procurement.json'
    link.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Procurement data exported successfully'
    })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedRecords = JSON.parse(event.target?.result as string)
          setRecords(importedRecords)
          toast({
            title: 'Success',
            description: 'Procurement data imported successfully'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRecords = records.filter(record =>
    record.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-slate-900">Procurement</h1>
          <p className="text-slate-600 mt-1">Track your purchase orders and suppliers</p>
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
              <Button onClick={() => { resetForm(); setEditingRecord(null) }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Procurement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? 'Edit Procurement Record' : 'Add New Procurement Record'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
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
                </div>
                
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Enter image URL"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitPrice">Unit Price *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingCost">Shipping Cost</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.shippingCost}
                      onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="purchaseLink">Purchase Link</Label>
                  <Input
                    id="purchaseLink"
                    value={formData.purchaseLink}
                    onChange={(e) => setFormData({ ...formData, purchaseLink: e.target.value })}
                    placeholder="Enter purchase link"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Input
                      id="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                      placeholder="Enter tracking number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded">
                  <p className="text-sm text-slate-600">
                    Total Price: ${((formData.quantity * formData.unitPrice) + formData.shippingCost).toFixed(2)}
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setEditingRecord(null)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRecord ? 'Update' : 'Add'} Record
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
          placeholder="Search by SKU or tracking number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-slate-400 mb-4">
                <Package className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No procurement records found</h3>
              <p className="text-slate-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first procurement record'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {record.imageUrl && (
                      <img
                        src={record.imageUrl}
                        alt={record.sku}
                        className="h-16 w-16 object-cover rounded border flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge variant="secondary">{record.sku}</Badge>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Date:</span>
                          <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Quantity:</span>
                          <p className="font-medium">{record.quantity}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Unit Price:</span>
                          <p className="font-medium">${record.unitPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Total:</span>
                          <p className="font-medium text-green-600">${record.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {record.trackingNumber && (
                        <div className="mt-2 text-sm">
                          <span className="text-slate-500">Tracking:</span>
                          <span className="ml-2 font-mono">{record.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}