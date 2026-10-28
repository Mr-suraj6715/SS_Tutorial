import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

export interface SiteSettings {
  institute_name: string
  tagline: string
  about: string
  founder_name: string
  founder_title: string
  founder_bio: string
  founder_image_url: string
  notice_ticker: string
  address: string
  phone: string
  email: string
  working_hours: string
  whatsapp_number: string
  whatsapp_message: string
  footer_note: string
  logo_url: string
  hero_image_url: string
  map_embed_url: string
  instagram_url: string
  facebook_url: string
  youtube_url: string
  twitter_url: string
  linkedin_url: string
  meta_title: string
  meta_description: string
  [key: string]: string
}

export const defaultSettings: SiteSettings = {
  institute_name: 'SS Tutorial',
  tagline: 'ACHIEVING EXCELLENCE TOGETHER',
  about: 'Welcome to SS TUTORIAL CLASSES - Your Ultimate Math Learning Hub! We simplify complex topics and help you master math with fun, clarity, and confidence. Specializing in SSC Board & CBSE coaching for School Classes and High School.',
  founder_name: 'Ankit Gupta',
  founder_title: 'Founder & Director',
  founder_bio: 'Dedicated educator and founder of SS Tutorial, passionate about simplifying mathematics and guiding students toward academic excellence through conceptual clarity and disciplined practice.',
  founder_image_url: '/founder.jpg',
  notice_ticker: "Education Can't SNATCH By Anyone",
  address: '002, (B) WING, VEER 10, UMROLI (EAST)',
  phone: '7738820436',
  email: '',
  working_hours: 'Mon - Sat: 8:00 AM - 8:00 PM',
  whatsapp_number: '7738820436',
  whatsapp_message: 'Hello SS Tutorial, I would like to inquire about courses and admissions.',
  footer_note: '© SS Tutorial. All Rights Reserved.',
  logo_url: '/logo.png',
  hero_image_url: '',
  map_embed_url: '',
  instagram_url: 'https://www.instagram.com/ss__tutorial',
  facebook_url: '',
  youtube_url: 'https://www.youtube.com/@SS__tutorial2025',
  twitter_url: '',
  linkedin_url: '',
  meta_title: 'SS Tutorial | Achieving Excellence Together',
  meta_description: 'Welcome to SS Tutorial - Your Ultimate Math Learning Hub. Located at 002, (B) Wing, Veer 10, Umroli (East). Follow us on Instagram @ss__tutorial and YouTube @SS__tutorial2025.',
}

interface SiteSettingsContextType {
  settings: SiteSettings
  loading: boolean
  refreshSettings: () => Promise<void>
  updateSetting: (key: string, value: string) => Promise<boolean>
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
  updateSetting: async () => false,
})

function isValidSettingValue(key: string, value: unknown): boolean {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  // Filter out accidental repeated test keystrokes like "ssssssss"
  if (/^s+$/i.test(trimmed)) return false
  return true
}

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchSettings = async () => {
    try {
      setLoading(true)

      // 1. Try local backend API (/api/settings)
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const json = await res.json()
          if (json && json.settings) {
            const settingsMap: SiteSettings = { ...defaultSettings }
            for (const [k, v] of Object.entries(json.settings)) {
              if (isValidSettingValue(k, v)) {
                settingsMap[k] = v as string
              }
            }
            setSettings(settingsMap)
            localStorage.setItem('ss_tutorial_settings', JSON.stringify(settingsMap))
            return
          }
        }
      } catch {
        // backend api unreachable, fallback
      }

      // 2. Try Supabase if configured
      const { data, error } = await supabase.from('site_settings').select('key, value')
      if (!error && Array.isArray(data)) {
        const settingsMap: SiteSettings = { ...defaultSettings }
        data.forEach((row: { key: string; value: string }) => {
          if (row.key && isValidSettingValue(row.key, row.value)) {
            settingsMap[row.key] = row.value
          }
        })
        setSettings(settingsMap)
        localStorage.setItem('ss_tutorial_settings', JSON.stringify(settingsMap))
        return
      }

      // 3. Fallback to localStorage
      const local = localStorage.getItem('ss_tutorial_settings')
      if (local) {
        try {
          const parsed = JSON.parse(local)
          const sanitized: SiteSettings = { ...defaultSettings }
          let hadJunk = false
          for (const [k, v] of Object.entries(parsed)) {
            if (isValidSettingValue(k, v)) {
              sanitized[k] = v as string
            } else if (parsed[k] !== undefined) {
              hadJunk = true
            }
          }
          if (hadJunk) {
            localStorage.setItem('ss_tutorial_settings', JSON.stringify(sanitized))
          }
          setSettings(sanitized)
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Could not fetch remote settings, using local/defaults', e)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string): Promise<boolean> => {
    try {
      const updated = { ...settings, [key]: value }
      setSettings(updated)
      localStorage.setItem('ss_tutorial_settings', JSON.stringify(updated))

      // Also persist to backend API if available
      try {
        await fetch('/api/settings/' + encodeURIComponent(key), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('ss_token') ? { 'Authorization': 'Bearer ' + localStorage.getItem('ss_token') } : {})
          },
          body: JSON.stringify({ value })
        })
      } catch {
        // ignore
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

      if (error) {
        console.warn('Failed to persist setting to Supabase:', error)
        return false
      }
      return true
    } catch (err) {
      console.error('Error updating setting:', err)
      return false
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSetting,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  )
}

export const useSiteSettings = () => useContext(SiteSettingsContext)
