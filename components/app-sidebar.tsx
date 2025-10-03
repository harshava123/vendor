"use client"
import { Video, LayoutGrid, Package, ArrowLeftRight, Users, ImageIcon, UserCircle, ChevronLeft, LogOut } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { TrulluLogo } from './TrulluLogo'
import { LogoutConfirmation } from '@/components/LogoutConfirmation'

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

// Function to get tab info for PageHeader
export function getTabInfo(pathname: string) {
  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutGrid,
      description: "Overview of your vendor dashboard"
    },
    {
      title: "Products",
      url: "/products",
      icon: Package,
      description: "Manage your product catalog"
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ArrowLeftRight,
      description: "View and manage customer orders"
    },
    {
      title: "Livestream",
      url: "/livestream",
      icon: Video,
      description: "Start live product demonstrations"
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
      description: "Manage customer accounts"
    },
    {
      title: "Promotion banners",
      url: "/addBanners",
      icon: ImageIcon,
      description: "Create and manage promotional content"
    },
    {
      title: "Profile",
      url: "/profile",
      icon: UserCircle,
      description: "Manage your vendor profile"
    },
  ];

  const item = items.find(item => pathname === item.url || pathname.startsWith(item.url + '/'));
  
  return item || {
    title: "Page",
    url: pathname,
    icon: LayoutGrid,
    description: "Vendor admin page"
  };
}

export function AppSidebar({ isCollapsed, onToggleCollapse, isMobile = false, onMobileClose }: AppSidebarProps) {
  const [activeUrl, setActiveUrl] = useState<string>("")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const pathname = usePathname()

  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutGrid,
    },
    {
      title: "Products",
      url: "/products",
      icon: Package,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: ArrowLeftRight,
    },
    {
      title: "Livestream",
      url: "/livestream",
      icon: Video,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
    },
    {
      title: "Promotion banners",
      url: "/addBanners",
      icon: ImageIcon,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: UserCircle,
    },
  ]

  useEffect(() => {
    setActiveUrl(pathname)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('vendor_token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    
    // Set logout flag and redirect to login page
    sessionStorage.setItem('justLoggedOut', 'true');
    window.location.href = '/login';
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // For mobile, render without Sidebar wrapper to avoid potential issues
  if (isMobile) {
    return (
      <div 
        className="h-screen relative slide-in-left transition-all duration-300 ease-in-out flex flex-col"
        style={{ 
          width: '280px',
          backgroundColor: '#ffffff',
          borderRadius: '0',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.3)',
          border: 'none',
          marginRight: '0',
          zIndex: 999,
          minHeight: '100vh'
        }}
      >
        {/* Header with Trullu Logo */}
        <div className="p-4 relative" style={{ borderBottom: 'none' }}>
          <div className="flex flex-col items-center gap-3">
            <TrulluLogo size="xl" variant="teal" showText={false} />
            <div className="text-center">
              <h2 className="font-semibold text-base" style={{ color: '#1e293b' }}>Vendor Panel</h2>
              <p className="text-sm" style={{ color: '#64748b' }}>Dashboard</p>
            </div>
          </div>
          {/* Toggle Button - Always visible */}
          <button 
            onClick={onMobileClose} 
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10"
            style={{ 
              color: '#64748b',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(4px)'
            }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-3">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link 
                key={item.title} 
                href={item.url}
                className="rounded-lg flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-300 whitespace-nowrap hover:shadow-sm"
                style={{
                  backgroundColor: activeUrl === item.url ? '#98FF98' : 'transparent',
                  color: activeUrl === item.url ? 'white' : '#1e293b',
                  justifyContent: 'flex-start'
                }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="mt-auto p-3 border-t" style={{ borderColor: '#e2e8f0' }}>
          <button
            onClick={handleLogoutClick}
            className="w-full rounded-lg flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-300 whitespace-nowrap hover:shadow-sm"
            style={{
              backgroundColor: 'transparent',
              color: '#1e293b',
              justifyContent: 'flex-start'
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Logout Confirmation Dialog */}
        <LogoutConfirmation
          isOpen={showLogoutConfirm}
          onClose={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
          userType="vendor"
        />
      </div>
    );
  }

  return (
    <Sidebar className="border-0 border-r-0 border-l-0 border-t-0 border-b-0" style={{ border: 'none' }}>
      <SidebarContent 
        className="h-screen relative slide-in-left transition-all duration-300 ease-in-out"
        style={{ 
          width: isCollapsed ? '80px' : '280px',
          backgroundColor: 'var(--sidebar-bg)',
          borderRadius: '0 16px 16px 0',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.15), 2px 0 4px rgba(0, 0, 0, 0.1)',
          border: 'none',
          marginRight: '8px'
        }}
      >
        {/* Mobile Debug Indicator */}
        {isMobile && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-50">
            Mobile
          </div>
        )}

        {/* Header with Trullu Logo */}
        <div className="p-4 relative" style={{ borderBottom: 'none' }}>
          <div className="flex flex-col items-center gap-3">
            <TrulluLogo size="xl" variant="teal" showText={false} />
            {(!isCollapsed || isMobile) && (
              <div className="text-center">
                <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Vendor Panel</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Dashboard</p>
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

        <SidebarGroup className="border-0 border-r-0 p-3 sidebar-no-scroll">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link 
                key={item.title} 
                href={item.url}
                className={`rounded-lg flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-300 whitespace-nowrap
                  ${activeUrl === item.url ? 'shadow-md' : 'hover:shadow-sm'}
                `}
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
              </Link>
            ))}
          </nav>
        </SidebarGroup>

        {/* Logout Section */}
        <div className="mt-auto p-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
          <button
            onClick={handleLogoutClick}
            className="w-full rounded-lg flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-300 whitespace-nowrap hover:shadow-sm"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              justifyContent: (isCollapsed && !isMobile) ? 'center' : 'flex-start'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <LogOut className="h-4 w-4" />
            {(!isCollapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </SidebarContent>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        userType="vendor"
      />
    </Sidebar>
  )
}
