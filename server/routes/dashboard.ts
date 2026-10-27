import { Router, Request, Response } from 'express';
import { query, get } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { eventBroadcaster } from '../services/events.js';

const router = Router();
router.use(authenticate);

// GET /api/dashboard/live-stream  (admin real-time SSE stream)
router.get('/live-stream', authorize('admin'), (_req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }
  eventBroadcaster.addClient(res);
});

export function fetchDashboardStats() {
  const totalStudents = (get<any>('SELECT COUNT(*) as c FROM users WHERE role = ?', ['student']) as any)?.c ?? 0;
  const totalTeachers = (get<any>('SELECT COUNT(*) as c FROM users WHERE role = ?', ['teacher']) as any)?.c ?? 0;
  const totalUsers    = (get<any>('SELECT COUNT(*) as c FROM users') as any)?.c ?? 0;
  const totalCourses  = (get<any>('SELECT COUNT(*) as c FROM courses WHERE is_active = 1') as any)?.c ?? 0;
  const totalBatches  = (get<any>('SELECT COUNT(*) as c FROM batches WHERE is_active = 1') as any)?.c ?? 0;
  const totalSubjects = (get<any>('SELECT COUNT(*) as c FROM subjects WHERE is_active = 1') as any)?.c ?? 0;
  const totalFees     = (get<any>('SELECT SUM(amount) as t FROM fees') as any)?.t ?? 0;
  const collectedFees = (get<any>('SELECT SUM(paid_amount) as t FROM fees') as any)?.t ?? 0;
  const pendingFeesCount = (get<any>('SELECT COUNT(*) as c FROM fees WHERE status IN (\'unpaid\', \'partial\')') as any)?.c ?? 0;
  const pendingAdmissions = (get<any>('SELECT COUNT(*) as c FROM admissions WHERE status = \'pending\'') as any)?.c ?? 0;
  const totalGallery  = (get<any>('SELECT COUNT(*) as c FROM gallery') as any)?.c ?? 0;
  const unreadMessages = (get<any>('SELECT COUNT(*) as c FROM messages WHERE is_read = 0') as any)?.c ?? 0;
  const totalExams    = (get<any>('SELECT COUNT(*) as c FROM exams') as any)?.c ?? 0;
  const totalBlogs    = (get<any>('SELECT COUNT(*) as c FROM blogs') as any)?.c ?? 0;

  return {
    totalStudents,
    totalTeachers,
    totalUsers,
    totalCourses,
    totalBatches,
    totalSubjects,
    totalFees,
    collectedFees,
    pendingFees: pendingFeesCount,
    pendingAdmissions,
    totalGallery,
    unreadMessages,
    totalExams,
    totalBlogs,
  };
}

// GET /api/dashboard/stats  (admin)
router.get('/stats', authorize('admin'), (_req: Request, res: Response) => {
  const stats = fetchDashboardStats();

  const recentAdmissions = query(`
    SELECT a.*, c.title as course_title 
    FROM admissions a 
    LEFT JOIN courses c ON c.id = a.course_id 
    ORDER BY a.applied_at DESC 
    LIMIT 5
  `);
  const upcomingExams = query(`
    SELECT e.*, b.name as batch_name 
    FROM exams e 
    LEFT JOIN batches b ON b.id = e.batch_id 
    ORDER BY e.date ASC 
    LIMIT 5
  `);

  res.json({
    stats,
    recentAdmissions,
    upcomingExams,
  });
});

// GET /api/dashboard/teacher  (teacher)
router.get('/teacher', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  const tid = req.user!.id;
  const myBatches = query(
    `SELECT b.*, c.title as course_title, (SELECT COUNT(*) FROM batch_enrollments WHERE batch_id = b.id) as enrolled 
     FROM batches b 
     LEFT JOIN courses c ON c.id = b.course_id 
     WHERE (b.teacher_id = ? OR ? = 'admin') AND b.is_active = 1`,
    [tid, req.user!.role]
  );
  const upcomingExams = query(
    `SELECT e.*, b.name as batch_name 
     FROM exams e 
     LEFT JOIN batches b ON b.id = e.batch_id 
     WHERE (b.teacher_id = ? OR ? = 'admin') AND e.date >= DATE('now') 
     ORDER BY e.date ASC 
     LIMIT 5`,
    [tid, req.user!.role]
  );
  res.json({ batches: myBatches, upcomingExams });
});

// GET /api/dashboard/student  (student)
router.get('/student', authorize('student'), (req: Request, res: Response) => {
  const sid = req.user!.id;
  const profile = get(
    `SELECT u.full_name, u.email, u.phone, s.roll_no, s.class_name, s.board, s.status, s.admission_date 
     FROM students s 
     JOIN users u ON u.id = s.id 
     WHERE s.id = ?`,
    [sid]
  );
  const enrollments = query(
    `SELECT be.*, b.name as batch_name, b.schedule, c.title as course_title 
     FROM batch_enrollments be 
     JOIN batches b ON b.id = be.batch_id 
     JOIN courses c ON c.id = b.course_id 
     WHERE be.student_id = ?`,
    [sid]
  );
  const recentAttendance = query(
    `SELECT a.*, b.name as batch_name 
     FROM attendance a 
     LEFT JOIN batches b ON b.id = a.batch_id 
     WHERE a.student_id = ? 
     ORDER BY a.date DESC 
     LIMIT 30`,
    [sid]
  );
  const recentResults = query(
    `SELECT r.*, e.title as exam_title, e.total_marks, e.passing_marks, e.date 
     FROM results r 
     JOIN exams e ON e.id = r.exam_id 
     WHERE r.student_id = ? AND r.is_published = 1 
     ORDER BY e.date DESC 
     LIMIT 5`,
    [sid]
  );
  const fees = query(
    `SELECT f.*, b.name as batch_name 
     FROM fees f 
     LEFT JOIN batches b ON b.id = f.batch_id 
     WHERE f.student_id = ? 
     ORDER BY f.due_date DESC`,
    [sid]
  );
  const notices = query(
    `SELECT * FROM notices WHERE target_audience IN ('all','student') AND is_published = 1 ORDER BY created_at DESC LIMIT 5`
  );
  const materials = query(
    `SELECT m.* FROM study_materials m JOIN batch_enrollments be ON be.batch_id = m.batch_id WHERE be.student_id = ? ORDER BY m.uploaded_at DESC LIMIT 10`,
    [sid]
  );
  const assignments = query(
    `SELECT a.* FROM assignments a JOIN batch_enrollments be ON be.batch_id = a.batch_id WHERE be.student_id = ? ORDER BY a.due_date ASC`,
    [sid]
  );
  res.json({ profile, enrollments, recentAttendance, recentResults, fees, notices, materials, assignments });
});

// GET /api/dashboard/parent  (parent)
router.get('/parent', authorize('parent'), (req: Request, res: Response) => {
  const pid = req.user!.id;
  const children = query(
    `SELECT u.id, u.full_name, u.email, s.roll_no, s.class_name, s.board, s.status,
            (SELECT COUNT(*) FROM attendance WHERE student_id = u.id AND status = 'present') as present_count,
            (SELECT COUNT(*) FROM attendance WHERE student_id = u.id) as total_count
     FROM parent_student_links psl
     JOIN users u ON u.id = psl.student_id
     JOIN students s ON s.id = u.id
     WHERE psl.parent_id = ?`,
    [pid]
  );
  const notices = query(
    `SELECT * FROM notices WHERE target_audience IN ('all','parent') AND is_published = 1 ORDER BY created_at DESC LIMIT 5`
  );
  res.json({ children, notices, parent_id: pid });
});

export default router;