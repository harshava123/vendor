"use client"
import { Package, Users, BarChart3, Settings, LogOut, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { adminLogout } from '@/lib/admin-api'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

export function AdminSidebar() {
  const [activeUrl, setActiveUrl] = useState<string>("")
  const pathname = usePathname()
  const router = useRouter()

  const items = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: BarChart3,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: Package,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ]

  useEffect(() => {
    setActiveUrl(pathname)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await adminLogout();
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminToken');
      toast({
        title: "Success",
        description: "Logged out successfully.",
        variant: "default",
        className: "bg-blue-500 text-white",
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout API fails
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminToken');
      router.push('/login');
    }
  }

  return (
    <div className="h-screen w-80 bg-gray-100 border-r border-gray-300 flex flex-col fixed left-0 top-0 z-10">
      {/* Header */}
      <div className="p-6 border-b border-gray-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-gray-900">Admin Panel</h2>
            <p className="text-base text-gray-600">System Administrator</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Navigation</h3>
          {items.map((item) => (
            <Link href={item.url} key={item.title}>
              <div
                className={`flex items-center gap-4 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200 ${
                  activeUrl === item.url
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-300">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full rounded-lg px-4 py-3 text-base font-medium text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
