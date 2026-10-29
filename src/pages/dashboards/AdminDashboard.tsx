import React, { useEffect, useRef, useState } from 'react'
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
  Scissors,
  Eye,
  CheckCircle2,
  Phone,
  Clock,
  UserPlus,
  UserMinus,
  Sparkles,
} from 'lucide-react'
import { useAuth, UserRole } from '@/lib/hooks/useAuth'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { FileUpload } from '@/components/media/FileUpload'
import { ImageCropperModal } from '@/components/media/ImageCropperModal'
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
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success')
  const showNotice = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification(msg)
    setNotificationType(type)
    setTimeout(() => setNotification(''), 4500)
  }

  // --- CREDENTIAL CHANGE STATE ---
  const [credForm, setCredForm] = useState({ currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' })
  const [credLoading, setCredLoading] = useState(false)
  const [credError, setCredError]   = useState('')
  const [credSuccess, setCredSuccess] = useState('')

  const handleChangeCredentials = async () => {
    setCredError(''); setCredSuccess('')
    if (!credForm.currentPassword) {
      setCredError('Current password is required to update credentials.')
      return
    }
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      setCredError('New password and confirmation password do not match.')
      return
    }
    if (credForm.newPassword && credForm.newPassword.length < 8) {
      setCredError('New password must be at least 8 characters long.')
      return
    }
    if (!credForm.newPassword && !credForm.newEmail) {
      setCredError('Please provide a new email address, a new password, or both.')
      return
    }
    if (credForm.newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(credForm.newEmail.trim())) {
        setCredError('Please enter a valid new email address.')
        return
      }
    }

    setCredLoading(true)
    try {
      const token = localStorage.getItem('ss_token')
      if (!token) {
        setCredError('Your session has expired. Please sign in again.')
        setCredLoading(false)
        setTimeout(() => signOut(), 2500)
        return
      }

      const res = await fetch('/api/auth/admin/update-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: credForm.currentPassword,
          newEmail: credForm.newEmail ? credForm.newEmail.trim() : undefined,
          newPassword: credForm.newPassword || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401 && (data.error?.toLowerCase().includes('token') || data.error?.toLowerCase().includes('session') || data.error?.toLowerCase().includes('unauthenticated'))) {
          setCredError('Your session has expired. Please sign in again.')
          setTimeout(() => signOut(), 2500)
        } else {
          setCredError(data.error || 'Failed to update credentials.')
        }
        setCredLoading(false)
        return
      }

      setCredSuccess(data.message || 'Credentials updated successfully! Logging out...')
      setCredForm({ currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => signOut(), 2500)
    } catch (e: any) {
      setCredError(e.message || 'An unexpected error occurred.')
    } finally {
      setCredLoading(false)
    }
  }

  // --- DATA STATES ---
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [dbStatus, setDbStatus] = useState<{ active: string; supabaseOnline: boolean; url?: string } | null>(null)

  // 1. Admissions
  const [admissions, setAdmissions] = useState<any[]>([])
  const [admissionFilter, setAdmissionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedAdmission, setSelectedAdmission] = useState<any | null>(null)
  const [rejectingAdmission, setRejectingAdmission] = useState<any | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // 2. Users
  const [profilesList, setProfilesList] = useState<any[]>([])
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'teacher',
    is_active: 1,
  })

  // 3. Courses
  const [coursesList, setCoursesList] = useState<any[]>([])
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any | null>(null)
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    slug: '',
    board: 'SSC',
    target_class: 'Class 10',
    subjects: '',
    description: '',
    syllabus: '',
    duration: '',
    fee: '',
    batch_info: '',
    faculty_name: '',
    category: 'Class 10',
    image_url: '',
    display_order: 0,
    is_active: 1,
  })

  // 4. Subjects
  const [subjectsList, setSubjectsList] = useState<any[]>([])
  const [subjectModalOpen, setSubjectModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any | null>(null)
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: '',
    board: 'SSC',
    target_class: 'Class 10',
    description: '',
    display_order: 0,
    is_active: 1,
  })

  // 5. Batches
  const [batchesList, setBatchesList] = useState<any[]>([])
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<any | null>(null)
  const [batchFormData, setBatchFormData] = useState({
    course_id: '',
    name: '',
    schedule: '',
    start_date: '',
    end_date: '',
    capacity: 30,
    teacher_id: '',
    is_active: 1,
  })
  // Batch students modal
  const [batchStudentsModalOpen, setBatchStudentsModalOpen] = useState(false)
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<any | null>(null)
  const [batchStudentsList, setBatchStudentsList] = useState<any[]>([])
  const [enrollStudentId, setEnrollStudentId] = useState('')

  // 6. Fees
  const [feesList, setFeesList] = useState<any[]>([])
  const [feeModalOpen, setFeeModalOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<any | null>(null)
  const [feeFormData, setFeeFormData] = useState({
    student_id: '',
    batch_id: '',
    amount: '',
    due_date: '',
    remarks: '',
  })
  const [recordPaymentFeeId, setRecordPaymentFeeId] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  // 7. Exams & Marks
  const [examsList, setExamsList] = useState<any[]>([])
  const [examModalOpen, setExamModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<any | null>(null)
  const [examFormData, setExamFormData] = useState({
    batch_id: '',
    title: '',
    subject_id: '',
    date: '',
    total_marks: 100,
    passing_marks: 40,
  })
  // Exam Marks Entry Modal
  const [marksModalOpen, setMarksModalOpen] = useState(false)
  const [selectedExamForMarks, setSelectedExamForMarks] = useState<any | null>(null)
  const [marksStudentRows, setMarksStudentRows] = useState<any[]>([])
  const [savingMarks, setSavingMarks] = useState(false)

  // 8. Gallery
  const [galleryList, setGalleryList] = useState<any[]>([])
  const [batchPlacement, setBatchPlacement] = useState('gallery')
  const [batchCaption, setBatchCaption] = useState('')
  const [cropQueue, setCropQueue] = useState<File[]>([])
  const [cropCurrentSrc, setCropCurrentSrc] = useState('')
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [cropUploadedCount, setCropUploadedCount] = useState(0)
  const cropQueueRef = useRef<File[]>([])
  const [editingGalleryItem, setEditingGalleryItem] = useState<any | null>(null)

  // 9. Blogs
  const [blogsList, setBlogsList] = useState<any[]>([])
  const [blogModalOpen, setBlogModalOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<any | null>(null)
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    slug: '',
    author: 'Ankit Gupta',
    excerpt: '',
    content: '',
    cover_url: '',
    is_published: 1,
  })

  // 10. Faculty
  const [facultyList, setFacultyList] = useState<any[]>([])
  const [facultyModalOpen, setFacultyModalOpen] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState<any | null>(null)
  const [facultyFormData, setFacultyFormData] = useState({
    name: '',
    designation: '',
    subjects: '',
    bio: '',
    photo_url: '',
    display_order: 0,
  })

  // 11. Facilities
  const [facilitiesList, setFacilitiesList] = useState<any[]>([])
  const [facilityModalOpen, setFacilityModalOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState<any | null>(null)
  const [facilityFormData, setFacilityFormData] = useState({
    title: '',
    description: '',
    icon: 'BookOpen',
    image_url: '',
    display_order: 0,
  })

  // 12. Achievements
  const [achievementsList, setAchievementsList] = useState<any[]>([])
  const [achievementModalOpen, setAchievementModalOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<any | null>(null)
  const [achievementFormData, setAchievementFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    image_url: '',
    display_order: 0,
  })

  // 13. Testimonials
  const [testimonialsList, setTestimonialsList] = useState<any[]>([])
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<any | null>(null)
  const [testimonialFormData, setTestimonialFormData] = useState({
    student_name: '',
    course: '',
    text: '',
    rating: 5,
    photo_url: '',
    is_published: 1,
  })

  // 14. Videos
  const [videosList, setVideosList] = useState<any[]>([])
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<any | null>(null)
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    url: '',
    platform: 'youtube',
    startTime: '',
    endTime: '',
    display_order: 0,
    is_active: 1,
  })

  // 15. Messages
  const [messagesList, setMessagesList] = useState<any[]>([])

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

  // Real-time SSE stream for instant admission & inquiry updates
  useEffect(() => {
    if (role !== 'admin' && role !== 'moderator') return

    const token = localStorage.getItem('ss_token')
    if (!token) return

    let es: EventSource | null = null
    let reconnectTimer: any = null

    const connectSSE = () => {
      try {
        es = new EventSource(`/api/dashboard/live-stream?token=${encodeURIComponent(token)}`)

        es.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data)
            if (msg.type === 'admission_created' && msg.data) {
              setAdmissions((prev) => [msg.data, ...prev.filter((a) => a.id !== msg.data.id)])
              showNotice(`New admission application: ${msg.data.student_name || 'Student'}`)
              setDashboardStats((prev: any) =>
                prev ? { ...prev, pendingAdmissions: (prev.pendingAdmissions || 0) + 1 } : prev
              )
            } else if (msg.type === 'admission_updated' && msg.data) {
              setAdmissions((prev) => prev.map((a) => (a.id === msg.data.id ? { ...a, ...msg.data } : a)))
            } else if (msg.type === 'admission_deleted' && msg.data) {
              setAdmissions((prev) => prev.filter((a) => a.id !== msg.data.id))
            } else if (msg.type === 'message_created' && msg.data) {
              setMessagesList((prev) => [msg.data, ...prev.filter((m) => m.id !== msg.data.id)])
              showNotice(`New inquiry from ${msg.data.name || 'Visitor'}!`)
              setDashboardStats((prev: any) =>
                prev ? { ...prev, unreadMessages: (prev.unreadMessages || 0) + 1 } : prev
              )
            } else if (msg.type === 'message_updated' && msg.data) {
              setMessagesList((prev) => prev.map((m) => (m.id === msg.data.id ? { ...m, ...msg.data } : m)))
            } else if (msg.type === 'message_deleted' && msg.data) {
              setMessagesList((prev) => prev.filter((m) => m.id !== msg.data.id))
            } else if (msg.type === 'stats_updated' && msg.data) {
              setDashboardStats((prev: any) => ({ ...prev, ...msg.data }))
            }
          } catch (e) {
            // Heartbeat or parse error
          }
        }

        es.onerror = () => {
          if (es) {
            es.close()
            es = null
          }
          reconnectTimer = setTimeout(connectSSE, 5000)
        }
      } catch (err) {
        console.warn('SSE stream error:', err)
      }
    }

    connectSSE()

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (es) es.close()
    }
  }, [role])

  const loadTabData = async (tab: string) => {
    try {
      if (tab === 'overview') {
        fetch('/api/health')
          .then((r) => (r.ok ? r.json() : null))
          .then((hJson) => {
            if (hJson) {
              // setDbStatus({
              //   active: hJson.db || 'sqlite',
              //   supabaseOnline: Boolean(hJson.database_status?.supabase?.online),
              //   url: hJson.database_status?.supabase?.url,
              // })
            }
          })
          .catch(() => {})

        const statsRes = await fetch('/api/dashboard/stats', { headers: authHeaders() })
        if (statsRes.ok) {
          const sdata = await statsRes.json()
          setDashboardStats(sdata)
        }
      }
      if (tab === 'overview' || tab === 'admissions') {
        const res = await fetch('/api/admissions', { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setAdmissions(data.admissions || [])
        }
      }
      if (tab === 'overview' || tab === 'users' || tab === 'fees' || tab === 'batches') {
        const res = await fetch('/api/users', { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setProfilesList(data.users || [])
        }
      }
      if (tab === 'overview' || tab === 'courses' || tab === 'batches') {
        const res = await fetch('/api/courses?all=true')
        if (res.ok) {
          const data = await res.json()
          setCoursesList(data.courses || [])
        }
      }
      if (tab === 'overview' || tab === 'subjects' || tab === 'exams') {
        const res = await fetch('/api/subjects?all=true')
        if (res.ok) {
          const data = await res.json()
          setSubjectsList(data.subjects || [])
        }
      }
      if (tab === 'overview' || tab === 'batches' || tab === 'fees' || tab === 'exams') {
        const res = await fetch('/api/batches?all=true', { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setBatchesList(data.batches || [])
        }
      }
      if (tab === 'overview' || tab === 'fees') {
        const res = await fetch('/api/fees', { headers: authHeaders() })
        if (res.ok) {
          const data = await res.json()
          setFeesList(data.fees || [])
        }
      }
      if (tab === 'overview' || tab === 'exams') {
        const res = await fetch('/api/exams?all=true', { headers: authHeaders() })
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
      if (tab === 'overview' || tab === 'blogs') {
        const res = await fetch('/api/content/blogs?all=true')
        if (res.ok) {
          const data = await res.json()
          setBlogsList(data.blogs || [])
        }
      }
      if (tab === 'overview' || tab === 'faculty') {
        const res = await fetch('/api/content/faculty')
        if (res.ok) {
          const data = await res.json()
          setFacultyList(data.faculty || [])
        }
      }
      if (tab === 'overview' || tab === 'facilities') {
        const res = await fetch('/api/content/facilities')
        if (res.ok) {
          const data = await res.json()
          setFacilitiesList(data.facilities || [])
        }
      }
      if (tab === 'overview' || tab === 'achievements') {
        const res = await fetch('/api/content/achievements')
        if (res.ok) {
          const data = await res.json()
          setAchievementsList(data.achievements || [])
        }
      }
      if (tab === 'overview' || tab === 'testimonials') {
        const res = await fetch('/api/content/testimonials?all=true')
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
      if (tab === 'overview' || tab === 'videos') {
        const res = await fetch('/api/content/videos?all=true')
        if (res.ok) {
          const data = await res.json()
          setVideosList(data.videos || [])
        }
      }
    } catch (e: any) {
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
      if (res.error) throw res.error

      const userStr = localStorage.getItem('ss_user')
      if (userStr) {
        const u = JSON.parse(userStr)
        if (u.role !== 'admin' && u.role !== 'moderator') {
          await signOut()
          throw new Error('Access Denied: The account entered is not an administrator.')
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

  // ==========================================
  // 1. ADMISSIONS HANDLERS
  // ==========================================
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
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update admission')

      showNotice(`Admission application ${status} successfully!`)
      setRejectingAdmission(null)
      setRejectionReason('')
      if (selectedAdmission?.id === id) {
        setSelectedAdmission(data.admission)
      }
      loadTabData('admissions')
    } catch (e: any) {
      showNotice(e.message, 'error')
    }
  }

  const handleDeleteAdmission = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this admission application?')) return
    try {
      const res = await fetch(`/api/admissions/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete application')
      showNotice('Admission application deleted')
      if (selectedAdmission?.id === id) setSelectedAdmission(null)
      loadTabData('admissions')
    } catch (e: any) {
      showNotice(e.message, 'error')
    }
  }

  // ==========================================
  // 2. USERS HANDLERS
  // ==========================================
  const handleOpenCreateUser = () => {
    setEditingUser(null)
    setUserFormData({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'teacher',
      is_active: 1,
    })
    setUserModalOpen(true)
  }

  const handleOpenEditUser = (userItem: any) => {
    setEditingUser(userItem)
    setUserFormData({
      full_name: userItem.full_name || '',
      email: userItem.email || '',
      password: '',
      phone: userItem.phone || '',
      role: userItem.role || 'student',
      is_active: userItem.is_active !== 0 ? 1 : 0,
    })
    setUserModalOpen(true)
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        const payload: any = {
          full_name: userFormData.full_name,
          phone: userFormData.phone,
          role: userFormData.role,
          is_active: userFormData.is_active,
        }
        if (userFormData.password.trim()) {
          payload.password = userFormData.password
        }
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update user')
        showNotice(`User ${userFormData.full_name} updated successfully!`)
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(userFormData),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create user')
        showNotice(`User ${userFormData.full_name} created successfully!`)
      }
      setUserModalOpen(false)
      loadTabData('users')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleToggleUserActive = async (userItem: any) => {
    const nextActive = userItem.is_active ? 0 : 1
    try {
      const res = await fetch(`/api/users/${userItem.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ is_active: nextActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update user status')
      showNotice(`User ${userItem.full_name} status updated!`)
      loadTabData('users')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteUser = async (userItem: any) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userItem.full_name}"?`)) return
    try {
      const res = await fetch(`/api/users/${userItem.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete user')
      showNotice('User deleted successfully')
      loadTabData('users')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 3. COURSES HANDLERS
  // ==========================================
  const handleOpenCreateCourse = () => {
    setEditingCourse(null)
    setCourseFormData({
      title: '',
      slug: '',
      board: 'SSC',
      target_class: 'Class 10',
      subjects: '',
      description: '',
      syllabus: '',
      duration: '',
      fee: '',
      batch_info: '',
      faculty_name: '',
      category: 'Class 10',
      image_url: '',
      display_order: 0,
      is_active: 1,
    })
    setCourseModalOpen(true)
  }

  const handleOpenEditCourse = (course: any) => {
    setEditingCourse(course)
    setCourseFormData({
      title: course.title || '',
      slug: course.slug || '',
      board: course.board || 'SSC',
      target_class: course.target_class || 'Class 10',
      subjects: course.subjects || '',
      description: course.description || '',
      syllabus: course.syllabus || '',
      duration: course.duration || '',
      fee: course.fee || '',
      batch_info: course.batch_info || '',
      faculty_name: course.faculty_name || '',
      category: course.category || course.target_class || 'Class 10',
      image_url: course.image_url || '',
      display_order: course.display_order || 0,
      is_active: course.is_active !== 0 ? 1 : 0,
    })
    setCourseModalOpen(true)
  }

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!courseFormData.title.trim()) {
        showNotice('Course title is required', 'error')
        return
      }
      const isEdit = !!editingCourse
      const url = isEdit ? `/api/courses/${editingCourse.id}` : '/api/courses'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(courseFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save course')

      showNotice(isEdit ? 'Course updated successfully!' : 'Course created successfully!')
      setCourseModalOpen(false)
      loadTabData('courses')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteCourse = async (course: any) => {
    if (!window.confirm(`Are you sure you want to delete course "${course.title}"?`)) return
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete course')
      showNotice('Course deleted successfully')
      loadTabData('courses')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 4. SUBJECTS HANDLERS (Real Persistent CRUD)
  // ==========================================
  const handleOpenCreateSubject = () => {
    setEditingSubject(null)
    setSubjectFormData({
      name: '',
      code: '',
      board: 'SSC',
      target_class: 'Class 10',
      description: '',
      display_order: 0,
      is_active: 1,
    })
    setSubjectModalOpen(true)
  }

  const handleOpenEditSubject = (subject: any) => {
    setEditingSubject(subject)
    setSubjectFormData({
      name: subject.name || '',
      code: subject.code || '',
      board: subject.board || 'SSC',
      target_class: subject.target_class || 'Class 10',
      description: subject.description || '',
      display_order: subject.display_order || 0,
      is_active: subject.is_active !== 0 ? 1 : 0,
    })
    setSubjectModalOpen(true)
  }

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!subjectFormData.name.trim()) {
        showNotice('Subject name is required', 'error')
        return
      }
      const isEdit = !!editingSubject
      const url = isEdit ? `/api/subjects/${editingSubject.id}` : '/api/subjects'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(subjectFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save subject')

      showNotice(isEdit ? 'Subject updated successfully!' : 'Subject added successfully!')
      setSubjectModalOpen(false)
      loadTabData('subjects')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteSubject = async (subject: any) => {
    if (!window.confirm(`Are you sure you want to delete subject "${subject.name}"?`)) return
    try {
      const res = await fetch(`/api/subjects/${subject.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete subject')
      showNotice('Subject deleted successfully')
      loadTabData('subjects')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 5. BATCHES HANDLERS
  // ==========================================
  const handleOpenCreateBatch = () => {
    setEditingBatch(null)
    setBatchFormData({
      course_id: coursesList[0]?.id || '',
      name: '',
      schedule: '',
      start_date: '',
      end_date: '',
      capacity: 30,
      teacher_id: '',
      is_active: 1,
    })
    setBatchModalOpen(true)
  }

  const handleOpenEditBatch = (batch: any) => {
    setEditingBatch(batch)
    setBatchFormData({
      course_id: batch.course_id || '',
      name: batch.name || '',
      schedule: batch.schedule || '',
      start_date: batch.start_date || '',
      end_date: batch.end_date || '',
      capacity: batch.capacity || 30,
      teacher_id: batch.teacher_id || '',
      is_active: batch.is_active !== 0 ? 1 : 0,
    })
    setBatchModalOpen(true)
  }

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!batchFormData.name.trim() || !batchFormData.course_id) {
        showNotice('Batch name and course are required', 'error')
        return
      }
      const isEdit = !!editingBatch
      const url = isEdit ? `/api/batches/${editingBatch.id}` : '/api/batches'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(batchFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save batch')

      showNotice(isEdit ? 'Batch updated successfully!' : 'Batch created successfully!')
      setBatchModalOpen(false)
      loadTabData('batches')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteBatch = async (batch: any) => {
    if (!window.confirm(`Are you sure you want to delete batch "${batch.name}"?`)) return
    try {
      const res = await fetch(`/api/batches/${batch.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete batch')
      showNotice('Batch deleted successfully')
      loadTabData('batches')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleOpenBatchStudents = async (batch: any) => {
    setSelectedBatchDetails(batch)
    setEnrollStudentId('')
    try {
      const res = await fetch(`/api/batches/${batch.id}`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setBatchStudentsList(data.students || [])
      }
    } catch (e) {
      console.error(e)
    }
    setBatchStudentsModalOpen(true)
  }

  const handleEnrollStudent = async () => {
    if (!enrollStudentId || !selectedBatchDetails) return
    try {
      const res = await fetch(`/api/batches/${selectedBatchDetails.id}/enroll`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ student_id: enrollStudentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to enroll student')
      showNotice('Student enrolled successfully!')
      setEnrollStudentId('')
      handleOpenBatchStudents(selectedBatchDetails)
      loadTabData('batches')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleRemoveStudentFromBatch = async (studentId: string) => {
    if (!selectedBatchDetails) return
    if (!window.confirm('Remove this student from the batch?')) return
    try {
      const res = await fetch(`/api/batches/${selectedBatchDetails.id}/enroll/${studentId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to remove student')
      showNotice('Student removed from batch')
      handleOpenBatchStudents(selectedBatchDetails)
      loadTabData('batches')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 6. FEES HANDLERS
  // ==========================================
  const handleOpenCreateFee = () => {
    setEditingFee(null)
    setFeeFormData({
      student_id: profilesList.find((p) => p.role === 'student')?.id || '',
      batch_id: batchesList[0]?.id || '',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      remarks: '',
    })
    setFeeModalOpen(true)
  }

  const handleOpenEditFee = (fee: any) => {
    setEditingFee(fee)
    setFeeFormData({
      student_id: fee.student_id || '',
      batch_id: fee.batch_id || '',
      amount: String(fee.amount || ''),
      due_date: fee.due_date || '',
      remarks: fee.remarks || '',
    })
    setFeeModalOpen(true)
  }

  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!feeFormData.student_id || !feeFormData.amount || !feeFormData.due_date) {
        showNotice('Student, amount, and due date are required', 'error')
        return
      }
      const isEdit = !!editingFee
      const url = isEdit ? `/api/fees/${editingFee.id}` : '/api/fees'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(feeFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save fee invoice')

      showNotice(isEdit ? 'Fee invoice updated!' : 'Fee invoice issued successfully!')
      setFeeModalOpen(false)
      loadTabData('fees')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteFee = async (fee: any) => {
    if (!window.confirm(`Are you sure you want to delete this fee record for "${fee.student_name}"?`)) return
    try {
      const res = await fetch(`/api/fees/${fee.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete fee record')
      showNotice('Fee record deleted')
      loadTabData('fees')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleRecordPayment = async (feeId: string) => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      showNotice('Please enter a valid payment amount', 'error')
      return
    }
    try {
      const res = await fetch(`/api/fees/${feeId}/payment`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount: Number(paymentAmount), method: paymentMethod }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to record payment')

      showNotice(`Payment recorded! Receipt: ${data.receipt_no}`)
      setRecordPaymentFeeId(null)
      setPaymentAmount('')
      loadTabData('fees')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 7. EXAMS & MARKS HANDLERS
  // ==========================================
  const handleOpenCreateExam = () => {
    setEditingExam(null)
    setExamFormData({
      batch_id: batchesList[0]?.id || '',
      title: '',
      subject_id: subjectsList[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      total_marks: 100,
      passing_marks: 35,
    })
    setExamModalOpen(true)
  }

  const handleOpenEditExam = (exam: any) => {
    setEditingExam(exam)
    setExamFormData({
      batch_id: exam.batch_id || '',
      title: exam.title || '',
      subject_id: exam.subject_id || '',
      date: exam.date || '',
      total_marks: exam.total_marks || 100,
      passing_marks: exam.passing_marks || 35,
    })
    setExamModalOpen(true)
  }

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!examFormData.title.trim() || !examFormData.batch_id || !examFormData.date) {
        showNotice('Title, batch, and date are required', 'error')
        return
      }
      const isEdit = !!editingExam
      const url = isEdit ? `/api/exams/${editingExam.id}` : '/api/exams'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(examFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save exam')

      showNotice(isEdit ? 'Exam updated successfully!' : 'Exam scheduled successfully!')
      setExamModalOpen(false)
      loadTabData('exams')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteExam = async (exam: any) => {
    if (!window.confirm(`Are you sure you want to delete exam "${exam.title}"?`)) return
    try {
      const res = await fetch(`/api/exams/${exam.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete exam')
      showNotice('Exam deleted successfully')
      loadTabData('exams')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handlePublishExam = async (examId: string) => {
    try {
      const res = await fetch(`/api/exams/${examId}/publish`, {
        method: 'PATCH',
        headers: authHeaders(),
      })
      if (res.ok) {
        showNotice('Exam and student marks published to student/parent portals!')
        loadTabData('exams')
      }
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleOpenMarksModal = async (exam: any) => {
    setSelectedExamForMarks(exam)
    setMarksStudentRows([])
    setMarksModalOpen(true)
    try {
      const res = await fetch(`/api/exams/${exam.id}/results`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        const rows = (data.students || []).map((s: any) => ({
          student_id: s.student_id,
          student_name: s.student_name,
          student_email: s.student_email,
          marks_obtained: s.marks_obtained !== null && s.marks_obtained !== undefined ? s.marks_obtained : '',
          remarks: s.remarks || '',
        }))
        setMarksStudentRows(rows)
      }
    } catch (e: any) {
      showNotice('Error loading student marks: ' + e.message, 'error')
    }
  }

  const handleSaveMarks = async (publish: boolean = false) => {
    if (!selectedExamForMarks) return
    setSavingMarks(true)
    try {
      // Validate marks
      for (const row of marksStudentRows) {
        if (row.marks_obtained !== '' && !isNaN(Number(row.marks_obtained))) {
          const val = Number(row.marks_obtained)
          if (val < 0 || val > selectedExamForMarks.total_marks) {
            throw new Error(`Marks for ${row.student_name} must be between 0 and ${selectedExamForMarks.total_marks}`)
          }
        }
      }

      const results = marksStudentRows
        .filter((r) => r.marks_obtained !== '' && !isNaN(Number(r.marks_obtained)))
        .map((r) => ({
          student_id: r.student_id,
          marks_obtained: Number(r.marks_obtained),
          remarks: r.remarks,
        }))

      const res = await fetch(`/api/exams/${selectedExamForMarks.id}/results`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ results, publish }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save marks')

      showNotice(publish ? 'Marks saved and published!' : 'Marks saved as draft!')
      setMarksModalOpen(false)
      loadTabData('exams')
    } catch (err: any) {
      showNotice(err.message, 'error')
    } finally {
      setSavingMarks(false)
    }
  }

  // ==========================================
  // 8. GALLERY HANDLERS
  // ==========================================
  const uploadSingleGalleryFile = async (file: File) => {
    const uploadRes = await uploadOptimizedImage(file, 'gallery')
    await fetch('/api/gallery', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        title: file.name.replace(/\.[^/.]+$/, '').replace(/^cropped_/, ''),
        caption: batchCaption || '',
        alt_text: file.name,
        image_url: uploadRes.imageUrl,
        webp_url: uploadRes.webpUrl,
        thumbnail_url: uploadRes.thumbnailUrl,
        placement: batchPlacement,
        is_published: 1,
      }),
    })
  }

  const handleBulkGalleryUpload = (files: FileList) => {
    const arr = Array.from(files)
    cropQueueRef.current = arr
    setCropUploadedCount(0)
    setCropQueue([...arr])
    if (arr.length > 0) {
      const url = URL.createObjectURL(arr[0])
      setCropCurrentSrc(url)
    }
  }

  const handleCropConfirm = async (_blob: Blob, croppedFile: File) => {
    setIsUploadingGallery(true)
    try {
      await uploadSingleGalleryFile(croppedFile)
      setCropUploadedCount((c) => c + 1)
    } catch (err) {
      console.error('Upload failed:', err)
    }
    advanceCropQueue()
  }

  const handleCropSkip = async () => {
    const current = cropQueueRef.current[0]
    if (current) {
      setIsUploadingGallery(true)
      try {
        await uploadSingleGalleryFile(current)
        setCropUploadedCount((c) => c + 1)
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }
    advanceCropQueue()
  }

  const advanceCropQueue = () => {
    if (cropCurrentSrc) URL.revokeObjectURL(cropCurrentSrc)
    cropQueueRef.current = cropQueueRef.current.slice(1)
    if (cropQueueRef.current.length > 0) {
      const nextUrl = URL.createObjectURL(cropQueueRef.current[0])
      setCropCurrentSrc(nextUrl)
      setCropQueue([...cropQueueRef.current])
    } else {
      setCropCurrentSrc('')
      setCropQueue([])
      setIsUploadingGallery(false)
      showNotice(`${cropUploadedCount + 1} image(s) uploaded successfully!`)
      loadTabData('gallery')
    }
  }

  const handleSaveGalleryEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGalleryItem) return
    try {
      const res = await fetch(`/api/gallery/${editingGalleryItem.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          title: editingGalleryItem.title,
          caption: editingGalleryItem.caption,
          alt_text: editingGalleryItem.alt_text,
          placement: editingGalleryItem.placement,
          is_published: editingGalleryItem.is_published,
        }),
      })
      if (!res.ok) throw new Error('Failed to update gallery item')
      showNotice('Gallery item updated!')
      setEditingGalleryItem(null)
      loadTabData('gallery')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Delete this photo?')) return
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (res.ok) {
        showNotice('Photo deleted successfully')
        loadTabData('gallery')
      }
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 9. BLOG POSTS HANDLERS
  // ==========================================
  const handleOpenCreateBlog = () => {
    setEditingBlog(null)
    setBlogFormData({
      title: '',
      slug: '',
      author: 'Ankit Gupta',
      excerpt: '',
      content: '',
      cover_url: '',
      is_published: 1,
    })
    setBlogModalOpen(true)
  }

  const handleOpenEditBlog = (blog: any) => {
    setEditingBlog(blog)
    setBlogFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      author: blog.author || 'Ankit Gupta',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      cover_url: blog.cover_url || '',
      is_published: blog.is_published !== 0 ? 1 : 0,
    })
    setBlogModalOpen(true)
  }

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!blogFormData.title.trim() || !blogFormData.content.trim()) {
        showNotice('Blog title and content are required', 'error')
        return
      }
      const isEdit = !!editingBlog
      const url = isEdit ? `/api/content/blogs/${editingBlog.id}` : '/api/content/blogs'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(blogFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save blog post')

      showNotice(isEdit ? 'Article updated successfully!' : 'Article published successfully!')
      setBlogModalOpen(false)
      loadTabData('blogs')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return
    try {
      const res = await fetch(`/api/content/blogs/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete blog')
      showNotice('Article removed')
      loadTabData('blogs')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 10. FACULTY HANDLERS
  // ==========================================
  const handleOpenCreateFaculty = () => {
    setEditingFaculty(null)
    setFacultyFormData({
      name: '',
      designation: '',
      subjects: '',
      bio: '',
      photo_url: '',
      display_order: 0,
    })
    setFacultyModalOpen(true)
  }

  const handleOpenEditFaculty = (fac: any) => {
    setEditingFaculty(fac)
    setFacultyFormData({
      name: fac.name || '',
      designation: fac.designation || '',
      subjects: fac.subjects || '',
      bio: fac.bio || '',
      photo_url: fac.photo_url || '',
      display_order: fac.display_order || 0,
    })
    setFacultyModalOpen(true)
  }

  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!facultyFormData.name.trim()) {
        showNotice('Faculty name is required', 'error')
        return
      }
      const isEdit = !!editingFaculty
      const url = isEdit ? `/api/content/faculty/${editingFaculty.id}` : '/api/content/faculty'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(facultyFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save faculty')

      showNotice(isEdit ? 'Faculty profile updated!' : 'Faculty profile added!')
      setFacultyModalOpen(false)
      loadTabData('faculty')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteFaculty = async (id: string) => {
    if (!window.confirm('Remove this faculty member?')) return
    try {
      const res = await fetch(`/api/content/faculty/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete faculty')
      showNotice('Faculty removed')
      loadTabData('faculty')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 11. FACILITIES HANDLERS
  // ==========================================
  const handleOpenCreateFacility = () => {
    setEditingFacility(null)
    setFacilityFormData({
      title: '',
      description: '',
      icon: 'BookOpen',
      image_url: '',
      display_order: 0,
    })
    setFacilityModalOpen(true)
  }

  const handleOpenEditFacility = (f: any) => {
    setEditingFacility(f)
    setFacilityFormData({
      title: f.title || '',
      description: f.description || '',
      icon: f.icon || 'BookOpen',
      image_url: f.image_url || '',
      display_order: f.display_order || 0,
    })
    setFacilityModalOpen(true)
  }

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!facilityFormData.title.trim()) {
        showNotice('Facility title is required', 'error')
        return
      }
      const isEdit = !!editingFacility
      const url = isEdit ? `/api/content/facilities/${editingFacility.id}` : '/api/content/facilities'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(facilityFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save facility')

      showNotice(isEdit ? 'Facility updated!' : 'Facility added!')
      setFacilityModalOpen(false)
      loadTabData('facilities')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteFacility = async (id: string) => {
    if (!window.confirm('Delete this facility?')) return
    try {
      const res = await fetch(`/api/content/facilities/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete facility')
      showNotice('Facility removed')
      loadTabData('facilities')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 12. ACHIEVEMENTS HANDLERS
  // ==========================================
  const handleOpenCreateAchievement = () => {
    setEditingAchievement(null)
    setAchievementFormData({
      title: '',
      description: '',
      date: new Date().getFullYear().toString() + ' Batch',
      category: 'Topper',
      image_url: '',
      display_order: 0,
    })
    setAchievementModalOpen(true)
  }

  const handleOpenEditAchievement = (a: any) => {
    setEditingAchievement(a)
    setAchievementFormData({
      title: a.title || '',
      description: a.description || '',
      date: a.date || '',
      category: a.category || '',
      image_url: a.image_url || '',
      display_order: a.display_order || 0,
    })
    setAchievementModalOpen(true)
  }

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!achievementFormData.title.trim()) {
        showNotice('Achievement title is required', 'error')
        return
      }
      const isEdit = !!editingAchievement
      const url = isEdit ? `/api/content/achievements/${editingAchievement.id}` : '/api/content/achievements'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(achievementFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save achievement')

      showNotice(isEdit ? 'Achievement updated!' : 'Achievement added!')
      setAchievementModalOpen(false)
      loadTabData('achievements')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteAchievement = async (id: string) => {
    if (!window.confirm('Delete this achievement?')) return
    try {
      const res = await fetch(`/api/content/achievements/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete achievement')
      showNotice('Achievement removed')
      loadTabData('achievements')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 13. TESTIMONIALS HANDLERS
  // ==========================================
  const handleOpenCreateTestimonial = () => {
    setEditingTestimonial(null)
    setTestimonialFormData({
      student_name: '',
      course: '',
      text: '',
      rating: 5,
      photo_url: '',
      is_published: 1,
    })
    setTestimonialModalOpen(true)
  }

  const handleOpenEditTestimonial = (t: any) => {
    setEditingTestimonial(t)
    setTestimonialFormData({
      student_name: t.student_name || '',
      course: t.course || '',
      text: t.text || '',
      rating: t.rating || 5,
      photo_url: t.photo_url || '',
      is_published: t.is_published !== 0 ? 1 : 0,
    })
    setTestimonialModalOpen(true)
  }

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!testimonialFormData.student_name.trim() || !testimonialFormData.text.trim()) {
        showNotice('Student name and testimonial text are required', 'error')
        return
      }
      const isEdit = !!editingTestimonial
      const url = isEdit ? `/api/content/testimonials/${editingTestimonial.id}` : '/api/content/testimonials'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(testimonialFormData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save testimonial')

      showNotice(isEdit ? 'Testimonial updated!' : 'Testimonial added!')
      setTestimonialModalOpen(false)
      loadTabData('testimonials')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return
    try {
      const res = await fetch(`/api/content/testimonials/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete testimonial')
      showNotice('Testimonial removed')
      loadTabData('testimonials')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 14. VIDEOS HANDLERS
  // ==========================================
  const handleOpenCreateVideo = () => {
    setEditingVideo(null)
    setVideoFormData({
      title: '',
      description: '',
      url: '',
      platform: 'youtube',
      startTime: '',
      endTime: '',
      display_order: 0,
      is_active: 1,
    })
    setVideoModalOpen(true)
  }

  const handleOpenEditVideo = (v: any) => {
    setEditingVideo(v)
    setVideoFormData({
      title: v.title || '',
      description: v.description || '',
      url: v.url || '',
      platform: v.platform || 'youtube',
      startTime: '',
      endTime: '',
      display_order: v.display_order || 0,
      is_active: v.is_active !== 0 ? 1 : 0,
    })
    setVideoModalOpen(true)
  }

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!videoFormData.title.trim() || !videoFormData.url.trim()) {
        showNotice('Video title and URL are required', 'error')
        return
      }

      let embed = videoFormData.url.trim()
      if (embed.includes('youtube.com/watch?v=')) {
        embed = embed.replace('watch?v=', 'embed/')
      } else if (embed.includes('youtu.be/')) {
        const vid = embed.split('youtu.be/')[1]?.split('?')[0]
        embed = `https://www.youtube.com/embed/${vid}`
      }

      if (videoFormData.platform === 'youtube') {
        const params: string[] = []
        if (videoFormData.startTime) params.push(`start=${parseInt(videoFormData.startTime)}`)
        if (videoFormData.endTime) params.push(`end=${parseInt(videoFormData.endTime)}`)
        if (params.length > 0) embed += (embed.includes('?') ? '&' : '?') + params.join('&')
      }

      const isEdit = !!editingVideo
      const url = isEdit ? `/api/content/videos/${editingVideo.id}` : '/api/content/videos'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({
          title: videoFormData.title,
          description: videoFormData.description,
          url: videoFormData.url,
          embed_url: embed,
          platform: videoFormData.platform,
          display_order: videoFormData.display_order,
          is_active: videoFormData.is_active,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save video')

      showNotice(isEdit ? 'Video updated successfully!' : 'Video added successfully!')
      setVideoModalOpen(false)
      loadTabData('videos')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm('Delete this video?')) return
    try {
      const res = await fetch(`/api/content/videos/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete video')
      showNotice('Video removed')
      loadTabData('videos')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  // ==========================================
  // 15. MESSAGES HANDLERS
  // ==========================================
  const handleToggleReadMessage = async (msg: any) => {
    try {
      const nextRead = msg.is_read ? 0 : 1
      const res = await fetch(`/api/content/messages/${msg.id}/read`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ is_read: nextRead }),
      })
      if (!res.ok) throw new Error('Failed to update message status')
      showNotice(nextRead ? 'Marked as read' : 'Marked as unread')
      loadTabData('messages')
    } catch (err: any) {
      showNotice(err.message, 'error')
    }
  }

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message?')) return
    try {
      const res = await fetch(`/api/content/messages/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete message')
      showNotice('Message removed')
      loadTabData('messages')
    } catch (err: any) {
      showNotice(err.message, 'error')
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
                <span>
                  Logged in as: {user.email} ({role})
                </span>
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
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-emerald-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
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
  const stats = dashboardStats?.stats || {}

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-emerald-950 text-white flex flex-col shrink-0 border-r border-emerald-900">
        <div className="p-6 border-b border-emerald-900 flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white">SS Tutorial</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                Admin Control
              </span>
            </div>
            {dbStatus && (
              <div
                className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  dbStatus.supabaseOnline
                    ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700/60'
                    : 'bg-emerald-900/60 text-amber-300 border border-emerald-800/50'
                }`}
                title={dbStatus.supabaseOnline ? `Connected to Supabase (${dbStatus.url})` : 'Running on local SQLite database'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    dbStatus.supabaseOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{dbStatus.supabaseOnline ? 'Supabase Online' : 'Local SQLite Active'}</span>
              </div>
            )}
          </div>
          <a
            href="/"
            className="text-xs text-emerald-300 hover:text-white flex items-center gap-1"
            title="View Site"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <nav className="p-3 md:p-4 flex md:flex-col gap-1.5 md:gap-0 md:space-y-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto shrink-0 text-xs no-scrollbar">
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
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:px-3.5 md:py-2.5 rounded-xl font-semibold transition cursor-pointer whitespace-nowrap shrink-0 md:shrink md:w-full ${
                  active
                    ? 'bg-amber-400 text-emerald-950 shadow-md font-bold'
                    : 'text-emerald-100 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.id === 'admissions' && admissions.filter((a) => a.status === 'pending').length > 0 && (
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                      active ? 'bg-emerald-950 text-amber-300' : 'bg-amber-400 text-emerald-950'
                    }`}
                  >
                    {admissions.filter((a) => a.status === 'pending').length}
                  </span>
                )}
                {item.id === 'messages' && messagesList.filter((m) => !m.is_read).length > 0 && (
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                      active ? 'bg-red-700 text-white' : 'bg-rose-500 text-white animate-pulse'
                    }`}
                  >
                    {messagesList.filter((m) => !m.is_read).length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-emerald-900">
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-red-200 bg-red-950/50 hover:bg-red-900 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out (Admin)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Flash Notice */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in fade-in ${
              notificationType === 'error' ? 'bg-red-700' : 'bg-emerald-700'
            }`}
          >
            {notificationType === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span>{notification}</span>
          </div>
        )}

        {/* =========================================================================
            1. OVERVIEW TAB
        ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Admin Command Center</h2>
              <p className="text-xs text-slate-500 mt-1">
                Real-time institute metrics, admission pipeline, and public website controls.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                onClick={() => setActiveTab('admissions')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition cursor-pointer"
              >
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Admissions</p>
                <p className="text-3xl font-black text-amber-500 mt-2">
                  {stats.pendingAdmissions ?? admissions.filter((a) => a.status === 'pending').length}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Click to review applications &rarr;</p>
              </div>

              <div
                onClick={() => setActiveTab('users')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition cursor-pointer"
              >
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registered Users</p>
                <p className="text-3xl font-black text-blue-600 mt-2">{stats.totalUsers ?? profilesList.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Students: {stats.totalStudents || 0} | Teachers: {stats.totalTeachers || 0}
                </p>
              </div>

              <div
                onClick={() => setActiveTab('courses')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 transition cursor-pointer"
              >
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Courses</p>
                <p className="text-3xl font-black text-emerald-700 mt-2">{stats.totalCourses ?? coursesList.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">Batches: {stats.totalBatches ?? batchesList.length}</p>
              </div>

              <div
                onClick={() => setActiveTab('fees')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 transition cursor-pointer"
              >
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fees & Dues</p>
                <p className="text-3xl font-black text-emerald-600 mt-2">
                  ₹{Number(stats.collectedFees || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  Pending: {stats.pendingFees || 0} invoice(s)
                </p>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wider">Quick Management Shortcuts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('admissions')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 text-left hover:border-amber-400 transition shadow-sm cursor-pointer"
                >
                  <FileCheck className="w-5 h-5 text-amber-500 mb-1.5" />
                  <h4 className="font-bold text-xs text-slate-900">Review Admissions</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Approve/Reject</p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('courses')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 text-left hover:border-emerald-500 transition shadow-sm cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 text-emerald-600 mb-1.5" />
                  <h4 className="font-bold text-xs text-slate-900">Course Manager</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Add / Edit Courses</p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('exams')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 text-left hover:border-indigo-500 transition shadow-sm cursor-pointer"
                >
                  <Award className="w-5 h-5 text-indigo-600 mb-1.5" />
                  <h4 className="font-bold text-xs text-slate-900">Exams & Marks</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Enter Test Scores</p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gallery')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 text-left hover:border-pink-500 transition shadow-sm cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5 text-pink-600 mb-1.5" />
                  <h4 className="font-bold text-xs text-slate-900">Gallery Photos</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Upload WebP Images</p>
                </button>
              </div>
            </div>

            {/* Recent Admissions Preview */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Recent Applications</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('admissions')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  View All ({admissions.length}) &rarr;
                </button>
              </div>
              {admissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Course / Class</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {admissions.slice(0, 5).map((adm) => (
                        <tr key={adm.id}>
                          <td className="p-3 font-bold text-slate-900">{adm.student_name}</td>
                          <td className="p-3">{adm.course_title || adm.target_class || 'Class 10'}</td>
                          <td className="p-3 text-slate-500">{adm.phone}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
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
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAdmission(adm)
                                setActiveTab('admissions')
                              }}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[11px] text-slate-700"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No admission applications received yet.</p>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            2. ADMISSIONS TAB
        ========================================================================= */}
        {activeTab === 'admissions' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Admission Applications</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect student details, review documents, and approve or reject submissions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAdmissionFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer ${
                      admissionFilter === st
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {admissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Parent</th>
                      <th className="p-3">Course / Batch</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Applied</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admissions
                      .filter((a) => admissionFilter === 'all' || a.status === admissionFilter)
                      .map((adm) => (
                        <tr key={adm.id}>
                          <td className="p-3 font-bold text-slate-900">{adm.student_name}</td>
                          <td className="p-3 text-slate-500">{adm.parent_name || '-'}</td>
                          <td className="p-3 text-slate-700">
                            <p className="font-semibold">{adm.course_title || adm.target_class}</p>
                            {adm.batch_name && <p className="text-[11px] text-slate-400">{adm.batch_name}</p>}
                          </td>
                          <td className="p-3 text-slate-500">
                            <p>{adm.phone}</p>
                            <p className="text-[11px] text-slate-400">{adm.email}</p>
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">
                            {adm.applied_at ? new Date(adm.applied_at).toLocaleDateString() : '-'}
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
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedAdmission(adm)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-[11px] text-slate-800 cursor-pointer flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              {adm.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleReviewAdmission(adm.id, 'approved')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectingAdmission(adm)}
                                    className="px-2.5 py-1 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-[11px] cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteAdmission(adm.id)}
                                className="p-1 text-slate-400 hover:text-red-600 transition"
                                title="Delete application"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No admission applications found.</p>
            )}

            {/* Complete Admission Details Modal */}
            {selectedAdmission && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">Application Details</h3>
                      <p className="text-xs text-slate-400">ID: {selectedAdmission.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAdmission(null)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="font-bold text-slate-400 block">Student Name</span>
                        <span className="font-bold text-slate-900 text-sm">{selectedAdmission.student_name}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block">Parent / Guardian</span>
                        <span className="text-slate-800">{selectedAdmission.parent_name || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block">Phone Number</span>
                        <span className="text-slate-800">{selectedAdmission.phone}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block">Email Address</span>
                        <span className="text-slate-800">{selectedAdmission.email}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block">Class & Board</span>
                        <span className="text-slate-800">
                          {selectedAdmission.target_class || 'Class 10'} ({selectedAdmission.board || 'SSC'})
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block">Course Selected</span>
                        <span className="text-slate-800">{selectedAdmission.course_title || 'General'}</span>
                      </div>
                    </div>

                    {selectedAdmission.address && (
                      <div>
                        <span className="font-bold text-slate-400 block">Residential Address</span>
                        <span className="text-slate-800">{selectedAdmission.address}</span>
                      </div>
                    )}

                    {selectedAdmission.previous_marks && (
                      <div>
                        <span className="font-bold text-slate-400 block">Previous Academic Marks</span>
                        <span className="text-slate-800">{selectedAdmission.previous_marks}</span>
                      </div>
                    )}

                    <div>
                      <span className="font-bold text-slate-400 block">Current Status</span>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full font-bold uppercase text-[11px] ${
                          selectedAdmission.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedAdmission.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedAdmission.status}
                      </span>
                    </div>

                    {selectedAdmission.rejection_reason && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                        <span className="font-bold block mb-1">Rejection Reason:</span>
                        <span>{selectedAdmission.rejection_reason}</span>
                      </div>
                    )}

                    {selectedAdmission.reviewer_name && (
                      <p className="text-[11px] text-slate-400">
                        Reviewed by: <span className="font-semibold text-slate-600">{selectedAdmission.reviewer_name}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    {selectedAdmission.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReviewAdmission(selectedAdmission.id, 'approved')}
                          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Approve Application
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingAdmission(selectedAdmission)
                            setSelectedAdmission(null)
                          }}
                          className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs"
                        >
                          Reject Application
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedAdmission(null)}
                      className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Modal */}
            {rejectingAdmission && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-2xl max-w-md w-full border border-slate-200 shadow-xl space-y-4">
                  <h3 className="font-bold text-base text-slate-900">
                    Reject Admission Application for {rejectingAdmission.student_name}
                  </h3>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection (e.g. batch capacity reached, prerequisite not met)..."
                    className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingAdmission(null)
                        setRejectionReason('')
                      }}
                      className="px-4 py-2 rounded-xl text-xs bg-slate-200 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewAdmission(rejectingAdmission.id, 'rejected')}
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

        {/* =========================================================================
            3. USERS & ROLES TAB
        ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">User Accounts & Roles Management</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage student, teacher, parent, and administrator accounts. Protected against accidental lockout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateUser}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
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
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="teacher">Teachers</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {profilesList
                      .filter((u) => userRoleFilter === 'all' || u.role === userRoleFilter)
                      .filter(
                        (u) =>
                          !userSearch ||
                          u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.phone?.includes(userSearch)
                      )
                      .map((u) => (
                        <tr key={u.id}>
                          <td className="p-3 font-bold text-slate-900">{u.full_name || 'Unnamed'}</td>
                          <td className="p-3 text-slate-500">{u.email}</td>
                          <td className="p-3 text-slate-500">{u.phone || '-'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                                u.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800'
                                  : u.role === 'teacher'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.role === 'parent'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                u.is_active !== 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {u.is_active !== 0 ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleUserActive(u)}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-[11px] font-bold text-slate-700 cursor-pointer"
                              >
                                {u.is_active !== 0 ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create / Edit User Modal */}
            {userModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingUser ? 'Edit User Account' : 'Create New User Account'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setUserModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={userFormData.full_name}
                        onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Ramesh Kumar"
                      />
                    </div>

                    {!editingUser && (
                      <div>
                        <label className="font-bold text-slate-500 mb-1 block">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                          placeholder="user@sstutorial.com"
                        />
                      </div>
                    )}

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">
                        {editingUser ? 'New Password (leave blank to keep unchanged)' : 'Password *'}
                      </label>
                      <input
                        type="password"
                        required={!editingUser}
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="••••••••••••"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Phone Number</label>
                      <input
                        type="text"
                        value={userFormData.phone}
                        onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="7738820436"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Assigned Role</label>
                      <select
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher / Faculty</option>
                        <option value="parent">Parent</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    {editingUser && (
                      <div>
                        <label className="font-bold text-slate-500 mb-1 block">Account Status</label>
                        <select
                          value={userFormData.is_active}
                          onChange={(e) => setUserFormData({ ...userFormData, is_active: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                        >
                          <option value={1}>Active</option>
                          <option value={0}>Disabled</option>
                        </select>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setUserModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingUser ? 'Save Changes' : 'Create User'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            4. COURSES MANAGER TAB
        ========================================================================= */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Courses Manager</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage course curriculum, categories, fees, and published offerings shown on the public site.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateCourse}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Course
                </button>
              </div>

              {/* Courses List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Course</th>
                      <th className="p-3">Board</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Fee</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coursesList.map((course: any) => (
                      <tr key={course.id}>
                        <td className="p-3 font-bold text-slate-900">{course.title}</td>
                        <td className="p-3">{course.board}</td>
                        <td className="p-3">{course.target_class}</td>
                        <td className="p-3 font-bold text-emerald-600">{course.fee || '-'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              course.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {course.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCourse(course)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-[11px] text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCourse(course)}
                              className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                              title="Delete course"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Course Modal */}
            {courseModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingCourse ? 'Edit Course' : 'Create New Course'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCourseModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCourse} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Course Title *</label>
                      <input
                        type="text"
                        required
                        value={courseFormData.title}
                        onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Class 10 Math & Science Excellence"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Board *</label>
                      <select
                        value={courseFormData.board}
                        onChange={(e) => setCourseFormData({ ...courseFormData, board: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="SSC">SSC Board</option>
                        <option value="CBSE">CBSE Board</option>
                        <option value="Both">Both Boards</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Class / Category *</label>
                      <select
                        value={courseFormData.target_class}
                        onChange={(e) =>
                          setCourseFormData({
                            ...courseFormData,
                            target_class: e.target.value,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="Class 1">Class 1</option>
                        <option value="Class 2">Class 2</option>
                        <option value="Class 3">Class 3</option>
                        <option value="Class 4">Class 4</option>
                        <option value="Class 5">Class 5</option>
                        <option value="Class 6">Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 1">Class 1</option>
                        <option value="Class 2">Class 2</option>
                        <option value="Class 3">Class 3</option>
                        <option value="Class 4">Class 4</option>
                        <option value="Class 5">Class 5</option>
                        <option value="Class 6">Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                        <option value="School Classes">School Classes (Primary/Middle)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subjects Included</label>
                      <input
                        type="text"
                        value={courseFormData.subjects}
                        onChange={(e) => setCourseFormData({ ...courseFormData, subjects: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="Mathematics, Science, English"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Fee Structure</label>
                      <input
                        type="text"
                        value={courseFormData.fee}
                        onChange={(e) => setCourseFormData({ ...courseFormData, fee: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. ₹2,500 / month"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Duration</label>
                      <input
                        type="text"
                        value={courseFormData.duration}
                        onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Full Year Academic"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Faculty Name</label>
                      <input
                        type="text"
                        value={courseFormData.faculty_name}
                        onChange={(e) => setCourseFormData({ ...courseFormData, faculty_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Ankit Gupta & Senior Faculty"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Publication Status</label>
                      <select
                        value={courseFormData.is_active}
                        onChange={(e) => setCourseFormData({ ...courseFormData, is_active: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value={1}>Published (Visible on site)</option>
                        <option value={0}>Draft / Hidden</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Course Image URL</label>
                      <input
                        type="text"
                        value={courseFormData.image_url}
                        onChange={(e) => setCourseFormData({ ...courseFormData, image_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="https://... or /uploads/..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Course Description</label>
                      <textarea
                        rows={3}
                        value={courseFormData.description}
                        onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setCourseModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingCourse ? 'Save Changes' : 'Create Course'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            5. SUBJECTS MANAGER TAB (Real Persistent CRUD)
        ========================================================================= */}
        {activeTab === 'subjects' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Subjects Manager</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage subjects, subject codes, target classes, and academic syllabus mapping.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateSubject}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Subject
                </button>
              </div>

              {/* Subjects Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Subject Name</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Board</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjectsList.map((subject: any) => (
                      <tr key={subject.id}>
                        <td className="p-3 font-bold text-slate-900">{subject.name}</td>
                        <td className="p-3 font-mono text-slate-400">{subject.code || '-'}</td>
                        <td className="p-3">{subject.board}</td>
                        <td className="p-3">{subject.target_class}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              subject.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {subject.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditSubject(subject)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-[11px] text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubject(subject)}
                              className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                              title="Delete subject"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subject Modal */}
            {subjectModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSubjectModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subject Name *</label>
                      <input
                        type="text"
                        required
                        value={subjectFormData.name}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Mathematics"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subject Code</label>
                      <input
                        type="text"
                        value={subjectFormData.code}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. MATH-10"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Board</label>
                      <select
                        value={subjectFormData.board}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, board: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="SSC">SSC Board</option>
                        <option value="CBSE">CBSE Board</option>
                        <option value="Both">Both Boards</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Class / Standard</label>
                      <select
                        value={subjectFormData.target_class}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, target_class: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="Class 1">Class 1</option>
                        <option value="Class 2">Class 2</option>
                        <option value="Class 3">Class 3</option>
                        <option value="Class 4">Class 4</option>
                        <option value="Class 5">Class 5</option>
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
                      <label className="font-bold text-slate-500 mb-1 block">Status</label>
                      <select
                        value={subjectFormData.is_active}
                        onChange={(e) => setSubjectFormData({ ...subjectFormData, is_active: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSubjectModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingSubject ? 'Save Changes' : 'Add Subject'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            6. BATCHES TAB
        ========================================================================= */}
        {activeTab === 'batches' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Batches & Enrolment</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage student batches, assigned teachers, class schedules, and enrollments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateBatch}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create New Batch
                </button>
              </div>

              {/* Batches Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Batch Name</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Teacher</th>
                      <th className="p-3">Schedule</th>
                      <th className="p-3">Enrolled</th>
                      <th className="p-3">Capacity</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchesList.map((b) => (
                      <tr key={b.id}>
                        <td className="p-3 font-bold text-slate-900">{b.name}</td>
                        <td className="p-3 text-slate-600">{b.course_title || '-'}</td>
                        <td className="p-3 text-slate-600">{b.teacher_name || 'Unassigned'}</td>
                        <td className="p-3 text-slate-500">{b.schedule || '-'}</td>
                        <td className="p-3 font-bold text-amber-500">{b.enrolled || 0}</td>
                        <td className="p-3">{b.capacity}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenBatchStudents(b)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Users className="w-3 h-3" /> Students
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditBatch(b)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBatch(b)}
                              className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                              title="Delete batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Batch Create/Edit Modal */}
            {batchModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingBatch ? 'Edit Batch' : 'Create New Batch'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setBatchModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveBatch} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Batch Name *</label>
                      <input
                        type="text"
                        required
                        value={batchFormData.name}
                        onChange={(e) => setBatchFormData({ ...batchFormData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Class 10 Morning Achievers"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Course *</label>
                      <select
                        required
                        value={batchFormData.course_id}
                        onChange={(e) => setBatchFormData({ ...batchFormData, course_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="">-- Choose Course --</option>
                        {coursesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Assigned Teacher</label>
                      <select
                        value={batchFormData.teacher_id}
                        onChange={(e) => setBatchFormData({ ...batchFormData, teacher_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="">-- None / Unassigned --</option>
                        {profilesList
                          .filter((p) => p.role === 'teacher' || p.role === 'admin')
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.full_name} ({t.role})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Schedule / Timings</label>
                      <input
                        type="text"
                        value={batchFormData.schedule}
                        onChange={(e) => setBatchFormData({ ...batchFormData, schedule: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="Mon-Fri, 7:00 AM - 9:00 AM"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Seat Capacity</label>
                      <input
                        type="number"
                        value={batchFormData.capacity}
                        onChange={(e) => setBatchFormData({ ...batchFormData, capacity: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setBatchModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingBatch ? 'Save Changes' : 'Create Batch'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Batch Students Enrollment Modal */}
            {batchStudentsModalOpen && selectedBatchDetails && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        Enrolled Students: {selectedBatchDetails.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {batchStudentsList.length} of {selectedBatchDetails.capacity} seats filled
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBatchStudentsModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Enroll new student input */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row gap-2 items-center">
                    <select
                      value={enrollStudentId}
                      onChange={(e) => setEnrollStudentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-xs"
                    >
                      <option value="">-- Select Student to Enroll --</option>
                      {profilesList
                        .filter((p) => p.role === 'student')
                        .filter((p) => !batchStudentsList.some((bs) => bs.id === p.id))
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name} ({s.email})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!enrollStudentId}
                      onClick={handleEnrollStudent}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs whitespace-nowrap disabled:opacity-50 cursor-pointer"
                    >
                      Enroll Student
                    </button>
                  </div>

                  {/* Enrolled Students Table */}
                  <div className="space-y-2">
                    {batchStudentsList.length > 0 ? (
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                        {batchStudentsList.map((st) => (
                          <div key={st.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                            <div>
                              <p className="font-bold text-slate-900">{st.full_name}</p>
                              <p className="text-[11px] text-slate-400">
                                {st.email} {st.phone && `• ${st.phone}`}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveStudentFromBatch(st.id)}
                              className="px-2.5 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 font-bold text-[11px] cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-4">
                        No students currently enrolled in this batch.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setBatchStudentsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 font-bold text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            7. FEES & DUES TAB
        ========================================================================= */}
        {activeTab === 'fees' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Fee Invoices & Dues</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Generate fee invoices, record fee collections, issue receipts, and track dues.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateFee}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Issue Fee Invoice
                </button>
              </div>

              {/* Fee Invoices Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Batch</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Paid Amount</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feesList.map((f) => (
                      <tr key={f.id}>
                        <td className="p-3 font-bold text-slate-900">{f.student_name}</td>
                        <td className="p-3 text-slate-500">{f.batch_name || '-'}</td>
                        <td className="p-3 font-bold">₹{f.amount}</td>
                        <td className="p-3 font-bold text-emerald-600">₹{f.paid_amount || 0}</td>
                        <td className="p-3 text-slate-500">{f.due_date}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              f.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : f.status === 'partial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {f.status !== 'paid' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRecordPaymentFeeId(f.id)
                                  setPaymentAmount(String(Math.max(0, f.amount - (f.paid_amount || 0))))
                                }}
                                className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-[11px] cursor-pointer"
                              >
                                Collect
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEditFee(f)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFee(f)}
                              className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                              title="Delete fee record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create / Edit Fee Modal */}
            {feeModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingFee ? 'Edit Fee Record' : 'Issue Fee Invoice'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setFeeModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveFee} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Select Student *</label>
                      <select
                        required
                        disabled={!!editingFee}
                        value={feeFormData.student_id}
                        onChange={(e) => setFeeFormData({ ...feeFormData, student_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="">-- Choose Student --</option>
                        {profilesList
                          .filter((p) => p.role === 'student')
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.full_name} ({s.email})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Select Batch (Optional)</label>
                      <select
                        value={feeFormData.batch_id}
                        onChange={(e) => setFeeFormData({ ...feeFormData, batch_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="">-- Choose Batch --</option>
                        {batchesList.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Total Fee Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        value={feeFormData.amount}
                        onChange={(e) => setFeeFormData({ ...feeFormData, amount: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. 2500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Due Date *</label>
                      <input
                        type="date"
                        required
                        value={feeFormData.due_date}
                        onChange={(e) => setFeeFormData({ ...feeFormData, due_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Remarks / Notes</label>
                      <input
                        type="text"
                        value={feeFormData.remarks}
                        onChange={(e) => setFeeFormData({ ...feeFormData, remarks: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Term 1 Academic Fee"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setFeeModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingFee ? 'Save Changes' : 'Issue Invoice'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Collect Payment Modal */}
            {recordPaymentFeeId && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-2xl max-w-sm w-full border border-slate-200 shadow-xl space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-slate-900">Record Fee Payment</h3>
                  <div>
                    <label className="font-bold text-slate-500 mb-1 block">Amount Received (₹) *</label>
                    <input
                      type="number"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-500 mb-1 block">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRecordPaymentFeeId(null)}
                      className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRecordPayment(recordPaymentFeeId)}
                      className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-bold cursor-pointer"
                    >
                      Confirm & Issue Receipt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            8. EXAMS & MARKS TAB
        ========================================================================= */}
        {activeTab === 'exams' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Exams & Student Marks</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Schedule tests, record marks for batch students with validation, and publish results to student dashboards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateExam}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Schedule Exam
                </button>
              </div>

              {/* Exams Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Exam Title</th>
                      <th className="p-3">Batch</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Max Marks</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {examsList.map((ex) => (
                      <tr key={ex.id}>
                        <td className="p-3 font-bold text-slate-900">{ex.title}</td>
                        <td className="p-3 text-slate-600">{ex.batch_name || '-'}</td>
                        <td className="p-3 text-slate-500">{ex.subject_name || '-'}</td>
                        <td className="p-3 text-slate-500">{ex.date}</td>
                        <td className="p-3 font-bold">{ex.total_marks}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              ex.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ex.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenMarksModal(ex)}
                              className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Award className="w-3 h-3" /> Enter Marks
                            </button>
                            {!ex.is_published && (
                              <button
                                type="button"
                                onClick={() => handlePublishExam(ex.id)}
                                className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                              >
                                Publish
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEditExam(ex)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExam(ex)}
                              className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                              title="Delete exam"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exam Create / Edit Modal */}
            {examModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingExam ? 'Edit Exam' : 'Schedule New Exam'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setExamModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveExam} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Exam Title *</label>
                      <input
                        type="text"
                        required
                        value={examFormData.title}
                        onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Chapter 4 Quadratic Equations Test"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Batch *</label>
                      <select
                        required
                        value={examFormData.batch_id}
                        onChange={(e) => setExamFormData({ ...examFormData, batch_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="">-- Choose Batch --</option>
                        {batchesList.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subject</label>
                      <select
                        value={examFormData.subject_id}
                        onChange={(e) => setExamFormData({ ...examFormData, subject_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="">-- Optional / General --</option>
                        {subjectsList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.target_class})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Date of Exam *</label>
                      <input
                        type="date"
                        required
                        value={examFormData.date}
                        onChange={(e) => setExamFormData({ ...examFormData, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-500 mb-1 block">Total Marks *</label>
                        <input
                          type="number"
                          required
                          value={examFormData.total_marks}
                          onChange={(e) => setExamFormData({ ...examFormData, total_marks: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-500 mb-1 block">Passing Marks</label>
                        <input
                          type="number"
                          value={examFormData.passing_marks}
                          onChange={(e) => setExamFormData({ ...examFormData, passing_marks: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setExamModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingExam ? 'Save Changes' : 'Schedule Exam'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Enter / Manage Marks Modal */}
            {marksModalOpen && selectedExamForMarks && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        Enter Student Marks: {selectedExamForMarks.title}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Max Marks: {selectedExamForMarks.total_marks} | Passing: {selectedExamForMarks.passing_marks}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMarksModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {marksStudentRows.length > 0 ? (
                    <div className="space-y-3">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Student Name</th>
                              <th className="p-2.5 w-32">Marks Obtained</th>
                              <th className="p-2.5">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {marksStudentRows.map((row, idx) => (
                              <tr key={row.student_id}>
                                <td className="p-2.5">
                                  <p className="font-bold text-slate-900">{row.student_name}</p>
                                  <p className="text-[10px] text-slate-400">{row.student_email}</p>
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="number"
                                    min="0"
                                    max={selectedExamForMarks.total_marks}
                                    value={row.marks_obtained}
                                    onChange={(e) => {
                                      const next = [...marksStudentRows]
                                      next[idx].marks_obtained = e.target.value
                                      setMarksStudentRows(next)
                                    }}
                                    className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-bold"
                                    placeholder={`0 - ${selectedExamForMarks.total_marks}`}
                                  />
                                </td>
                                <td className="p-2.5">
                                  <input
                                    type="text"
                                    value={row.remarks}
                                    onChange={(e) => {
                                      const next = [...marksStudentRows]
                                      next[idx].remarks = e.target.value
                                      setMarksStudentRows(next)
                                    }}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900"
                                    placeholder="e.g. Good performance"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setMarksModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-200 font-bold text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={savingMarks}
                          onClick={() => handleSaveMarks(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
                        >
                          Save as Draft
                        </button>
                        <button
                          type="button"
                          disabled={savingMarks}
                          onClick={() => handleSaveMarks(true)}
                          className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs cursor-pointer"
                        >
                          Save & Publish Results
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      <p>No students enrolled in this batch yet.</p>
                      <p className="mt-1">Enroll students into this batch first under the Batches tab.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            9. GALLERY MANAGER TAB
        ========================================================================= */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Gallery Manager & Photo Uploader</h2>
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-emerald-700/40 rounded-2xl p-8 text-center bg-slate-50/50">
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  id="bulk-gallery-input"
                  className="hidden"
                  onChange={(e) => e.target.files && handleBulkGalleryUpload(e.target.files)}
                />
                <label
                  htmlFor="bulk-gallery-input"
                  className="cursor-pointer inline-flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm text-slate-800">
                    Click to select multiple photos or drag and drop
                  </span>
                  <span className="text-xs text-slate-400">PNG, JPG, WebP supported</span>
                </label>
              </div>
            </div>

            {/* Gallery Media Grid */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900">Current Gallery Photos ({galleryList.length})</h3>
              {galleryList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryList.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-slate-100">
                        <img
                          src={item.webp_url || item.thumbnail_url || item.image_url}
                          alt={item.alt_text || item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-3 text-xs flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {item.placement}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                item.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {item.is_published ? 'Live' : 'Hidden'}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 mt-1 truncate">{item.title || 'Untitled'}</p>
                          {item.caption && <p className="text-[11px] text-slate-500 truncate">{item.caption}</p>}
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setEditingGalleryItem({ ...item })}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-bold text-[10px] text-slate-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-2.5 h-2.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGallery(item.id)}
                            className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No media uploaded to gallery yet.</p>
              )}
            </div>

            {/* Gallery Edit Modal */}
            {editingGalleryItem && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900">Edit Photo Details</h3>
                    <button
                      type="button"
                      onClick={() => setEditingGalleryItem(null)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveGalleryEdit} className="space-y-3">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Title</label>
                      <input
                        type="text"
                        value={editingGalleryItem.title}
                        onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Caption</label>
                      <input
                        type="text"
                        value={editingGalleryItem.caption}
                        onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, caption: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Placement</label>
                      <select
                        value={editingGalleryItem.placement}
                        onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, placement: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="gallery">General Gallery</option>
                        <option value="classroom">Classroom ("Inside our classrooms")</option>
                        <option value="results">Results & Toppers</option>
                        <option value="hero">Hero Banners</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Visibility</label>
                      <select
                        value={editingGalleryItem.is_published}
                        onChange={(e) =>
                          setEditingGalleryItem({ ...editingGalleryItem, is_published: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value={1}>Published (Visible on site)</option>
                        <option value={0}>Hidden / Draft</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingGalleryItem(null)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            10. BLOG POSTS TAB
        ========================================================================= */}
        {activeTab === 'blogs' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Blog & Educational Articles</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage study guides, exam preparation tips, and news posted on the public blog.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateBlog}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Write Article
                </button>
              </div>

              {/* Blogs list */}
              <div className="space-y-3">
                {blogsList.map((blog) => (
                  <div
                    key={blog.id}
                    className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{blog.title}</h4>
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            blog.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {blog.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {blog.author} &bull; {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBlog(blog)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="text-xs font-bold text-red-600 hover:underline px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blog Modal */}
            {blogModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingBlog ? 'Edit Blog Article' : 'Write New Article'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setBlogModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveBlog} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Article Title *</label>
                      <input
                        type="text"
                        required
                        value={blogFormData.title}
                        onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. 5 Strategies to Score 95+ in Board Math"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Author</label>
                      <input
                        type="text"
                        value={blogFormData.author}
                        onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Publication Status</label>
                      <select
                        value={blogFormData.is_published}
                        onChange={(e) => setBlogFormData({ ...blogFormData, is_published: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value={1}>Published (Live on blog)</option>
                        <option value={0}>Draft (Hidden)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Cover Image URL</label>
                      <input
                        type="text"
                        value={blogFormData.cover_url}
                        onChange={(e) => setBlogFormData({ ...blogFormData, cover_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="https://... or /uploads/..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Short Summary / Excerpt</label>
                      <input
                        type="text"
                        value={blogFormData.excerpt}
                        onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Full Article Content *</label>
                      <textarea
                        rows={8}
                        required
                        value={blogFormData.content}
                        onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setBlogModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingBlog ? 'Save Changes' : 'Publish Article'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            11. FACULTY TAB
        ========================================================================= */}
        {activeTab === 'faculty' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Faculty Profiles</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage instructor names, designations, subject specializations, and biographies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateFaculty}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Faculty Member
                </button>
              </div>

              {/* Faculty Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {facultyList.map((fac) => (
                  <div
                    key={fac.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      {fac.photo_url && (
                        <img
                          src={fac.photo_url}
                          alt={fac.name}
                          className="w-16 h-16 rounded-full object-cover mb-3 border border-slate-200"
                        />
                      )}
                      <h4 className="font-bold text-sm text-slate-900">{fac.name}</h4>
                      <p className="text-xs text-emerald-700 font-semibold">{fac.designation}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{fac.subjects}</p>
                      {fac.bio && <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">{fac.bio}</p>}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleOpenEditFaculty(fac)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-[11px] text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFaculty(fac.id)}
                        className="text-xs text-red-600 font-bold hover:underline px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Faculty Modal */}
            {facultyModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingFaculty ? 'Edit Faculty Profile' : 'Add Faculty Member'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setFacultyModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveFaculty} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={facultyFormData.name}
                        onChange={(e) => setFacultyFormData({ ...facultyFormData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Ankit Gupta"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Designation</label>
                      <input
                        type="text"
                        value={facultyFormData.designation}
                        onChange={(e) => setFacultyFormData({ ...facultyFormData, designation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="Founder & Senior Faculty"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subjects Taught</label>
                      <input
                        type="text"
                        value={facultyFormData.subjects}
                        onChange={(e) => setFacultyFormData({ ...facultyFormData, subjects: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="Mathematics, Physics"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Photo URL</label>
                      <input
                        type="text"
                        value={facultyFormData.photo_url}
                        onChange={(e) => setFacultyFormData({ ...facultyFormData, photo_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="https://... or /uploads/..."
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Bio / Summary</label>
                      <textarea
                        rows={3}
                        value={facultyFormData.bio}
                        onChange={(e) => setFacultyFormData({ ...facultyFormData, bio: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setFacultyModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingFaculty ? 'Save Changes' : 'Add Faculty'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            12. FACILITIES TAB
        ========================================================================= */}
        {activeTab === 'facilities' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Campus Facilities</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage classroom facilities, laboratories, and study environment highlights.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateFacility}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Facility
                </button>
              </div>

              {/* Facilities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilitiesList.map((f) => (
                  <div
                    key={f.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{f.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{f.description}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleOpenEditFacility(f)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-[11px] text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFacility(f.id)}
                        className="text-xs text-red-600 font-bold hover:underline px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facility Modal */}
            {facilityModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingFacility ? 'Edit Facility' : 'Add Facility Feature'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setFacilityModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveFacility} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Facility Title *</label>
                      <input
                        type="text"
                        required
                        value={facilityFormData.title}
                        onChange={(e) => setFacilityFormData({ ...facilityFormData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. AC Classrooms & Smart Boards"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Description</label>
                      <textarea
                        rows={3}
                        value={facilityFormData.description}
                        onChange={(e) => setFacilityFormData({ ...facilityFormData, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setFacilityModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingFacility ? 'Save Changes' : 'Add Facility'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            13. ACHIEVEMENTS & TOPPERS TAB
        ========================================================================= */}
        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Achievements & Hall of Fame</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage student board exam records, topper spotlights, and institute milestones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateAchievement}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Achievement
                </button>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementsList.map((a) => (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{a.title}</h4>
                      <p className="text-xs text-amber-600 font-semibold mt-0.5">{a.date}</p>
                      {a.description && <p className="text-xs text-slate-600 mt-1">{a.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAchievement(a)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-[11px] text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAchievement(a.id)}
                        className="text-xs text-red-600 font-bold hover:underline px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Modal */}
            {achievementModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingAchievement ? 'Edit Achievement' : 'Add Topper / Achievement'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setAchievementModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveAchievement} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Title / Score *</label>
                      <input
                        type="text"
                        required
                        value={achievementFormData.title}
                        onChange={(e) => setAchievementFormData({ ...achievementFormData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Rahul Sharma - 98.4% SSC Board"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Year / Batch</label>
                      <input
                        type="text"
                        value={achievementFormData.date}
                        onChange={(e) => setAchievementFormData({ ...achievementFormData, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="2026 Batch"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Description</label>
                      <textarea
                        rows={2}
                        value={achievementFormData.description}
                        onChange={(e) => setAchievementFormData({ ...achievementFormData, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setAchievementModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingAchievement ? 'Save Changes' : 'Add Achievement'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            14. TESTIMONIALS TAB
        ========================================================================= */}
        {activeTab === 'testimonials' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Student & Parent Reviews</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage testimonials, ratings, and feedback displayed on the website.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateTestimonial}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Review
                </button>
              </div>

              {/* Testimonials List */}
              <div className="space-y-3">
                {testimonialsList.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{t.student_name}</h4>
                        {t.course && <span className="text-xs text-emerald-700 font-semibold">• {t.course}</span>}
                        <span className="text-amber-500 font-bold text-xs">★ {t.rating || 5}/5</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 italic">"{t.text}"</p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTestimonial(t)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-xs text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="text-xs font-bold text-red-600 hover:underline px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Modal */}
            {testimonialModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingTestimonial ? 'Edit Review' : 'Add Student / Parent Review'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setTestimonialModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveTestimonial} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Student / Parent Name *</label>
                      <input
                        type="text"
                        required
                        value={testimonialFormData.student_name}
                        onChange={(e) => setTestimonialFormData({ ...testimonialFormData, student_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Priya Deshmukh (Class 10)"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Course</label>
                      <input
                        type="text"
                        value={testimonialFormData.course}
                        onChange={(e) => setTestimonialFormData({ ...testimonialFormData, course: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="SSC Foundation Batch"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Rating (1 to 5 Stars)</label>
                      <select
                        value={testimonialFormData.rating}
                        onChange={(e) => setTestimonialFormData({ ...testimonialFormData, rating: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value={5}>5 Stars ★★★★★</option>
                        <option value={4}>4 Stars ★★★★☆</option>
                        <option value={3}>3 Stars ★★★☆☆</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Review Text *</label>
                      <textarea
                        rows={3}
                        required
                        value={testimonialFormData.text}
                        onChange={(e) => setTestimonialFormData({ ...testimonialFormData, text: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setTestimonialModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingTestimonial ? 'Save Changes' : 'Add Review'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            15. VIDEO MANAGER TAB
        ========================================================================= */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Video Manager</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Embed YouTube lectures, shorts, and Instagram reels directly on the site.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreateVideo}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs self-start sm:self-auto shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Video
                </button>
              </div>

              {/* Videos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videosList.map((v) => (
                  <div
                    key={v.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-500">{v.platform}</span>
                      <h4 className="font-bold text-sm mt-1 text-slate-900">{v.title}</h4>
                      {v.description && <p className="text-xs text-slate-500 mt-1">{v.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleOpenEditVideo(v)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-[11px] text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(v.id)}
                        className="text-xs font-bold text-red-600 hover:underline px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Modal */}
            {videoModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingVideo ? 'Edit Video' : 'Add Video Lecture or Reel'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setVideoModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveVideo} className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Video Title *</label>
                      <input
                        type="text"
                        required
                        value={videoFormData.title}
                        onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="e.g. Tips for Board Exam Prep"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Platform</label>
                      <select
                        value={videoFormData.platform}
                        onChange={(e) => setVideoFormData({ ...videoFormData, platform: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram Reel</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Video URL *</label>
                      <input
                        type="url"
                        required
                        value={videoFormData.url}
                        onChange={(e) => setVideoFormData({ ...videoFormData, url: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    {videoFormData.platform === 'youtube' && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                        <span className="text-[11px] font-bold text-amber-800 block mb-1">Video Trimming (optional)</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            min="0"
                            value={videoFormData.startTime}
                            onChange={(e) => setVideoFormData({ ...videoFormData, startTime: e.target.value })}
                            className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                            placeholder="Start (sec)"
                          />
                          <input
                            type="number"
                            min="0"
                            value={videoFormData.endTime}
                            onChange={(e) => setVideoFormData({ ...videoFormData, endTime: e.target.value })}
                            className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900"
                            placeholder="End (sec)"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setVideoModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-200 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold"
                      >
                        {editingVideo ? 'Save Changes' : 'Add Video'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            16. INQUIRIES INBOX TAB
        ========================================================================= */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Contact Inquiries Inbox</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Visitor questions, callback requests, and parent inquiries submitted from the website.
                </p>
              </div>
            </div>

            {messagesList.length > 0 ? (
              <div className="space-y-4">
                {messagesList.map((m) => (
                  <div
                    key={m.id}
                    className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      m.is_read ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{m.name}</h4>
                        <span className="text-xs text-slate-400">
                          &bull; {m.email} &bull; {m.phone || 'No phone'}
                        </span>
                        {!m.is_read && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-white font-bold text-[9px] uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-emerald-700">{m.subject || 'General Inquiry'}</p>
                      <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap">{m.message}</p>
                      <span className="text-[10px] text-slate-400 block pt-1">{m.created_at}</span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleReadMessage(m)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        {m.is_read ? 'Mark Unread' : 'Mark as Read'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No inquiries received yet.</p>
            )}
          </div>
        )}

        {/* =========================================================================
            17. MASTER SETTINGS TAB
        ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-4xl">

            {/* ── Change Admin Credentials ── */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700"><Lock className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Change Admin Login Credentials</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Update your admin email or password. You will be logged out after saving.</p>
                </div>
              </div>

              {/* Current credentials info card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Current email:</span>
                  <span className="font-semibold text-slate-800">{user?.email || 'admin@sstutorial.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-500" />
                  <span className="text-slate-500">Role:</span>
                  <span className="font-semibold text-teal-700 uppercase text-[10px] tracking-wider">Administrator</span>
                </div>
              </div>

              {credError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" /><span>{credError}</span>
                </div>
              )}
              {credSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /><span>{credSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    placeholder="Enter your current password to confirm"
                    value={credForm.currentPassword}
                    onChange={(e) => setCredForm(f => ({ ...f, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Email <span className="text-slate-400">(optional)</span></label>
                  <input
                    type="email"
                    placeholder="e.g. newadmin@sstutorial.com"
                    value={credForm.newEmail}
                    onChange={(e) => setCredForm(f => ({ ...f, newEmail: e.target.value }))}
                    className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-start-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password <span className="text-slate-400">(optional)</span></label>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    value={credForm.newPassword}
                    onChange={(e) => setCredForm(f => ({ ...f, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={credForm.confirmPassword}
                    onChange={(e) => setCredForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleChangeCredentials}
                disabled={credLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 transition shadow-sm"
              >
                <Lock className="w-4 h-4" />
                {credLoading ? 'Saving…' : 'Update Credentials'}
              </button>
            </div>

            {/* ── Institute Settings form (existing) ── */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Master Institute Settings</h2>
              <p className="text-xs text-slate-500 mt-1">
                Every piece of information here is live and dynamically controls headers, footers, contact pages, and metadata.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <FileUpload
                  label="Institute Logo (PNG/SVG)"
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

              {/* Configurable text fields */}
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
                <div
                  key={field.key}
                  className={
                    ['address', 'notice_ticker', 'homepage_hero_title', 'homepage_hero_subtitle', 'about_vision_text', 'about_mission_text'].includes(
                      field.key
                    )
                      ? 'sm:col-span-2'
                      : ''
                  }
                >
                  <label className="block text-xs font-bold text-slate-700 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={settings[field.key] || ''}
                    onChange={(e) => updateSetting(field.key, e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  About Institute (History, Vision, Mission)
                </label>
                <textarea
                  rows={4}
                  value={settings.about || ''}
                  onChange={(e) => updateSetting('about', e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Founder Biography</label>
                <textarea
                  rows={4}
                  value={settings.founder_bio || ''}
                  onChange={(e) => updateSetting('founder_bio', e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Homepage FAQs (JSON Format)</label>
                <textarea
                  rows={6}
                  value={settings.faqs_json || ''}
                  onChange={(e) => updateSetting('faqs_json', e.target.value)}
                  placeholder={'[\n  { "q": "Question?", "a": "Answer" }\n]'}
                  className="w-full font-mono px-4 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Homepage Schedule (JSON Format)</label>
                <textarea
                  rows={6}
                  value={settings.schedule_json || ''}
                  onChange={(e) => updateSetting('schedule_json', e.target.value)}
                  placeholder={'{\n  "Monday": [\n    { "time": "7:00 AM", "tag": "ADV", "title": "Math", "instructor": "Ankit", "seats": "3 left" }\n  ]\n}'}
                  className="w-full font-mono px-4 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>
            </div>{/* end institute settings card */}
          </div>
        )}
      </main>

      {/* ====== IMAGE CROP MODAL ====== */}
      {cropQueue.length > 0 && cropCurrentSrc && (
        <ImageCropperModal
          key={cropCurrentSrc}
          src={cropCurrentSrc}
          originalFile={cropQueue[0]}
          onConfirm={handleCropConfirm}
          onCancel={handleCropSkip}
        />
      )}
    </div>
  )
}
