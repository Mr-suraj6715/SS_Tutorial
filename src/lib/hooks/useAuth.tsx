import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'

export type UserRole = 'admin' | 'moderator' | 'teacher' | 'student' | 'parent' | 'user'

export interface UserProfile {
  id: string
  full_name: string
  phone: string
  avatar_url: string | null
  role: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
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
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<UserRole>('user')
  const [loading, setLoading] = useState<boolean>(true)

  const fetchProfileAndRole = async (userId: string) => {
    try {
      // 1. Fetch user role from user_roles (authoritative RBAC)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      if (roleData?.role) {
        setRole(roleData.role as UserRole)
      } else {
        setRole('user')
      }

      // 2. Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileData) {
        setProfile(profileData as UserProfile)
        // If role wasn't in user_roles, check profile role as fallback
        if (!roleData?.role && profileData.role) {
          setRole(profileData.role as UserRole)
        }
      }
    } catch (e) {
      console.warn('Error fetching profile or role:', e)
    }
  }

  const refreshAuth = async () => {
    try {
      setLoading(true)
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setUser(data.session?.user || null)
      if (data.session?.user) {
        await fetchProfileAndRole(data.session.user.id)
      } else {
        setProfile(null)
        setRole('user')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      if (newSession?.user) {
        await fetchProfileAndRole(newSession.user.id)
      } else {
        setProfile(null)
        setRole('user')
      }
      setLoading(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string, desiredRole: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: desiredRole,
        },
      },
    })
    if (error) return { error }

    if (data.user) {
      // Upsert profile and user_roles
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        role: desiredRole as any,
      })
      await supabase.from('user_roles').upsert({
        user_id: data.user.id,
        role: (desiredRole === 'admin' ? 'admin' : 'user') as any,
      })
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
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
        session,
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
