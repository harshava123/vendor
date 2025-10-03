"use client"
import { usePathname } from 'next/navigation'
import { getTabInfo } from './app-sidebar'

export function PageHeader() {
  const pathname = usePathname()
  const tabInfo = getTabInfo(pathname)
  const IconComponent = tabInfo.icon

  return (
    <div className="mb-8 fade-in">
      <div className="flex items-center gap-4 mb-3">
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)' }}
        >
          <IconComponent className="h-8 w-8" style={{ color: '#98FF98' }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {tabInfo.title}
          </h1>
          <p className="text-lg mt-1" style={{ color: 'var(--text-secondary)' }}>
            {tabInfo.description}
          </p>
        </div>
      </div>
    </div>
  )
}
