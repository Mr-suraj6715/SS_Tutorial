import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/exams
router.get('/', (req: Request, res: Response) => {
  const { batch_id } = req.query;
  let sql = 'SELECT e.*, b.name as batch_name FROM exams e LEFT JOIN batches b ON b.id = e.batch_id WHERE 1=1';
  const params: any[] = [];
  if (batch_id) { sql += ' AND e.batch_id = ?'; params.push(batch_id); }
  if (req.user!.role !== 'admin' && req.user!.role !== 'teacher') {
    sql += ' AND e.is_published = 1';
  }
  sql += ' ORDER BY e.date DESC';
  res.json({ exams: query(sql, params) });
});

// POST /api/exams  (teacher / admin)
router.post('/', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  const { batch_id, title, subject_id, date, total_marks, passing_marks } = req.body;
  if (!batch_id || !title || !date || !total_marks) { res.status(400).json({ error: 'batch_id, title, date, total_marks required' }); return; }
  const id = 'exam-' + Date.now();
  run('INSERT INTO exams (id, batch_id, title, subject_id, date, total_marks, passing_marks, created_by) VALUES (?,?,?,?,?,?,?,?)',
    [id, batch_id, title, subject_id || null, date, total_marks, passing_marks || Math.round(total_marks * 0.4), req.user!.id]);
  res.status(201).json({ exam: get('SELECT * FROM exams WHERE id = ?', [id]) });
});

// PATCH /api/exams/:id/publish  (admin / teacher)
router.patch('/:id/publish', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  run('UPDATE exams SET is_published = 1 WHERE id = ?', [req.params.id]);
  res.json({ message: 'Exam published' });
});

// ── Results ────────────────────────────────────────────────────────────────
// GET /api/exams/:id/results
router.get('/:id/results', (req: Request, res: Response) => {
  const exam = get<any>('SELECT * FROM exams WHERE id = ?', [req.params.id]);
  if (!exam) { res.status(404).json({ error: 'Exam not found' }); return; }
  let sql = `SELECT r.*, u.full_name as student_name FROM results r JOIN users u ON u.id = r.student_id WHERE r.exam_id = ?`;
  const params: any[] = [req.params.id];
  if (req.user!.role === 'student') { sql += ' AND r.student_id = ? AND r.is_published = 1'; params.push(req.user!.id); }
  res.json({ exam, results: query(sql, params) });
});

// POST /api/exams/:id/results  (teacher / admin)
router.post('/:id/results', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  const { results } = req.body; // [{ student_id, marks_obtained, grade, remarks }]
  if (!Array.isArray(results)) { res.status(400).json({ error: 'results[] required' }); return; }
  const exam = get<any>('SELECT * FROM exams WHERE id = ?', [req.params.id]);
  if (!exam) { res.status(404).json({ error: 'Exam not found' }); return; }
  for (const r of results) {
    const existing = get<any>('SELECT id FROM results WHERE exam_id = ? AND student_id = ?', [req.params.id, r.student_id]);
    if (existing) {
      run('UPDATE results SET marks_obtained = ?, grade = ?, remarks = ? WHERE id = ?',
        [r.marks_obtained, r.grade || null, r.remarks || null, existing.id]);
    } else {
      const id = 'res-' + Date.now() + '-' + r.student_id;
      run('INSERT INTO results (id, exam_id, student_id, marks_obtained, grade, remarks) VALUES (?,?,?,?,?,?)',
        [id, req.params.id, r.student_id, r.marks_obtained, r.grade || null, r.remarks || null]);
    }
  }
  res.json({ message: 'Results saved', count: results.length });
});

// PATCH /api/exams/:id/results/publish  (admin / teacher)
router.patch('/:id/results/publish', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  run('UPDATE results SET is_published = 1 WHERE exam_id = ?', [req.params.id]);
  res.json({ message: 'Results published' });
});

export default router;