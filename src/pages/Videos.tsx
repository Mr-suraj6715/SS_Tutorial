import React, { useEffect, useState } from 'react'
import { Video, Youtube, Instagram, Play } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { updatePageMeta } from '@/lib/utils/seo'

export const VideosPage: React.FC = () => {
  const { settings } = useSiteSettings()
  const [videos, setVideos] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'youtube' | 'instagram'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updatePageMeta({
      title: 'Video Lectures & Reels',
      description: `Watch educational lectures, tips, and Instagram reels from ${settings.institute_name}.`,
    }, settings.institute_name)

    const fetchVideos = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (data) setVideos(data)
      } catch (err) {
        console.warn('Error fetching videos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [settings])

  const filteredVideos = videos.filter((v) => {
    if (filter === 'all') return true
    return v.platform === filter
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Media & Learning
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Video Lectures & Instagram Reels
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
            Watch concept explanations, exam motivation, solving techniques, and student tips.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
              filter === 'all'
                ? 'bg-emerald-800 text-white shadow'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Videos
          </button>
          <button
            type="button"
            onClick={() => setFilter('youtube')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              filter === 'youtube'
                ? 'bg-red-600 text-white shadow'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" /> YouTube
          </button>
          <button
            type="button"
            onClick={() => setFilter('instagram')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              filter === 'instagram'
                ? 'bg-pink-600 text-white shadow'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" /> Instagram Reels
          </button>
        </div>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                {/* Embed iframe or Video Player */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {video.embed_url ? (
                    <iframe
                      src={video.embed_url}
                      title={video.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : video.thumbnail ? (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full relative group block"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                        <div className="w-12 h-12 rounded-full bg-white/90 text-emerald-950 flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 ml-0.5 fill-emerald-950" />
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                      <Video className="w-8 h-8" />
                      <span>Video player preview</span>
                    </div>
                  )}

                  {/* Platform Badge */}
                  <span
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1 shadow ${
                      video.platform === 'youtube' ? 'bg-red-600' : 'bg-gradient-to-r from-pink-600 to-rose-600'
                    }`}
                  >
                    {video.platform === 'youtube' ? (
                      <>
                        <Youtube className="w-3 h-3" /> YouTube
                      </>
                    ) : (
                      <>
                        <Instagram className="w-3 h-3" /> Instagram
                      </>
                    )}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  {video.url && (
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Watch on {video.platform === 'youtube' ? 'YouTube' : 'Instagram'} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Video className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-200 font-bold text-base">
              No videos currently listed in this category.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Admin can add YouTube lecture links and Instagram reels from the Video Manager in the dashboard.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
