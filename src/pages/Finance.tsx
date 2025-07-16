import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useToast } from '../hooks/use-toast'

interface FinancialRecord {
  id: string
  type: 'expense' | 'revenue'
  category: string
  amount: number
  description: string
  date: string
  referenceId?: string
  createdAt: string
}

interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  monthlyGrowth: number
  topExpenseCategories: { category: string; amount: number }[]
  recentTransactions: FinancialRecord[]
}

export default function Finance() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const { toast } = useToast()

  useEffect(() => {
    loadFinancialData()
  }, [selectedPeriod]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      
      // Mock financial data - in real app, this would be calculated from procurement and sales data
      const mockSummary: FinancialSummary = {
        totalRevenue: 45678.90,
        totalExpenses: 32450.75,
        netProfit: 13228.15,
        monthlyGrowth: 12.5,
        topExpenseCategories: [
          { category: 'Procurement', amount: 25600.00 },
          { category: 'Shipping', amount: 4200.50 },
          { category: 'Marketing', amount: 1800.25 },
          { category: 'Operations', amount: 850.00 }
        ],
        recentTransactions: [
          {
            id: '1',
            type: 'expense',
            category: 'Procurement',
            amount: 1299.50,
            description: 'SKU001 - Wireless Headphones (50 units)',
            date: '2024-01-20',
            referenceId: 'PROC-001',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            type: 'revenue',
            category: 'Sales',
            amount: 2599.00,
            description: 'Customer order #12345',
            date: '2024-01-19',
            referenceId: 'ORDER-12345',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            type: 'expense',
            category: 'Shipping',
            amount: 125.00,
            description: 'Shipping costs for order batch',
            date: '2024-01-18',
            referenceId: 'SHIP-001',
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            type: 'revenue',
            category: 'Sales',
            amount: 899.99,
            description: 'Customer order #12346',
            date: '2024-01-17',
            referenceId: 'ORDER-12346',
            createdAt: new Date().toISOString()
          },
          {
            id: '5',
            type: 'expense',
            category: 'Marketing',
            amount: 450.00,
            description: 'Google Ads campaign',
            date: '2024-01-16',
            createdAt: new Date().toISOString()
          }
        ]
      }
      
      setSummary(mockSummary)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load financial data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    if (!summary) return
    
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: summary.totalRevenue,
        totalExpenses: summary.totalExpenses,
        netProfit: summary.netProfit,
        monthlyGrowth: summary.monthlyGrowth
      },
      expenseBreakdown: summary.topExpenseCategories,
      transactions: summary.recentTransactions
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Success',
      description: 'Financial report exported successfully'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">No financial data available</h3>
            <p className="text-slate-600">Financial data will be automatically generated from your procurement and sales activities.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Finance</h1>
          <p className="text-slate-600 mt-1">Track your financial performance and expenses</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ${summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  ${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-50">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Net Profit</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ${summary.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Growth Rate</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  +{summary.monthlyGrowth}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Expense Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.topExpenseCategories.map((category, index) => {
              const percentage = (category.amount / summary.totalExpenses) * 100
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500" style={{
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}></div>
                    <span className="font-medium text-slate-900">{category.category}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-slate-500">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'revenue' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'revenue' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-900">{transaction.description}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      {transaction.referenceId && (
                        <span>Ref: {transaction.referenceId}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'revenue' ? '+' : '-'}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profit Margin Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Margin Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Gross Margin</p>
              <p className="text-2xl font-bold text-slate-900">
                {((summary.netProfit / summary.totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Expense Ratio</p>
              <p className="text-2xl font-bold text-slate-900">
                {((summary.totalExpenses / summary.totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">ROI</p>
              <p className="text-2xl font-bold text-green-600">
                {((summary.netProfit / summary.totalExpenses) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}