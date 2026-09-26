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
  Instagram,
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
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { FileUpload } from '@/components/media/FileUpload'
import { uploadOptimizedImage } from '@/lib/utils/image'

export const AdminDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const { settings, updateSetting, refreshSettings } = useSiteSettings()

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
    | 'instagram'
    | 'messages'
    | 'settings'
  >('overview')

  const [notification, setNotification] = useState('')
  const showNotice = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 4000)
  }

  // --- ADMISSIONS STATE ---
  const [admissions, setAdmissions] = useState<any[]>([])
  const [selectedAdmission, setSelectedAdmission] = useState<any | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // --- USERS STATE ---
  const [profilesList, setProfilesList] = useState<any[]>([])

  // --- COURSES & BATCHES STATE ---
  const [coursesList, setCoursesList] = useState<any[]>([])
  const [batchesList, setBatchesList] = useState<any[]>([])
  const [editingCourse, setEditingCourse] = useState<any | null>(null)
  const [editingBatch, setEditingBatch] = useState<any | null>(null)
  const emptyCourse = { title: '', board: 'SSC', target_class: 'Class 10', subjects: '', description: '', syllabus: '', duration: '', fee: '', batch_info: '', faculty_name: '', is_active: true, display_order: 0 }

  // --- SUBJECTS STATE ---
  const [subjectsList, setSubjectsList] = useState<any[]>([])
  const [editingSubject, setEditingSubject] = useState<any | null>(null)
  const emptySubject = { name: '', code: '', board: 'SSC', target_class: 'Class 10', description: '', is_active: true, display_order: 0 }

  // --- FEES STATE ---
  const [feesList, setFeesList] = useState<any[]>([])
  const [newFee, setNewFee] = useState({ student_id: '', batch_id: '', amount: '', due_date: '' })

  // --- EXAMS STATE ---
  const [examsList, setExamsList] = useState<any[]>([])
  const [newExam, setNewExam] = useState({ batch_id: '', title: '', total_marks: 100, passing_marks: 35, date: '' })

  // --- BLOGS STATE ---
  const [blogsList, setBlogsList] = useState<any[]>([])
  const [editingBlog, setEditingBlog] = useState<any | null>(null)

  // --- TESTIMONIALS STATE ---
  const [testimonialsList, setTestimonialsList] = useState<any[]>([])

  // --- ACHIEVEMENTS STATE ---
  const [achievementsList, setAchievementsList] = useState<any[]>([])

  // --- FACILITIES STATE ---
  const [facilitiesList, setFacilitiesList] = useState<any[]>([])

  // --- FACULTY STATE ---
  const [facultyList, setFacultyList] = useState<any[]>([])
  const [editingFaculty, setEditingFaculty] = useState<any | null>(null)

  // --- GALLERY STATE ---
  const [galleryList, setGalleryList] = useState<any[]>([])
  const [batchPlacement, setBatchPlacement] = useState('gallery')
  const [batchCaption, setBatchCaption] = useState('')

  // --- VIDEOS STATE ---
  const [videosList, setVideosList] = useState<any[]>([])
  const [newVideo, setNewVideo] = useState({ title: '', description: '', url: '', platform: 'youtube' })

  // --- INSTAGRAM BULK IMPORT STATE ---
  const [instagramLinksInput, setInstagramLinksInput] = useState('')
  const [instagramImportsList, setInstagramImportsList] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)

  // --- MESSAGES STATE ---
  const [messagesList, setMessagesList] = useState<any[]>([])

  // Load active tab data
  useEffect(() => {
    loadTabData(activeTab)
  }, [activeTab])

  const loadTabData = async (tab: string) => {
    try {
      if (tab === 'overview' || tab === 'admissions') {
        const { data } = await supabase.from('admissions').select('*, courses(title), batches(name)').order('applied_at', { ascending: false })
        if (data) setAdmissions(data)
      }
      if (tab === 'overview' || tab === 'users') {
        const { data } = await supabase.from('profiles').select('*')
        if (data) setProfilesList(data)
      }
      if (tab === 'overview' || tab === 'courses') {
        const { data } = await supabase.from('courses').select('*').order('display_order', { ascending: true })
        if (data) setCoursesList(data.map((item: any) => ({
          ...item,
          board: item.board || 'Both',
          target_class: item.target_class || item.category || 'School Classes',
          subjects: item.subjects || '',
          batch_info: item.batch_info || '',
          faculty_name: item.faculty_name || '',
        })))
      }
      if (tab === 'subjects') {
        const { data } = await supabase.from('subjects').select('*').order('display_order', { ascending: true })
        if (data) setSubjectsList(data)
      }
      if (tab === 'batches') {
        const { data } = await supabase.from('batches').select('*, courses(title)').order('created_at', { ascending: false })
        if (data) setBatchesList(data)
      }
      if (tab === 'fees') {
        const { data } = await supabase.from('fees').select('*, profiles(full_name), batches(name)')
        if (data) setFeesList(data)
      }
      if (tab === 'exams') {
        const { data } = await supabase.from('exams').select('*, batches(name)')
        if (data) setExamsList(data)
      }
      if (tab === 'blogs') {
        const { data } = await supabase.from('blogs').select('*').order('created_at', { ascending: false })
        if (data) setBlogsList(data)
      }
      if (tab === 'testimonials') {
        const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
        if (data) setTestimonialsList(data)
      }
      if (tab === 'achievements') {
        const { data } = await supabase.from('achievements').select('*').order('display_order', { ascending: true })
        if (data) setAchievementsList(data)
      }
      if (tab === 'facilities') {
        const { data } = await supabase.from('facilities').select('*').order('display_order', { ascending: true })
        if (data) setFacilitiesList(data)
      }
      if (tab === 'faculty') {
        const { data } = await supabase.from('faculty').select('*').order('display_order', { ascending: true })
        if (data) setFacultyList(data)
      }
      if (tab === 'gallery') {
        const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
        if (data) setGalleryList(data)
      }
      if (tab === 'videos') {
        const { data } = await supabase.from('videos').select('*').order('display_order', { ascending: true })
        if (data) setVideosList(data)
      }
      if (tab === 'instagram') {
        const { data } = await supabase.from('instagram_imports').select('*').order('created_at', { ascending: false })
        if (data) setInstagramImportsList(data)
      }
      if (tab === 'overview' || tab === 'messages') {
        const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
        if (data) setMessagesList(data)
      }
    } catch (e) {
      console.warn('Error loading tab data:', e)
    }
  }

  // --- ADMISSION ACTIONS ---
  const handleReviewAdmission = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await supabase
        .from('admissions')
        .update({
          status,
          rejection_reason: status === 'rejected' ? rejectionReason : null,
          reviewed_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      showNotice(`Admission application ${status}!`)
      setSelectedAdmission(null)
      setRejectionReason('')
      loadTabData('admissions')
    } catch (e) {
      console.error(e)
    }
  }

  // --- GALLERY ACTIONS ---
  const handleBulkGalleryUpload = async (files: FileList) => {
    showNotice(`Processing and uploading ${files.length} images...`)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const res = await uploadOptimizedImage(file, 'gallery')
        await supabase.from('gallery').insert({
          title: file.name.replace(/\.[^/.]+$/, ''),
          caption: batchCaption || '',
          alt_text: file.name,
          image_url: res.imageUrl,
          webp_url: res.webpUrl,
          thumbnail_url: res.thumbnailUrl,
          placement: batchPlacement as any,
          is_published: true,
        })
      } catch (err) {
        console.error('Failed to upload image:', file.name, err)
      }
    }
    showNotice('Images uploaded and converted to WebP successfully!')
    loadTabData('gallery')
  }

  // --- INSTAGRAM BULK IMPORT SIMULATION & QUEUE ---
  const handleQueueInstagramImports = async () => {
    const urls = instagramLinksInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0)

    if (urls.length === 0) return
    setIsImporting(true)

    for (const url of urls) {
      try {
        // Queue link
        const { data: queueItem } = await supabase
          .from('instagram_imports')
          .insert({
            url,
            status: 'processing',
            attempts: 1,
          })
          .select()
          .single()

        // Create gallery entry with Instagram link
        const { data: galItem } = await supabase
          .from('gallery')
          .insert({
            title: 'Instagram Post',
            caption: 'Imported from Instagram @ss__tutorial',
            alt_text: 'SS Tutorial Instagram Photo',
            image_url: settings.hero_image_url || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
            placement: 'gallery',
            instagram_post_url: url,
            is_published: true,
          })
          .select()
          .single()

        // Update status to completed
        if (queueItem) {
          await supabase
            .from('instagram_imports')
            .update({
              status: 'completed',
              gallery_id: galItem?.id || null,
            })
            .eq('id', queueItem.id)
        }
      } catch (e: any) {
        await supabase.from('instagram_imports').insert({
          url,
          status: 'failed',
          attempts: 3,
          failure_reason: e?.message || 'Network timeout or invalid post URL',
        })
      }
    }

    setInstagramLinksInput('')
    setIsImporting(false)
    showNotice('Instagram links imported into Gallery!')
    loadTabData('instagram')
  }

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
          <a href="/" className="text-xs text-emerald-300 hover:text-white" title="View Site">
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
            { id: 'blogs', label: 'Blog Posts', icon: FileText },
            { id: 'gallery', label: 'Gallery Manager', icon: ImageIcon },
            { id: 'videos', label: 'Video Manager', icon: Video },
            { id: 'instagram', label: 'Instagram Import', icon: Instagram },
            { id: 'faculty', label: 'Faculty', icon: Users },
            { id: 'facilities', label: 'Facilities', icon: Award },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
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
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-200 bg-red-950/40 hover:bg-red-900/60 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
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

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Contact Inquiries</p>
                <p className="text-3xl font-black text-blue-600 mt-2">
                  {messagesList.length}
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
                      <th className="p-3">Course</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {admissions.map((adm) => (
                      <tr key={adm.id}>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{adm.student_name}</td>
                        <td className="p-3 text-slate-500">{adm.parent_name}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{adm.courses?.title || 'General'}</td>
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
                    placeholder="Enter reason for rejection (e.g. batch full, incomplete documents)..."
                    className="w-full p-3 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
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

        {/* COURSES MANAGER TAB */}
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
                    updated_at: new Date().toISOString(),
                  }

                  if (isEdit) {
                    await supabase.from('courses').update(payload).eq('id', form.id)
                    showNotice('Course updated!')
                  } else {
                    await supabase.from('courses').insert({ ...payload, id: undefined })
                    showNotice('Course added!')
                  }

                  setEditingCourse(null)
                  loadTabData('courses')
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Course Name *</label>
                      <input type="text" value={form.title || ''} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="e.g. Class 10 Math Foundation" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Board</label>
                      <select value={form.board || 'Both'} onChange={(e) => setForm({...form, board: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
                        <option value="SSC">SSC Board</option>
                        <option value="CBSE">CBSE Board</option>
                        <option value="Both">Both Boards</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Class / Level</label>
                      <select value={form.target_class || 'Class 10'} onChange={(e) => setForm({...form, target_class: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
                        <option value="School Classes">School Classes (General)</option>
                        <option value="Class 6">Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11 (Higher Secondary)</option>
                        <option value="Class 12">Class 12 (Higher Secondary)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subjects (comma separated)</label>
                      <input type="text" value={form.subjects || ''} onChange={(e) => setForm({...form, subjects: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="e.g. Mathematics, Science" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Duration</label>
                      <input type="text" value={form.duration || ''} onChange={(e) => setForm({...form, duration: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="e.g. 6 Months" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Fees</label>
                      <input type="text" value={form.fee || ''} onChange={(e) => setForm({...form, fee: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="e.g. Rs. 1500/month" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Batch Info / Schedule</label>
                      <input type="text" value={form.batch_info || ''} onChange={(e) => setForm({...form, batch_info: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="e.g. Morning 9AM–11AM" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Faculty / Teacher</label>
                      <input type="text" value={form.faculty_name || ''} onChange={(e) => setForm({...form, faculty_name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="Leave blank if not decided" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Course Description</label>
                      <textarea rows={3} value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="Short description of this course" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Syllabus / Topics</label>
                      <textarea rows={3} value={form.syllabus || ''} onChange={(e) => setForm({...form, syllabus: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="List of topics covered in this course" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-slate-500">Published</label>
                      <input type="checkbox" checked={form.is_active !== false} onChange={(e) => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 accent-emerald-700" />
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
              {coursesList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Course</th>
                        <th className="p-3">Board</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Subjects</th>
                        <th className="p-3">Fee</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {coursesList.map((course: any) => (
                        <tr key={course.id}>
                          <td className="p-3 font-bold text-slate-900 dark:text-white max-w-xs">
                            <p>{course.title}</p>
                            {course.faculty_name && <p className="text-slate-400 font-normal">{course.faculty_name}</p>}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 uppercase">{course.board || '-'}</span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{course.target_class || '-'}</td>
                          <td className="p-3 text-slate-500 max-w-xs truncate">{course.subjects || '-'}</td>
                          <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">{course.fee || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${course.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                              {course.is_active ? 'Published' : 'Unpublished'}
                            </span>
                          </td>
                          <td className="p-3 space-x-2">
                            <button type="button" onClick={() => setEditingCourse(course)} className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-[11px] hover:bg-amber-200">Edit</button>
                            <button type="button" onClick={async () => {
                              if (window.confirm('Delete this course?')) {
                                await supabase.from('courses').delete().eq('id', course.id)
                                showNotice('Course deleted')
                                loadTabData('courses')
                              }
                            }} className="px-3 py-1 rounded-lg bg-red-100 text-red-700 font-bold text-[11px] hover:bg-red-200">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No courses added yet. Use the form above to add your first course.</p>
              )}
            </div>
          </div>
        )}

        {/* SUBJECTS MANAGER TAB */}
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
                  const payload: any = {
                    name: form.name,
                    code: form.code || '',
                    board: form.board || 'SSC',
                    target_class: form.target_class || 'Class 10',
                    description: form.description || '',
                    is_active: form.is_active !== false,
                    display_order: Number(form.display_order) || 0,
                    updated_at: new Date().toISOString(),
                  }

                  if (isEdit) {
                    await supabase.from('subjects').update(payload).eq('id', form.id)
                    showNotice('Subject updated!')
                  } else {
                    await supabase.from('subjects').insert(payload)
                    showNotice('Subject added!')
                  }

                  setEditingSubject(null)
                  loadTabData('subjects')
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subject Name *</label>
                      <input type="text" value={form.name || ''} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="e.g. Mathematics" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Subject Code</label>
                      <input type="text" value={form.code || ''} onChange={(e) => setForm({...form, code: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="e.g. MATH10" />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Board</label>
                      <select value={form.board || 'SSC'} onChange={(e) => setForm({...form, board: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
                        <option value="SSC">SSC Board</option>
                        <option value="CBSE">CBSE Board</option>
                        <option value="Both">Both Boards</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 mb-1 block">Class / Level</label>
                      <select value={form.target_class || 'Class 10'} onChange={(e) => setForm({...form, target_class: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
                        <option value="School Classes">School Classes (General)</option>
                        <option value="Class 6">Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="Class 11">Class 11 (Higher Secondary)</option>
                        <option value="Class 12">Class 12 (Higher Secondary)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-500 mb-1 block">Description (optional)</label>
                      <textarea rows={2} value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" placeholder="Brief description of topics in this subject" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-slate-500">Active</label>
                      <input type="checkbox" checked={form.is_active !== false} onChange={(e) => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 accent-emerald-700" />
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                      <button type="button" onClick={handleSave} className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700">
                        {isEdit ? 'Save Changes' : 'Add Subject'}
                      </button>
                      {isEdit && (
                        <button type="button" onClick={() => setEditingSubject(null)} className="px-6 py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Subjects List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-6">All Subjects ({subjectsList.length})</h3>
              {subjectsList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Code</th>
                        <th className="p-3">Board</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subjectsList.map((subject: any) => (
                        <tr key={subject.id}>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{subject.name}</td>
                          <td className="p-3 text-slate-400 font-mono">{subject.code || '-'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 uppercase">{subject.board || '-'}</span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{subject.target_class || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${subject.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                              {subject.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-3 space-x-2">
                            <button type="button" onClick={() => setEditingSubject(subject)} className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-[11px] hover:bg-amber-200">Edit</button>
                            <button type="button" onClick={async () => {
                              if (window.confirm('Delete this subject?')) {
                                await supabase.from('subjects').delete().eq('id', subject.id)
                                showNotice('Subject deleted')
                                loadTabData('subjects')
                              }
                            }} className="px-3 py-1 rounded-lg bg-red-100 text-red-700 font-bold text-[11px] hover:bg-red-200">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No subjects added yet. Use the form above to add subjects.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. GALLERY MANAGER (Bulk upload, WebP auto-conversion, placement) */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Gallery Manager & Bulk Uploader
              </h2>
              <p className="text-xs text-slate-500">
                Uploaded images automatically generate optimized WebP variants and thumbnails.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Batch Placement</label>
                  <select
                    value={batchPlacement}
                    onChange={(e) => setBatchPlacement(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="gallery">General Gallery</option>
                    <option value="classroom">Classroom ("Inside our classrooms")</option>
                    <option value="results">Results & Toppers</option>
                    <option value="hero">Hero Banners</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Batch Caption</label>
                  <input
                    type="text"
                    value={batchCaption}
                    onChange={(e) => setBatchCaption(e.target.value)}
                    placeholder="Caption applied to uploaded images"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Bulk File Input */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center">
                <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Select Multiple Photos to Upload
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP supported</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleBulkGalleryUpload(e.target.files)}
                  className="mt-4 text-xs"
                />
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base mb-6">Published Gallery Media</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {galleryList.map((item) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-800">
                    <img
                      src={item.thumbnail_url || item.webp_url || item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await supabase.from('gallery').delete().eq('id', item.id)
                          loadTabData('gallery')
                          showNotice('Image removed')
                        }}
                        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. INSTAGRAM BULK IMPORT TAB */}
        {activeTab === 'instagram' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-600" /> Instagram Bulk Import Queue
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Paste Instagram post URLs from @ss__tutorial to queue and import photos directly into your gallery.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Instagram Post URLs (One per line)
              </label>
              <textarea
                rows={5}
                value={instagramLinksInput}
                onChange={(e) => setInstagramLinksInput(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <button
                type="button"
                disabled={isImporting || !instagramLinksInput.trim()}
                onClick={handleQueueInstagramImports}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {isImporting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isImporting ? 'Processing Queue...' : 'Queue & Import Links'}</span>
              </button>
            </div>

            {/* Queue Table */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm mb-4">Import Job Status</h3>
              {instagramImportsList.length > 0 ? (
                <div className="space-y-2">
                  {instagramImportsList.map((job) => (
                    <div key={job.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="truncate max-w-sm">{job.url}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          job.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : job.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No import jobs recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* 5. VIDEO MANAGER TAB */}
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    placeholder="e.g. Tips for Board Exam Prep"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Platform</label>
                  <select
                    value={newVideo.platform}
                    onChange={(e) => setNewVideo({ ...newVideo, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/reel/..."
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

                  await supabase.from('videos').insert({
                    title: newVideo.title,
                    url: newVideo.url,
                    embed_url: embed,
                    platform: newVideo.platform as any,
                    is_active: true,
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
              <h3 className="font-bold text-base">Active Videos</h3>
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
                        await supabase.from('videos').delete().eq('id', v.id)
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

        {/* 6. MASTER SETTINGS TAB */}
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

              {/* Hero Image Upload */}
              <div>
                <FileUpload
                  label="Hero Banner Image"
                  currentUrl={settings.hero_image_url}
                  folder="branding"
                  onUploadSuccess={(res) => {
                    updateSetting('hero_image_url', res.webpUrl || res.url)
                    showNotice('Hero banner updated!')
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
                { key: 'whatsapp_message', label: 'Default WhatsApp Message' },
                { key: 'address', label: 'Physical Campus Address' },
                { key: 'working_hours', label: 'Working Hours' },
                { key: 'notice_ticker', label: 'Notice Ticker Announcement' },
                { key: 'map_embed_url', label: 'Google Maps Embed URL' },
                { key: 'instagram_url', label: 'Instagram Profile URL' },
                { key: 'facebook_url', label: 'Facebook Page URL' },
                { key: 'youtube_url', label: 'YouTube Channel URL' },
                { key: 'footer_note', label: 'Custom Footer Note' },
              ].map((field) => (
                <div key={field.key} className={field.key === 'address' || field.key === 'notice_ticker' || field.key === 'map_embed_url' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={settings[field.key] || ''}
                    onChange={(e) => updateSetting(field.key, e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
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
                  className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
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
                  placeholder="Enter the founder's biography. Leave blank to hide."
                  className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

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

            </div>
          </div>
        )}

      </main>
    </div>
  )
}
