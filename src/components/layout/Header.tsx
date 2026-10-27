import React, { useState } from 'react'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { useAuth } from '@/lib/hooks/useAuth'

interface HeaderProps {
  currentPath?: string
}

export const Header: React.FC<HeaderProps> = ({ currentPath = '/' }) => {
  const { settings } = useSiteSettings()
  const { user, role } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Courses', href: '/courses' },
    { name: 'Results', href: '/results' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Videos', href: '/videos' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  const getDashboardHref = () => {
    if (role === 'admin' || role === 'moderator') return '/admin'
    if (role === 'teacher') return '/dashboard/teacher'
    if (role === 'parent') return '/dashboard/parent'
    return '/dashboard/student'
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 transition-colors shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single row: logo LEFT | nav CENTERED | buttons RIGHT */}
        <div className="flex items-center h-16 sm:h-[68px] relative">

          {/* ── Brand (left) ── */}
          <a href="/" className="flex items-center gap-2.5 shrink-0 group z-10">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-white border border-slate-200/90 p-0.5 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200">
              <img
                src={settings.logo_url || '/logo.png'}
                alt={settings.institute_name || 'SS Tutorial'}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-teal-900 transition-colors whitespace-nowrap">
                {settings.institute_name || 'SS Tutorial'}
              </span>
              <span className="text-[8.5px] sm:text-[9px] font-bold text-teal-800 tracking-widest uppercase whitespace-nowrap mt-0.5">
                {settings.tagline?.replace(/~$/, '').trim() || 'ACHIEVING EXCELLENCE TOGETHER'}
              </span>
            </div>
          </a>

          {/* ── Desktop Navigation (absolutely centered) ── */}
          <nav className="hidden lg:flex items-center gap-0 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-teal-900 bg-teal-50 font-semibold'
                      : 'text-slate-600 hover:text-teal-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </a>
              )
            })}
          </nav>

          {/* ── Right Actions (ml-auto pushes to far right) ── */}
          <div className="hidden lg:flex items-center gap-2 ml-auto z-10">
            <a
              href={user ? getDashboardHref() : '/auth'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all whitespace-nowrap"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>Dashboard</span>
            </a>

            <a
              href="/contact"
              className="inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-semibold text-white bg-[#154d68] hover:bg-[#0e3a50] shadow-sm transition-all whitespace-nowrap"
            >
              Contact Us
            </a>
          </div>

          {/* ── Mobile Hamburger ── */}
          <div className="flex lg:hidden items-center ml-auto">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-100 px-4 pt-3 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = currentPath === link.href
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'text-teal-900 bg-teal-50 font-semibold'
                    : 'text-slate-700 hover:text-teal-800 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </a>
            )
          })}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href={user ? getDashboardHref() : '/auth'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-teal-700" />
              <span>Dashboard</span>
            </a>

            <a
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full font-semibold text-sm text-white bg-[#154d68] hover:bg-[#0e3a50] shadow-sm transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
