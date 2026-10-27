import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/courses  (public: active courses; admin can pass all=true)
router.get('/', (req: Request, res: Response) => {
  const { board, class: cls, all } = req.query;
  let sql = 'SELECT * FROM courses WHERE 1=1';
  const params: any[] = [];
  if (!all) {
    sql += ' AND is_active = 1';
  }
  if (board && board !== 'All') {
    sql += ' AND (board = ? OR board = ?)';
    params.push(board, 'Both');
  }
  if (cls && cls !== 'All') {
    sql += ' AND target_class = ?';
    params.push(cls);
  }
  sql += ' ORDER BY display_order ASC, created_at DESC';
  const courses = query(sql, params);
  res.json({ courses });
});

// GET /api/courses/:id  (public)
router.get('/:id', (req: Request, res: Response) => {
  const course = get('SELECT * FROM courses WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  const subjects = query(
    'SELECT * FROM subjects WHERE target_class = (SELECT target_class FROM courses WHERE id = ? OR slug = ?) AND is_active = 1',
    [req.params.id, req.params.id]
  );
  res.json({ course, subjects });
});

// POST /api/courses  (admin)
router.post('/', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const {
    title,
    slug,
    board,
    target_class,
    subjects,
    description,
    syllabus,
    duration,
    fee,
    batch_info,
    faculty_name,
    category,
    image_url,
    display_order,
    is_active,
  } = req.body;

  if (!title || !board || !target_class) {
    res.status(400).json({ error: 'title, board, and target_class are required' });
    return;
  }

  const id = 'course-' + Date.now();
  const safeSlug =
    slug?.trim() ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    id;

  run(
    `INSERT INTO courses (
      id, title, slug, board, target_class, subjects, description, syllabus,
      duration, fee, batch_info, faculty_name, category, image_url, display_order, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      title.trim(),
      safeSlug,
      board,
      target_class,
      subjects || '',
      description || '',
      syllabus || '',
      duration || '',
      fee || '',
      batch_info || '',
      faculty_name || '',
      category || target_class || '',
      image_url || '',
      display_order !== undefined ? Number(display_order) : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
    ]
  );

  const created = get('SELECT * FROM courses WHERE id = ?', [id]);
  res.status(201).json({ course: created, message: 'Course created successfully' });
});

// PUT & PATCH /api/courses/:id  (admin)
const updateCourseHandler = (req: Request, res: Response) => {
  const course = get<any>('SELECT id FROM courses WHERE id = ?', [req.params.id]);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  const fields = [
    'title',
    'slug',
    'board',
    'target_class',
    'subjects',
    'description',
    'syllabus',
    'duration',
    'fee',
    'batch_info',
    'faculty_name',
    'category',
    'image_url',
    'display_order',
    'is_active',
  ];

  const updates: string[] = [];
  const vals: any[] = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'is_active') {
        vals.push(req.body[f] ? 1 : 0);
      } else if (f === 'display_order') {
        vals.push(Number(req.body[f]) || 0);
      } else {
        vals.push(req.body[f]);
      }
    }
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  vals.push(req.params.id);
  run(`UPDATE courses SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, vals);

  const updated = get('SELECT * FROM courses WHERE id = ?', [req.params.id]);
  res.json({ course: updated, message: 'Course updated successfully' });
};
router.put('/:id', authenticate, authorize('admin'), updateCourseHandler);
router.patch('/:id', authenticate, authorize('admin'), updateCourseHandler);

// DELETE /api/courses/:id  (admin)
router.delete('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const course = get<any>('SELECT id FROM courses WHERE id = ?', [req.params.id]);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  // Delete course record safely
  run('DELETE FROM courses WHERE id = ?', [req.params.id]);
  res.json({ message: 'Course deleted successfully' });
});

// ── Subjects sub-resource (kept for compatibility) ──────────────────────────
// GET /api/courses/subjects/all
router.get('/subjects/all', (_req: Request, res: Response) => {
  const subjects = query('SELECT * FROM subjects ORDER BY display_order ASC, name ASC');
  res.json({ subjects });
});

export default router;