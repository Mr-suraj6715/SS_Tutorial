import React from 'react'
import { Bell } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'

export const NoticeTicker: React.FC = () => {
  const { settings } = useSiteSettings()

  if (!settings.notice_ticker || settings.notice_ticker.trim() === '') {
    return null
  }

  return (
    <div className="bg-amber-500 text-amber-950 text-xs sm:text-sm font-medium py-1.5 px-4 flex items-center overflow-hidden border-b border-amber-600/20 shadow-inner">
      <div className="flex items-center gap-1.5 shrink-0 pr-3 font-semibold tracking-wide border-r border-amber-900/20">
        <Bell className="w-3.5 h-3.5 animate-bounce text-amber-900" />
        <span className="uppercase text-[11px] font-bold">Notice</span>
      </div>
      <div className="relative w-full overflow-hidden whitespace-nowrap pl-3">
        <div className="inline-block animate-marquee pl-4">
          {settings.notice_ticker}
        </div>
      </div>
    </div>
  )
}
