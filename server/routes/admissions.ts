import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { eventBroadcaster } from '../services/events.js';

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

  if (!student_name || typeof student_name !== 'string' || student_name.trim().length < 2) {
    res.status(400).json({ error: 'Please enter the student full legal name (at least 2 characters).' });
    return;
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
    res.status(400).json({ error: 'Please enter a valid contact phone number.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  if (!course_id) {
    res.status(400).json({ error: 'Please select an academic course for admission.' });
    return;
  }

  // Prevent immediate duplicate submissions (same email & phone in the last 2 minutes)
  const existingRecent = get<any>(
    `SELECT id FROM admissions 
     WHERE email = ? AND phone = ? AND applied_at > datetime('now', '-2 minutes')`,
    [email.trim().toLowerCase(), phone.trim()]
  );
  if (existingRecent) {
    res.status(429).json({ error: 'An admission application was already submitted recently. Please wait a few moments.' });
    return;
  }

  let validCourseId = null;
  if (course_id) {
    const c = get('SELECT id FROM courses WHERE id = ?', [course_id]);
    if (c) validCourseId = course_id;
  }

  let validBatchId = null;
  if (batch_id) {
    const b = get('SELECT id FROM batches WHERE id = ?', [batch_id]);
    if (b) validBatchId = batch_id;
  }

  const id = 'adm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  run(
    `INSERT INTO admissions (
      id, student_name, parent_name, phone, email, address,
      course_id, batch_id, target_class, board, previous_marks, documents, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      student_name.trim(),
      parent_name?.trim() || '',
      phone.trim(),
      email.trim().toLowerCase(),
      address?.trim() || '',
      validCourseId,
      validBatchId,
      target_class || 'Class 10',
      board || 'SSC',
      previous_marks || '',
      typeof documents === 'string' ? documents : JSON.stringify(documents || []),
    ]
  );

  const created = get(
    `SELECT a.*, c.title as course_title, b.name as batch_name 
     FROM admissions a 
     LEFT JOIN courses c ON c.id = a.course_id 
     LEFT JOIN batches b ON b.id = a.batch_id 
     WHERE a.id = ?`,
    [id]
  );

  // Real-time broadcast to connected admin dashboards
  eventBroadcaster.broadcast({
    type: 'admission_created',
    data: created,
  });

  res.status(201).json({ admission: created, message: 'Application submitted successfully' });
});

// GET /api/admissions (admin only)
router.get('/', authenticate, authorize('admin'), (_req: Request, res: Response) => {
  const sql = `
    SELECT a.*, c.title as course_title, b.name as batch_name, u.full_name as reviewer_name
    FROM admissions a
    LEFT JOIN courses c ON c.id = a.course_id
    LEFT JOIN batches b ON b.id = a.batch_id
    LEFT JOIN users u ON u.id = a.reviewed_by
    ORDER BY a.applied_at DESC
  `;
  const admissions = query(sql);
  res.json({ admissions });
});

// GET /api/admissions/:id (admin only: view full details)
router.get('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const sql = `
    SELECT a.*, c.title as course_title, b.name as batch_name, u.full_name as reviewer_name
    FROM admissions a
    LEFT JOIN courses c ON c.id = a.course_id
    LEFT JOIN batches b ON b.id = a.batch_id
    LEFT JOIN users u ON u.id = a.reviewed_by
    WHERE a.id = ?
  `;
  const admission = get(sql, [req.params.id]);
  if (!admission) {
    res.status(404).json({ error: 'Admission application not found' });
    return;
  }
  res.json({ admission });
});

// PUT & PATCH /api/admissions/:id & /:id/status (admin only: approve / reject / status update)
const updateAdmissionStatus = (req: Request, res: Response) => {
  const { status, rejection_reason } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  const existing = get<any>('SELECT id FROM admissions WHERE id = ?', [req.params.id]);
  if (!existing) {
    res.status(404).json({ error: 'Admission application not found' });
    return;
  }

  run(
    `UPDATE admissions 
     SET status = ?, rejection_reason = ?, reviewed_by = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [status, rejection_reason || null, req.user!.id, req.params.id]
  );

  const updated = get(
    `SELECT a.*, c.title as course_title, b.name as batch_name, u.full_name as reviewer_name
     FROM admissions a
     LEFT JOIN courses c ON c.id = a.course_id
     LEFT JOIN batches b ON b.id = a.batch_id
     LEFT JOIN users u ON u.id = a.reviewed_by
     WHERE a.id = ?`,
    [req.params.id]
  );

  // Real-time broadcast
  eventBroadcaster.broadcast({
    type: 'admission_updated',
    data: updated,
  });

  res.json({ admission: updated, message: `Application marked as ${status}` });
};
router.patch('/:id', authenticate, authorize('admin'), updateAdmissionStatus);
router.put('/:id', authenticate, authorize('admin'), updateAdmissionStatus);
router.patch('/:id/status', authenticate, authorize('admin'), updateAdmissionStatus);
router.put('/:id/status', authenticate, authorize('admin'), updateAdmissionStatus);

// DELETE /api/admissions/:id (admin only)
router.delete('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const existing = get<any>('SELECT id FROM admissions WHERE id = ?', [req.params.id]);
  if (!existing) {
    res.status(404).json({ error: 'Admission application not found' });
    return;
  }
  run('DELETE FROM admissions WHERE id = ?', [req.params.id]);

  // Real-time broadcast
  eventBroadcaster.broadcast({
    type: 'admission_deleted',
    data: { id: req.params.id },
  });

  res.json({ message: 'Admission application deleted', id: req.params.id });
});

export default router;