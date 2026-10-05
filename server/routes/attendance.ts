import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/attendance
router.get('/', (req: Request, res: Response) => {
  const { batch_id, student_id, date, month } = req.query;
  let sql = `SELECT a.*, u.full_name as student_name FROM attendance a JOIN users u ON u.id = a.student_id WHERE 1=1`;
  const params: any[] = [];
  if (batch_id) { sql += ' AND a.batch_id = ?'; params.push(batch_id); }
  if (req.user!.role === 'student') { sql += ' AND a.student_id = ?'; params.push(req.user!.id); }
  else if (student_id) { sql += ' AND a.student_id = ?'; params.push(student_id); }
  if (date) { sql += ' AND a.date = ?'; params.push(date); }
  if (month) { sql += ' AND strftime(\'%Y-%m\', a.date) = ?'; params.push(month); }
  sql += ' ORDER BY a.date DESC';
  res.json({ attendance: query(sql, params) });
});

// POST /api/attendance  (teacher / admin)
router.post('/', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  const { batch_id, date, records } = req.body;
  // records: [{ student_id, status, remarks }]
  if (!batch_id || !date || !Array.isArray(records)) {
    res.status(400).json({ error: 'batch_id, date, and records[] are required' }); return;
  }
  for (const r of records) {
    const existing = get<any>('SELECT id FROM attendance WHERE batch_id = ? AND student_id = ? AND date = ?', [batch_id, r.student_id, date]);
    if (existing) {
      run('UPDATE attendance SET status = ?, remarks = ?, marked_by = ? WHERE id = ?',
        [r.status, r.remarks || null, req.user!.id, existing.id]);
    } else {
      const id = 'att-' + Date.now() + '-' + r.student_id;
      run('INSERT INTO attendance (id, student_id, batch_id, date, status, remarks, marked_by) VALUES (?,?,?,?,?,?,?)',
        [id, r.student_id, batch_id, date, r.status, r.remarks || null, req.user!.id]);
    }
  }
  res.json({ message: 'Attendance recorded', count: records.length });
});

// GET /api/attendance/summary/:student_id
router.get('/summary/:student_id', (req: Request, res: Response) => {
  if (req.user!.role === 'student' && req.user!.id !== req.params.student_id) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }
  const total = query<any>('SELECT status, COUNT(*) as count FROM attendance WHERE student_id = ? GROUP BY status', [req.params.student_id]);
  const recent = query('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 30', [req.params.student_id]);
  res.json({ summary: total, recent });
});

export default router;