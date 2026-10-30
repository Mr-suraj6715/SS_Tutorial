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
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-200">

          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white border border-slate-200/80 p-0.5 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={settings.logo_url || '/logo.png'}
                  alt={settings.institute_name || 'SS Tutorial'}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                {settings.institute_name || 'SS TUTORIAL'}
              </span>
            </div>

            {settings.about && settings.about.trim() !== '' ? (
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{settings.about}</p>
            ) : (
              <p className="text-sm text-slate-500 leading-relaxed">
                Dedicated coaching institute empowering students with excellence, conceptual clarity, and disciplined learning.
              </p>
            )}

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-700 text-xs font-semibold hover:text-teal-800 border border-slate-200 shadow-xs hover:border-teal-300 transition-all"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-500" />
              Follow @ss__tutorial
            </a>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'All Courses', href: '/courses' },
                { label: 'Apply for Admission', href: '/admission' },
                { label: 'Results & Toppers', href: '/results' },
                { label: 'Campus Gallery', href: '/gallery' },
                { label: 'Video Lectures', href: '/videos' },
                { label: 'Educational Blog', href: '/blog' },
              ].map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className="text-slate-600 hover:text-teal-800 transition-colors flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Contact & Hours
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {settings.address && settings.address.trim() !== '' && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
                  <span>{settings.address}</span>
                </li>
              )}
              {(settings.phone || '7738820436') && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <a href={`tel:${settings.phone || '7738820436'}`} className="hover:text-teal-800 transition-colors">
                    {settings.phone || '7738820436'}
                  </a>
                </li>
              )}
              {settings.email && settings.email.trim() !== '' && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-teal-800 transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.working_hours && settings.working_hours.trim() !== '' && (
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{settings.working_hours}</span>
                </li>
              )}
              {!settings.address && !settings.phone && !settings.email && (
                <li className="text-slate-400 italic text-xs">
                  Contact details will appear here once configured in the Admin Dashboard.
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Social + Connect */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Connect With Us
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Stay connected for exam updates, study materials, and topper highlights.
            </p>

            <div className="flex items-center gap-2.5 mb-6">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-800 border border-slate-200 flex items-center justify-center transition-colors shadow-xs"
                aria-label="Instagram @ss__tutorial"
              >
                <Instagram className="w-4 h-4" />
              </a>
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-800 border border-slate-200 flex items-center justify-center transition-colors shadow-xs"
                  aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-800 border border-slate-200 flex items-center justify-center transition-colors shadow-xs"
                  aria-label="YouTube">
                  <Youtube className="w-4 h-4 text-red-600" />
                </a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-800 border border-slate-200 flex items-center justify-center transition-colors shadow-xs"
                  aria-label="Twitter / X">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings.linkedin_url && (
                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-800 border border-slate-200 flex items-center justify-center transition-colors shadow-xs"
                  aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: 3-Column Grid for Exact Center Alignment */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-xs text-slate-500">
          {/* Left Column: Copyright */}
          <p className="text-center md:text-left">
            &copy; {currentYear} {settings.institute_name || 'SS Tutorial'}. All rights reserved.
          </p>

          {/* Center Column: Darvyx Agency Credit Badge (100% Dead Center) */}
          <div className="flex justify-center items-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#152a22] border border-[#114a38] shadow-sm select-none hover:border-[#1c7a5c] transition-all whitespace-nowrap">
              <span className="text-[#78b5e2] text-xs font-semibold tracking-wide">
                Made by
              </span>
              <img
                src="/darvyx-logo.png"
                alt="Darvyx"
                className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]"
              />
              <span className="text-white text-xs font-bold tracking-tight">
                Darvyx
              </span>
              <span className="text-[#0e523d] text-xs font-light">
                |
              </span>
              <span className="text-[#36b089] text-xs font-medium tracking-wide">
                Your Digital Partner
              </span>
            </div>
          </div>

          {/* Right Column: Policies & Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1">
            <a href="/privacy-policy" className="hover:text-teal-800 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-teal-800 transition-colors">Terms & Conditions</a>
            {settings.footer_note && settings.footer_note.trim() !== '' && (
              <span className="text-teal-700">{settings.footer_note}</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
