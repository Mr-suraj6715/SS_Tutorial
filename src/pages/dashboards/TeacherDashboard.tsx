import React, { useEffect, useState } from 'react'
import {
  Users,
  Calendar,
  BookOpen,
  Award,
  Upload,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Plus,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { FileUpload } from '@/components/media/FileUpload'

export const TeacherDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'batches' | 'attendance' | 'materials' | 'results'>('batches')
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [students, setStudents] = useState<any[]>([])
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'late'>>({})
  const [savedMsg, setSavedMsg] = useState('')

  // Material upload state
  const [materialTitle, setMaterialTitle] = useState('')
  const [materialDesc, setMaterialDesc] = useState('')
  const [uploadedFileUrl, setUploadedFileUrl] = useState('')

  // Results state
  const [exams, setExams] = useState<any[]>([])
  const [selectedExamId, setSelectedExamId] = useState('')
  const [marksState, setMarksState] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchTeacherBatches = async () => {
      if (!user) return
      try {
        const { data } = await supabase
          .from('batches')
          .select('*, courses(title)')
          .eq('is_active', true)

        if (data && data.length > 0) {
          setBatches(data)
          setSelectedBatchId(data[0].id)
        }
      } catch (err) {
        console.warn('Error fetching teacher batches:', err)
      }
    }

    fetchTeacherBatches()
  }, [user])

  // Fetch enrolled students for selected batch
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedBatchId) return
      try {
        const { data } = await supabase
          .from('batch_enrollments')
          .select('*, profiles:student_id(*)')
          .eq('batch_id', selectedBatchId)

        if (data) {
          setStudents(data.map((d) => d.profiles).filter(Boolean))
          // Pre-populate attendance state with present
          const initialAtt: Record<string, 'present' | 'absent' | 'late'> = {}
          data.forEach((d) => {
            if (d.profiles?.id) initialAtt[d.profiles.id] = 'present'
          })
          setAttendanceState(initialAtt)
        }

        // Fetch exams for this batch
        const { data: examData } = await supabase
          .from('exams')
          .select('*')
          .eq('batch_id', selectedBatchId)

        if (examData) {
          setExams(examData)
          if (examData.length > 0) setSelectedExamId(examData[0].id)
        }
      } catch (err) {
        console.warn('Error fetching batch students/exams:', err)
      }
    }

    fetchStudents()
  }, [selectedBatchId])

  const handleSaveAttendance = async () => {
    setSavedMsg('')
    try {
      const records = Object.entries(attendanceState).map(([studentId, status]) => ({
        batch_id: selectedBatchId,
        student_id: studentId,
        date: attendanceDate,
        status,
        marked_by: user?.id,
      }))

      for (const rec of records) {
        await supabase.from('attendance').upsert(rec, {
          onConflict: 'student_id,batch_id,date',
        })
      }

      setSavedMsg('Attendance saved successfully!')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch (err) {
      console.error('Failed to record attendance:', err)
    }
  }

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadedFileUrl || !selectedBatchId || !materialTitle) return

    try {
      await supabase.from('study_materials').insert({
        batch_id: selectedBatchId,
        title: materialTitle,
        description: materialDesc,
        file_url: uploadedFileUrl,
        uploaded_by: user?.id,
      })

      setMaterialTitle('')
      setMaterialDesc('')
      setUploadedFileUrl('')
      setSavedMsg('Study material published!')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch (err) {
      console.error('Failed to upload study material:', err)
    }
  }

  const handleSaveMarks = async () => {
    if (!selectedExamId) return
    try {
      for (const [studentId, marks] of Object.entries(marksState)) {
        await supabase.from('results').upsert(
          {
            exam_id: selectedExamId,
            student_id: studentId,
            marks_obtained: marks,
          },
          { onConflict: 'exam_id,student_id' }
        )
      }
      setSavedMsg('Exam marks saved successfully!')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch (err) {
      console.error('Failed to save exam marks:', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Header */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold">{profile?.full_name || 'Faculty Portal'}</h1>
              <span className="text-xs text-amber-300 font-medium">Teacher Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/" className="text-xs text-emerald-200 hover:text-white transition">
              Back to Website
            </a>
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-900 hover:bg-emerald-800 text-emerald-200"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'batches', label: 'My Batches', icon: Users },
            { id: 'attendance', label: 'Mark Attendance', icon: Calendar },
            { id: 'materials', label: 'Upload Materials', icon: Upload },
            { id: 'results', label: 'Enter Exam Marks', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {savedMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {savedMsg}
          </div>
        )}

        {/* Tab 1: Batches */}
        {activeTab === 'batches' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assigned Academic Batches</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {batches.map((b) => (
                <div key={b.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">
                    {b.courses?.title || 'Academic Course'}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">{b.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Schedule: {b.schedule || 'Regular'}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Capacity: {b.capacity}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBatchId(b.id)
                        setActiveTab('attendance')
                      }}
                      className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Mark Attendance →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Mark Attendance */}
        {activeTab === 'attendance' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Daily Attendance Marking</h3>
                <p className="text-xs text-slate-400">Select batch and date to record attendance</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                </input>
              </div>
            </div>

            {students.length > 0 ? (
              <div className="space-y-3">
                {students.map((st) => (
                  <div key={st.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{st.full_name}</p>
                      <p className="text-xs text-slate-400">{st.phone || 'No phone'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {(['present', 'absent', 'late'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setAttendanceState({ ...attendanceState, [st.id]: status })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                            attendanceState[st.id] === status
                              ? status === 'present'
                                ? 'bg-emerald-600 text-white'
                                : status === 'late'
                                ? 'bg-amber-500 text-white'
                                : 'bg-red-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700 transition mt-4"
                >
                  Save Batch Attendance
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No students currently enrolled in this batch.</p>
            )}
          </div>
        )}

        {/* Tab 3: Upload Materials */}
        {activeTab === 'materials' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm max-w-2xl space-y-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upload Class Study Material</h3>
            <form onSubmit={handleUploadMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Target Batch</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Practice Questions & Notes"
                  className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={materialDesc}
                  onChange={(e) => setMaterialDesc(e.target.value)}
                  placeholder="Brief note on topic coverage..."
                  className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <FileUpload
                bucket="documents"
                folder="materials"
                isDocument={true}
                label="Study Material File (PDF, DOCX)"
                onUploadSuccess={(res) => setUploadedFileUrl(res.url)}
              />

              <button
                type="submit"
                disabled={!uploadedFileUrl || !materialTitle}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                Publish Study Material
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Enter Exam Marks */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Exam Score Entry</h3>
                <p className="text-xs text-slate-400">Enter evaluated marks for batch students</p>
              </div>

              {exams.length > 0 && (
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.title} (Max: {ex.total_marks})</option>
                  ))}
                </select>
              )}
            </div>

            {exams.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No exams configured for this batch yet. Admin can create exams.</p>
            ) : students.length > 0 ? (
              <div className="space-y-3">
                {students.map((st) => (
                  <div key={st.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{st.full_name}</p>
                    <input
                      type="number"
                      placeholder="Marks"
                      value={marksState[st.id] ?? ''}
                      onChange={(e) => setMarksState({ ...marksState, [st.id]: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 text-xs text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleSaveMarks}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs text-white bg-emerald-800 hover:bg-emerald-700 transition mt-4"
                >
                  Save Exam Results
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No students found.</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
