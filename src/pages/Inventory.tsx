import { useState, useEffect } from 'react'
import { Plus, Search, Upload, Download, ArrowUp, ArrowDown, Package, AlertTriangle } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { useToast } from '../hooks/use-toast'

interface InventoryItem {
  id: string
  sku: string
  productTitle: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  lastUpdated: string
}

interface PendingStock {
  id: string
  sku: string
  quantity: number
  expectedDate: string
  supplier: string
  trackingNumber: string
}

interface StockTransaction {
  id: string
  sku: string
  type: 'in' | 'out'
  quantity: number
  trackingNumber: string
  notes: string
  createdAt: string
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [pendingStock, setPendingStock] = useState<PendingStock[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isStockInDialogOpen, setIsStockInDialogOpen] = useState(false)
  const [isStockOutDialogOpen, setIsStockOutDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [stockInData, setStockInData] = useState({
    quantity: 1,
    trackingNumber: '',
    notes: ''
  })
  const [stockOutData, setStockOutData] = useState({
    quantity: 1,
    trackingNumber: '',
    notes: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadInventoryData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadInventoryData = async () => {
    try {
      setLoading(true)
      
      // Mock inventory data
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          sku: 'SKU001',
          productTitle: 'Wireless Bluetooth Headphones',
          quantity: 45,
          reservedQuantity: 5,
          availableQuantity: 40,
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          sku: 'SKU002',
          productTitle: 'Smart Watch Series X',
          quantity: 12,
          reservedQuantity: 2,
          availableQuantity: 10,
          lastUpdated: new Date().toISOString()
        }
      ]

      // Mock pending stock data (from procurement)
      const mockPendingStock: PendingStock[] = [
        {
          id: '1',
          sku: 'SKU003',
          quantity: 25,
          expectedDate: '2024-02-01',
          supplier: 'Tech Supplier Co.',
          trackingNumber: 'TRK123456789'
        }
      ]

      // Mock transaction history
      const mockTransactions: StockTransaction[] = [
        {
          id: '1',
          sku: 'SKU001',
          type: 'in',
          quantity: 50,
          trackingNumber: 'TRK987654321',
          notes: 'Initial stock from supplier',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          sku: 'SKU001',
          type: 'out',
          quantity: 5,
          trackingNumber: 'OUT123456',
          notes: 'Customer order fulfillment',
          createdAt: new Date().toISOString()
        }
      ]

      setInventory(mockInventory)
      setPendingStock(mockPendingStock)
      setTransactions(mockTransactions)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load inventory data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedItem || stockInData.quantity <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid quantity',
        variant: 'destructive'
      })
      return
    }

    try {
      // Update inventory
      const updatedInventory = inventory.map(item => {
        if (item.id === selectedItem.id) {
          const newQuantity = item.quantity + stockInData.quantity
          return {
            ...item,
            quantity: newQuantity,
            availableQuantity: newQuantity - item.reservedQuantity,
            lastUpdated: new Date().toISOString()
          }
        }
        return item
      })
      setInventory(updatedInventory)

      // Add transaction record
      const newTransaction: StockTransaction = {
        id: Date.now().toString(),
        sku: selectedItem.sku,
        type: 'in',
        quantity: stockInData.quantity,
        trackingNumber: stockInData.trackingNumber,
        notes: stockInData.notes,
        createdAt: new Date().toISOString()
      }
      setTransactions([newTransaction, ...transactions])

      toast({
        title: 'Success',
        description: `Stock in completed for ${selectedItem.sku}`
      })

      setIsStockInDialogOpen(false)
      setSelectedItem(null)
      setStockInData({ quantity: 1, trackingNumber: '', notes: '' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process stock in',
        variant: 'destructive'
      })
    }
  }

  const handleStockOut = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedItem || stockOutData.quantity <= 0 || stockOutData.quantity > selectedItem.availableQuantity) {
      toast({
        title: 'Error',
        description: 'Please enter a valid quantity (not exceeding available stock)',
        variant: 'destructive'
      })
      return
    }

    try {
      // Update inventory
      const updatedInventory = inventory.map(item => {
        if (item.id === selectedItem.id) {
          const newQuantity = item.quantity - stockOutData.quantity
          return {
            ...item,
            quantity: newQuantity,
            availableQuantity: newQuantity - item.reservedQuantity,
            lastUpdated: new Date().toISOString()
          }
        }
        return item
      })
      setInventory(updatedInventory)

      // Add transaction record
      const newTransaction: StockTransaction = {
        id: Date.now().toString(),
        sku: selectedItem.sku,
        type: 'out',
        quantity: stockOutData.quantity,
        trackingNumber: stockOutData.trackingNumber,
        notes: stockOutData.notes,
        createdAt: new Date().toISOString()
      }
      setTransactions([newTransaction, ...transactions])

      toast({
        title: 'Success',
        description: `Stock out completed for ${selectedItem.sku}`
      })

      setIsStockOutDialogOpen(false)
      setSelectedItem(null)
      setStockOutData({ quantity: 1, trackingNumber: '', notes: '' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process stock out',
        variant: 'destructive'
      })
    }
  }

  const handleExport = () => {
    const exportData = {
      inventory,
      pendingStock,
      transactions
    }
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'inventory.json'
    link.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Inventory data exported successfully'
    })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string)
          if (importedData.inventory) setInventory(importedData.inventory)
          if (importedData.pendingStock) setPendingStock(importedData.pendingStock)
          if (importedData.transactions) setTransactions(importedData.transactions)
          
          toast({
            title: 'Success',
            description: 'Inventory data imported successfully'
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

  const filteredInventory = inventory.filter(item =>
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const lowStockItems = inventory.filter(item => item.availableQuantity < 10)

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
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-600 mt-1">Manage your stock levels and transactions</p>
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
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Low Stock Alert</h3>
            </div>
            <p className="text-red-700 mt-1">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} running low on stock
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="destructive" className="text-xs">
                  {item.sku}: {item.availableQuantity} left
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Stock */}
      {pendingStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Pending Stock Arrivals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingStock.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{item.sku}</Badge>
                      <span className="font-medium">{item.quantity} units</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Expected: {new Date(item.expectedDate).toLocaleDateString()} • {item.supplier}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      // In real app, this would move from pending to actual inventory
                      toast({
                        title: 'Stock Received',
                        description: `${item.quantity} units of ${item.sku} added to inventory`
                      })
                    }}
                  >
                    Mark as Received
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search by SKU or product title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventory.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-slate-400 mb-4">
                <Package className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No inventory items found</h3>
              <p className="text-slate-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Inventory will be automatically populated from procurement'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInventory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="secondary">{item.sku}</Badge>
                      <h3 className="text-lg font-semibold text-slate-900">{item.productTitle}</h3>
                      {item.availableQuantity < 10 && (
                        <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div>
                        <span className="text-slate-500">Total Quantity:</span>
                        <p className="text-2xl font-bold text-slate-900">{item.quantity}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Reserved:</span>
                        <p className="text-2xl font-bold text-orange-600">{item.reservedQuantity}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Available:</span>
                        <p className="text-2xl font-bold text-green-600">{item.availableQuantity}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 mt-2">
                      Last updated: {new Date(item.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog open={isStockInDialogOpen && selectedItem?.id === item.id} onOpenChange={setIsStockInDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          <ArrowUp className="h-4 w-4 mr-1" />
                          Stock In
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Stock In - {item.sku}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleStockIn} className="space-y-4">
                          <div>
                            <Label htmlFor="stockInQuantity">Quantity *</Label>
                            <Input
                              id="stockInQuantity"
                              type="number"
                              min="1"
                              value={stockInData.quantity}
                              onChange={(e) => setStockInData({ ...stockInData, quantity: parseInt(e.target.value) || 1 })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="stockInTracking">Tracking Number</Label>
                            <Input
                              id="stockInTracking"
                              value={stockInData.trackingNumber}
                              onChange={(e) => setStockInData({ ...stockInData, trackingNumber: e.target.value })}
                              placeholder="Enter tracking number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="stockInNotes">Notes</Label>
                            <Textarea
                              id="stockInNotes"
                              value={stockInData.notes}
                              onChange={(e) => setStockInData({ ...stockInData, notes: e.target.value })}
                              placeholder="Enter notes"
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsStockInDialogOpen(false)
                                setSelectedItem(null)
                                setStockInData({ quantity: 1, trackingNumber: '', notes: '' })
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Confirm Stock In</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isStockOutDialogOpen && selectedItem?.id === item.id} onOpenChange={setIsStockOutDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                          disabled={item.availableQuantity === 0}
                        >
                          <ArrowDown className="h-4 w-4 mr-1" />
                          Stock Out
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Stock Out - {item.sku}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleStockOut} className="space-y-4">
                          <div>
                            <Label htmlFor="stockOutQuantity">Quantity * (Max: {item.availableQuantity})</Label>
                            <Input
                              id="stockOutQuantity"
                              type="number"
                              min="1"
                              max={item.availableQuantity}
                              value={stockOutData.quantity}
                              onChange={(e) => setStockOutData({ ...stockOutData, quantity: parseInt(e.target.value) || 1 })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="stockOutTracking">Tracking Number</Label>
                            <Input
                              id="stockOutTracking"
                              value={stockOutData.trackingNumber}
                              onChange={(e) => setStockOutData({ ...stockOutData, trackingNumber: e.target.value })}
                              placeholder="Enter tracking number"
                            />
                          </div>
                          <div>
                            <Label htmlFor="stockOutNotes">Notes</Label>
                            <Textarea
                              id="stockOutNotes"
                              value={stockOutData.notes}
                              onChange={(e) => setStockOutData({ ...stockOutData, notes: e.target.value })}
                              placeholder="Enter notes"
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsStockOutDialogOpen(false)
                                setSelectedItem(null)
                                setStockOutData({ quantity: 1, trackingNumber: '', notes: '' })
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">Confirm Stock Out</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'in' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'in' ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{transaction.sku}</Badge>
                        <span className="font-medium">
                          {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
                        </span>
                      </div>
                      {transaction.notes && (
                        <p className="text-sm text-slate-600">{transaction.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}