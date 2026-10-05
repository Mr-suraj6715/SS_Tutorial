import React, { createContext, useContext, useEffect, useState } from 'react'

export type UserRole = 'admin' | 'moderator' | 'teacher' | 'student' | 'parent' | 'user'

export interface UserProfile {
  id: string
  full_name: string
  phone: string
  avatar_url: string | null
  role: string
  email?: string
}

export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    role?: string
  }
}

interface AuthContextType {
  user: AuthUser | null
  session: any | null
  profile: UserProfile | null
  role: UserRole
  loading: boolean
  isAdmin: boolean
  isTeacher: boolean
  isStudent: boolean
  isParent: boolean
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signUpWithEmail: (email: string, password: string, fullName: string, role: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: 'user',
  loading: true,
  isAdmin: false,
  isTeacher: false,
  isStudent: false,
  isParent: false,
  signInWithGoogle: async () => ({ error: null }),
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signOut: async () => {},
  refreshAuth: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<UserRole>('user')
  const [loading, setLoading] = useState<boolean>(true)

  const refreshAuth = async () => {
    try {
      const token = localStorage.getItem('ss_token')
      if (!token) {
        setUser(null)
        setProfile(null)
        setRole('user')
        return
      }

      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      })

      if (res.ok) {
        const data = await res.json()
        const u = data.user
        if (u) {
          const authUser: AuthUser = {
            id: u.id,
            email: u.email,
            user_metadata: { full_name: u.name, role: u.role },
          }
          const prof: UserProfile = {
            id: u.id,
            full_name: u.name,
            phone: u.phone || '',
            avatar_url: null,
            role: u.role,
            email: u.email,
          }
          setUser(authUser)
          setProfile(prof)
          setRole((u.role as UserRole) || 'user')
        }
      } else {
        // Token invalid or expired
        localStorage.removeItem('ss_token')
        setUser(null)
        setProfile(null)
        setRole('user')
      }
    } catch (err) {
      console.warn('Auth verification error:', err)
      // Check cached user in localStorage if network glitch
      try {
        const cachedUserStr = localStorage.getItem('ss_user')
        if (cachedUserStr) {
          const u = JSON.parse(cachedUserStr)
          setUser({ id: u.id, email: u.email, user_metadata: { full_name: u.name, role: u.role } })
          setProfile({ id: u.id, full_name: u.name, phone: '', avatar_url: null, role: u.role, email: u.email })
          setRole((u.role as UserRole) || 'user')
        }
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAuth()
  }, [])

  const signInWithGoogle = async () => {
    return { error: new Error('Google Sign-In is not configured for local environment. Please use email and password.') }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase()
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        return { error: new Error(data.error || 'Failed to sign in. Please check your credentials.') }
      }

      if (data.token) {
        localStorage.setItem('ss_token', data.token)
        localStorage.setItem('ss_user', JSON.stringify(data.user))
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          user_metadata: { full_name: data.user.name, role: data.user.role },
        }
        setUser(authUser)
        setProfile({
          id: data.user.id,
          full_name: data.user.name,
          phone: '',
          avatar_url: null,
          role: data.user.role,
          email: data.user.email,
        })
        setRole((data.user.role as UserRole) || 'user')
      }

      return { error: null }
    } catch (err: any) {
      return { error: new Error(err?.message || 'Network error during sign in.') }
    }
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string, desiredRole: string) => {
    try {
      // Prevent unauthorized admin signups
      const safeRole = desiredRole === 'admin' ? 'student' : desiredRole

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role: safeRole,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        return { error: new Error(data.error || 'Registration failed. Please try again.') }
      }

      if (data.token) {
        localStorage.setItem('ss_token', data.token)
        localStorage.setItem('ss_user', JSON.stringify(data.user))
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          user_metadata: { full_name: data.user.name, role: data.user.role },
        }
        setUser(authUser)
        setProfile({
          id: data.user.id,
          full_name: data.user.name,
          phone: '',
          avatar_url: null,
          role: data.user.role,
          email: data.user.email,
        })
        setRole((data.user.role as UserRole) || 'student')
      }

      return { error: null }
    } catch (err: any) {
      return { error: new Error(err?.message || 'Network error during registration.') }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('ss_token')
    localStorage.removeItem('ss_user')
    setUser(null)
    setProfile(null)
    setRole('user')
  }

  const isAdmin = role === 'admin' || role === 'moderator'
  const isTeacher = role === 'teacher' || isAdmin
  const isStudent = role === 'student'
  const isParent = role === 'parent'

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        profile,
        role,
        loading,
        isAdmin,
        isTeacher,
        isStudent,
        isParent,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
