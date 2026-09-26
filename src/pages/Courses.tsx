import React, { useEffect, useState } from 'react'
import { BookOpen, Search, ArrowRight, Clock, DollarSign, Sparkles } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { updatePageMeta } from '@/lib/utils/seo'

export const CoursesPage: React.FC = () => {
  const { settings } = useSiteSettings()
  const [courses, setCourses] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updatePageMeta({
      title: 'Our Courses',
      description: `Explore academic and competitive coaching courses offered by ${settings.institute_name}.`,
    }, settings.institute_name)

    const fetchCourses = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (data) {
          setCourses(data)
          const cats = Array.from(new Set(data.map((c) => c.category).filter(Boolean))) as string[]
          setCategories(cats)
        }
      } catch (err) {
        console.warn('Error fetching courses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [settings])

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Academic Programs
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Courses & Batches
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
            Structured curricula designed for complete conceptual mastery, exam readiness, and high scoring performance.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'All'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-950 flex items-center justify-center text-amber-400">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    {course.category && (
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-amber-300 backdrop-blur-sm border border-emerald-700/50">
                        {course.category}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {course.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {course.duration && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-500" />
                          {course.duration}
                        </span>
                      )}
                      {course.fee && (
                        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                          <DollarSign className="w-4 h-4" />
                          {course.fee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
                  <a
                    href={`/courses/${course.slug}`}
                    className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-amber-500 transition"
                  >
                    View Syllabus & Batches →
                  </a>
                  <a
                    href={`/admission?course_id=${course.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 transition"
                  >
                    Enroll Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-200 font-bold text-base">
              No courses matching your criteria.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Check back soon or contact the institute for upcoming batch announcements.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
