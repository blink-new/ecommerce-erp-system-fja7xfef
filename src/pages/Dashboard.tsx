import { useState, useEffect } from 'react'
import { Package, ShoppingCart, Warehouse, Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalProcurement: 0,
    totalInventory: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    monthlyGrowth: 0
  })

  useEffect(() => {
    // 模拟加载统计数据 - 在实际应用中，这将从数据库获取
    setStats({
      totalProducts: 156,
      totalProcurement: 89,
      totalInventory: 1234,
      totalCustomers: 67,
      totalRevenue: 45678.90,
      lowStockItems: 12,
      pendingOrders: 8,
      monthlyGrowth: 12.5
    })
  }, [])

  const statCards = [
    {
      title: '产品总数',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '采购订单',
      value: stats.totalProcurement,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '库存商品',
      value: stats.totalInventory,
      icon: Warehouse,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: '客户数量',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const alertCards = [
    {
      title: '库存不足',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: '商品需要补货'
    },
    {
      title: '待处理订单',
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: '订单等待处理'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">仪表盘</h1>
          <p className="text-slate-600 mt-1">欢迎使用您的ERP管理系统</p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">
            本月增长 +{stats.monthlyGrowth}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Card */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>总收入</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600">
            ¥{stats.totalRevenue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-slate-600 mt-2">所有销售的累计收入</p>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {alertCards.map((alert) => {
          const Icon = alert.icon
          return (
            <Card key={alert.title} className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-5 w-5 ${alert.color}`} />
                      <h3 className="font-semibold text-slate-900">{alert.title}</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{alert.value}</p>
                    <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    需要处理
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Package className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-slate-900">添加产品</h3>
              <p className="text-sm text-slate-600">创建新产品条目</p>
            </button>
            <button className="p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <ShoppingCart className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium text-slate-900">新采购</h3>
              <p className="text-sm text-slate-600">记录新的采购</p>
            </button>
            <button className="p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Warehouse className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-slate-900">库存更新</h3>
              <p className="text-sm text-slate-600">更新库存水平</p>
            </button>
            <button className="p-4 text-left border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Users className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="font-medium text-slate-900">添加客户</h3>
              <p className="text-sm text-slate-600">注册新客户</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}