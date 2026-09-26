import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

export interface SiteSettings {
  institute_name: string
  tagline: string
  about: string
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
  tagline: '',
  about: '',
  notice_ticker: '',
  address: '',
  phone: '',
  email: '',
  working_hours: '',
  whatsapp_number: '',
  whatsapp_message: 'Hello SS Tutorial, I would like to inquire about courses and admissions.',
  footer_note: '',
  logo_url: '/logo.png',
  hero_image_url: '',
  map_embed_url: '',
  instagram_url: 'https://www.instagram.com/ss__tutorial',
  facebook_url: '',
  youtube_url: '',
  twitter_url: '',
  linkedin_url: '',
  meta_title: 'SS Tutorial | Coaching Institute',
  meta_description: 'Welcome to SS Tutorial. Follow us on Instagram @ss__tutorial.',
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

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('site_settings').select('key, value')
      if (error) {
        // Fallback to local storage if offline or DB not yet connected
        const local = localStorage.getItem('ss_tutorial_settings')
        if (local) {
          try {
            setSettings({ ...defaultSettings, ...JSON.parse(local) })
          } catch {
            // ignore
          }
        }
        return
      }

      if (data && data.length > 0) {
        const settingsMap = { ...defaultSettings }
        data.forEach((row) => {
          if (row.key) {
            settingsMap[row.key] = row.value || ''
          }
        })
        setSettings(settingsMap)
        localStorage.setItem('ss_tutorial_settings', JSON.stringify(settingsMap))
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
