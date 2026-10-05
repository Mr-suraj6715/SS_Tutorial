import React, { useState, useEffect } from 'react'
import { GraduationCap, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { useAuth } from '@/lib/hooks/useAuth'
import { useBackendAuth } from '@/lib/hooks/useBackendAuth'
import { updatePageMeta } from '@/lib/utils/seo'

export const AuthPage: React.FC = () => {
  const { settings } = useSiteSettings()
  // Backend auth (JWT)
  const { signIn: backendSignIn, user: backendUser } = useBackendAuth()
  // Primary auth hook
  const { user, role, signInWithEmail, signUpWithEmail, signInWithGoogle, refreshAuth } = useAuth()
  
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [desiredRole, setDesiredRole] = useState<'student' | 'parent' | 'teacher' | 'admin'>('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    updatePageMeta({
      title: 'Portal Sign In',
      description: `Sign in to access your SS Tutorial student, teacher, parent, or admin dashboard.`,
    }, settings.institute_name)

    // Backend user takes priority; redirect if already logged in
    if (backendUser) {
      redirectToDashboard(backendUser.role)
      return
    }
    if (user) {
      redirectToDashboard(role)
    }
  }, [user, role, backendUser, settings])

  const redirectToDashboard = (userRole: string) => {
    if (userRole === 'admin' || userRole === 'moderator') {
      window.location.href = '/admin'
    } else if (userRole === 'teacher') {
      window.location.href = '/dashboard/teacher'
    } else if (userRole === 'parent') {
      window.location.href = '/dashboard/parent'
    } else {
      window.location.href = '/dashboard/student'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()

    try {
      if (mode === 'login') {
        // Try backend login first
        const { error: backendErr } = await backendSignIn(cleanEmail, password)
        if (!backendErr) {
          // Backend login succeeded — sync useAuth state and redirect
          await refreshAuth()
          const userStr = localStorage.getItem('ss_user')
          const u = userStr ? JSON.parse(userStr) : null
          const resolvedRole = u?.role || 'student'
          redirectToDashboard(resolvedRole)
          return
        }
        // Fallback to signInWithEmail
        const { error: err } = await signInWithEmail(cleanEmail, password)
        if (err) throw new Error(backendErr || err.message)
        const userStr = localStorage.getItem('ss_user')
        const u = userStr ? JSON.parse(userStr) : null
        redirectToDashboard(u?.role || 'student')
      } else {
        const { error: err } = await signUpWithEmail(cleanEmail, password, fullName, desiredRole)
        if (err) throw err
        const userStr = localStorage.getItem('ss_user')
        const u = userStr ? JSON.parse(userStr) : null
        redirectToDashboard(u?.role || desiredRole)
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      const { error: err } = await signInWithGoogle()
      if (err) throw err
    } catch (err: any) {
      setError(err?.message || 'Google OAuth sign in failed.')
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <a href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-emerald-950 shadow-lg group-hover:scale-105 transition">
            <GraduationCap className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">
            {settings.institute_name || 'SS Tutorial'}
          </span>
        </a>
        <h2 className="text-xl font-bold text-emerald-100">
          {mode === 'login' ? 'Sign in to your portal' : 'Create an institute account'}
        </h2>
        <p className="text-xs text-emerald-300 mt-1">
          Role-based access for Students, Parents, Teachers & Admins
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-emerald-800/40">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError('')
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">
                Or with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    I am registering as:
                  </label>
                  <select
                    value={desiredRole}
                    onChange={(e: any) => setDesiredRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  >
                    <option value="student" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Student</option>
                    <option value="parent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Parent / Guardian</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Administrator and Faculty accounts are created internally and cannot be registered publicly.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs text-emerald-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
