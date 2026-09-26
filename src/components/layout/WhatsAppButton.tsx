import React from 'react'
import { MessageCircle } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'

export const WhatsAppButton: React.FC = () => {
  const { settings } = useSiteSettings()

  const rawNumber = settings.whatsapp_number ? settings.whatsapp_number.replace(/[^0-9]/g, '') : ''
  if (!rawNumber) return null

  const encodedMsg = encodeURIComponent(
    settings.whatsapp_message || 'Hello SS Tutorial, I would like to inquire about courses and admissions.'
  )
  const whatsappUrl = `https://wa.me/${rawNumber}?text=${encodedMsg}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp with SS Tutorial"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-full shadow-2xl hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-300 group border border-white/20"
    >
      <MessageCircle className="w-5 h-5 text-white fill-white group-hover:animate-pulse" />
      <span className="hidden sm:inline">Chat with Us</span>
    </a>
  )
}
