import React, { useEffect, useState } from 'react'
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { updatePageMeta } from '@/lib/utils/seo'

interface CourseDetailProps {
  slug: string
}

export const CourseDetailPage: React.FC<CourseDetailProps> = ({ slug }) => {
  const { settings } = useSiteSettings()
  const [course, setCourse] = useState<any>(null)
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourseAndBatches = async () => {
      try {
        setLoading(true)
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (courseData) {
          setCourse(courseData)
          updatePageMeta({
            title: courseData.title,
            description: courseData.description || `Course syllabus, timings, and batches for ${courseData.title}.`,
          }, settings.institute_name)

          // Fetch active batches for this course with teacher details
          const { data: batchData } = await supabase
            .from('batches')
            .select(`
              *,
              teacher:teacher_id (
                id,
                full_name,
                phone,
                role
              )
            `)
            .eq('course_id', courseData.id)
            .eq('is_active', true)

          if (batchData) setBatches(batchData)
        }
      } catch (err) {
        console.warn('Error fetching course detail:', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchCourseAndBatches()
  }, [slug, settings])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <BookOpen className="w-16 h-16 text-slate-400 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">Course Not Found</h1>
        <p className="text-slate-500 text-sm mt-2">The requested course does not exist or has been deactivated.</p>
        <a href="/courses" className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold">
          Back to Courses
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl border border-emerald-800">
          {course.category && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-emerald-950 uppercase tracking-wider mb-4">
              {course.category}
            </span>
          )}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{course.title}</h1>
          <p className="text-emerald-200 mt-4 text-base sm:text-lg max-w-3xl leading-relaxed">
            {course.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            {course.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="font-semibold">Duration: {course.duration}</span>
              </div>
            )}
            {course.fee && (
              <div className="flex items-center gap-2 text-amber-400">
                <span className="text-lg font-bold">Fee: {course.fee}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Column: Syllabus & Batches */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Syllabus Section */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Curriculum & Syllabus
              </h2>
              {course.syllabus ? (
                <div className="prose max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                  {course.syllabus}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  Detailed syllabus will be provided upon enrollment or counseling.
                </p>
              )}
            </div>

            {/* Active Batches Table */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Upcoming & Ongoing Batches
              </h2>

              {batches.length > 0 ? (
                <div className="space-y-4">
                  {batches.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{b.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Schedule: {b.schedule || 'Regular Weekday'}</span>
                        </p>
                        {b.teacher && (
                          <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1.5 font-medium">
                            <User className="w-3.5 h-3.5" />
                            <span>Faculty: {b.teacher.full_name}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {b.capacity > 0 && (
                          <span className="text-xs font-medium text-slate-500 bg-slate-200 px-3 py-1.5 rounded-lg">
                            Cap: {b.capacity}
                          </span>
                        )}
                        <a
                          href={`/admission?course_id=${course.id}&batch_id=${b.id}`}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 transition"
                        >
                          Join Batch
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No active batches currently scheduled. Apply now to be notified when the next batch is announced.
                </p>
              )}
            </div>

          </div>

          {/* Right Column: Enrollment Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg space-y-6">
              <h3 className="text-lg font-bold text-slate-900">Enroll in this Course</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit an admission inquiry or application online to reserve your seat in the next orientation batch.
              </p>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Printed & Digital Study Notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Weekly Topic-wise Assessment Tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Personalized One-on-One Mentoring</span>
                </div>
              </div>

              <a
                href={`/admission?course_id=${course.id}`}
                className="w-full block text-center py-3 rounded-xl font-bold text-sm text-emerald-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md transition"
              >
                Apply for Course
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
