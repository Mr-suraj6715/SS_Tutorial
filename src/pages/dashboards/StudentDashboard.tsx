import React, { useEffect, useState } from 'react'
import {
  User,
  Calendar,
  CreditCard,
  Award,
  BookOpen,
  Download,
  CheckCircle2,
  Clock,
  LogOut,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'

export const StudentDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'results' | 'materials'>('overview')
  const [attendance, setAttendance] = useState<any[]>([])
  const [fees, setFees] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return
      try {
        setLoading(true)
        const [attRes, feeRes, resRes, matRes] = await Promise.all([
          supabase.from('attendance').select('*, batches(name)').eq('student_id', user.id).order('date', { ascending: false }),
          supabase.from('fees').select('*, batches(name)').eq('student_id', user.id),
          supabase.from('results').select('*, exams(title, total_marks, passing_marks, date)').eq('student_id', user.id),
          supabase.from('study_materials').select('*, batches(name)').order('uploaded_at', { ascending: false }),
        ])

        if (attRes.data) setAttendance(attRes.data)
        if (feeRes.data) setFees(feeRes.data)
        if (resRes.data) setResults(resRes.data)
        if (matRes.data) setMaterials(matRes.data)
      } catch (err) {
        console.warn('Error loading student dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [user])

  const totalClasses = attendance.length
  const presentClasses = attendance.filter((a) => a.status === 'present').length
  const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      
      {/* Dashboard Top Header */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
              {profile?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 className="text-base font-bold">{profile?.full_name || 'Student Portal'}</h1>
              <span className="text-xs text-amber-300 font-medium">Student Dashboard</span>
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
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'attendance', label: 'Attendance', icon: Calendar },
            { id: 'fees', label: 'Fees & Dues', icon: CreditCard },
            { id: 'results', label: 'Exam Results', icon: Award },
            { id: 'materials', label: 'Study Materials', icon: BookOpen },
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

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Attendance Rate</p>
                <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">
                  {attendancePct}%
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {presentClasses} of {totalClasses} classes attended
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Exams Taken</p>
                <p className="text-3xl font-extrabold text-amber-500 mt-2">
                  {results.length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Evaluated assessments</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Study Materials</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {materials.length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Downloadable documents</p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Student Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Full Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{profile?.full_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Registered Email</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{user?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Contact Phone</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{profile?.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Role Status</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    Active Student
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance */}
        {activeTab === 'attendance' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Attendance Log</h3>
            {attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Batch</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {attendance.map((row) => (
                      <tr key={row.id}>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(row.date).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-slate-500">{row.batches?.name || 'Class Batch'}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              row.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : row.status === 'late'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No attendance records logged yet.</p>
            )}
          </div>
        )}

        {/* Tab 3: Fees */}
        {activeTab === 'fees' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Fee Invoices & Dues</h3>
            {fees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">Batch</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Paid Amount</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {fees.map((f) => (
                      <tr key={f.id}>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{f.batches?.name || 'Academic Batch'}</td>
                        <td className="p-3 font-bold">₹{f.amount}</td>
                        <td className="p-3 text-emerald-600 font-bold">₹{f.paid_amount}</td>
                        <td className="p-3 text-slate-500">{f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No fee records found.</p>
            )}
          </div>
        )}

        {/* Tab 4: Results */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Academic Results</h3>
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {r.exams?.title || 'Assessment Test'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Date: {r.exams?.date ? new Date(r.exams.date).toLocaleDateString() : 'Recent'} | Passing: {r.exams?.passing_marks}
                      </p>
                      {r.remarks && <p className="text-xs text-emerald-600 mt-1">Remark: {r.remarks}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-amber-500">
                        {r.marks_obtained} / {r.exams?.total_marks || 100}
                      </span>
                      {r.grade && (
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Grade: {r.grade}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No examination results posted yet.</p>
            )}
          </div>
        )}

        {/* Tab 5: Study Materials */}
        {activeTab === 'materials' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Downloadable Study Materials</h3>
            {materials.length > 0 ? (
              <div className="space-y-3">
                {materials.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</h4>
                        {m.description && <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>}
                      </div>
                    </div>
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-600 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No study materials uploaded for your batch yet.</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
