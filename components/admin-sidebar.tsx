"use client"
import { Package, Users, BarChart3, Settings, LogOut, Shield, ChevronLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { adminLogout } from '@/lib/admin-api'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { TrulluLogo } from './TrulluLogo'

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ isCollapsed, onToggleCollapse, isMobile = false, onMobileClose }: AdminSidebarProps) {
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
    <div 
      className="h-full flex flex-col slide-in-left transition-all duration-300 ease-in-out sidebar-no-scroll"
      style={{ 
        width: '100%',
        backgroundColor: isMobile ? '#ffffff' : 'var(--sidebar-bg)',
        borderRadius: isMobile ? '0' : '0 16px 16px 0',
        boxShadow: isMobile ? '4px 0 12px rgba(0, 0, 0, 0.3)' : '4px 0 12px rgba(0, 0, 0, 0.15), 2px 0 4px rgba(0, 0, 0, 0.1)',
        border: 'none',
        marginRight: isMobile ? '0' : '8px',
        zIndex: isMobile ? 999 : 'auto',
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <div className="p-4 relative" style={{ borderBottom: 'none' }}>
        <div className="flex flex-col items-center gap-3">
          {/* Trullu Logo */}
          <TrulluLogo size="xl" variant="teal" showText={false} />
          {(!isCollapsed || isMobile) && (
            <div className="text-center">
              <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Admin Panel</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>System</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Administrator</p>
            </div>
          )}
        </div>
          {/* Toggle Button - Always visible */}
          <button 
            onClick={isMobile ? onMobileClose : onToggleCollapse} 
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10"
            style={{ 
              color: 'var(--text-secondary)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(4px)'
            }}
          >
            {isMobile ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            )}
          </button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 p-4 sidebar-no-scroll">
        <div className="space-y-1">
          {!isCollapsed && (
            <h3 
              className="text-xs font-semibold uppercase tracking-wider mb-4 px-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              Navigation
            </h3>
          )}
          {items.map((item) => (
            <Link href={item.url} key={item.title}>
              <div
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                  activeUrl === item.url
                    ? "shadow-md"
                    : "hover:shadow-sm"
                }`}
                style={{
                  backgroundColor: activeUrl === item.url 
                    ? 'var(--primary-teal)' 
                    : 'transparent',
                  color: activeUrl === item.url 
                    ? 'white' 
                    : 'var(--text-primary)',
                  justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start'
                }}
                onMouseEnter={(e) => {
                  if (activeUrl !== item.url) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeUrl !== item.url) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <item.icon className="h-4 w-4" />
                {(!isCollapsed || isMobile) && <span>{item.title}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300"
          style={{ 
            color: '#dc2626',
            backgroundColor: 'transparent',
            justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut className="h-4 w-4" />
          {(!isCollapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}
