import React, { useEffect, useState } from 'react'
import { Award, Trophy, Star, Sparkles } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { updatePageMeta } from '@/lib/utils/seo'

export const ResultsPage: React.FC = () => {
  const { settings } = useSiteSettings()
  const [achievements, setAchievements] = useState<any[]>([])
  const [toppers, setToppers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updatePageMeta({
      title: 'Results & Top Scorers',
      description: `Celebrating the outstanding board and competitive achievements of students at ${settings.institute_name}.`,
    }, settings.institute_name)

    const fetchResults = async () => {
      try {
        setLoading(true)
        const [achRes, resultsRes] = await Promise.all([
          supabase.from('achievements').select('*').order('display_order', { ascending: true }),
          supabase.from('gallery').select('*').eq('placement', 'results').eq('is_published', true),
        ])

        if (achRes.data && achRes.data.length > 0) {
          setAchievements(achRes.data)
        } else {
          const res = await fetch('/api/content/achievements').catch(() => null)
          if (res?.ok) {
            const d = await res.json()
            if (d.achievements?.length) setAchievements(d.achievements)
          }
        }

        if (resultsRes.data && resultsRes.data.length > 0) {
          setToppers(resultsRes.data)
        } else {
          const res = await fetch('/api/gallery').catch(() => null)
          if (res?.ok) {
            const d = await res.json()
            const toppersFromGallery = (d.gallery || []).filter((g: any) => g.placement === 'results')
            if (toppersFromGallery.length) setToppers(toppersFromGallery)
          }
        }
      } catch (err) {
        console.warn('Error fetching results:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [settings])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold mb-3 border border-amber-300 dark:border-amber-800">
            <Trophy className="w-3.5 h-3.5" /> Proven Track Record of Success
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Our Top Scorers & Achievements
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
            Celebrating the determination, hard work, and remarkable scores achieved by students under our faculty's guidance.
          </p>
        </div>

        {/* Major Achievements Showcase */}
        {achievements.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" /> Major Academic Milestones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition"
                >
                  <div className="h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {ach.image_url ? (
                      <img
                        src={ach.image_url}
                        alt={ach.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-950 flex items-center justify-center text-amber-400">
                        <Trophy className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    {ach.category && (
                      <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                        {ach.category}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {ach.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {ach.description}
                    </p>
                    {ach.date && (
                      <p className="text-[11px] text-slate-400 mt-4">
                        Date: {new Date(ach.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toppers Gallery Gallery Images with placement='results' */}
        {toppers.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Honor Roll & Topper Gallery
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {toppers.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <div className="h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={t.webp_url || t.image_url}
                      alt={t.alt_text || t.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.title}</h4>
                    {t.caption && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                        {t.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {achievements.length === 0 && toppers.length === 0 && (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-200 font-bold text-base">
              Results and achievements list will appear here once added in the dashboard.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
