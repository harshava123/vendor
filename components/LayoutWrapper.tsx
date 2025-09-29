"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useState, useEffect } from "react";
import { TopHeader } from "@/components/TopHeader";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if user is admin
    const adminEmail = localStorage.getItem('adminEmail');
    const adminToken = localStorage.getItem('adminToken');
    const isAdminUser = adminEmail === 'Admin@gmail.com' && adminToken && pathname.startsWith('/admin');
    setIsAdmin(isAdminUser);
  }, [pathname]);

  const hideSidebar = pathname === "/login" || pathname === '/login/otp' || pathname === '/register';
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isClient) {
    return null;
  }

  // Admin routes use different layout
  if (isAdminRoute) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <AdminSidebar />
        <main className="ml-80 h-screen overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // Regular vendor layout
  return (
    <div className="min-h-screen w-full">
      {!hideSidebar && <TopHeader />}
      <div className="flex">
        {!hideSidebar && (
          <div className="w-64 flex-shrink-0">
            <AppSidebar />
          </div>
        )}
        <main className={`flex-1 overflow-x-hidden`}>
          {children}
        </main>
      </div>
    </div>
  );
}
