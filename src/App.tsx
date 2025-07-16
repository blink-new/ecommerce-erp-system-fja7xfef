import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Toaster } from './components/ui/toaster'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Procurement from './pages/Procurement'
import Inventory from './pages/Inventory'
import CRM from './pages/CRM'
import Finance from './pages/Finance'
import BackupRestore from './pages/BackupRestore'
import Settings from './pages/Settings'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">E-commerce ERP System</h1>
          <p className="text-slate-600 mb-8">Please sign in to access your ERP dashboard</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/backup" element={<BackupRestore />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  )
}

export default App