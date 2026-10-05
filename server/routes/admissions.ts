import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// POST /api/admissions (public: apply for admission)
router.post('/', (req: Request, res: Response) => {
  const {
    student_name,
    parent_name,
    phone,
    email,
    address,
    course_id,
    batch_id,
    target_class,
    board,
    previous_marks,
    documents,
  } = req.body;

  if (!student_name || !phone || !email) {
    res.status(400).json({ error: 'student_name, phone, and email are required' });
    return;
  }

  const id = 'adm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  run(
    `INSERT INTO admissions (
      id, student_name, parent_name, phone, email, address,
      course_id, batch_id, target_class, board, previous_marks, documents, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      student_name,
      parent_name || '',
      phone,
      email,
      address || '',
      course_id || null,
      batch_id || null,
      target_class || 'Class 10',
      board || 'SSC',
      previous_marks || '',
      typeof documents === 'string' ? documents : JSON.stringify(documents || []),
    ]
  );

  const created = get('SELECT * FROM admissions WHERE id = ?', [id]);
  res.status(201).json({ admission: created, message: 'Application submitted successfully' });
});

// GET /api/admissions (admin only)
router.get('/', authenticate, authorize('admin'), (_req: Request, res: Response) => {
  const sql = `
    SELECT a.*, c.title as course_title, b.name as batch_name
    FROM admissions a
    LEFT JOIN courses c ON c.id = a.course_id
    LEFT JOIN batches b ON b.id = a.batch_id
    ORDER BY a.applied_at DESC
  `;
  const admissions = query(sql);
  res.json({ admissions });
});

// PATCH /api/admissions/:id (admin only: approve / reject)
router.patch('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { status, rejection_reason } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  run(
    'UPDATE admissions SET status = ?, rejection_reason = ?, reviewed_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, rejection_reason || null, req.user!.id, req.params.id]
  );

  const updated = get('SELECT * FROM admissions WHERE id = ?', [req.params.id]);
  res.json({ admission: updated });
});

// DELETE /api/admissions/:id (admin only)
router.delete('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM admissions WHERE id = ?', [req.params.id]);
  res.json({ message: 'Admission application deleted' });
});

export default router;