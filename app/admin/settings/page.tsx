"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, Shield, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="shadow-sm border-b" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
            <p style={{ color: 'var(--text-secondary)' }}>System configuration and preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-blue-600" />
                <CardTitle>Database Settings</CardTitle>
              </div>
              <CardDescription>
                Configure database connections and backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Database management features coming soon...</p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-green-600" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>
                Manage security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Security configuration options coming soon...</p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-yellow-600" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Notification settings coming soon...</p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardContent className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>System Settings</h3>
            <p>Advanced system configuration features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

