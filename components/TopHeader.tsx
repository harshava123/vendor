"use client"
import { BellIcon, LogOut, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogoutConfirmation } from "@/components/LogoutConfirmation";

interface TopHeaderProps {
  isMobile?: boolean;
  onMobileMenuClick?: () => void;
}

export function TopHeader({ isMobile = false, onMobileMenuClick }: TopHeaderProps) {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [vendorName, setVendorName] = useState("Vendor User");

  useEffect(() => {
    // Get vendor name from localStorage
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedName) {
      setVendorName(storedName);
    } else if (storedEmail) {
      // Extract name from email if no name is stored
      const nameFromEmail = storedEmail.split('@')[0];
      setVendorName(nameFromEmail);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("vendor_token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
    } catch {}
    sessionStorage.setItem('justLoggedOut', 'true');
    router.push("/login");
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

  return (
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
      {isMobile && onMobileMenuClick && (
        <button
          onClick={onMobileMenuClick}
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
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <div className="flex items-center relative">
          <div 
            className="p-2 rounded-full cursor-pointer transition-all duration-300"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            }}
          >
            <BellIcon className="h-5 w-5" style={{ color: '#e5e7eb' }} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              1
            </span>
          </div>
        </div>

        {/* User Profile */}
        <div className={`flex items-center gap-3 ${isMobile ? 'hidden sm:flex' : ''}`}>
          <div 
            className="p-2 rounded-full cursor-pointer transition-all duration-300"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            }}
          >
            <User className="h-5 w-5" style={{ color: '#e5e7eb' }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{vendorName}</p>
            <p className="text-xs" style={{ color: '#00FF00' }}>Online</p>
          </div>
          <Button
            variant="ghost"
            className={`cursor-pointer hover:bg-white/10 transition-all duration-300 ${isMobile ? 'hidden sm:flex' : ''}`}
            style={{ color: '#00FF00' }}
            onClick={handleLogoutClick}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
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
