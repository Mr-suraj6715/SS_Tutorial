import React from 'react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'

export const NoticeTicker: React.FC = () => {
  const { settings } = useSiteSettings()

  let text = settings.notice_ticker?.trim() || "Education Can't SNATCH By Anyone"

  // If text has the old appended admission message, sanitize to the clean centered quote
  if (text.includes("Education Can't SNATCH By Anyone")) {
    text = "Education Can't SNATCH By Anyone"
  }

  if (!text) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-teal-50 via-teal-100/60 to-teal-50 text-teal-950 text-xs sm:text-sm font-semibold py-1 sm:py-1.5 px-4 border-b border-teal-200/60 text-center tracking-wide flex items-center justify-center">
      <span className="text-teal-900 font-semibold">
        {text}
      </span>
    </div>
  )
}
