import React, { useEffect, useState } from 'react'
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { updatePageMeta } from '@/lib/utils/seo'

export const BlogPage: React.FC = () => {
  const { settings } = useSiteSettings()
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updatePageMeta({
      title: 'Educational Blog & Articles',
      description: `Read the latest study guidance, exam strategies, and educational updates from ${settings.institute_name}.`,
    }, settings.institute_name)

    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })

        if (data) setBlogs(data)
      } catch (err) {
        console.warn('Error fetching blogs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [settings])

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Study Guidance
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Articles & Academic Insights
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Proven preparation techniques, time-management tips, and subject walkthroughs curated by our faculty.
          </p>
        </div>

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="h-52 overflow-hidden bg-slate-100 relative">
                    {post.cover_url ? (
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-950 flex items-center justify-center text-amber-400">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      )}
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {post.author}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700:text-emerald-400 transition">
                      {post.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-amber-500 transition">
                    Read Complete Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 font-bold text-base">
              No blog posts published yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Check back soon for new articles or publish one through the Admin Dashboard.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
