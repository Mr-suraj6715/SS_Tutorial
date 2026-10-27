import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/batches
router.get('/', (req: Request, res: Response) => {
  const { all } = req.query;
  let sql = `
    SELECT b.*, c.title as course_title, c.board, c.target_class,
      u.full_name as teacher_name,
      (SELECT COUNT(*) FROM batch_enrollments WHERE batch_id = b.id) as enrolled
    FROM batches b
    LEFT JOIN courses c ON c.id = b.course_id
    LEFT JOIN users u ON u.id = b.teacher_id
  `;
  if (!all) {
    sql += ' WHERE b.is_active = 1';
  }
  sql += ' ORDER BY b.created_at DESC';
  const batches = query(sql);
  res.json({ batches });
});

// GET /api/batches/:id
router.get('/:id', (req: Request, res: Response) => {
  const batch = get(
    `SELECT b.*, c.title as course_title, c.board, c.target_class, u.full_name as teacher_name
     FROM batches b 
     LEFT JOIN courses c ON c.id = b.course_id 
     LEFT JOIN users u ON u.id = b.teacher_id
     WHERE b.id = ?`,
    [req.params.id]
  );
  if (!batch) {
    res.status(404).json({ error: 'Batch not found' });
    return;
  }
  const students = query(
    `SELECT u.id, u.full_name, u.email, u.phone, s.roll_no, s.class_name, be.enrolled_at
     FROM batch_enrollments be 
     JOIN users u ON u.id = be.student_id 
     LEFT JOIN students s ON s.id = be.student_id
     WHERE be.batch_id = ?
     ORDER BY u.full_name ASC`,
    [req.params.id]
  );
  res.json({ batch, students });
});

// POST /api/batches  (admin)
router.post('/', authorize('admin'), (req: Request, res: Response) => {
  const { course_id, name, schedule, start_date, end_date, capacity, teacher_id } = req.body;
  if (!course_id || !name || !name.trim()) {
    res.status(400).json({ error: 'course_id and batch name are required' });
    return;
  }

  const course = get('SELECT id FROM courses WHERE id = ?', [course_id]);
  if (!course) {
    res.status(400).json({ error: 'Selected course does not exist' });
    return;
  }

  const id = 'b-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  run(
    `INSERT INTO batches (id, course_id, name, schedule, start_date, end_date, capacity, teacher_id, is_active) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      id,
      course_id,
      name.trim(),
      schedule || '',
      start_date || null,
      end_date || null,
      Number(capacity) || 30,
      teacher_id || null,
    ]
  );

  const created = get('SELECT * FROM batches WHERE id = ?', [id]);
  res.status(201).json({ batch: created, message: 'Batch created successfully' });
});

// PUT & PATCH /api/batches/:id  (admin)
const updateBatchHandler = (req: Request, res: Response) => {
  const batch = get<any>('SELECT id FROM batches WHERE id = ?', [req.params.id]);
  if (!batch) {
    res.status(404).json({ error: 'Batch not found' });
    return;
  }

  const fields = ['course_id', 'name', 'schedule', 'start_date', 'end_date', 'capacity', 'teacher_id', 'is_active'];
  const updates: string[] = [];
  const vals: any[] = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'capacity') {
        vals.push(Number(req.body[f]) || 30);
      } else if (f === 'is_active') {
        vals.push(req.body[f] ? 1 : 0);
      } else {
        vals.push(req.body[f]);
      }
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields provided to update' });
    return;
  }

  vals.push(req.params.id);
  run(`UPDATE batches SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, vals);

  const updated = get('SELECT * FROM batches WHERE id = ?', [req.params.id]);
  res.json({ batch: updated, message: 'Batch updated successfully' });
};
router.put('/:id', authorize('admin'), updateBatchHandler);
router.patch('/:id', authorize('admin'), updateBatchHandler);

// DELETE /api/batches/:id  (admin)
router.delete('/:id', authorize('admin'), (req: Request, res: Response) => {
  const batch = get<any>('SELECT id FROM batches WHERE id = ?', [req.params.id]);
  if (!batch) {
    res.status(404).json({ error: 'Batch not found' });
    return;
  }

  run('DELETE FROM batches WHERE id = ?', [req.params.id]);
  res.json({ message: 'Batch deleted successfully' });
});

// POST /api/batches/:id/enroll  (admin)
router.post('/:id/enroll', authorize('admin'), (req: Request, res: Response) => {
  const { student_id } = req.body;
  if (!student_id) {
    res.status(400).json({ error: 'student_id is required' });
    return;
  }

  const batch = get<any>('SELECT id, capacity FROM batches WHERE id = ?', [req.params.id]);
  if (!batch) {
    res.status(404).json({ error: 'Batch not found' });
    return;
  }

  const student = get<any>('SELECT id FROM users WHERE id = ?', [student_id]);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const existing = get('SELECT id FROM batch_enrollments WHERE batch_id = ? AND student_id = ?', [
    req.params.id,
    student_id,
  ]);
  if (existing) {
    res.status(409).json({ error: 'Student is already enrolled in this batch' });
    return;
  }

  const id = 'be-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  run('INSERT INTO batch_enrollments (id, batch_id, student_id) VALUES (?, ?, ?)', [
    id,
    req.params.id,
    student_id,
  ]);

  res.status(201).json({ message: 'Student enrolled successfully' });
});

// DELETE /api/batches/:id/enroll/:student_id  (admin)
router.delete('/:id/enroll/:student_id', authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM batch_enrollments WHERE batch_id = ? AND student_id = ?', [
    req.params.id,
    req.params.student_id,
  ]);
  res.json({ message: 'Student removed from batch successfully' });
});

export default router;