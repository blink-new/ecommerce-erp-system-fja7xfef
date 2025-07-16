import { useState, useEffect } from 'react'
import { User, Bell, Shield, Database, Globe, Save } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Switch } from '../components/ui/switch'
import { Label } from '../components/ui/label'
import { Separator } from '../components/ui/separator'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    company: '',
    timezone: 'UTC'
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    orderUpdates: true,
    weeklyReports: false
  })
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90
  })
  const [system, setSystem] = useState({
    autoBackup: true,
    dataRetention: 365,
    apiAccess: false
  })
  const { toast } = useToast()

  useEffect(() => {
    loadUserSettings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserSettings = async () => {
    try {
      setLoading(true)
      const currentUser = await blink.auth.me()
      setUser(currentUser)
      
      // Load user profile data
      setProfileData({
        displayName: currentUser?.displayName || '',
        email: currentUser?.email || '',
        company: 'Your Company Name', // This would come from user settings
        timezone: 'UTC'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await blink.auth.updateMe({
        displayName: profileData.displayName
      })
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = () => {
    // In a real app, this would save to database
    toast({
      title: 'Success',
      description: 'Notification preferences updated'
    })
  }

  const handleSaveSecurity = () => {
    // In a real app, this would save to database
    toast({
      title: 'Success',
      description: 'Security settings updated'
    })
  }

  const handleSaveSystem = () => {
    // In a real app, this would save to database
    toast({
      title: 'Success',
      description: 'System settings updated'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <a href="#profile" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </a>
                <a href="#notifications" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </a>
                <a href="#security" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </a>
                <a href="#system" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">
                  <Database className="h-4 w-4" />
                  <span>System</span>
                </a>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card id="profile">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    placeholder="Enter your display name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    placeholder="Enter your company name"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card id="notifications">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lowStockAlerts" className="text-base font-medium">
                    Low Stock Alerts
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Get notified when inventory levels are low
                  </p>
                </div>
                <Switch
                  id="lowStockAlerts"
                  checked={notifications.lowStockAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, lowStockAlerts: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="orderUpdates" className="text-base font-medium">
                    Order Updates
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Receive notifications for procurement and order status changes
                  </p>
                </div>
                <Switch
                  id="orderUpdates"
                  checked={notifications.orderUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weeklyReports" className="text-base font-medium">
                    Weekly Reports
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Receive weekly summary reports via email
                  </p>
                </div>
                <Switch
                  id="weeklyReports"
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notifications
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card id="security">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth" className="text-base font-medium">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={security.twoFactorAuth}
                  onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
                />
              </div>
              
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="480"
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) || 30 })}
                  className="mt-1 max-w-xs"
                />
                <p className="text-sm text-slate-600 mt-1">
                  Automatically log out after this period of inactivity
                </p>
              </div>
              
              <div>
                <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  min="30"
                  max="365"
                  value={security.passwordExpiry}
                  onChange={(e) => setSecurity({ ...security, passwordExpiry: parseInt(e.target.value) || 90 })}
                  className="mt-1 max-w-xs"
                />
                <p className="text-sm text-slate-600 mt-1">
                  Require password change after this many days
                </p>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card id="system">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup" className="text-base font-medium">
                    Automatic Backups
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Automatically backup your data daily
                  </p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={system.autoBackup}
                  onCheckedChange={(checked) => setSystem({ ...system, autoBackup: checked })}
                />
              </div>
              
              <div>
                <Label htmlFor="dataRetention">Data Retention (days)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  min="30"
                  max="2555"
                  value={system.dataRetention}
                  onChange={(e) => setSystem({ ...system, dataRetention: parseInt(e.target.value) || 365 })}
                  className="mt-1 max-w-xs"
                />
                <p className="text-sm text-slate-600 mt-1">
                  How long to keep deleted records before permanent removal
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="apiAccess" className="text-base font-medium">
                    API Access
                  </Label>
                  <p className="text-sm text-slate-600 mt-1">
                    Enable API access for third-party integrations
                  </p>
                </div>
                <Switch
                  id="apiAccess"
                  checked={system.apiAccess}
                  onCheckedChange={(checked) => setSystem({ ...system, apiAccess: checked })}
                />
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSystem}>
                  <Save className="h-4 w-4 mr-2" />
                  Save System
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}