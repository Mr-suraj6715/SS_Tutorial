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
  Compass,
  TrendingUp,
  Calculator,
  FlaskConical,
  FileCheck,
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
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">

      {/* =========================================================
          1. HERO SECTION (Full-Width Edge-to-Edge)
          ========================================================= */}
      <section className="relative w-full overflow-hidden min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] flex items-center justify-center">
        {/* Full-bleed Background Educational Photo */}
        <img
          src={settings.hero_image_url || '/hero-students.jpg'}
          alt="Students studying together in library"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Soft subtle scrim overlay so text is crystal clear */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-slate-950/40" />

        {/* Overlaid Center Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-16 sm:py-20 lg:py-24">
          <h1 className="font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] drop-shadow-md">
            {settings.homepage_hero_title && !/^s+$/i.test(settings.homepage_hero_title.trim())
              ? settings.homepage_hero_title
              : "Empower Your Child's Academic Journey."}
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-white/95 max-w-xl mx-auto font-normal leading-relaxed drop-shadow-sm">
            {settings.homepage_hero_subtitle ||
              "Trusted Tutoring for Excellence & Growth. Expert guidance from passionate educators."}
          </p>

          {/* Dual Action Buttons matching reference: deep teal filled pill + clean outline pill */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <a
              href="/admission"
              className="px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white bg-[#154d68] hover:bg-[#0e3a50] shadow-md transition-all hover:scale-[1.02]"
            >
              Get Started Today
            </a>
            <a
              href="/courses"
              className="px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-teal-900 bg-white/95 hover:bg-white border border-teal-600/40 shadow-sm backdrop-blur-sm transition-all hover:scale-[1.02]"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. OUR APPROACH (Directly matching reference image)
          ========================================================= */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 text-center tracking-tight">
            Our Approach
          </h2>

          <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-center">
            {/* Feature 1: Personalized Learning */}
            <div className="py-6 md:py-0 md:px-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100/60 shadow-xs">
                <Compass className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Personalized Learning
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                Tailored plans for each student's unique needs.
              </p>
            </div>

            {/* Feature 2: Expert Tutors */}
            <div className="py-6 md:py-0 md:px-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100/60 shadow-xs">
                <GraduationCap className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Expert Tutors
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                Highly qualified and background-checked mentors.
              </p>
            </div>

            {/* Feature 3: Proven Results */}
            <div className="py-6 md:py-0 md:px-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100/60 shadow-xs">
                <TrendingUp className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Proven Results
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                Boost confidence and achieve academic success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. EXPLORE OUR PROGRAMS (Directly matching reference image)
          ========================================================= */}
      <section className="py-16 sm:py-24 bg-[#fafcfb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore Our Programs
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Structured, board-aligned courses crafted for deep conceptual understanding and high examination scores.
            </p>
          </div>

          {/* 4 Clean Rounded Program Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Math */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-200 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-base mb-5">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Math</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Tailored plans for each student's unique math needs.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="/courses"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-950 transition-colors"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: Science */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-200 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mb-5">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Science</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Highly qualified and background-checked mentors.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="/courses"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-950 transition-colors"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 3: English */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-200 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center mb-5">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">English</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Boost confidence and english academic success.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="/courses"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-950 transition-colors"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 4: Test Prep */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-200 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center mb-5">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Test Prep</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Boost students and test prep, and academic competitions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="/courses"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-950 transition-colors"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Action Link to Full Courses */}
          <div className="mt-12 text-center">
            <a
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-teal-300 hover:text-teal-900 shadow-xs transition-all"
            >
              <span>View All Board Courses & Batches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. ABOUT OUR FOUNDER & CENTER STORY
          ========================================================= */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Founder Image & Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-gradient-to-b from-teal-50/60 to-slate-50 border border-slate-200/80 shadow-md">
                <img
                  src={settings.founder_image_url || '/founder.jpg'}
                  alt={settings.founder_name || 'Ankit Gupta'}
                  className="w-full h-80 sm:h-96 object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent text-white">
                  <h3 className="text-xl font-bold tracking-tight">
                    {settings.founder_name || 'Ankit Gupta'}
                  </h3>
                  <p className="text-xs font-semibold text-teal-300 mt-0.5">
                    {settings.founder_title || 'Founder & Director, SS Tutorial'}
                  </p>
                </div>
              </div>
            </div>

            {/* Story & Stat Counters */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-teal-700">
                  Meet Our Founder & Director
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight mt-1">
                  Dedicated Mentorship. <br />
                  Built for Today’s Students.
                </h2>
              </div>

              <p className="text-slate-600 text-base leading-relaxed">
                {settings.founder_bio ||
                  'Dedicated educator and founder of SS Tutorial, passionate about simplifying mathematics and guiding students toward academic excellence through conceptual clarity and disciplined practice.'}
              </p>

              <p className="text-slate-500 text-sm leading-relaxed">
                Located at Umroli (East), SS Tutorial has been the community’s trusted destination for Class 6 to 12 CBSE & SSC coaching. Every batch is strictly limited to 15-20 students so no learner gets left behind.
              </p>

              {/* Clean Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200/80 text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-teal-800">500+</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Students Mentored</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200/80 text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-teal-800">98%</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Board Pass Rate</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200/80 text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-teal-800">10+</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Years Mastery</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200/80 text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-teal-800">15-20</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">Max Batch Size</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="/about"
                  className="inline-flex items-center gap-2 font-semibold text-sm text-teal-800 hover:text-teal-950 transition-colors"
                >
                  <span>Read our complete story & meet the faculty</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          5. WHY LEARN WITH US
          ========================================================= */}
      <section className="py-16 sm:py-24 bg-[#fafcfb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Learn With Us
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              Every detail of how we teach, mentor, and support your child's growth is intentional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100/60">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Expert Faculty</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Led personally by Ankit Gupta, dedicated to breaking down complicated mathematics into simple steps.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100/60">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Small Batch Size</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Strictly capped at 15 to 20 students so no student is overlooked or hesitant to ask questions.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100/60">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Weekly Assessments</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Periodic unit tests mirror actual board formats, building time-management skills and exam confidence.
                </p>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100/60">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Formula Cheatsheets</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Concise theorem summaries and formula banks provided for quick, stress-free revisions.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          6. CLASS TIMINGS / WEEKLY SCHEDULE
          ========================================================= */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Weekly Batch Schedule
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Find a slot that fits your routine and school timings.
            </p>
          </div>

          {/* Day Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-slate-50 border border-slate-200/80 max-w-fit mx-auto mb-8">
            {Object.keys(scheduleData).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeDay === day
                    ? 'bg-[#154d68] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Schedule Slots */}
          <div className="space-y-3">
            {scheduleData[activeDay]?.map((slot, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 border border-teal-100">
                    {slot.tag}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{slot.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Faculty: {slot.instructor}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span className="text-xs font-semibold text-teal-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {slot.time}
                  </span>
                  <a
                    href="/admission"
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#154d68] hover:bg-[#0e3a50] text-white transition-colors"
                  >
                    Join Batch
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================
          7. STUDENT STORIES / TESTIMONIALS
          ========================================================= */}
      <section className="py-16 sm:py-24 bg-[#fafcfb] border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-10">
            What Our Students & Parents Say
          </h2>

          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-sm max-w-3xl mx-auto">
            <div className="flex justify-center gap-1 text-amber-400 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>

            <p className="text-base sm:text-xl text-slate-700 leading-relaxed font-medium italic">
              "{testimonials[0]?.text || 'The conceptual clarity and personal attention my son received here is remarkable. Ankit Sir makes even the most difficult math word problems intuitive and fun. His board score went from 65% to 92%!'}"
            </p>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="font-bold text-sm sm:text-base text-slate-900">
                {testimonials[0]?.student_name || 'Rahul Sharma (Parent: Sunita Sharma)'}
              </p>
              <p className="text-xs font-semibold text-teal-700 mt-0.5">
                {testimonials[0]?.course || 'Class 10 SSC Board - 94% in Mathematics'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          8. FREQUENTLY ASKED QUESTIONS
          ========================================================= */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to know about admissions and classes at SS Tutorial.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-teal-700' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
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
          9. HIGH CONVERSION CTA BANNER
          ========================================================= */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-gradient-to-r from-[#154d68] to-teal-800 text-white p-10 sm:p-14 text-center shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-5">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Ready to Empower Your Child's Academic Journey?
              </h2>

              <p className="text-sm sm:text-base text-teal-50/90 max-w-xl mx-auto font-normal">
                No registration fee for demo. Your first trial class is 100% free with Ankit Sir.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
                <a
                  href="/admission"
                  className="px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-[#154d68] bg-white hover:bg-teal-50 shadow-md transition-all hover:scale-105"
                >
                  Register for Free Trial
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white bg-teal-900/60 hover:bg-teal-900/80 border border-teal-300/40 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-teal-200" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              <div className="pt-4 text-xs text-teal-100/80">
                📍 002, (B) WING, VEER 10, UMROLI (EAST) • Admissions Open for Class 6 to 12
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
