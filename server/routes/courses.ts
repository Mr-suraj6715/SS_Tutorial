import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/courses  (public)
router.get('/', (req: Request, res: Response) => {
  const { board, class: cls } = req.query;
  let sql = 'SELECT * FROM courses WHERE 1=1';
  const params: any[] = [];
  if (board) { sql += ' AND board = ?'; params.push(board); }
  if (cls) { sql += ' AND target_class = ?'; params.push(cls); }
  sql += ' ORDER BY display_order ASC';
  const courses = query(sql, params);
  res.json({ courses });
});

// GET /api/courses/:id  (public)
router.get('/:id', (req: Request, res: Response) => {
  const course = get('SELECT * FROM courses WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
  if (!course) { res.status(404).json({ error: 'Course not found' }); return; }
  const subjects = query('SELECT * FROM subjects WHERE target_class = (SELECT target_class FROM courses WHERE id = ? OR slug = ?)', [req.params.id, req.params.id]);
  res.json({ course, subjects });
});

// POST /api/courses  (admin)
router.post('/', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, slug, board, target_class, subjects, description, syllabus, duration, fee, batch_info, faculty_name, display_order } = req.body;
  if (!title || !board || !target_class) { res.status(400).json({ error: 'title, board, target_class required' }); return; }
  const id = 'course-' + Date.now();
  run('INSERT INTO courses (id, title, slug, board, target_class, subjects, description, syllabus, duration, fee, batch_info, faculty_name, display_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [id, title, slug || id, board, target_class, subjects || '', description || '', syllabus || '', duration || '', fee || '', batch_info || '', faculty_name || '', display_order || 99]);
  res.status(201).json({ course: get('SELECT * FROM courses WHERE id = ?', [id]) });
});

// PATCH /api/courses/:id  (admin)
router.patch('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const course = get<any>('SELECT id FROM courses WHERE id = ?', [req.params.id]);
  if (!course) { res.status(404).json({ error: 'Course not found' }); return; }
  const fields = ['title','slug','board','target_class','subjects','description','syllabus','duration','fee','batch_info','faculty_name','display_order','is_active'];
  const updates: string[] = []; const vals: any[] = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(f + ' = ?'); vals.push(req.body[f]); }
  }
  if (updates.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }
  vals.push(req.params.id);
  run('UPDATE courses SET ' + updates.join(', ') + ', updated_at = CURRENT_TIMESTAMP WHERE id = ?', vals);
  res.json({ course: get('SELECT * FROM courses WHERE id = ?', [req.params.id]) });
});

// DELETE /api/courses/:id  (admin)
router.delete('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('UPDATE courses SET is_active = 0 WHERE id = ?', [req.params.id]);
  res.json({ message: 'Course deactivated' });
});

// ── Subjects sub-resource ──────────────────────────────────────────────────
// GET /api/courses/subjects/all
router.get('/subjects/all', (req: Request, res: Response) => {
  const { board, class: cls } = req.query;
  let sql = 'SELECT * FROM subjects WHERE 1=1';
  const params: any[] = [];
  if (board) { sql += ' AND (board = ? OR board = ?)'; params.push(board, 'Both'); }
  if (cls) { sql += ' AND target_class = ?'; params.push(cls); }
  res.json({ subjects: query(sql, params) });
});

export default router;