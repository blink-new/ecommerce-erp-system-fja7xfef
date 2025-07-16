import { useState } from 'react'
import { Download, Upload, Database, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Switch } from '../components/ui/switch'
import { Label } from '../components/ui/label'
import { Progress } from '../components/ui/progress'
import { useToast } from '../hooks/use-toast'

interface BackupRecord {
  id: string
  filename: string
  size: string
  createdAt: string
  type: 'manual' | 'automatic'
  status: 'completed' | 'failed'
}

export default function BackupRestore() {
  const [isBackupEnabled, setIsBackupEnabled] = useState(true)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [backupHistory] = useState<BackupRecord[]>([
    {
      id: '1',
      filename: 'erp-backup-2024-01-20-14-30.json',
      size: '2.4 MB',
      createdAt: '2024-01-20T14:30:00Z',
      type: 'manual',
      status: 'completed'
    },
    {
      id: '2',
      filename: 'erp-backup-2024-01-19-02-00.json',
      size: '2.3 MB',
      createdAt: '2024-01-19T02:00:00Z',
      type: 'automatic',
      status: 'completed'
    },
    {
      id: '3',
      filename: 'erp-backup-2024-01-18-02-00.json',
      size: '2.2 MB',
      createdAt: '2024-01-18T02:00:00Z',
      type: 'automatic',
      status: 'completed'
    },
    {
      id: '4',
      filename: 'erp-backup-2024-01-17-02-00.json',
      size: '2.1 MB',
      createdAt: '2024-01-17T02:00:00Z',
      type: 'automatic',
      status: 'failed'
    }
  ])
  const { toast } = useToast()

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    setBackupProgress(0)

    try {
      // Simulate backup creation progress
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Wait for progress to complete
      await new Promise(resolve => setTimeout(resolve, 2200))

      // Create backup data
      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          products: [], // Would contain actual product data
          procurement: [], // Would contain actual procurement data
          inventory: [], // Would contain actual inventory data
          customers: [], // Would contain actual customer data
          financial_records: [] // Would contain actual financial data
        },
        metadata: {
          totalRecords: 0,
          dataSize: '2.5 MB',
          checksum: 'abc123def456'
        }
      }

      // Download backup file
      const dataStr = JSON.stringify(backupData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `erp-backup-${new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]}-${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}.json`
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Backup Created Successfully',
        description: 'Your complete system backup has been downloaded'
      })
    } catch (error) {
      toast({
        title: 'Backup Failed',
        description: 'Failed to create system backup',
        variant: 'destructive'
      })
    } finally {
      setIsCreatingBackup(false)
      setBackupProgress(0)
    }
  }

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsRestoring(true)
    setRestoreProgress(0)

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        // Simulate restore progress
        const progressInterval = setInterval(() => {
          setRestoreProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval)
              return 100
            }
            return prev + 8
          })
        }, 150)

        // Wait for progress to complete
        await new Promise(resolve => setTimeout(resolve, 2000))

        const backupData = JSON.parse(event.target?.result as string)
        
        // Validate backup structure
        if (!backupData.version || !backupData.data) {
          throw new Error('Invalid backup file format')
        }

        // In a real application, you would restore the data to your database here
        console.log('Restoring data:', backupData)

        toast({
          title: 'Restore Completed Successfully',
          description: 'Your system has been restored from the backup file'
        })
      } catch (error) {
        toast({
          title: 'Restore Failed',
          description: 'Invalid backup file or restore process failed',
          variant: 'destructive'
        })
      } finally {
        setIsRestoring(false)
        setRestoreProgress(0)
      }
    }
    reader.readAsText(file)
  }

  const handleDownloadBackup = (backup: BackupRecord) => {
    // In a real application, this would download the actual backup file
    toast({
      title: 'Download Started',
      description: `Downloading ${backup.filename}`
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Backup & Restore</h1>
          <p className="text-slate-600 mt-1">Protect your data with automated backups and easy restore</p>
        </div>
      </div>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Backup Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-backup" className="text-base font-medium">
                Automatic Backups
              </Label>
              <p className="text-sm text-slate-600 mt-1">
                Automatically create daily backups of your entire system
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={isBackupEnabled}
              onCheckedChange={setIsBackupEnabled}
            />
          </div>
          
          {isBackupEnabled && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Automatic backups enabled</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Daily backups will be created at 2:00 AM and stored securely
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Backup & Restore */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Create Backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              Create a complete backup of your entire ERP system including products, procurement, inventory, customers, and financial data.
            </p>
            
            {isCreatingBackup && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Creating backup...</span>
                  <span>{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="w-full" />
              </div>
            )}
            
            <Button 
              onClick={handleCreateBackup} 
              disabled={isCreatingBackup}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isCreatingBackup ? 'Creating Backup...' : 'Create Full Backup'}
            </Button>
          </CardContent>
        </Card>

        {/* Restore System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Restore System</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Warning</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Restoring will replace all current data with the backup data
              </p>
            </div>
            
            {isRestoring && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Restoring system...</span>
                  <span>{restoreProgress}%</span>
                </div>
                <Progress value={restoreProgress} className="w-full" />
              </div>
            )}
            
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              disabled={isRestoring}
              className="hidden"
              id="restore-file"
            />
            <Button
              onClick={() => document.getElementById('restore-file')?.click()}
              disabled={isRestoring}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isRestoring ? 'Restoring...' : 'Select Backup File'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Backup History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    backup.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {backup.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{backup.filename}</h4>
                    <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                      <span>{new Date(backup.createdAt).toLocaleString()}</span>
                      <span>{backup.size}</span>
                      <span className="capitalize">{backup.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {backup.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadBackup(backup)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-slate-600 mb-1">Last Backup</p>
              <p className="font-medium text-slate-900">
                {new Date(backupHistory[0]?.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Backup Status</p>
              <p className="font-medium text-green-600">Active</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Storage Used</p>
              <p className="font-medium text-slate-900">12.4 MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}