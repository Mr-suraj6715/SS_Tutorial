import React, { useEffect, useState } from 'react'
import {
  GraduationCap,
  Target,
  Compass,
  Award,
  BookOpen,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { updatePageMeta } from '@/lib/utils/seo'

export const AboutPage: React.FC = () => {
  const { settings } = useSiteSettings()
  const [faculty, setFaculty] = useState<any[]>([])
  const [facilities, setFacilities] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    updatePageMeta({
      title: 'About Us',
      description: `Learn about the mission, vision, expert faculty, and facilities at ${settings.institute_name}.`,
    }, settings.institute_name)

    const fetchAboutData = async () => {
      try {
        setLoading(true)
        const [facRes, fclRes, achRes] = await Promise.all([
          supabase.from('faculty').select('*').order('display_order', { ascending: true }),
          supabase.from('facilities').select('*').order('display_order', { ascending: true }),
          supabase.from('achievements').select('*').order('display_order', { ascending: true }),
        ])

        if (facRes.data) setFaculty(facRes.data)
        if (fclRes.data) setFacilities(fclRes.data)
        if (achRes.data) setAchievements(achRes.data)
      } catch (err) {
        console.warn('Error fetching about data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutData()
  }, [settings])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      
      {/* Page Header */}
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white py-16 lg:py-20 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Excellence & Values
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-2 text-white">
            About {settings.institute_name || 'SS Tutorial'}
          </h1>
          <p className="text-base sm:text-lg text-emerald-200 mt-4 leading-relaxed">
            {settings.tagline || 'Committed to fostering conceptual knowledge, academic integrity, and consistent results.'}
          </p>
        </div>
      </section>

      {/* Institute Story & Vision/Mission */}
      <section className="py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Our Story & Heritage
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Empowering Students with Knowledge and Dedication
              </h2>
              
              <div className="text-slate-600 dark:text-slate-300 space-y-4 text-base leading-relaxed">
                {settings.about && settings.about.trim() !== '' ? (
                  <p>{settings.about}</p>
                ) : (
                  <>
                    <p>
                      {settings.institute_name || 'SS Tutorial'} was founded with a singular purpose: to deliver structured, high-quality, and accessible education that bridges the gap between rote memorization and true conceptual mastery.
                    </p>
                    <p>
                      Through regular interactive classes, comprehensive study materials, and rigorous testing routines, we prepare students for competitive and academic success in a supportive, disciplined environment.
                    </p>
                  </>
                )}
              </div>

              {/* Mission & Vision Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 p-5 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-3">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Our Mission</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    To cultivate a strong conceptual foundation, critical thinking, and disciplined study habits that help students excel in examinations and future careers.
                  </p>
                </div>

                <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 p-5 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-3">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Our Vision</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    To be the most trusted coaching institute celebrated for academic results, student care, and progressive teaching methodologies.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-emerald-950 text-white p-8 text-center">
                <GraduationCap className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">{settings.institute_name}</h3>
                <p className="text-xs text-emerald-300 mt-2">Connect with our community on Instagram</p>
                <a
                  href={settings.instagram_url || 'https://www.instagram.com/ss__tutorial'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-amber-600 text-white font-semibold text-xs shadow-md hover:scale-105 transition"
                >
                  @ss__tutorial on Instagram
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Faculty Cards */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Mentors & Educators
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Experienced Faculty
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Passionate educators dedicated to student growth, personal mentoring, and clarity of fundamentals.
            </p>
          </div>

          {faculty.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {faculty.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col text-center"
                >
                  <div className="h-56 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-950 flex items-center justify-center text-amber-400">
                        <Users className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                        {member.designation}
                      </p>
                      {member.subjects && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                          {member.subjects}
                        </p>
                      )}
                      {member.bio && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-3">
                          {member.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Faculty profiles will appear here as configured by the admin in the dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Facilities Section */}
      {facilities.length > 0 && (
        <section className="py-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Infrastructure
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                Campus Facilities
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60"
                >
                  <Award className="w-8 h-8 text-emerald-600 mb-3" />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {facility.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {facility.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Milestones
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                Institute Achievements
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <Award className="w-8 h-8 text-amber-500 mb-3" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {ach.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {ach.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOUNDER SECTION */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
              Leadership
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              About the Founder
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-10 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            {settings.founder_image_url ? (
              <img
                src={settings.founder_image_url}
                alt={settings.founder_name || 'Founder'}
                className="w-32 h-32 rounded-full object-cover border-4 border-emerald-700 shrink-0"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-emerald-950 flex items-center justify-center shrink-0 border-4 border-emerald-700">
                <GraduationCap className="w-14 h-14 text-amber-400" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {settings.founder_name || 'Aniket Gupta'}
              </h3>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                {settings.founder_title || 'Founder & Director, SS Tutorial'}
              </p>
              {settings.founder_bio && settings.founder_bio.trim() !== '' ? (
                <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {settings.founder_bio}
                </p>
              ) : (
                <p className="mt-4 text-slate-400 text-sm italic">
                  Biography can be added from the Admin Dashboard under Institute Settings.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
