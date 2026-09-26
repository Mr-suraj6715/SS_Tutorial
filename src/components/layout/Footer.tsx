import React from 'react'
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings()

  const currentYear = new Date().getFullYear()
  const instagramUrl = settings.instagram_url || 'https://www.instagram.com/ss__tutorial'

  return (
    <footer className="bg-emerald-950 text-emerald-100 border-t border-emerald-900/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-emerald-900">

          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white/95 p-1 shadow-md flex items-center justify-center overflow-hidden shrink-0 border border-emerald-800/40">
                <img
                  src={settings.logo_url || '/logo.png'}
                  alt={settings.institute_name || 'SS Tutorial'}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-bold text-xl text-white">
                {settings.institute_name || 'SS Tutorial'}
              </span>
            </div>

            {settings.about && settings.about.trim() !== '' ? (
              <p className="text-sm text-emerald-200/80 leading-relaxed line-clamp-3">{settings.about}</p>
            ) : (
              <p className="text-sm text-emerald-200/80 leading-relaxed">
                Dedicated coaching institute empowering students with excellence, conceptual clarity, and disciplined learning.
              </p>
            )}

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-900 text-emerald-100 text-xs font-semibold hover:bg-emerald-800 border border-emerald-700/50 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              Follow @ss__tutorial
            </a>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'All Courses', href: '/courses' },
                { label: 'Apply for Admission', href: '/admission' },
                { label: 'Results and Toppers', href: '/results' },
                { label: 'Campus Gallery', href: '/gallery' },
                { label: 'Video Lectures', href: '/videos' },
                { label: 'Educational Blog', href: '/blog' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
              Contact and Hours
            </h3>
            <ul className="space-y-3 text-sm text-emerald-200/90">
              {settings.address && settings.address.trim() !== '' && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.phone && settings.phone.trim() !== '' && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`tel:${settings.phone}`} className="hover:text-amber-300 transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && settings.email.trim() !== '' && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-amber-300 transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.working_hours && settings.working_hours.trim() !== '' && (
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{settings.working_hours}</span>
                </li>
              )}
              {!settings.address && !settings.phone && !settings.email && (
                <li className="text-emerald-400/60 italic text-xs">
                  Contact details will appear here once configured in the Admin Dashboard.
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Social + Admin */}
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
              Connect With Us
            </h3>
            <p className="text-xs text-emerald-200/80 mb-4 leading-relaxed">
              Stay connected for exam updates, study materials, and topper highlights.
            </p>

            <div className="flex items-center gap-2.5 mb-6">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram @ss__tutorial"
              >
                <Instagram className="w-4 h-4" />
              </a>
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Twitter / X">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings.linkedin_url && (
                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>

            <a href="/admin" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-amber-300 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Management Portal
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400/80">
          <p>
            &copy; {currentYear} {settings.institute_name || 'SS Tutorial'}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-amber-300 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-amber-300 transition-colors">Terms and Conditions</a>
            {settings.footer_note && settings.footer_note.trim() !== '' && (
              <span className="text-emerald-300">{settings.footer_note}</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
