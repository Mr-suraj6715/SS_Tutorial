import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/exams
router.get('/', (req: Request, res: Response) => {
  const { batch_id, all } = req.query;
  let sql = `
    SELECT e.*, b.name as batch_name, s.name as subject_name,
      (SELECT COUNT(*) FROM results WHERE exam_id = e.id) as result_count,
      (SELECT COUNT(*) FROM batch_enrollments WHERE batch_id = e.batch_id) as student_count
    FROM exams e 
    LEFT JOIN batches b ON b.id = e.batch_id 
    LEFT JOIN subjects s ON s.id = e.subject_id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (batch_id) {
    sql += ' AND e.batch_id = ?';
    params.push(batch_id);
  }
  if (!all && req.user!.role !== 'admin' && req.user!.role !== 'teacher') {
    sql += ' AND e.is_published = 1';
  }
  sql += ' ORDER BY e.date DESC, e.created_at DESC';
  res.json({ exams: query(sql, params) });
});

// GET /api/exams/:id
router.get('/:id', (req: Request, res: Response) => {
  const exam = get(
    `SELECT e.*, b.name as batch_name, s.name as subject_name 
     FROM exams e 
     LEFT JOIN batches b ON b.id = e.batch_id 
     LEFT JOIN subjects s ON s.id = e.subject_id
     WHERE e.id = ?`,
    [req.params.id]
  );
  if (!exam) {
    res.status(404).json({ error: 'Exam not found' });
    return;
  }
  res.json({ exam });
});

// POST /api/exams  (teacher / admin)
router.post('/', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  const { batch_id, title, subject_id, date, total_marks, passing_marks } = req.body;
  if (!batch_id || !title || !date || !total_marks) {
    res.status(400).json({ error: 'batch_id, title, date, and total_marks are required' });
    return;
  }

  const totMarks = Number(total_marks);
  const passMarks = passing_marks !== undefined ? Number(passing_marks) : Math.round(totMarks * 0.35);

  const id = 'exam-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  run(
    `INSERT INTO exams (
      id, batch_id, title, subject_id, date, total_marks, passing_marks, is_published, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, batch_id, title.trim(), subject_id || null, date, totMarks, passMarks, req.user!.id]
  );

  const created = get('SELECT * FROM exams WHERE id = ?', [id]);
  res.status(201).json({ exam: created, message: 'Exam scheduled successfully' });
});

// PATCH /api/exams/:id  (admin / teacher: edit exam details)
router.patch('/:id', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  const exam = get<any>('SELECT * FROM exams WHERE id = ?', [req.params.id]);
  if (!exam) {
    res.status(404).json({ error: 'Exam not found' });
    return;
  }

  const fields = ['batch_id', 'title', 'subject_id', 'date', 'total_marks', 'passing_marks', 'is_published'];
  const updates: string[] = [];
  const vals: any[] = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'total_marks' || f === 'passing_marks') {
        vals.push(Number(req.body[f]));
      } else if (f === 'is_published') {
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
  run(`UPDATE exams SET ${updates.join(', ')} WHERE id = ?`, vals);

  const updated = get('SELECT * FROM exams WHERE id = ?', [req.params.id]);
  res.json({ exam: updated, message: 'Exam updated successfully' });
});

// DELETE /api/exams/:id  (admin only)
router.delete('/:id', authorize('admin'), (req: Request, res: Response) => {
  const exam = get<any>('SELECT id FROM exams WHERE id = ?', [req.params.id]);
  if (!exam) {
    res.status(404).json({ error: 'Exam not found' });
    return;
  }

  run('DELETE FROM exams WHERE id = ?', [req.params.id]);
  res.json({ message: 'Exam deleted successfully' });
});

// PATCH /api/exams/:id/publish  (admin / teacher)
router.patch('/:id/publish', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  run('UPDATE exams SET is_published = 1 WHERE id = ?', [req.params.id]);
  run('UPDATE results SET is_published = 1 WHERE exam_id = ?', [req.params.id]);
  res.json({ message: 'Exam and marks published successfully' });
});

// ── Results ────────────────────────────────────────────────────────────────
// GET /api/exams/:id/results
router.get('/:id/results', (req: Request, res: Response) => {
  const exam = get<any>(
    `SELECT e.*, b.name as batch_name, s.name as subject_name 
     FROM exams e 
     LEFT JOIN batches b ON b.id = e.batch_id 
     LEFT JOIN subjects s ON s.id = e.subject_id
     WHERE e.id = ?`,
    [req.params.id]
  );
  if (!exam) {
    res.status(404).json({ error: 'Exam not found' });
    return;
  }

  // Get all students enrolled in this exam's batch, along with existing results
  const batchStudents = query(
    `SELECT u.id as student_id, u.full_name as student_name, u.email as student_email,
            r.id as result_id, r.marks_obtained, r.grade, r.remarks, r.is_published
     FROM batch_enrollments be
     JOIN users u ON u.id = be.student_id
     LEFT JOIN results r ON r.exam_id = ? AND r.student_id = u.id
     WHERE be.batch_id = ?
     ORDER BY u.full_name ASC`,
    [req.params.id, exam.batch_id]
  );

  res.json({ exam, students: batchStudents });
});

// POST /api/exams/:id/results  (teacher / admin)
router.post('/:id/results', authorize('admin', 'teacher'), (req: Request, res: Response) => {
  const { results, publish, student_id, marks_obtained, remarks } = req.body;
  const rawResults = Array.isArray(results)
    ? results
    : (student_id ? [{ student_id, marks_obtained, remarks }] : null);

  if (!rawResults || rawResults.length === 0) {
    res.status(400).json({ error: 'results array or student marks object is required' });
    return;
  }

  const exam = get<any>('SELECT * FROM exams WHERE id = ?', [req.params.id]);
  if (!exam) {
    res.status(404).json({ error: 'Exam not found' });
    return;
  }

  for (const r of rawResults) {
    const marks = Number(r.marks_obtained);
    if (isNaN(marks) || marks < 0 || marks > exam.total_marks) {
      res.status(400).json({
        error: `Marks for student must be between 0 and total marks (${exam.total_marks}). Received: ${r.marks_obtained}`,
      });
      return;
    }

    // Auto-calculate grade
    const pct = (marks / exam.total_marks) * 100;
    let grade = 'F';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 35) grade = 'D';

    const existing = get<any>(
      'SELECT id FROM results WHERE exam_id = ? AND student_id = ?',
      [req.params.id, r.student_id]
    );

    const isPublished = publish ? 1 : exam.is_published;

    if (existing) {
      run(
        'UPDATE results SET marks_obtained = ?, grade = ?, remarks = ?, is_published = ? WHERE id = ?',
        [marks, r.grade || grade, r.remarks || '', isPublished, existing.id]
      );
    } else {
      const id = 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      run(
        'INSERT INTO results (id, exam_id, student_id, marks_obtained, grade, remarks, is_published) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, req.params.id, r.student_id, marks, r.grade || grade, r.remarks || '', isPublished]
      );
    }
  }

  if (publish) {
    run('UPDATE exams SET is_published = 1 WHERE id = ?', [req.params.id]);
  }

  res.json({ message: 'Exam results saved successfully', count: rawResults.length });
});

export default router;