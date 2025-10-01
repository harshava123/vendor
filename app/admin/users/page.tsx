"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiClient } from '@/lib/admin-api';

export default function AdminUsersPage() {
  const router = useRouter();
  useEffect(() => {
    const adminToken = adminApiClient.getAdminToken?.() || localStorage.getItem('adminToken');
    const adminEmail = typeof window !== 'undefined' ? localStorage.getItem('adminEmail') : null;
    if (!adminToken || adminEmail !== 'Admin@gmail.com') {
      router.replace('/login');
    }
  }, [router]);
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="shadow-sm border-b" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>User Management</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage vendors and user accounts</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                All registered users
              </p>
            </CardContent>
          </Card>
          
          <Card style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                Verified vendors
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                Pending verification
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Suspended accounts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-light)' }}>
          <CardContent className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>User Management</h3>
            <p>User management features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

