import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { NoticeTicker } from '@/components/layout/NoticeTicker'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { HomePage } from '@/pages/Home'
import { AboutPage } from '@/pages/About'
import { CoursesPage } from '@/pages/Courses'
import { CourseDetailPage } from '@/pages/CourseDetail'
import { ResultsPage } from '@/pages/Results'
import { GalleryPage } from '@/pages/Gallery'
import { VideosPage } from '@/pages/Videos'
import { BlogPage } from '@/pages/Blog'
import { BlogDetailPage } from '@/pages/BlogDetail'
import { ContactPage } from '@/pages/Contact'
import { AdmissionPage } from '@/pages/Admission'
import { AuthPage } from '@/pages/Auth'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicy'
import { TermsPage } from '@/pages/Terms'
import { StudentDashboard } from '@/pages/dashboards/StudentDashboard'
import { ParentDashboard } from '@/pages/dashboards/ParentDashboard'
import { TeacherDashboard } from '@/pages/dashboards/TeacherDashboard'
import { AdminDashboard } from '@/pages/dashboards/AdminDashboard'
import { useAuth } from '@/lib/hooks/useAuth'

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname)
  const { user, isAdmin, isTeacher, isParent, isStudent, loading } = useAuth()

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Navigation interceptor for seamless client routing without page reloads
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        !target.hasAttribute('download') &&
        target.target !== '_blank'
      ) {
        e.preventDefault()
        const newPath = target.pathname + target.search
        if (newPath !== window.location.pathname + window.location.search) {
          window.history.pushState({}, '', newPath)
          setCurrentPath(target.pathname)
          window.scrollTo(0, 0)
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  // Route Resolver
  const renderRoute = () => {
    // 1. Dashboards (Protected)
    if (currentPath.startsWith('/admin')) {
      return <AdminDashboard />
    }
    if (currentPath.startsWith('/dashboard/teacher')) {
      return <TeacherDashboard />
    }
    if (currentPath.startsWith('/dashboard/parent')) {
      return <ParentDashboard />
    }
    if (currentPath.startsWith('/dashboard/student')) {
      return <StudentDashboard />
    }

    // 2. Auth Route
    if (currentPath === '/auth') {
      return <AuthPage />
    }

    // 3. Dynamic Course Detail Route: /courses/:slug
    if (currentPath.startsWith('/courses/')) {
      const slug = currentPath.replace('/courses/', '').split('/')[0]
      return <CourseDetailPage slug={slug} />
    }

    // 4. Dynamic Blog Detail Route: /blog/:slug
    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '').split('/')[0]
      return <BlogDetailPage slug={slug} />
    }

    // 5. Standard Public Pages
    switch (currentPath) {
      case '/about':
        return <AboutPage />
      case '/courses':
        return <CoursesPage />
      case '/results':
        return <ResultsPage />
      case '/gallery':
        return <GalleryPage />
      case '/videos':
        return <VideosPage />
      case '/blog':
        return <BlogPage />
      case '/contact':
        return <ContactPage />
      case '/admission':
        return <AdmissionPage />
      case '/privacy-policy':
        return <PrivacyPolicyPage />
      case '/terms':
        return <TermsPage />
      case '/':
      default:
        return <HomePage />
    }
  }

  // Dashboard pages have their own layout
  const isDashboardPage =
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/dashboard/') ||
    currentPath === '/auth'

  return (
    <div className="flex flex-col min-h-screen">
      {!isDashboardPage && <NoticeTicker />}
      {!isDashboardPage && <Header currentPath={currentPath} />}

      <main className="flex-1">{renderRoute()}</main>

      {!isDashboardPage && <Footer />}
      {!isDashboardPage && <WhatsAppButton />}
    </div>
  )
}
