import React, { useEffect, useState } from 'react'
import { Instagram, Eye, X, ExternalLink, Image as ImageIcon } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { updatePageMeta } from '@/lib/utils/seo'

export const GalleryPage: React.FC = () => {
  const { settings } = useSiteSettings()
  const [images, setImages] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [activeImage, setActiveImage] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updatePageMeta({
      title: 'Photo Gallery',
      description: `Explore classrooms, campus events, and celebrations at ${settings.institute_name}. Follow us on Instagram @ss__tutorial.`,
    }, settings.institute_name)

    const fetchGallery = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true })
          
        if (error) throw error
        if (data) setImages(data)
      } catch (err) {
        console.warn('Error fetching gallery:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [settings])

  const filteredImages = images.filter((img) => {
    if (filter === 'all') return true
    return img.placement === filter
  })

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Moments & Milestones
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Campus Photo Gallery
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            A glimpse into life at SS Tutorial, classroom sessions, academic celebrations, and student milestones.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {['all', 'gallery', 'classroom', 'results', 'hero'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                filter === tab
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab === 'all' ? 'All Images' : tab}
            </button>
          ))}
        </div>

        {/* Masonry / Grid */}
        {filteredImages.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                onClick={() => setActiveImage(img)}
                className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Thumbnail First with Lazy Loading */}
                <div className="overflow-hidden bg-slate-100">
                  <img
                    src={img.thumbnail_url || img.webp_url || img.image_url}
                    alt={img.alt_text || img.title || 'SS Tutorial Gallery'}
                    loading="lazy"
                    className="w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end text-white">
                  <p className="font-bold text-sm text-amber-300">{img.title || 'SS Tutorial'}</p>
                  {img.caption && (
                    <p className="text-xs text-emerald-100/90 line-clamp-2 mt-0.5">{img.caption}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-200">
                      <Eye className="w-3.5 h-3.5" /> Click to expand
                    </span>
                    {img.instagram_post_url && (
                      <span className="p-1 rounded-full bg-pink-600 text-white">
                        <Instagram className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 font-bold text-base">
              No gallery images found in this category.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Admin can upload photos via the Gallery Manager or import from Instagram.
            </p>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image display */}
            <div className="flex-1 overflow-auto bg-black flex items-center justify-center min-h-[300px]">
              <img
                src={activeImage.webp_url || activeImage.image_url}
                alt={activeImage.alt_text || activeImage.title}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            </div>

            {/* Meta info bar */}
            <div className="p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-amber-400">
                  {activeImage.title || 'SS Tutorial'}
                </h3>
                {activeImage.caption && (
                  <p className="text-xs text-slate-300 mt-1">{activeImage.caption}</p>
                )}
              </div>

              {activeImage.instagram_post_url && (
                <a
                  href={activeImage.instagram_post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-semibold shadow hover:scale-105 transition"
                >
                  <Instagram className="w-4 h-4" />
                  <span>View Original Instagram Post</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
