import React, { useEffect, useState } from 'react'
import {
  Users,
  Calendar,
  CreditCard,
  Award,
  LogOut,
  AlertCircle,
  Search,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'

export const ParentDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const [linkedStudents, setLinkedStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [studentDetails, setStudentDetails] = useState<any | null>(null)
  const [attendance, setAttendance] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLinkedStudents = async () => {
      if (!user) return
      try {
        setLoading(true)
        // Check parent_student_links or search admissions by parent email
        const { data: linkData } = await supabase
          .from('parent_student_links')
          .select('*, student:student_id(*)')
          .eq('parent_id', user.id)

        if (linkData && linkData.length > 0) {
          setLinkedStudents(linkData)
          setSelectedStudentId(linkData[0].student_id)
        } else {
          // Fallback: search admissions by parent email to show applicant record
          const { data: admData } = await supabase
            .from('admissions')
            .select('*')
            .eq('email', user.email)

          if (admData) {
            setLinkedStudents(admData)
          }
        }
      } catch (err) {
        console.warn('Error fetching linked student data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLinkedStudents()
  }, [user])

  useEffect(() => {
    const fetchChildRecords = async () => {
      if (!selectedStudentId) return
      try {
        const [attRes, feeRes, resRes] = await Promise.all([
          supabase.from('attendance').select('*, batches(name)').eq('student_id', selectedStudentId),
          supabase.from('fees').select('*, batches(name)').eq('student_id', selectedStudentId),
          supabase.from('results').select('*, exams(title, total_marks, passing_marks, date)').eq('student_id', selectedStudentId),
        ])

        if (attRes.data) setAttendance(attRes.data)
        if (feeRes.data) setFees(feeRes.data)
        if (resRes.data) setResults(resRes.data)
      } catch (err) {
        console.warn('Error fetching child records:', err)
      }
    }

    fetchChildRecords()
  }, [selectedStudentId])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <div className="bg-emerald-950 text-white border-b border-emerald-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold">{profile?.full_name || 'Parent Portal'}</h1>
              <span className="text-xs text-amber-300 font-medium">Parent Dashboard</span>
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Child Performance & Academic Tracker
        </h2>

        {linkedStudents.length > 0 ? (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Select Child
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full sm:w-80 px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              >
                {linkedStudents.map((link) => (
                  <option key={link.id} value={link.student_id || link.id}>
                    {link.student?.full_name || link.student_name || 'Student'}
                  </option>
                ))}
              </select>
            </div>

            {/* Attendance & Fees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Attendance Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" /> Attendance Records
                </h3>
                {attendance.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {attendance.slice(0, 5).map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <span>{new Date(a.date).toLocaleDateString()}</span>
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${a.status === 'present' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'}`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No attendance records logged yet.</p>
                )}
              </div>

              {/* Fees Card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" /> Fee Status & Receipts
                </h3>
                {fees.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    {fees.map((f) => (
                      <div key={f.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div>
                          <p className="font-bold">Total: ₹{f.amount}</p>
                          <p className="text-slate-400">Paid: ₹{f.paid_amount}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${f.status === 'paid' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'}`}>
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No fee records found.</p>
                )}
              </div>

            </div>

            {/* Results */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Assessment Marks & Grades
              </h3>
              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="font-bold text-xs">{r.exams?.title || 'Class Test'}</h4>
                        <p className="text-[11px] text-slate-400">Passing: {r.exams?.passing_marks} marks</p>
                      </div>
                      <span className="text-sm font-extrabold text-amber-500">
                        {r.marks_obtained} / {r.exams?.total_marks || 100}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No test results posted yet.</p>
              )}
            </div>

          </div>
        ) : (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-200 font-bold text-base">
              No linked student accounts found.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Please provide your student's admission roll number to the institute administrator to link accounts.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
