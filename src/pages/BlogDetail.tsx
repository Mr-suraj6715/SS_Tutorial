import React, { useEffect, useState } from 'react'
import { Calendar, User, ArrowLeft, BookOpen, Share2 } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { updatePageMeta } from '@/lib/utils/seo'

interface BlogDetailProps {
  slug: string
}

export const BlogDetailPage: React.FC<BlogDetailProps> = ({ slug }) => {
  const { settings } = useSiteSettings()
  const [post, setPost] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle()

        if (data) {
          setPost(data)
          updatePageMeta({
            title: data.title,
            description: data.excerpt || `${data.title} - SS Tutorial Education Blog`,
            ogImage: data.cover_url,
            ogType: 'article',
          }, settings.institute_name)
        }
      } catch (err) {
        console.warn('Error fetching blog post:', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchPost()
  }, [slug, settings])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
        <BookOpen className="w-16 h-16 text-slate-400 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Article Not Found</h1>
        <p className="text-slate-500 text-sm mt-2">The article you are looking for may have been moved or unpublished.</p>
        <a href="/blog" className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold">
          Back to Blog
        </a>
      </div>
    )
  }

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <a
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-amber-500 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Articles
        </a>

        {/* Title Header */}
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800 py-3">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                Published: {new Date(post.published_at).toLocaleDateString()}
              </span>
            )}
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                Author: {post.author}
              </span>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_url && (
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg mb-10 bg-slate-100 dark:bg-slate-900">
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
          {post.excerpt && (
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200 italic mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 leading-relaxed">
              "{post.excerpt}"
            </p>
          )}

          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-base leading-relaxed whitespace-pre-line space-y-4">
            {post.content}
          </div>
        </div>

      </div>
    </article>
  )
}
