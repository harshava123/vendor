"use client"
import { usePathname } from 'next/navigation'
import { getTabInfo } from './app-sidebar'

export function PageHeader() {
  const pathname = usePathname()
  const tabInfo = getTabInfo(pathname)
  const IconComponent = tabInfo.icon

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <IconComponent className="h-8 w-8 text-[#98E165]" />
        <h1 className="text-3xl font-bold font-poppins">{tabInfo.title}</h1>
      </div>
      <p className="text-gray-600 font-inter text-lg">{tabInfo.description}</p>
    </div>
  )
}
