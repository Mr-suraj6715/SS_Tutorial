import React, { useEffect, useState } from 'react'
import {
  GraduationCap,
  User,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
} from 'lucide-react'
import { useSiteSettings } from '@/lib/hooks/useSiteSettings'
import { supabase } from '@/lib/supabase/client'
import { updatePageMeta } from '@/lib/utils/seo'
import { FileUpload } from '@/components/media/FileUpload'

export const AdmissionPage: React.FC = () => {
  const { settings } = useSiteSettings()
  const [courses, setCourses] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    student_name: '',
    parent_name: '',
    phone: '',
    email: '',
    address: '',
  })

  useEffect(() => {
    updatePageMeta({
      title: 'Online Admission Application',
      description: `Apply online for courses and batch enrollment at ${settings.institute_name}.`,
    }, settings.institute_name)

    // Pre-select course or batch from URL search params
    const params = new URLSearchParams(window.location.search)
    const cId = params.get('course_id')
    const bId = params.get('batch_id')
    if (cId) setSelectedCourseId(cId)
    if (bId) setSelectedBatchId(bId)

    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses')
        if (res.ok) {
          const data = await res.json()
          setCourses(data.courses || [])
        }
      } catch (e) {
        console.warn('Could not fetch courses from backend:', e)
      }
    }

    fetchCourses()
  }, [settings])

  // Fetch batches when course selection changes
  useEffect(() => {
    const fetchBatches = async () => {
      if (!selectedCourseId) {
        setBatches([])
        return
      }

      try {
        const res = await fetch('/api/batches')
        if (res.ok) {
          const data = await res.json()
          const matched = (data.batches || []).filter((b: any) => b.course_id === selectedCourseId)
          setBatches(matched)
        }
      } catch (e) {
        console.warn('Could not fetch batches from backend:', e)
      }
    }

    fetchBatches()
  }, [selectedCourseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedCourseId) {
      setError('Please select a course for admission.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: formData.student_name,
          parent_name: formData.parent_name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          course_id: selectedCourseId,
          batch_id: selectedBatchId || null,
          documents: uploadedDocuments,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit admission application')
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error('Admission submission error:', err)
      setError(err?.message || 'Failed to submit admission application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            Admissions Open
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Student Enrollment Form
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Submit your details below to apply for upcoming academic sessions at {settings.institute_name}.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Application Submitted Successfully!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
              Your application is under review with status <strong className="text-amber-500">Pending</strong>. Our admissions counselor will contact you and your parents shortly regarding batch confirmation, fee schedule, and orientation details.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <a
                href="/"
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700 transition"
              >
                Return to Home
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setFormData({
                    student_name: '',
                    parent_name: '',
                    phone: '',
                    email: '',
                    address: '',
                  })
                  setUploadedDocuments([])
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xl space-y-10"
          >
            {/* Section 1: Student Information */}
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-6">
                <User className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  1. Student Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Enter student's legal name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parent_name}
                    onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="Parent or Guardian name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="e.g. student@example.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    placeholder="House/Street, City, Postal Code"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Course & Batch Selection */}
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-6">
                <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  2. Course & Batch Preference
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Course *
                  </label>
                  <select
                    required
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value)
                      setSelectedBatchId('')
                    }}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} {c.category ? `(${c.category})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Batch
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    disabled={!selectedCourseId || batches.length === 0}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-600 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">
                      {!selectedCourseId
                        ? '-- Choose a course first --'
                        : batches.length === 0
                        ? '-- No active batches (General Application) --'
                        : '-- Select Batch --'}
                    </option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.schedule || 'Regular'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Document Uploads */}
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-6">
                <FileCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  3. Verification Documents (Optional)
                </h3>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Upload previous mark sheets, student photo, or ID proof (PDF or image).
              </p>

              <FileUpload
                bucket="documents"
                folder="admissions"
                isDocument={true}
                accept="application/pdf,image/*"
                helperText="Upload mark sheet or student ID (PDF, JPG, PNG)"
                onUploadSuccess={(res) => {
                  setUploadedDocuments((prev) => [...prev, res.url])
                }}
              />

              {uploadedDocuments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {uploadedDocuments.map((docUrl, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Document {idx + 1} attached
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-500 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-bold text-sm text-emerald-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting Application...' : 'Submit Admission Application'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
