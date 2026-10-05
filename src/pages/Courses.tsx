import React, { useEffect, useState } from 'react'
import { BookOpen, Clock, Users, ChevronDown, ChevronRight, Search } from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { fetchAcademicCourses, AcademicCourse } from '@/lib/services/coursesService'
import { updatePageMeta } from '@/lib/utils/seo'

interface Course extends AcademicCourse {}

const CLASS_ORDER = ['School Classes', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const BOARDS = ['CBSE', 'SSC']

export const CoursesPage: React.FC = () => {
  const { settings } = useSiteSettings()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeBoard, setActiveBoard] = useState<string>('SSC')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({})

  useEffect(() => {
    updatePageMeta(
      {
        title: 'Courses',
        description: `Explore CBSE and SSC board courses for Class 6 to Class 12 at ${settings.institute_name}.`,
      },
      settings.institute_name
    )

    const fetchCourses = async () => {
      try {
        setLoading(true)
        const data = await fetchAcademicCourses()
        const active = data.filter((c) => c.is_active !== false)
        setCourses(active)
        const expanded: Record<string, boolean> = {}
        active.forEach((c) => { expanded[c.target_class] = true })
        setExpandedClasses(expanded)
      } catch (err) {
        console.warn('Error fetching courses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [settings])

  const filteredCourses = courses.filter((course) => {
    const matchesBoard = activeBoard === 'All' || course.board === activeBoard || course.board === 'Both'
    const matchesSearch =
      !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.subjects || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesBoard && matchesSearch
  })

  const coursesByClass = CLASS_ORDER.reduce<Record<string, Course[]>>((acc, cls) => {
    const clsCourses = filteredCourses.filter(
      (c) =>
        c.target_class === cls ||
        (cls === 'School Classes' && !CLASS_ORDER.includes(c.target_class))
    )
    if (clsCourses.length > 0) acc[cls] = clsCourses
    return acc
  }, {})

  // Also catch any class names not in CLASS_ORDER
  filteredCourses.forEach((c) => {
    if (!CLASS_ORDER.includes(c.target_class) && !coursesByClass['School Classes']?.find((x) => x.id === c.id)) {
      if (!coursesByClass[c.target_class]) coursesByClass[c.target_class] = []
      coursesByClass[c.target_class].push(c)
    }
  })

  const toggleClass = (cls: string) => {
    setExpandedClasses((prev) => ({ ...prev, [cls]: !prev[cls] }))
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Academic Programs
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Courses &amp; Batches
          </h1>
          <p className="text-slate-600 text-sm mt-3">
            Structured academic coaching for Class 6 to Class 12 under CBSE and SSC boards.
          </p>
        </div>

        {/* Board Filter + Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Board:</span>
            {['All', ...BOARDS].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setActiveBoard(b)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeBoard === b
                    ? 'bg-emerald-800 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200:bg-slate-700'
                }`}
              >
                {b === 'All' ? 'All Boards' : b + ' Board'}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-0 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading courses...</div>
        ) : Object.keys(coursesByClass).length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 font-bold text-base">No courses available yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              The admin can add courses from the Admin Dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(coursesByClass).map(([cls, clsCourses]) => (
              <div key={cls} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                
                {/* Class Header */}
                <button
                  type="button"
                  onClick={() => toggleClass(cls)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50:bg-slate-800/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                    </span>
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">{cls}</h2>
                      <span className="text-xs text-slate-400">{clsCourses.length} course{clsCourses.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {expandedClasses[cls] ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Courses in this class */}
                {expandedClasses[cls] && (
                  <div className="border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {clsCourses.map((course) => (
                      <div
                        key={course.id}
                        className="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-slate-50 hover:border-emerald-400:border-emerald-700 transition"
                      >
                        {course.image_url ? (
                          <img
                            src={course.image_url}
                            alt={course.title}
                            className="w-full h-36 object-cover"
                          />
                        ) : (
                          <div className="w-full h-36 bg-emerald-950 flex items-center justify-center text-amber-400">
                            <BookOpen className="w-10 h-10" />
                          </div>
                        )}
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {course.board && course.board !== 'Both' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                                {course.board}
                              </span>
                            )}
                            {course.board === 'Both' && (
                              <>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">CBSE</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">SSC</span>
                              </>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mb-1">{course.title}</h3>
                          {course.description && (
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{course.description}</p>
                          )}
                          
                          {/* Subjects */}
                          {course.subjects && (
                            <div className="mb-3">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Subjects</p>
                              <p className="text-xs text-slate-600">{course.subjects}</p>
                            </div>
                          )}

                          <div className="mt-auto pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-500">
                            {course.duration && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                {course.duration}
                              </div>
                            )}
                            {course.batch_info && (
                              <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-emerald-600" />
                                {course.batch_info}
                              </div>
                            )}
                            {course.fee && (
                              <div className="font-bold text-emerald-800 text-sm mt-1">
                                {course.fee}
                              </div>
                            )}
                            {course.faculty_name && (
                              <div className="text-[11px] text-slate-400 italic">
                                Faculty: {course.faculty_name}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex gap-2">
                            <a
                              href={`/courses/${course.slug}`}
                              className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold border border-emerald-700 text-emerald-700 hover:bg-emerald-50:bg-emerald-950 transition"
                            >
                              View Details
                            </a>
                            <a
                              href={`/admission?course_id=${course.id}`}
                              className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 transition"
                            >
                              Enquire Now
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
