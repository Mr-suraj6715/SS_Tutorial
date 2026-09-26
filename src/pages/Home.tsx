import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Award,
  CheckCircle,
  Instagram,
  ChevronRight,
  Star,
  ExternalLink,
} from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { updatePageMeta } from '@/lib/utils/seo'

export const HomePage: React.FC = () => {
  const { settings } = useSiteSettings()
  const [courses, setCourses] = useState<any[]>([])
  const [facilities, setFacilities] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [classroomItems, setClassroomItems] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updatePageMeta({
      title: settings.meta_title || `${settings.institute_name} | Coaching Institute`,
      description: settings.meta_description || 'Quality coaching with experienced faculty and structured test series.',
    }, settings.institute_name)

    const fetchData = async () => {
      try {
        setLoading(true)
        const [
          coursesRes, facilitiesRes, achievementsRes,
          galleryRes, classroomRes, testimonialsRes, blogsRes,
        ] = await Promise.all([
          supabase.from('courses').select('*').eq('is_active', true).order('display_order', { ascending: true }).limit(6),
          supabase.from('facilities').select('*').order('display_order', { ascending: true }).limit(6),
          supabase.from('achievements').select('*').order('display_order', { ascending: true }).limit(4),
          supabase.from('gallery').select('*').eq('is_published', true).order('display_order', { ascending: true }).limit(6),
          supabase.from('gallery').select('*').eq('placement', 'classroom').eq('is_published', true).limit(4),
          supabase.from('testimonials').select('*').eq('is_published', true).limit(3),
          supabase.from('blogs').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(3),
        ])
        if (coursesRes.data) setCourses(coursesRes.data)
        if (facilitiesRes.data) setFacilities(facilitiesRes.data)
        if (achievementsRes.data) setAchievements(achievementsRes.data)
        if (galleryRes.data) setGalleryItems(galleryRes.data)
        if (classroomRes.data) setClassroomItems(classroomRes.data)
        if (testimonialsRes.data) setTestimonials(testimonialsRes.data)
        if (blogsRes.data) setBlogs(blogsRes.data)
      } catch (err) {
        console.warn('Error fetching home page data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [settings])

  const instagramUrl = settings.instagram_url || 'https://www.instagram.com/ss__tutorial'

  return (
    <div className="flex flex-col min-h-screen">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white py-20 lg:py-28">
        {settings.hero_image_url && settings.hero_image_url.trim() !== '' && (
          <div className="absolute inset-0 z-0 opacity-20">
            <img src={settings.hero_image_url} alt="Institute Banner" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300">
                <Instagram className="w-3.5 h-3.5" />
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
                  @ss__tutorial
                </a>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Welcome to{' '}
                <span className="text-amber-400">{settings.institute_name || 'SS Tutorial'}</span>
              </h1>

              <p className="text-lg text-emerald-100/90 max-w-2xl leading-relaxed">
                {settings.tagline && settings.tagline.trim() !== ''
                  ? settings.tagline
                  : 'Nurturing academic excellence with experienced mentors, structured test series, and personalized attention.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="/admission" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-bold text-base text-emerald-950 bg-amber-400 hover:bg-amber-300 shadow-lg transition-colors">
                  Apply for Admission <ArrowRight className="w-4 h-4" />
                </a>
                <a href="/courses" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-base text-emerald-100 border border-emerald-600 hover:bg-emerald-800/50 transition-colors">
                  Explore Courses
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-emerald-800/60">
                <div>
                  <p className="text-sm font-semibold text-amber-400">Concept Clarity</p>
                  <p className="text-xs text-emerald-400 mt-0.5">Focus on fundamentals</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-400">Regular Tests</p>
                  <p className="text-xs text-emerald-400 mt-0.5">Structured test series</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-400">Doubt Sessions</p>
                  <p className="text-xs text-emerald-400 mt-0.5">Dedicated support</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-emerald-900/40 border border-emerald-700/50 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-emerald-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Admissions Open</h3>
                    <p className="text-xs text-emerald-300 mt-0.5">Enroll for upcoming batches</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">Active</span>
                </div>
                <ul className="space-y-2.5 text-sm text-emerald-100">
                  {['Expert and experienced faculty', 'Comprehensive study materials', 'Periodic progress reports', 'Small batches for individual care'].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <a href="/admission" className="w-full block text-center py-3 rounded-lg font-bold text-sm text-emerald-950 bg-amber-400 hover:bg-amber-300 transition-colors">
                  Book a Counseling Session
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SNIPPET */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
                {settings.hero_image_url && settings.hero_image_url.trim() !== '' ? (
                  <img src={settings.hero_image_url} alt="About SS Tutorial" className="w-full h-80 object-cover" />
                ) : (
                  <div className="w-full h-80 bg-gradient-to-br from-emerald-900 to-emerald-950 flex flex-col items-center justify-center text-white p-6 text-center">
                    <BookOpen className="w-16 h-16 text-amber-400 mb-4" />
                    <h3 className="text-xl font-bold">{settings.institute_name || 'SS Tutorial'}</h3>
                    <p className="text-sm text-emerald-200 mt-2">Commitment to Educational Excellence</p>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">About Our Institute</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Guiding Students Towards Consistent Academic Success
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                {settings.about && settings.about.trim() !== ''
                  ? settings.about
                  : 'At SS Tutorial, we believe every student possesses unique potential. Through disciplined pedagogy, regular assessments, and conceptual learning frameworks, our curriculum empowers students to achieve outstanding results in board and competitive examinations.'}
              </p>
              <a href="/about" className="inline-flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400 hover:text-amber-500 transition text-sm">
                Learn more about our history and faculty <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Our Programs</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">Featured Courses</h2>
            </div>
            <a href="/courses" className="mt-4 md:mt-0 inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:text-amber-500 text-sm">
              View all programs <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {course.image_url ? (
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-emerald-950/80 flex items-center justify-center text-amber-400">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                    {course.category && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-amber-300 border border-emerald-700/50">{course.category}</span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">{course.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{course.description}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        {course.duration && <span className="text-xs text-slate-400 block">Duration: {course.duration}</span>}
                        {course.fee && <span className="text-base font-bold text-emerald-800 dark:text-emerald-300">{course.fee}</span>}
                      </div>
                      <a href={`/courses/${course.slug}`} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-amber-500 transition">
                        Details <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-300 font-medium">No courses listed yet.</p>
              <p className="text-xs text-slate-400 mt-1">Admin can add and publish courses via the Admin Dashboard.</p>
            </div>
          )}
        </div>
      </section>

      {/* FACILITIES */}
      {facilities.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Infrastructure</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">Learning Facilities</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.map((facility) => (
                <div key={facility.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{facility.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{facility.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Student Achievements</span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">Top Results</h2>
              </div>
              <a href="/results" className="mt-4 md:mt-0 inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:text-amber-500 text-sm">
                View full results <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((item) => (
                <div key={item.id} className="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                  {item.image_url ? (
                    <div className="h-44 bg-slate-200 dark:bg-slate-800">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-44 bg-emerald-950 flex items-center justify-center text-amber-400">
                      <Award className="w-12 h-12" />
                    </div>
                  )}
                  <div className="p-5">
                    {item.category && <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">{item.category}</span>}
                    <h3 className="font-bold text-slate-900 dark:text-white mt-1 text-base">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CLASSROOM PHOTOS */}
      {classroomItems.length > 0 && (
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Life at SS Tutorial</span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-1">Inside Our Classrooms</h2>
              <p className="text-sm text-slate-300 mt-2">Focused teaching environments where every student receives dedicated guidance.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {classroomItems.map((item) => (
                <div key={item.id} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md group">
                  <div className="h-56 overflow-hidden">
                    <img src={item.webp_url || item.image_url} alt={item.alt_text || item.title || 'Classroom session'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  {item.title && (
                    <div className="p-4">
                      <p className="text-xs font-semibold text-amber-400">{item.title}</p>
                      {item.caption && <p className="text-xs text-slate-400 mt-0.5">{item.caption}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY PREVIEW */}
      {galleryItems.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Moments and Milestones</span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">Campus and Event Gallery</h2>
              </div>
              <a href="/gallery" className="mt-4 md:mt-0 inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:text-amber-500 text-sm">
                View complete gallery <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {galleryItems.map((img) => (
                <a key={img.id} href="/gallery" className="group relative rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 shadow-sm block">
                  <img src={img.thumbnail_url || img.webp_url || img.image_url} alt={img.alt_text || img.title || 'Gallery image'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  {img.instagram_post_url && (
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white">
                      <Instagram className="w-3 h-3" />
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS - only real DB data, never fake */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Student Testimonials</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">Words from Our Students and Parents</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-4">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">"{t.text}"</p>
                  </div>
                  <div className="flex items-center gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.student_name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                        {t.student_name?.charAt(0) || 'S'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{t.student_name}</p>
                      {t.course && <p className="text-xs text-slate-400">{t.course}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BLOG PREVIEWS */}
      {blogs.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Latest Insights</span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">Articles and Study Guidance</h2>
              </div>
              <a href="/blog" className="mt-4 md:mt-0 inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:text-amber-500 text-sm">
                Read all articles <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <a key={post.id} href={`/blog/${post.slug}`} className="group bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                  <div className="h-48 overflow-hidden bg-slate-200 dark:bg-slate-800">
                    {post.cover_url ? (
                      <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-emerald-950/80 flex items-center justify-center text-amber-400">
                        <BookOpen className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">{post.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{post.excerpt}</p>
                    </div>
                    <span className="pt-4 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      Read Article <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INSTAGRAM CTA */}
      <section className="py-16 bg-emerald-950 text-white border-t border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Follow us on Instagram</h2>
              <p className="text-sm text-emerald-200 leading-relaxed">
                Stay updated with study tips, topper spotlights, and institute events on our official Instagram page.
              </p>
            </div>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-white text-emerald-950 font-bold text-sm shadow-lg hover:bg-amber-50 transition-colors shrink-0"
            >
              <Instagram className="w-4 h-4" />
              @ss__tutorial
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
