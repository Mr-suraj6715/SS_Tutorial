import React, { useState } from 'react'
import { Menu, X, GraduationCap, User, LogIn, LayoutDashboard } from 'lucide-react'
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
    <header className="sticky top-0 z-40 w-full bg-emerald-950/95 backdrop-blur-md border-b border-emerald-900/60 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand Name */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-xl bg-white/95 p-1 shadow-md flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform border border-emerald-800/40">
              <img
                src={settings.logo_url || '/logo.png'}
                alt={settings.institute_name || 'SS Tutorial'}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl sm:text-2xl text-white tracking-tight leading-tight group-hover:text-amber-400 transition">
                {settings.institute_name || 'SS Tutorial'}
              </span>
              {settings.tagline && settings.tagline.trim() !== '' ? (
                <span className="text-[11px] text-emerald-300 font-medium tracking-wider uppercase">
                  {settings.tagline}
                </span>
              ) : (
                <span className="text-[11px] text-amber-400/90 font-medium tracking-wider">
                  @ss__tutorial
                </span>
              )}
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-amber-400 bg-emerald-900/60'
                      : 'text-emerald-100/90 hover:text-amber-300 hover:bg-emerald-900/30'
                  }`}
                >
                  {link.name}
                </a>
              )
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/admission"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-emerald-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-colors"
            >
              Apply Now
            </a>

            {user ? (
              <a
                href={getDashboardHref()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-emerald-200 bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/50 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <span>Dashboard</span>
              </a>
            ) : (
              <a
                href="/auth"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-emerald-200 hover:text-white hover:bg-emerald-900/50 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </a>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900/60 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950/98 border-b border-emerald-900 px-4 pt-2 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-emerald-100 hover:text-amber-400 hover:bg-emerald-900/40 transition"
            >
              {link.name}
            </a>
          ))}

          <div className="pt-4 border-t border-emerald-900/80 flex flex-col gap-2.5">
            <a
              href="/admission"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-lg font-semibold text-emerald-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-colors"
            >
              Apply for Admission
            </a>

            {user ? (
              <a
                href={getDashboardHref()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-emerald-200 bg-emerald-900/80 border border-emerald-700/50"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>My Dashboard</span>
              </a>
            ) : (
              <a
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-emerald-200 bg-emerald-900/40"
              >
                <LogIn className="w-4 h-4" />
                <span>Student / Admin Sign In</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
