"use client"
import { Video, LayoutGrid, Package, ArrowLeftRight, Users, ImageIcon, UserCircle, Archive } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function AppSidebar() {
  const [activeUrl, setActiveUrl] = useState<string>("")
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
      title: "Inventory",
      url: "/inventory",
      icon: Archive,
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

  return (
    <Sidebar className="border-0 border-r-0" >
      <SidebarContent className="bg-[#262626] border-0 border-r-0 h-screen sticky top-0 w-64">
        {/* Empty top section matching TopHeader height */}
        <div className="h-[59px] bg-[#262626] "></div>

        <SidebarGroup className="border-0 border-r-0">
          <nav className="flex flex-col border-0 border-r-0 divide-y divide-[#5f925f] gap-2">
            {items.map((item) => (
              <Link 
                key={item.title} 
                href={item.url}
                className={` rounded-md flex items-center gap-3 px-6 py-4 text-[16px] hover:bg-[#98E165]/90 transition-colors whitespace-nowrap
                  ${activeUrl === item.url ? 'bg-[#98E165] text-black' : 'text-white'}
                  ${item.title === 'Dashboard' && activeUrl === item.url ? 'bg-[#98ff98] text-black' : ''}
                `}
              >
                <item.icon className={`h-6 w-6  
                  ${activeUrl === item.url ? 'text-black' : 'text-white'}
                  ${item.title === 'Dashboard' && activeUrl === item.url ? 'text-black' : ''}
                `} />
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </nav>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
