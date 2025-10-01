"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useState, useEffect } from "react";
import { TopHeader } from "@/components/TopHeader";
import { Search, Bell, User, LogOut } from "lucide-react";
import { LogoutConfirmation } from "@/components/LogoutConfirmation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAdminLogoutConfirm, setShowAdminLogoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if user is admin
    const adminEmail = localStorage.getItem('adminEmail');
    const adminToken = localStorage.getItem('adminToken');
    const isAdminUser = adminEmail === 'Admin@gmail.com' && adminToken && pathname.startsWith('/admin');
    setIsAdmin(isAdminUser);

    // Check if mobile
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [pathname]);

  const hideSidebar = pathname === "/login" || pathname === '/login/otp' || pathname === '/register';
  const isAdminRoute = pathname.startsWith('/admin');

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };

  const sidebarWidth = isSidebarCollapsed ? '80px' : '280px';

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    sessionStorage.setItem('justLoggedOut', 'true');
    window.location.href = '/login';
  };

  const handleAdminLogoutClick = () => {
    setShowAdminLogoutConfirm(true);
  };

  const handleAdminLogoutConfirm = () => {
    setShowAdminLogoutConfirm(false);
    handleAdminLogout();
  };

  const handleAdminLogoutCancel = () => {
    setShowAdminLogoutConfirm(false);
  };

  if (!isClient) {
    return null;
  }

  // Admin routes use different layout
  if (isAdminRoute) {
    return (
      <div className="min-h-screen w-full flex" style={{ backgroundColor: 'var(--light-gray)' }}>
        {/* Mobile Overlay */}
        {isMobile && isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Fixed Sidebar */}
        <div 
          className={`fixed left-0 top-0 h-screen z-50 ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}
          style={{ 
            width: isMobile ? '280px' : (isSidebarCollapsed ? '80px' : '280px'),
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <AdminSidebar 
            isCollapsed={isMobile ? false : isSidebarCollapsed} 
            onToggleCollapse={toggleSidebar}
            isMobile={isMobile}
            onMobileClose={() => setIsMobileMenuOpen(false)}
          />
        </div>
        
        {/* Main Content Area */}
        <div 
          className="flex-1 flex flex-col h-screen overflow-hidden"
          style={{ 
            marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '96px' : '296px'),
            backgroundColor: 'var(--light-gray)',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {/* Fixed Admin Header */}
          <div className="flex-shrink-0" style={{ backgroundColor: 'var(--light-gray)' }}>
            <div
              className="border-b px-4 sm:px-6 py-4 flex justify-between items-center"
              style={{
                background: 'linear-gradient(135deg, #0b0b0b 0%, #16181d 100%)',
                borderColor: 'var(--border-light)',
                width: '100%',
                minHeight: '73px'
              }}
            >
              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200 mr-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              {/* Left side - Search */}
              <div className="flex items-center gap-2 sm:gap-6 flex-1">
                {/* Search Bar */}
                <div className={`search-bar ${isMobile ? 'hidden sm:flex' : ''}`}>
                  <Search className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="How can I help you?"
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
                
                {/* Mobile Search Button */}
                {isMobile && (
                  <button className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
                    <Search className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                )}
              </div>

              {/* Right side - Notifications and User */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="flex items-center relative">
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200">
                    <Bell className="h-5 w-5" style={{ color: '#e5e7eb' }} />
                  </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Admin User</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>System Administrator</p>
                  </div>
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200">
                    <User className="h-5 w-5" style={{ color: '#e5e7eb' }} />
                  </button>
                  <button 
                    onClick={handleAdminLogoutClick}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                  >
                    <LogOut className="h-5 w-5" style={{ color: '#00FF00' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6" style={{ backgroundColor: 'var(--light-gray)' }}>
            <div className="modern-card p-6 min-h-full fade-in">
              {children}
            </div>
          </main>
        </div>
        
        {/* Admin Logout Confirmation Dialog */}
        <LogoutConfirmation
          isOpen={showAdminLogoutConfirm}
          onClose={handleAdminLogoutCancel}
          onConfirm={handleAdminLogoutConfirm}
          userType="admin"
        />
      </div>
    );
  }

  // Regular vendor layout
  return (
    <div className="min-h-screen w-full flex" style={{ backgroundColor: 'var(--light-gray)' }}>
        {/* Mobile Overlay */}
        {isMobile && isMobileMenuOpen && !hideSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

      {!hideSidebar && (
        <div 
          className={`flex-shrink-0 transition-all duration-300 ease-in-out ${isMobile ? 'fixed left-0 top-0 h-screen z-50' : ''} ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : ''}`}
          style={{ 
            width: isMobile ? '280px' : sidebarWidth
          }}
        >
          <AppSidebar 
            isCollapsed={isMobile ? false : isSidebarCollapsed} 
            onToggleCollapse={toggleSidebar}
            isMobile={isMobile}
            onMobileClose={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}
      <div 
        className="flex-1 flex flex-col" 
        style={{ 
          marginLeft: isMobile ? '0' : '16px', 
          backgroundColor: 'var(--light-gray)' 
        }}
      >
        {!hideSidebar && (
          <div className="flex-shrink-0" style={{ backgroundColor: 'var(--light-gray)' }}>
            <TopHeader 
              isMobile={isMobile}
              onMobileMenuClick={toggleSidebar}
            />
          </div>
        )}
        <main className={`flex-1 overflow-x-hidden p-4 sm:p-6`} style={{ backgroundColor: 'var(--light-gray)' }}>
          <div className="modern-card p-4 sm:p-6 min-h-full fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
