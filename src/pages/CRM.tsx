import { useState, useEffect } from 'react'
import { Plus, Search, Upload, Download, Edit, Trash2, User, Mail, Phone, Building } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { useToast } from '../hooks/use-toast'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  company: string
  notes: string
  createdAt: string
  updatedAt: string
}

export default function CRM() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCustomers = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual database query
      const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, New York, NY 10001',
          company: 'Tech Solutions Inc.',
          notes: 'VIP customer, prefers email communication',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@company.com',
          phone: '+1 (555) 987-6543',
          address: '456 Oak Ave, Los Angeles, CA 90210',
          company: 'Creative Agency LLC',
          notes: 'Bulk order customer, quarterly purchases',
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Michael Brown',
          email: 'mbrown@startup.io',
          phone: '+1 (555) 456-7890',
          address: '789 Pine St, Seattle, WA 98101',
          company: 'StartupXYZ',
          notes: 'New customer, interested in premium products',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setCustomers(mockCustomers)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Name and Email are required',
        variant: 'destructive'
      })
      return
    }

    try {
      const customerData = {
        ...formData,
        id: editingCustomer?.id || Date.now().toString(),
        createdAt: editingCustomer?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (editingCustomer) {
        setCustomers(customers.map(c => c.id === editingCustomer.id ? customerData : c))
        toast({
          title: 'Success',
          description: 'Customer updated successfully'
        })
      } else {
        setCustomers([...customers, customerData])
        toast({
          title: 'Success',
          description: 'Customer added successfully'
        })
      }

      resetForm()
      setIsAddDialogOpen(false)
      setEditingCustomer(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save customer',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== id))
      toast({
        title: 'Success',
        description: 'Customer deleted successfully'
      })
    }
  }

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      company: customer.company,
      notes: customer.notes
    })
    setEditingCustomer(customer)
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      notes: ''
    })
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(customers, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'customers.json'
    link.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Customer data exported successfully'
    })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedCustomers = JSON.parse(event.target?.result as string)
          setCustomers(importedCustomers)
          toast({
            title: 'Success',
            description: 'Customer data imported successfully'
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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-slate-900">CRM</h1>
          <p className="text-slate-600 mt-1">Manage your customer relationships</p>
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
              <Button onClick={() => { resetForm(); setEditingCustomer(null) }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Enter notes about the customer"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setEditingCustomer(null)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCustomer ? 'Update' : 'Add'} Customer
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
          placeholder="Search by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-slate-400 mb-4">
                  <User className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No customers found</h3>
                <p className="text-slate-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first customer'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{customer.name}</h3>
                    {customer.company && (
                      <p className="text-sm text-slate-600 mb-2 flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        {customer.company}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(customer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(customer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-slate-600">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  
                  {customer.phone && (
                    <div className="flex items-center text-slate-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  
                  {customer.address && (
                    <div className="flex items-start text-slate-600">
                      <User className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-xs leading-relaxed">{customer.address}</span>
                    </div>
                  )}
                </div>
                
                {customer.notes && (
                  <div className="mt-3 p-2 bg-slate-50 rounded text-xs text-slate-600">
                    {customer.notes}
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Added: {new Date(customer.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}