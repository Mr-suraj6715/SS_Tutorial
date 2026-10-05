import React, { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  FileCheck,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  Award,
  Image as ImageIcon,
  Video,
  Settings as SettingsIcon,
  MessageSquare,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  LogOut,
  Upload,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  Mail,
  Search,
} from 'lucide-react'
import { useAuth, UserRole } from '@/lib/hooks/useAuth'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { FileUpload } from '@/components/media/FileUpload'
import { uploadOptimizedImage } from '@/lib/utils/image'

export const AdminDashboard: React.FC = () => {
  const { user, role, loading: authLoading, signInWithEmail, signOut } = useAuth()
  const { settings, updateSetting, refreshSettings } = useSiteSettings()

  // Admin login form states
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'admissions'
    | 'users'
    | 'courses'
    | 'subjects'
    | 'batches'
    | 'fees'
    | 'exams'
    | 'blogs'
    | 'testimonials'
    | 'achievements'
    | 'facilities'
    | 'faculty'
    | 'gallery'
    | 'videos'
    | 'messages'
    | 'settings'
  >('overview')

  const [notification, setNotification] = useState('')
  const showNotice = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 4000)
  }

  // --- DATA STATES ---
  const [admissions, setAdmissions] = useState<any[]>([])
  const [selectedAdmission, setSelectedAdmission] = useState<any | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [profilesList, setProfilesList] = useState<any[]>([])
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'teacher',
  })

  const [coursesList, setCoursesList] = useState<any[]>([])
  const [editingCourse, setEditingCourse] = useState<any | null>(null)
  const emptyCourse = {
    title: '',
    board: 'SSC',
    target_class: 'Class 10',
    subjects: '',
    description: '',
    syllabus: '',
    duration: '',
    fee: '',
    batch_info: '',
    faculty_name: '',
    is_active: true,
    display_order: 0,
  }

  const [subjectsList, setSubjectsList] = useState<any[]>([])
  const [editingSubject, setEditingSubject] = useState<any | null>(null)
  const emptySubject = {
    name: '',
    code: '',
    board: 'SSC',
    target_class: 'Class 10',
    description: '',
    is_active: true,
    display_order: 0,
  }

  const [batchesList, setBatchesList] = useState<any[]>([])
  const [newBatchForm, setNewBatchForm] = useState({
    course_id: '',
    name: '',
    schedule: '',
    capacity: 30,
    teacher_id: '',
  })

  const [feesList, setFeesList] = useState<any[]>([])
  const [newFeeForm, setNewFeeForm] = useState({
    student_id: '',
    batch_id: '',
    amount: '',
    due_date: '',
    description: '',
  })
  const [recordPaymentFeeId, setRecordPaymentFeeId] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  const [examsList, setExamsList] = useState<any[]>([])
  const [newExamForm, setNewExamForm] = useState({
    batch_id: '',
    title: '',
    date: '',
    total_marks: 100,
    passing_marks: 40,
  })

  const [galleryList, setGalleryList] = useState<any[]>([])
  const [batchPlacement, setBatchPlacement] = useState('gallery')
  const [batchCaption, setBatchCaption] = useState('')
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)

  const [blogsList, setBlogsList] = useState<any[]>([])
  const [newBlogForm, setNewBlogForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    cover_url: '',
    author: 'Ankit Gupta',
  })

  const [facultyList, setFacultyList] = useState<any[]>([])
  const [newFacultyForm, setNewFacultyForm] = useState({
    name: '',
    designation: '',
    subjects: '',
    bio: '',
    photo_url: '',
  })

  const [facilitiesList, setFacilitiesList] = useState<any[]>([])
  const [newFacilityForm, setNewFacilityForm] = useState({
    title: '',
    description: '',
    icon: 'BookOpen',
  })

  const [achievementsList, setAchievementsList] = useState<any[]>([])
  const [newAchievementForm, setNewAchievementForm] = useState({
    title: '',
    description: '',
    date: '',
  })

  const [testimonialsList, setTestimonialsList] = useState<any[]>([])
  const [newTestimonialForm, setNewTestimonialForm] = useState({
    student_name: '',
    course: '',
    text: '',
    rating: 5,
  })

  const [messagesList, setMessagesList] = useState<any[]>([])
  const [videosList, setVideosList] = useState<any[]>([])
  const [newVideo, setNewVideo] = useState({ title: '', description: '', url: '', platform: 'youtube' })

  // Helper for authenticated API calls
  const authHeaders = () => {
    const token = localStorage.getItem('ss_token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    }
  }

  // Load data whenever activeTab changes
  useEffect(() => {
    if (role === 'admin' || role === 'moderator') {
      loadTabData(activeTab)
    }
  }, [activeTab, role])

  const loadTabData = async (tab: string) => {
    try {
      if (tab === 'overview' || tab === 'admissions') {
        const res = await fetch('/api/admissions', { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setAdmissions(data.admissions || [])
        }
      }
      if (tab === 'overview' || tab === 'users') {
        const res = await fetch('/api/users', { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setProfilesList(data.users || [])
        }
      }
      if (tab === 'overview' || tab === 'courses' || tab === 'batches') {
        const res = await fetch('/api/courses')
        if (res.ok) {
          const data = await res.json()
          setCoursesList(data.courses || [])
        }
      }
      if (tab === 'subjects') {
        const res = await fetch('/api/courses/subjects/all')
        if (res.ok) {
          const data = await res.json()
          setSubjectsList(data.subjects || [])
        }
      }
      if (tab === 'batches' || tab === 'overview') {
        const res = await fetch('/api/batches', { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setBatchesList(data.batches || [])
        }
      }
      if (tab === 'fees') {
        const res = await fetch('/api/fees', { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setFeesList(data.fees || [])
        }
      }
      if (tab === 'exams') {
        const res = await fetch('/api/exams', { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setExamsList(data.exams || [])
        }
      }
      if (tab === 'overview' || tab === 'gallery') {
        const res = await fetch('/api/gallery?all=true')
        if (res.ok) {
          const data = await res.json()
          setGalleryList(data.gallery || [])
        }
      }
      if (tab === 'blogs') {
        const res = await fetch('/api/content/blogs?all=true')
        if (res.ok) {
          const data = await res.json()
          setBlogsList(data.blogs || [])
        }
      }
      if (tab === 'faculty') {
        const res = await fetch('/api/content/faculty')
        if (res.ok) {
          const data = await res.json()
          setFacultyList(data.faculty || [])
        }
      }
      if (tab === 'facilities') {
        const res = await fetch('/api/content/facilities')
        if (res.ok) {
          const data = await res.json()
          setFacilitiesList(data.facilities || [])
        }
      }
      if (tab === 'achievements') {
        const res = await fetch('/api/content/achievements')
        if (res.ok) {
          const data = await res.json()
          setAchievementsList(data.achievements || [])
        }
      }
      if (tab === 'testimonials') {
        const res = await fetch('/api/content/testimonials')
        if (res.ok) {
          const data = await res.json()
          setTestimonialsList(data.testimonials || [])
        }
      }
      if (tab === 'overview' || tab === 'messages') {
        const res = await fetch('/api/content/messages', { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setMessagesList(data.messages || [])
        }
      }
      if (tab === 'videos') {
        const res = await fetch('/api/content/videos')
        if (res.ok) {
          const data = await res.json()
          setVideosList(data.videos || [])
        }
      }
    } catch (e) {
      console.warn('Error loading admin data for tab ' + tab, e)
    }
  }

  // --- ADMIN LOGIN ACTION ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const res = await signInWithEmail(adminEmail.trim().toLowerCase(), adminPassword)
      if (res.error) {
        throw res.error
      }
      // Re-read role from local storage
      const userStr = localStorage.getItem('ss_user')
      if (userStr) {
        const u = JSON.parse(userStr)
        if (u.role !== 'admin' && u.role !== 'moderator') {
          await signOut()
          throw new Error('Access Denied: The account entered is not an administrator. Please log in with admin credentials.')
        }
      }
      showNotice('Welcome to SS Tutorial Admin Control!')
      loadTabData('overview')
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials')
    } finally {
      setLoginLoading(false)
    }
  }

  // --- ADMISSION ACTIONS ---
  const handleReviewAdmission = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admissions/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          status,
          rejection_reason: status === 'rejected' ? rejectionReason : null,
        }),
      })
      if (res.ok) {
        showNotice(`Admission application ${status}!`)
        setSelectedAdmission(null)
        setRejectionReason('')
        loadTabData('admissions')
      }
    } catch (e) {
      console.error(e)
    }
  }

  // --- USER ACTIONS ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newUserForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create user')
      showNotice(`User ${newUserForm.full_name} created successfully!`)
      setShowAddUserModal(false)
      setNewUserForm({ full_name: '', email: '', password: '', phone: '', role: 'teacher' })
      loadTabData('users')
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleToggleUserActive = async (userItem: any) => {
    try {
      const res = await fetch(`/api/users/${userItem.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ is_active: userItem.is_active ? 0 : 1 }),
      })
      if (res.ok) {
        showNotice(`User ${userItem.full_name} status updated!`)
        loadTabData('users')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // --- GALLERY ACTIONS ---
  const handleBulkGalleryUpload = async (files: FileList) => {
    setIsUploadingGallery(true)
    showNotice(`Uploading ${files.length} images...`)

    let uploadedCount = 0
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const uploadRes = await uploadOptimizedImage(file, 'gallery')
        await fetch('/api/gallery', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            title: file.name.replace(/\.[^/.]+$/, ''),
            caption: batchCaption || '',
            alt_text: file.name,
            image_url: uploadRes.imageUrl,
            webp_url: uploadRes.webpUrl,
            thumbnail_url: uploadRes.thumbnailUrl,
            placement: batchPlacement,
            is_published: 1,
          }),
        })
        uploadedCount++
      } catch (err) {
        console.error('Failed to upload image:', file.name, err)
      }
    }

    setIsUploadingGallery(false)
    showNotice(`${uploadedCount} image(s) uploaded successfully!`)
    loadTabData('gallery')
  }

  // --- BATCH ACTIONS ---
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBatchForm.name || !newBatchForm.course_id) {
      alert('Batch name and course are required')
      return
    }
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newBatchForm),
      })
      if (res.ok) {
        showNotice('Batch created successfully!')
        setNewBatchForm({ course_id: '', name: '', schedule: '', capacity: 30, teacher_id: '' })
        loadTabData('batches')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // --- FEE ACTIONS ---
  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFeeForm.student_id || !newFeeForm.amount || !newFeeForm.due_date) {
      alert('Student, amount, and due date are required')
      return
    }
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newFeeForm),
      })
      if (res.ok) {
        showNotice('Fee record created!')
        setNewFeeForm({ student_id: '', batch_id: '', amount: '', due_date: '', description: '' })
        loadTabData('fees')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRecordPayment = async (feeId: string) => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount')
      return
    }
    try {
      const res = await fetch(`/api/fees/${feeId}/payment`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount: Number(paymentAmount), method: paymentMethod }),
      })
      if (res.ok) {
        showNotice('Payment recorded successfully!')
        setRecordPaymentFeeId(null)
        setPaymentAmount('')
        loadTabData('fees')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // --- EXAM ACTIONS ---
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExamForm.title || !newExamForm.batch_id || !newExamForm.date) {
      alert('Title, batch, and date are required')
      return
    }
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newExamForm),
      })
      if (res.ok) {
        showNotice('Exam scheduled successfully!')
        setNewExamForm({ batch_id: '', title: '', date: '', total_marks: 100, passing_marks: 40 })
        loadTabData('exams')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handlePublishExam = async (examId: string) => {
    try {
      const res = await fetch(`/api/exams/${examId}/publish`, {
        method: 'PATCH',
        headers: authHeaders(),
      })
      if (res.ok) {
        showNotice('Exam published to students!')
        loadTabData('exams')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // =========================================================================
  // 1. STRICT ADMIN AUTH GUARD & DEDICATED ADMIN LOGIN
  // =========================================================================
  const isAdminUser = (role === 'admin' || role === 'moderator') && !!user

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-sm font-semibold">Verifying Administrator Permissions...</span>
        </div>
      </div>
    )
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-950 flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-slate-900/90 border border-emerald-800/50 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center text-emerald-950 mx-auto shadow-lg mb-4">
              <ShieldCheck className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">SS Tutorial</h1>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mt-1">
              Admin Portal Security
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Strictly restricted to institute administrators. Public registration is prohibited.
            </p>
          </div>

          {user && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Logged in as: {user.email} ({role})</span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                Your current account does not have administrator access. Please sign out and log in with your admin credentials.
              </p>
              <button
                type="button"
                onClick={() => signOut()}
                className="mt-1 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[11px] self-start hover:bg-red-700 transition"
              >
                Sign Out
              </button>
            </div>
          )}

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@sstutorial.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-emerald-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loginLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{loginLoading ? 'Verifying Admin Access...' : 'Sign In as Administrator'}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <a href="/" className="text-xs text-slate-400 hover:text-amber-400 transition inline-flex items-center gap-1.5">
              <span>&larr; Return to Institute Website</span>
            </a>
          </div>

        </div>
      </div>
    )
  }

  // =========================================================================
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-emerald-950 text-white flex flex-col shrink-0 border-r border-emerald-900">
        <div className="p-6 border-b border-emerald-900 flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white">SS Tutorial</h1>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
              Admin Control
            </span>
          </div>
          <a href="/" className="text-xs text-emerald-300 hover:text-white" title="View Site" target="_blank" rel="noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto flex-1 text-xs">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'admissions', label: 'Admissions', icon: FileCheck },
            { id: 'users', label: 'Users & Roles', icon: Users },
            { id: 'courses', label: 'Courses Manager', icon: BookOpen },
            { id: 'subjects', label: 'Subjects Manager', icon: BookOpen },
            { id: 'batches', label: 'Batches', icon: Calendar },
            { id: 'fees', label: 'Fees & Dues', icon: CreditCard },
            { id: 'exams', label: 'Exams & Marks', icon: Award },
            { id: 'gallery', label: 'Gallery Manager', icon: ImageIcon },
            { id: 'blogs', label: 'Blog Posts', icon: FileText },
            { id: 'faculty', label: 'Faculty', icon: Users },
            { id: 'facilities', label: 'Facilities', icon: Award },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
            { id: 'videos', label: 'Video Manager', icon: Video },
            { id: 'messages', label: 'Inquiries Inbox', icon: MessageSquare },
            { id: 'settings', label: 'Institute Settings', icon: SettingsIcon },
          ].map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition ${
                  active
                    ? 'bg-amber-400 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-emerald-900">
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-red-200 bg-red-950/50 hover:bg-red-900 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out (Admin)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Flash Notice */}
        {notification && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
            <Check className="w-4 h-4" /> {notification}
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Admin Command Center
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time metrics, recent admission submissions, and website content controls.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Pending Admissions</p>
                <p className="text-3xl font-black text-amber-500 mt-2">
                  {admissions.filter((a) => a.status === 'pending').length}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Registered Users</p>
                <p className="text-3xl font-black text-blue-600 mt-2">
                  {profilesList.length}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Active Courses</p>
                <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
                  {coursesList.length}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Gallery Media</p>
                <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">
                  {galleryList.length}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('admissions')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-amber-400 transition shadow-sm"
              >
                <FileCheck className="w-6 h-6 text-amber-500 mb-2" />
                <h4 className="font-bold text-sm">Review Admissions</h4>
                <p className="text-xs text-slate-400 mt-1">Approve or reject student applications</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-500 transition shadow-sm"
              >
                <ImageIcon className="w-6 h-6 text-emerald-600 mb-2" />
                <h4 className="font-bold text-sm">Upload Photos</h4>
                <p className="text-xs text-slate-400 mt-1">Bulk upload with automatic WebP generation</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-blue-500 transition shadow-sm"
              >
                <SettingsIcon className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-bold text-sm">Update Institute Info</h4>
                <p className="text-xs text-slate-400 mt-1">Logo, phone, address, timings, WhatsApp</p>
              </button>
            </div>
          </div>
        )}

        {/* 2. ADMISSIONS TAB */}
        {activeTab === 'admissions' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admission Applications</h2>
            {admissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Parent</th>
                      <th className="p-3">Course / Batch</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {admissions.map((adm) => (
                      <tr key={adm.id}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{adm.student_name}</td>
                        <td className="p-3 text-slate-500">{adm.parent_name || '-'}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">
                          <p>{adm.course_title || 'General'}</p>
                          {adm.batch_name && <p className="text-[11px] text-slate-400">{adm.batch_name}</p>}
                        </td>
                        <td className="p-3 text-slate-500">
                          <p>{adm.phone}</p>
                          <p className="text-[11px] text-slate-400">{adm.email}</p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              adm.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : adm.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {adm.status}
                          </span>
                        </td>
                        <td className="p-3 space-x-2">
                          {adm.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleReviewAdmission(adm.id, 'approved')}
                                className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px]"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedAdmission(adm)}
                                className="px-3 py-1 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400 italic">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No admission applications received yet.</p>
            )}

            {/* Reject Modal */}
            {selectedAdmission && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Reject Admission Application
                  </h3>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection (e.g. batch full)..."
                    className="w-full p-3 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAdmission(null)}
                      className="px-4 py-2 rounded-xl text-xs bg-slate-200 dark:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewAdmission(selectedAdmission.id, 'rejected')}
                      className="px-4 py-2 rounded-xl text-xs bg-red-700 text-white font-bold"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. USERS & ROLES TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    User Accounts & Roles Management
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage student, parent, teacher, and administrator accounts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add New User
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="teacher">Teachers</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {profilesList
                      .filter((u) => userRoleFilter === 'all' || u.role === userRoleFilter)
                      .filter((u) =>
                        !userSearch ||
                        u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.phone?.includes(userSearch)
                      )
                      .map((u) => (
                        <tr key={u.id}>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{u.full_name || 'Unnamed'}</td>
                          <td className="p-3 text-slate-500">{u.email}</td>
                          <td className="p-3 text-slate-500">{u.phone || '-'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                                u.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                  : u.role === 'teacher'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                                  : u.role === 'parent'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                u.is_active !== 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {u.is_active !== 0 ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-3 space-x-2">
                            <button
                              type="button"
                              onClick={() => handleToggleUserActive(u)}
                              className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-[11px] font-bold"
                            >
                              {u.is_active !== 0 ? 'Disable' : 'Enable'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Create New User</h3>
                  <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newUserForm.full_name}
                        onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        placeholder="e.g. Ramesh Kumar"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        placeholder="user@sstutorial.com"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Password *</label>
                      <input
                        type="password"
                        required
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Phone Number</label>
                      <input
                        type="text"
                        value={newUserForm.phone}
                        onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        placeholder="9876543210"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Assigned Role</label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      >
                        <option value="teacher">Teacher / Faculty</option>
                        <option value="student">Student</option>
                        <option value="parent">Parent</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        Create User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. COURSES MANAGER TAB */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingCourse?.id ? 'Edit Course' : 'Add New Course'}
              </h2>

              {(() => {
                const form = editingCourse || emptyCourse
                const setForm = (val: any) => setEditingCourse(val)
                const isEdit = !!editingCourse?.id

                const handleSave = async () => {
                  if (!form.title) { showNotice('Course title is required.'); return }
                  const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'course-' + Date.now()
                  const payload: any = {
                    title: form.title,
                    slug,
                    board: form.board || 'Both',
                    target_class: form.target_class || 'School Classes',
                    subjects: form.subjects || '',
                    description: form.description || '',
                    syllabus: form.syllabus || '',
                    duration: form.duration || '',
                    fee: form.fee || '',
                    batch_info: form.batch_info || '',
                    faculty_name: form.faculty_name || '',
                    category: form.target_class || '',
                    image_url: form.image_url || '',
                    is_active: form.is_active !== false,
                    display_order: Number(form.display_order) || 0,
                  }

                  if (isEdit) {
                    await fetch(`/api/courses/${form.id}`, {
                      method: 'PATCH',
                      headers: authHeaders(),
                      body: JSON.stringify(payload),
                    })
                    showNotice('Course updated!')
                  } else {
                    await fetch('/api/courses', {
                      method: 'POST',
                      headers: authHeaders(),
                      body: JSON.stringify(payload),
                    })
                    showNotice('Course added!')
                  }

                  setEditingCourse(null)
                  loadTabData('courses')
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Course Name *</label>
                      <input type="text" value={form.title || ''} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="e.g. Class 10 Math Foundation" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Board</label>
                      <select value={form.board || 'Both'} onChange={(e) => setForm({...form, board: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold">
                        <option value="SSC">SSC Board</option>
                        <option value="CBSE">CBSE Board</option>
                        <option value="Both">Both Boards</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Class / Level</label>
                      <select value={form.target_class || 'Class 10'} onChange={(e) => setForm({...form, target_class: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold">
                        <option value="School Classes">School Classes (General)</option>
                        <option value="Class 6">Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subjects</label>
                      <input type="text" value={form.subjects || ''} onChange={(e) => setForm({...form, subjects: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="e.g. Mathematics, Science" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Duration</label>
                      <input type="text" value={form.duration || ''} onChange={(e) => setForm({...form, duration: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="e.g. Full Year" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Fees</label>
                      <input type="text" value={form.fee || ''} onChange={(e) => setForm({...form, fee: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="e.g. ₹1500 / month" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Description</label>
                      <textarea rows={2} value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                      <button type="button" onClick={handleSave} className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700">
                        {isEdit ? 'Save Changes' : 'Add Course'}
                      </button>
                      {isEdit && (
                        <button type="button" onClick={() => setEditingCourse(null)} className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Courses List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-6">All Courses ({coursesList.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Course</th>
                      <th className="p-3">Board</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Fee</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {coursesList.map((course: any) => (
                      <tr key={course.id}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{course.title}</td>
                        <td className="p-3">{course.board}</td>
                        <td className="p-3">{course.target_class}</td>
                        <td className="p-3 font-bold text-emerald-600">{course.fee || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${course.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                            {course.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="p-3 space-x-2">
                          <button type="button" onClick={() => setEditingCourse(course)} className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-[11px]">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. SUBJECTS MANAGER TAB */}
        {activeTab === 'subjects' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingSubject?.id ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              {(() => {
                const form = editingSubject || emptySubject
                const setForm = (val: any) => setEditingSubject(val)
                const isEdit = !!editingSubject?.id

                const handleSave = async () => {
                  if (!form.name) { showNotice('Subject name is required.'); return }
                  const payload = {
                    name: form.name,
                    code: form.code || '',
                    board: form.board || 'SSC',
                    target_class: form.target_class || 'Class 10',
                    description: form.description || '',
                    is_active: form.is_active !== false,
                    display_order: Number(form.display_order) || 0,
                  }
                  showNotice('Subject saved!')
                  setEditingSubject(null)
                  loadTabData('subjects')
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subject Name *</label>
                      <input type="text" value={form.name || ''} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="e.g. Mathematics" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subject Code</label>
                      <input type="text" value={form.code || ''} onChange={(e) => setForm({...form, code: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" placeholder="MATH10" />
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                      <button type="button" onClick={handleSave} className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700">
                        {isEdit ? 'Save Changes' : 'Add Subject'}
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-6">All Subjects ({subjectsList.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Board</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {subjectsList.map((subject: any) => (
                      <tr key={subject.id}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{subject.name}</td>
                        <td className="p-3 font-mono text-slate-400">{subject.code || '-'}</td>
                        <td className="p-3">{subject.board}</td>
                        <td className="p-3">{subject.target_class}</td>
                        <td className="p-3">
                          <button type="button" onClick={() => setEditingSubject(subject)} className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 font-bold text-[11px]">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. BATCHES TAB */}
        {activeTab === 'batches' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Batch</h2>
              <form onSubmit={handleCreateBatch} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Batch Name *</label>
                  <input
                    type="text"
                    required
                    value={newBatchForm.name}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="e.g. Class 10 Morning Achievers"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Select Course *</label>
                  <select
                    required
                    value={newBatchForm.course_id}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, course_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="">-- Choose Course --</option>
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Schedule / Timings</label>
                  <input
                    type="text"
                    value={newBatchForm.schedule}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, schedule: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="Mon-Fri, 7:00 AM - 9:00 AM"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Seat Capacity</label>
                  <input
                    type="number"
                    value={newBatchForm.capacity}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700">
                    Create Batch
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-6">Active Batches ({batchesList.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Batch Name</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Schedule</th>
                      <th className="p-3">Enrolled</th>
                      <th className="p-3">Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {batchesList.map((b) => (
                      <tr key={b.id}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{b.name}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{b.course_title || '-'}</td>
                        <td className="p-3 text-slate-500">{b.schedule || '-'}</td>
                        <td className="p-3 font-bold text-amber-500">{b.enrolled || 0}</td>
                        <td className="p-3">{b.capacity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. FEES & DUES TAB */}
        {activeTab === 'fees' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Fee Record</h2>
              <form onSubmit={handleCreateFee} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Student *</label>
                  <select
                    required
                    value={newFeeForm.student_id}
                    onChange={(e) => setNewFeeForm({ ...newFeeForm, student_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="">-- Choose Student --</option>
                    {profilesList.filter(p => p.role === 'student').map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Batch (Optional)</label>
                  <select
                    value={newFeeForm.batch_id}
                    onChange={(e) => setNewFeeForm({ ...newFeeForm, batch_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="">-- Choose Batch --</option>
                    {batchesList.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newFeeForm.amount}
                    onChange={(e) => setNewFeeForm({ ...newFeeForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newFeeForm.due_date}
                    onChange={(e) => setNewFeeForm({ ...newFeeForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700">
                    Issue Fee Invoice
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-6">Fee Invoices & Dues ({feesList.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Batch</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Paid Amount</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {feesList.map((f) => (
                      <tr key={f.id}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{f.student_name}</td>
                        <td className="p-3 text-slate-500">{f.batch_name || '-'}</td>
                        <td className="p-3 font-bold">₹{f.amount}</td>
                        <td className="p-3 font-bold text-emerald-600">₹{f.paid_amount || 0}</td>
                        <td className="p-3 text-slate-500">{f.due_date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${f.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {f.status !== 'paid' && (
                            <button
                              type="button"
                              onClick={() => {
                                setRecordPaymentFeeId(f.id)
                                setPaymentAmount(String(f.amount - (f.paid_amount || 0)))
                              }}
                              className="px-3 py-1 rounded bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-[11px]"
                            >
                              Collect Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Collect Payment Modal */}
            {recordPaymentFeeId && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Record Fee Payment</h3>
                  <div>
                    <label className="font-bold text-slate-500 mb-1 block">Amount Received (₹)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-500 mb-1 block">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setRecordPaymentFeeId(null)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800">
                      Cancel
                    </button>
                    <button type="button" onClick={() => handleRecordPayment(recordPaymentFeeId)} className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold">
                      Confirm & Issue Receipt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. EXAMS & MARKS TAB */}
        {activeTab === 'exams' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Schedule New Test / Exam</h2>
              <form onSubmit={handleCreateExam} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Exam Title *</label>
                  <input
                    type="text"
                    required
                    value={newExamForm.title}
                    onChange={(e) => setNewExamForm({ ...newExamForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="e.g. Chapter 4 Quadratic Equations Test"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Batch *</label>
                  <select
                    required
                    value={newExamForm.batch_id}
                    onChange={(e) => setNewExamForm({ ...newExamForm, batch_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="">-- Choose Batch --</option>
                    {batchesList.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Date of Exam *</label>
                  <input
                    type="date"
                    required
                    value={newExamForm.date}
                    onChange={(e) => setNewExamForm({ ...newExamForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Total Marks</label>
                  <input
                    type="number"
                    value={newExamForm.total_marks}
                    onChange={(e) => setNewExamForm({ ...newExamForm, total_marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700">
                    Schedule Exam
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-6">Exams & Tests ({examsList.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Exam Title</th>
                      <th className="p-3">Batch</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Total Marks</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {examsList.map((ex) => (
                      <tr key={ex.id}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{ex.title}</td>
                        <td className="p-3 text-slate-500">{ex.batch_name || '-'}</td>
                        <td className="p-3 text-slate-500">{ex.date}</td>
                        <td className="p-3 font-bold">{ex.total_marks}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${ex.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {ex.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-3">
                          {!ex.is_published && (
                            <button
                              type="button"
                              onClick={() => handlePublishExam(ex.id)}
                              className="px-3 py-1 rounded bg-emerald-800 text-white font-bold text-[11px]"
                            >
                              Publish Marks
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 9. GALLERY MANAGER TAB (Working local uploads + WebP) */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Gallery Manager & Bulk Photo Uploader
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Upload multiple photos. Uploads are stored locally in the institute database and automatically converted to WebP variants.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Batch Placement</label>
                  <select
                    value={batchPlacement}
                    onChange={(e) => setBatchPlacement(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="gallery">General Gallery</option>
                    <option value="classroom">Classroom ("Inside our classrooms")</option>
                    <option value="results">Results & Toppers</option>
                    <option value="hero">Hero Banners</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Batch Caption</label>
                  <input
                    type="text"
                    value={batchCaption}
                    onChange={(e) => setBatchCaption(e.target.value)}
                    placeholder="Caption applied to uploaded images"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-emerald-700/40 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30">
                <Upload className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Select Multiple Photos to Upload
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG, WebP supported</p>
                <label className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs cursor-pointer shadow-md transition">
                  {isUploadingGallery ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>{isUploadingGallery ? 'Uploading & Converting...' : 'Choose Photos From Computer'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={isUploadingGallery}
                    onChange={(e) => e.target.files && handleBulkGalleryUpload(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-6">Published Gallery Media ({galleryList.length})</h3>
              {galleryList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {galleryList.map((item) => (
                    <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={item.thumbnail_url || item.webp_url || item.image_url}
                        alt={item.title || 'SS Tutorial Photo'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center">
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm('Delete this photo?')) {
                              await fetch(`/api/gallery/${item.id}`, {
                                method: 'DELETE',
                                headers: authHeaders(),
                              })
                              loadTabData('gallery')
                              showNotice('Image removed')
                            }
                          }}
                          className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No media uploaded to gallery yet. Use the uploader above to add photos.</p>
              )}
            </div>
          </div>
        )}

        {/* 10. BLOG POSTS TAB */}
        {activeTab === 'blogs' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Write Educational Article / Blog</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Blog Title *</label>
                  <input
                    type="text"
                    value={newBlogForm.title}
                    onChange={(e) => setNewBlogForm({ ...newBlogForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="e.g. 5 Strategies to Score 95+ in Board Math"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Author</label>
                  <input
                    type="text"
                    value={newBlogForm.author}
                    onChange={(e) => setNewBlogForm({ ...newBlogForm, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-500 mb-1 block">Short Excerpt / Summary</label>
                  <input
                    type="text"
                    value={newBlogForm.excerpt}
                    onChange={(e) => setNewBlogForm({ ...newBlogForm, excerpt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-500 mb-1 block">Content (Markdown / Text) *</label>
                  <textarea
                    rows={6}
                    value={newBlogForm.content}
                    onChange={(e) => setNewBlogForm({ ...newBlogForm, content: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!newBlogForm.title || !newBlogForm.content) {
                    alert('Title and content are required')
                    return
                  }
                  await fetch('/api/content/blogs', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(newBlogForm),
                  })
                  setNewBlogForm({ title: '', excerpt: '', content: '', cover_url: '', author: 'Ankit Gupta' })
                  showNotice('Blog post published!')
                  loadTabData('blogs')
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700"
              >
                Publish Article
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-4">Published Articles ({blogsList.length})</h3>
              <div className="space-y-3">
                {blogsList.map((blog) => (
                  <div key={blog.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{blog.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{blog.author} &bull; {blog.created_at}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/content/blogs/${blog.id}`, { method: 'DELETE', headers: authHeaders() })
                        loadTabData('blogs')
                        showNotice('Article removed')
                      }}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 11. FACULTY TAB */}
        {activeTab === 'faculty' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Faculty Member</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    value={newFacultyForm.name}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="e.g. Ankit Gupta"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Designation</label>
                  <input
                    type="text"
                    value={newFacultyForm.designation}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="Founder & Senior Faculty"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Subjects</label>
                  <input
                    type="text"
                    value={newFacultyForm.subjects}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, subjects: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="Mathematics, Physics"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-500 mb-1 block">Bio / Summary</label>
                  <textarea
                    rows={2}
                    value={newFacultyForm.bio}
                    onChange={(e) => setNewFacultyForm({ ...newFacultyForm, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!newFacultyForm.name) return
                  await fetch('/api/content/faculty', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(newFacultyForm),
                  })
                  setNewFacultyForm({ name: '', designation: '', subjects: '', bio: '', photo_url: '' })
                  showNotice('Faculty added!')
                  loadTabData('faculty')
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700"
              >
                Add Faculty
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-4">Faculty Members ({facultyList.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {facultyList.map((fac) => (
                  <div key={fac.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{fac.name}</h4>
                      <p className="text-xs text-emerald-600 font-semibold">{fac.designation}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{fac.subjects}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/content/faculty/${fac.id}`, { method: 'DELETE', headers: authHeaders() })
                        loadTabData('faculty')
                        showNotice('Faculty removed')
                      }}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 12. FACILITIES TAB */}
        {activeTab === 'facilities' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Facility Feature</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Facility Title *</label>
                  <input
                    type="text"
                    value={newFacilityForm.title}
                    onChange={(e) => setNewFacilityForm({ ...newFacilityForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="e.g. AC Classrooms & Smart Boards"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-500 mb-1 block">Description</label>
                  <input
                    type="text"
                    value={newFacilityForm.description}
                    onChange={(e) => setNewFacilityForm({ ...newFacilityForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!newFacilityForm.title) return
                  await fetch('/api/content/facilities', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(newFacilityForm),
                  })
                  setNewFacilityForm({ title: '', description: '', icon: 'BookOpen' })
                  showNotice('Facility added!')
                  loadTabData('facilities')
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700"
              >
                Add Facility
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-4">Campus Facilities ({facilitiesList.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilitiesList.map((f) => (
                  <div key={f.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{f.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{f.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/content/facilities/${f.id}`, { method: 'DELETE', headers: authHeaders() })
                        loadTabData('facilities')
                        showNotice('Facility removed')
                      }}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 13. ACHIEVEMENTS & TOPPERS TAB */}
        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Student Achievement / Topper</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Title / Score *</label>
                  <input
                    type="text"
                    value={newAchievementForm.title}
                    onChange={(e) => setNewAchievementForm({ ...newAchievementForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="e.g. Rahul Sharma - 98.4% SSC Board"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Year / Exam</label>
                  <input
                    type="text"
                    value={newAchievementForm.date}
                    onChange={(e) => setNewAchievementForm({ ...newAchievementForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="2026 Batch"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-500 mb-1 block">Description</label>
                  <input
                    type="text"
                    value={newAchievementForm.description}
                    onChange={(e) => setNewAchievementForm({ ...newAchievementForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!newAchievementForm.title) return
                  await fetch('/api/content/achievements', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(newAchievementForm),
                  })
                  setNewAchievementForm({ title: '', description: '', date: '' })
                  showNotice('Achievement added!')
                  loadTabData('achievements')
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700"
              >
                Add Achievement
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-4">Toppers & Achievements ({achievementsList.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementsList.map((a) => (
                  <div key={a.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.title}</h4>
                      <p className="text-xs text-amber-500 font-semibold mt-0.5">{a.date}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/content/achievements/${a.id}`, { method: 'DELETE', headers: authHeaders() })
                        loadTabData('achievements')
                        showNotice('Achievement removed')
                      }}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 14. TESTIMONIALS TAB */}
        {activeTab === 'testimonials' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Review / Testimonial</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Student / Parent Name *</label>
                  <input
                    type="text"
                    value={newTestimonialForm.student_name}
                    onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, student_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Course</label>
                  <input
                    type="text"
                    value={newTestimonialForm.course}
                    onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-500 mb-1 block">Review Text *</label>
                  <textarea
                    rows={3}
                    value={newTestimonialForm.text}
                    onChange={(e) => setNewTestimonialForm({ ...newTestimonialForm, text: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!newTestimonialForm.student_name || !newTestimonialForm.text) return
                  await fetch('/api/content/testimonials', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(newTestimonialForm),
                  })
                  setNewTestimonialForm({ student_name: '', course: '', text: '', rating: 5 })
                  showNotice('Testimonial added!')
                  loadTabData('testimonials')
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700"
              >
                Add Testimonial
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-4">Testimonials ({testimonialsList.length})</h3>
              <div className="space-y-3">
                {testimonialsList.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.student_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">"{t.text}"</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/content/testimonials/${t.id}`, { method: 'DELETE', headers: authHeaders() })
                        loadTabData('testimonials')
                        showNotice('Testimonial removed')
                      }}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 15. VIDEO MANAGER TAB */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Video Lecture or Reel</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Video Title *</label>
                  <input
                    type="text"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="e.g. Tips for Board Exam Prep"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Platform</label>
                  <select
                    value={newVideo.platform}
                    onChange={(e) => setNewVideo({ ...newVideo, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram Reel</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-500 mb-1 block">Video URL *</label>
                  <input
                    type="url"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (!newVideo.title || !newVideo.url) return
                  let embed = newVideo.url
                  if (newVideo.url.includes('youtube.com/watch?v=')) {
                    embed = newVideo.url.replace('watch?v=', 'embed/')
                  } else if (newVideo.url.includes('youtu.be/')) {
                    embed = newVideo.url.replace('youtu.be/', 'www.youtube.com/embed/')
                  }

                  await fetch('/api/content/videos', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({
                      title: newVideo.title,
                      url: newVideo.url,
                      embed_url: embed,
                      platform: newVideo.platform,
                    }),
                  })
                  setNewVideo({ title: '', description: '', url: '', platform: 'youtube' })
                  showNotice('Video added successfully!')
                  loadTabData('videos')
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700"
              >
                Add Video to Site
              </button>
            </div>

            {/* Video List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base">Active Videos ({videosList.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videosList.map((v) => (
                  <div key={v.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-500">{v.platform}</span>
                      <h4 className="font-bold text-sm mt-1">{v.title}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/content/videos/${v.id}`, { method: 'DELETE', headers: authHeaders() })
                        loadTabData('videos')
                        showNotice('Video removed')
                      }}
                      className="mt-4 text-xs font-bold text-red-600 hover:underline text-left"
                    >
                      Delete Video
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 16. INQUIRIES INBOX TAB */}
        {activeTab === 'messages' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact Inquiries Inbox</h2>
            {messagesList.length > 0 ? (
              <div className="space-y-4">
                {messagesList.map((m) => (
                  <div key={m.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h4>
                        <span className="text-xs text-slate-400">&bull; {m.email} &bull; {m.phone || 'No phone'}</span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-600">{m.subject || 'General Inquiry'}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{m.message}</p>
                      <span className="text-[10px] text-slate-400">{m.created_at}</span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch(`/api/content/messages/${m.id}`, { method: 'DELETE', headers: authHeaders() })
                        loadTabData('messages')
                        showNotice('Message removed')
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold self-start sm:self-auto hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No inquiries received yet.</p>
            )}
          </div>
        )}

        {/* 17. MASTER SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 max-w-4xl">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Master Institute Settings
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Every piece of information here is live and dynamically controls headers, footers, contact pages, and metadata.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Logo Upload */}
              <div>
                <FileUpload
                  label="Institute Logo (Upload PNG/SVG)"
                  currentUrl={settings.logo_url}
                  folder="branding"
                  onUploadSuccess={(res) => {
                    updateSetting('logo_url', res.url)
                    showNotice('Logo updated!')
                  }}
                />
              </div>

              {/* Founder Profile Photo */}
              <div>
                <FileUpload
                  label="Founder Profile Photo"
                  currentUrl={settings.founder_image_url}
                  folder="branding"
                  onUploadSuccess={(res) => {
                    updateSetting('founder_image_url', res.url)
                    showNotice('Founder photo updated!')
                  }}
                />
              </div>

              {/* Fields */}
              {[
                { key: 'institute_name', label: 'Institute Name' },
                { key: 'tagline', label: 'Tagline / Slogan' },
                { key: 'founder_name', label: 'Founder Name' },
                { key: 'founder_title', label: 'Founder Title / Designation' },
                { key: 'phone', label: 'Phone Number' },
                { key: 'email', label: 'Official Email' },
                { key: 'whatsapp_number', label: 'WhatsApp Number' },
                { key: 'address', label: 'Physical Campus Address' },
                { key: 'working_hours', label: 'Working Hours' },
                { key: 'notice_ticker', label: 'Notice Ticker Announcement' },
                { key: 'instagram_url', label: 'Instagram Profile URL' },
                { key: 'facebook_url', label: 'Facebook Page URL' },
                { key: 'youtube_url', label: 'YouTube Channel URL' },
                { key: 'homepage_hero_badge', label: 'Homepage Hero Badge (e.g. New Batch 2026-27)' },
                { key: 'homepage_hero_title', label: 'Homepage Hero Title' },
                { key: 'homepage_hero_subtitle', label: 'Homepage Hero Subtitle' },
                { key: 'about_vision_text', label: 'About Us Vision Text' },
                { key: 'about_mission_text', label: 'About Us Mission Text' },
              ].map((field) => (
                <div key={field.key} className={['address', 'notice_ticker', 'homepage_hero_title', 'homepage_hero_subtitle', 'about_vision_text', 'about_mission_text'].includes(field.key) ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={settings[field.key] || ''}
                    onChange={(e) => updateSetting(field.key, e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  About Institute (History, Vision, Mission)
                </label>
                <textarea
                  rows={4}
                  value={settings.about || ''}
                  onChange={(e) => updateSetting('about', e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Founder Biography (displayed on About page)
                </label>
                <textarea
                  rows={4}
                  value={settings.founder_bio || ''}
                  onChange={(e) => updateSetting('founder_bio', e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Homepage FAQs (JSON Format)
                </label>
                <textarea
                  rows={6}
                  value={settings.faqs_json || ''}
                  onChange={(e) => updateSetting('faqs_json', e.target.value)}
                  placeholder={'[\n  { "q": "Question?", "a": "Answer" }\n]'}
                  className="w-full font-mono px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Homepage Schedule (JSON Format)
                </label>
                <textarea
                  rows={6}
                  value={settings.schedule_json || ''}
                  onChange={(e) => updateSetting('schedule_json', e.target.value)}
                  placeholder={'{\n  "Monday": [\n    { "time": "7:00 AM", "tag": "ADV", "title": "Math", "instructor": "Ankit", "seats": "3 left" }\n  ]\n}'}
                  className="w-full font-mono px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  )
}
