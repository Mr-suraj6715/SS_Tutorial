import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/batches
router.get('/', (req: Request, res: Response) => {
  const sql = `
    SELECT b.*, c.title as course_title, c.board, c.target_class,
      u.full_name as teacher_name,
      (SELECT COUNT(*) FROM batch_enrollments WHERE batch_id = b.id) as enrolled
    FROM batches b
    LEFT JOIN courses c ON c.id = b.course_id
    LEFT JOIN users u ON u.id = b.teacher_id
    WHERE b.is_active = 1 ORDER BY b.created_at DESC`;
  const batches = query(sql);
  res.json({ batches });
});


// GET /api/batches/:id
router.get('/:id', (req: Request, res: Response) => {
  const batch = get(`SELECT b.*, c.title as course_title, c.board, c.target_class, u.full_name as teacher_name
    FROM batches b LEFT JOIN courses c ON c.id = b.course_id LEFT JOIN users u ON u.id = b.teacher_id
    WHERE b.id = ?`, [req.params.id]);
  if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }
  const students = query(`SELECT u.id, u.full_name, u.email, s.roll_no, s.class_name, be.enrolled_at
    FROM batch_enrollments be JOIN users u ON u.id = be.student_id JOIN students s ON s.id = be.student_id
    WHERE be.batch_id = ?`, [req.params.id]);
  res.json({ batch, students });
});

// POST /api/batches  (admin)
router.post('/', authorize('admin'), (req: Request, res: Response) => {
  const { course_id, name, schedule, start_date, end_date, capacity, teacher_id } = req.body;
  if (!course_id || !name) { res.status(400).json({ error: 'course_id and name are required' }); return; }
  const id = 'b-' + Date.now();
  run('INSERT INTO batches (id, course_id, name, schedule, start_date, end_date, capacity, teacher_id) VALUES (?,?,?,?,?,?,?,?)',
    [id, course_id, name, schedule || '', start_date || null, end_date || null, capacity || 30, teacher_id || null]);
  res.status(201).json({ batch: get('SELECT * FROM batches WHERE id = ?', [id]) });
});

// PATCH /api/batches/:id  (admin)
router.patch('/:id', authorize('admin'), (req: Request, res: Response) => {
  const batch = get<any>('SELECT id FROM batches WHERE id = ?', [req.params.id]);
  if (!batch) { res.status(404).json({ error: 'Batch not found' }); return; }
  const fields = ['name','schedule','start_date','end_date','capacity','teacher_id','is_active'];
  const updates: string[] = []; const vals: any[] = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(f + ' = ?'); vals.push(req.body[f]); } }
  if (!updates.length) { res.status(400).json({ error: 'No fields to update' }); return; }
  vals.push(req.params.id);
  run('UPDATE batches SET ' + updates.join(', ') + ' WHERE id = ?', vals);
  res.json({ batch: get('SELECT * FROM batches WHERE id = ?', [req.params.id]) });
});

// POST /api/batches/:id/enroll  (admin)
router.post('/:id/enroll', authorize('admin'), (req: Request, res: Response) => {
  const { student_id } = req.body;
  if (!student_id) { res.status(400).json({ error: 'student_id is required' }); return; }
  const existing = get('SELECT id FROM batch_enrollments WHERE batch_id = ? AND student_id = ?', [req.params.id, student_id]);
  if (existing) { res.status(409).json({ error: 'Student already enrolled' }); return; }
  const id = 'be-' + Date.now();
  run('INSERT INTO batch_enrollments (id, batch_id, student_id) VALUES (?,?,?)', [id, req.params.id, student_id]);
  res.status(201).json({ message: 'Enrolled successfully' });
});

export default router;