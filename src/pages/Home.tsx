import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Sparkles,
  ChevronDown,
  Star,
  Instagram,
  Youtube,
  Phone,
  MessageCircle,
  GraduationCap,
  ShieldCheck,
  Zap,
  Trophy,
} from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { fetchAcademicCourses } from '@/lib/services/coursesService'
import { updatePageMeta } from '@/lib/utils/seo'

interface ScheduleSlot {
  time: string
  tag: 'BEG' | 'INT' | 'ADV'
  title: string
  instructor: string
  seats: string
}

export const HomePage: React.FC = () => {
  const { settings } = useSiteSettings()
  const [courses, setCourses] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Interactive Schedule Tab state
  const [activeDay, setActiveDay] = useState<string>('Monday')

  // Interactive FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  useEffect(() => {
    updatePageMeta({
      title: settings.meta_title || `${settings.institute_name || 'SS Tutorial'} | Achieving Excellence Together`,
      description: settings.meta_description || 'Premier coaching for Class 6 to 12 SSC and CBSE Board. Master mathematics with concept clarity and personalized attention.',
    }, settings.institute_name)

    const fetchData = async () => {
      try {
        setLoading(true)
        const [coursesRes, testimonialsRes, galleryRes] = await Promise.all([
          supabase.from('courses').select('*').eq('is_active', true).order('display_order', { ascending: true }).limit(6),
          supabase.from('testimonials').select('*').eq('is_published', true).limit(4),
          supabase.from('gallery').select('*').eq('is_published', true).order('display_order', { ascending: true }).limit(6),
        ])

        if (coursesRes.data && coursesRes.data.length > 0) {
          setCourses(coursesRes.data)
        } else {
          const fallbackCourses = await fetchAcademicCourses()
          setCourses(fallbackCourses.filter((c) => c.is_active !== false).slice(0, 6))
        }

        if (testimonialsRes.data && testimonialsRes.data.length > 0) {
          setTestimonials(testimonialsRes.data)
        } else {
          const res = await fetch('/api/content/testimonials').catch(() => null)
          if (res?.ok) {
            const d = await res.json()
            if (d.testimonials?.length) setTestimonials(d.testimonials.slice(0, 4))
          }
        }

        if (galleryRes.data && galleryRes.data.length > 0) {
          setGalleryItems(galleryRes.data)
        } else {
          const res = await fetch('/api/gallery').catch(() => null)
          if (res?.ok) {
            const d = await res.json()
            if (d.gallery?.length) setGalleryItems(d.gallery.slice(0, 6))
          }
        }
      } catch (err) {
        console.warn('Error fetching homepage data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [settings])

  const instagramUrl = settings.instagram_url || 'https://www.instagram.com/ss__tutorial'
  const youtubeUrl = settings.youtube_url || 'https://www.youtube.com/@SS__tutorial2025'
  const whatsappNumber = settings.whatsapp_number || '9876543210'
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(settings.whatsapp_message || 'Hello SS Tutorial, I want to book a free demo class.')}`

  // Weekly Schedule Data
  let scheduleData: Record<string, ScheduleSlot[]> = {}
  try {
    scheduleData = settings.schedule_json ? JSON.parse(settings.schedule_json) : {
      Monday: [
        { time: '7:00 AM - 8:30 AM', tag: 'ADV', title: 'Class 10 SSC Math - Board Exam Prep', instructor: settings.founder_name || 'Ankit Gupta', seats: '3 seats left' },
        { time: '4:30 PM - 6:00 PM', tag: 'INT', title: 'Class 9 Math - Geometry & Algebra Concepts', instructor: 'Senior Faculty', seats: 'Available' },
        { time: '6:30 PM - 8:00 PM', tag: 'BEG', title: 'Class 7 & 8 - Math & Science Foundation', instructor: 'Faculty', seats: 'Available' },
      ],
      Tuesday: [
        { time: '7:00 AM - 8:30 AM', tag: 'ADV', title: 'Class 10 CBSE Math - Real Numbers & Polynomials', instructor: settings.founder_name || 'Ankit Gupta', seats: '2 seats left' },
        { time: '4:30 PM - 6:00 PM', tag: 'INT', title: 'Class 9 Science - Physics & Chemistry', instructor: 'Senior Faculty', seats: 'Available' },
        { time: '6:30 PM - 8:00 PM', tag: 'BEG', title: 'Class 6 - Basic Arithmetic & Foundational Tricks', instructor: 'Faculty', seats: 'Available' },
      ],
      Wednesday: [
        { time: '7:00 AM - 8:30 AM', tag: 'ADV', title: 'Class 10 SSC Math - Quadratic Equations & AP', instructor: settings.founder_name || 'Ankit Gupta', seats: 'Filling fast' },
        { time: '4:30 PM - 6:00 PM', tag: 'INT', title: 'Class 9 Math - Circle Theorems & Coordinate Geometry', instructor: 'Senior Faculty', seats: 'Available' },
        { time: '6:30 PM - 8:00 PM', tag: 'BEG', title: 'Class 8 - Linear Equations & Triangles', instructor: 'Faculty', seats: 'Available' },
      ],
      Thursday: [
        { time: '7:00 AM - 8:30 AM', tag: 'ADV', title: 'Class 10 CBSE Math - Trigonometry & Applications', instructor: settings.founder_name || 'Ankit Gupta', seats: '2 seats left' },
        { time: '4:30 PM - 6:00 PM', tag: 'INT', title: 'Class 9 Foundation - Word Problem Solving', instructor: 'Senior Faculty', seats: 'Available' },
        { time: '6:30 PM - 8:00 PM', tag: 'BEG', title: 'Class 7 - Integers & Fractions Masterclass', instructor: 'Faculty', seats: 'Available' },
      ],
      Friday: [
        { time: '7:00 AM - 8:30 AM', tag: 'ADV', title: 'Class 10 SSC Math - Weekly Unit Test & Paper Discussion', instructor: settings.founder_name || 'Ankit Gupta', seats: 'Mandatory' },
        { time: '4:30 PM - 6:00 PM', tag: 'INT', title: 'Class 9 Weekly Assessment & Doubts', instructor: 'Senior Faculty', seats: 'Mandatory' },
        { time: '6:30 PM - 8:00 PM', tag: 'BEG', title: 'Class 6-8 Weekly Quiz & Mental Math', instructor: 'Faculty', seats: 'Available' },
      ],
      Saturday: [
        { time: '8:00 AM - 10:00 AM', tag: 'ADV', title: 'Special Board Revision & 1-on-1 Doubt Clearing', instructor: settings.founder_name || 'Ankit Gupta', seats: 'All Batches' },
        { time: '10:30 AM - 12:30 PM', tag: 'INT', title: 'Class 9 & 10 Science Practical Explanations', instructor: 'Faculty', seats: 'Open' },
        { time: '4:00 PM - 6:00 PM', tag: 'BEG', title: 'Parent-Teacher Interaction & Progress Review', instructor: 'All Faculty', seats: 'Scheduled' },
      ],
    }
  } catch (e) {
    console.error('Failed to parse schedule JSON')
  }

  // FAQ Data
  let faqs: {q: string, a: string}[] = []
  try {
    faqs = settings.faqs_json ? JSON.parse(settings.faqs_json) : [
      {
        q: 'Which school boards and classes do you cater to?',
        a: 'We specialize in Maharashtra State Board (SSC) and CBSE Board curriculum for Class 6, 7, 8, 9, 10, as well as Class 11 & 12. Our primary emphasis is on Mathematics, Science, and fundamental concept-building.',
      },
      {
        q: 'Do I have to pay anything for the trial demo class?',
        a: 'No! Your first trial class is 100% free with no commitment or registration fee. Students can attend a live class, experience Ankit Sir’s teaching methodology firsthand, and see how simple math can become.',
      },
      {
        q: 'What is the student-to-teacher ratio in each batch?',
        a: 'We maintain strictly limited batch sizes of 15 to 20 students. This guarantees that every child receives individualized attention, gets their doubts resolved immediately, and never gets lost in a crowded hall.',
      },
      {
        q: 'Where is SS Tutorial located, and how do I visit?',
        a: 'Our learning center is located at 002, (B) Wing, Veer 10, Umroli (East). You can walk in during our working hours (Mon - Sat, 8:00 AM to 8:00 PM) or call us beforehand to schedule a meeting.',
      },
      {
        q: 'Do you provide study materials, worksheets, and mock exams?',
        a: 'Yes! Every enrolled student receives chapter-wise formula revision sheets, textbook solution booklets, important question banks, and sits for structured weekly assessments mirroring the official board exam pattern.',
      },
      {
        q: 'How are parents kept informed about student attendance and test results?',
        a: 'Through our dedicated Parent Portal and direct WhatsApp reports, parents receive real-time notifications on daily attendance, weekly test scores, rank analytics, and monthly teacher remarks.',
      },
    ]
  } catch (e) {
    console.error('Failed to parse FAQs JSON')
  }

  // Default featured programs if courses list is small
  const defaultPrograms = [
    {
      num: 'No. 01',
      badge: 'Class 10 SSC Board',
      title: 'Class 10 Math Board Exam Preparation',
      desc: 'Complete textbook solutions, geometry theorem mastery, algebra word problem shortcuts, and 5 years of board paper drills.',
      skills: ['Textbook Solutions', 'Geometry Theorems', 'Board Question Bank', 'Weekly Mock Tests'],
      slug: 'class-10-ssc-math',
      fee: 'Rs. 1500 / month',
    },
    {
      num: 'No. 02',
      badge: 'Class 10 CBSE Board',
      title: 'Class 10 CBSE Mathematics Foundation',
      desc: 'NCERT in-depth conceptual breakdown, exemplar problems, real-world case study questions, and step-by-step proofs.',
      skills: ['NCERT & Exemplar', 'Case Study Mastery', 'Trigonometry & Calculus', 'Formula Sheets'],
      slug: 'class-10-cbse-math',
      fee: 'Rs. 1500 / month',
    },
    {
      num: 'No. 03',
      badge: 'Class 9 Foundation',
      title: 'Class 9 Concept Building & Fun Tricks',
      desc: 'Master foundational algebraic identities, coordinate geometry, and science basics to make Class 10 feel effortless.',
      skills: ['Foundational Concepts', 'Speed Calculation Tricks', 'Science Basics', 'Problem Solving'],
      slug: 'class-9-math-science',
      fee: 'Rs. 1400 / month',
    },
    {
      num: 'No. 04',
      badge: 'Class 6 - 8 School Classes',
      title: 'Junior Math & Science Excellence',
      desc: 'Fun, disciplined learning designed specifically for young students to eliminate math fear and build rock-solid basics.',
      skills: ['Fractions & Integers', 'Mental Math Fun', 'Science Exploration', 'Homework Guidance'],
      slug: 'class-6-8-math',
      fee: 'Rs. 1200 / month',
    },
  ]

  const displayPrograms = courses.length >= 4 ? courses.slice(0, 4).map((c, i) => ({
    num: `No. 0${i + 1}`,
    badge: c.target_class || c.board || 'Academic Program',
    title: c.title,
    desc: c.description || 'Comprehensive curriculum-aligned coaching designed for deep understanding and exam confidence.',
    skills: c.subjects ? c.subjects.split(',').map((s: string) => s.trim()) : ['Concept Clarity', 'Weekly Tests', 'Formula Sheets', 'Doubt Clearing'],
    slug: c.slug || 'courses',
    fee: c.fee || 'Affordable Fees',
  })) : defaultPrograms

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-amber-400 selection:text-emerald-950">

      {/* =========================================================
          1. HERO SECTION (Concept 2 Clean Light Theme + Results First Layout)
          ========================================================= */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-200 dark:border-slate-800">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 mb-8 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Trophy className="w-4 h-4 text-amber-500" />
            {settings.homepage_hero_badge || 'Celebrating 98% Board Pass Rate in 2025'}
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-5xl mx-auto text-slate-900 dark:text-white whitespace-pre-wrap">
            {settings.homepage_hero_title || (
              <>
                Join the highest scoring <br className="hidden sm:inline" />
                students in the <span className="text-emerald-700 dark:text-emerald-400">city.</span>
              </>
            )}
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed whitespace-pre-wrap">
            {settings.homepage_hero_subtitle || 'Trusted by parents and proven by results. Master mathematics and science with expert tutors, personalized attention, and a highly competitive yet supportive environment.'}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/admission"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm text-white bg-emerald-700 hover:bg-emerald-800 shadow-xl shadow-emerald-700/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Book a Free Demo</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/results"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>View Past Results</span>
            </a>
          </div>

          {/* Massive Hero Image representing Top Students / Results */}
          <div className="mt-16 relative max-w-5xl mx-auto rounded-3xl p-2 sm:p-4 bg-slate-50 dark:bg-slate-800/50 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Students celebrating top scores" 
                className="w-full h-full object-cover object-[center_30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end justify-center pb-6 sm:pb-8">
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-xl">
                  <div className="flex -space-x-3">
                    <img className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" alt="Student" />
                    <img className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" alt="Student" />
                    <img className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Student" />
                  </div>
                  <div className="text-white text-left">
                    <p className="text-sm font-bold">500+ Top Scorers</p>
                    <p className="text-[10px] text-white/80">Maharashtra Board & CBSE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. LEGACY / STORY SECTION ("Forged in Tradition. Built for Today.")
          ========================================================= */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Years of Excellence
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Forged in Dedication. <br className="hidden sm:inline" />
                Built for Today’s Students.
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                Located at Umroli (East), SS Tutorial has been the community’s trusted destination for authentic mathematics and school curriculum coaching. Founded by <strong className="text-slate-900 dark:text-white font-semibold">{settings.founder_name || 'Ankit Gupta'}</strong> with a passion to demystify complex math concepts and build lifelong academic confidence.
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                Whether you seek board exam preparation, competitive foundation, or foundational textbook solutions — our classroom is your academic home. Every student, from Class 6 to Class 12, receives personalized attention and disciplined mentorship.
              </p>

              <div className="pt-2">
                <a
                  href="/about"
                  className="inline-flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-400 hover:text-amber-500 transition"
                >
                  <span>Read our story & meet the founder</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Stat Counters matching the Framer template layout */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-800 dark:text-emerald-300">500+</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Students Mentored</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-amber-500">98%</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Board Pass Rate</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-amber-500">10+</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Years Mastery</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-800 dark:text-emerald-300">15</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Max Batch Size</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          3. TRAINING PROGRAMS / COURSES (Template numbered card design)
          ========================================================= */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Training Programs
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
                Find Your Path.
              </h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
                Structured, board-aligned courses crafted for concept mastery, high examination scores, and stress-free learning.
              </p>
            </div>
            <a
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 hover:bg-emerald-200/80 transition self-start md:self-end"
            >
              <span>All programs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayPrograms.map((prog) => (
              <div
                key={prog.num}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                      {prog.num}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {prog.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {prog.title}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
                    {prog.desc}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                      Key Highlights
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                      {prog.skills.map((skill: string) => (
                        <div key={skill} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    {prog.fee}
                  </span>
                  <a
                    href={`/courses/${prog.slug}`}
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-500 transition"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================
          4. WHY TRAIN WITH US (Bento Grid matching template)
          ========================================================= */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Why Train With Us
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Built Different. <br />
              Teaching Different.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Every detail of how we teach, who we mentor, and how we structure your student's growth is intentional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Expert Faculty</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Led personally by Ankit Gupta, dedicated to breaking down complicated mathematics into simple, memorable steps.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Small Batch Size</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Strictly capped at 15 to 20 students so no student is overlooked or hesitant to ask questions.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Weekly Assessments</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Periodic unit tests mirror actual board formats, building time-management skills and eliminating exam fear.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Formula Cheatsheets</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Concise theorem summaries and formula banks provided for quick, stress-free revisions before every exam.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          5. CLASS TIMINGS / WEEKLY SCHEDULE (Interactive tabs)
          ========================================================= */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Class Timings
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Weekly Schedule
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Find a slot that fits your routine and school timings.
            </p>
          </div>

          {/* Day Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
            {Object.keys(scheduleData).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeDay === day
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Schedule Slots List for Active Day */}
          <div className="space-y-3">
            {scheduleData[activeDay]?.map((slot, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-600/40 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                    {slot.tag}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{slot.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Faculty: {slot.instructor}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {slot.time}
                  </span>
                  <a
                    href="/admission"
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-emerald-950 transition"
                  >
                    Join
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================
          6. STUDENT STORIES / TESTIMONIALS (Framer Quote card style)
          ========================================================= */}
      <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Student Stories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2 mb-12">
            What Our Students Say.
          </h2>

          <div className="relative p-8 sm:p-12 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl max-w-3xl mx-auto">
            <div className="flex justify-center gap-1 text-amber-400 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>

            <p className="font-display text-lg sm:text-2xl text-slate-800 dark:text-slate-100 leading-relaxed font-medium italic">
              "{testimonials[0]?.text || 'The conceptual clarity and personal attention my son received here is remarkable. Ankit Sir makes even the most difficult math word problems intuitive and fun. His board score went from 65% to 92%!'}"
            </p>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="font-bold text-base text-slate-900 dark:text-white">
                {testimonials[0]?.student_name || 'Rahul Sharma (Parent: Sunita Sharma)'}
              </p>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {testimonials[0]?.course || 'Class 10 SSC Board - 94% in Mathematics'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          7. COMMON QUESTIONS / FAQ (Interactive Accordion)
          ========================================================= */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              FAQ
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Common Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Everything you need to know about joining SS Tutorial.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* =========================================================
          8. BEGIN YOUR JOURNEY / HIGH-CONVERSION CTA BANNER
          ========================================================= */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-amber-400">
            Begin Your Journey
          </span>

          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Ready to Start Learning?
          </h2>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto font-normal">
            No registration fee for demo. First class is 100% free. Just show up at our Umroli center — we'll handle the rest.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/admission"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-emerald-950 bg-amber-400 hover:bg-amber-300 shadow-xl transition-all hover:scale-105"
            >
              <span>Register for Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm text-white bg-emerald-800/80 hover:bg-emerald-700/80 border border-emerald-600/60 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <div className="pt-8 text-xs text-emerald-300/80">
            📍 002, (B) WING, VEER 10, UMROLI (EAST) • Admissions Open for Class 6 to 12
          </div>

        </div>
      </section>

    </div>
  )
}
