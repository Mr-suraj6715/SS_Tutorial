import { Router, Request, Response } from 'express';
import { query, get, run } from '../database/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/notices  (public for published)
router.get('/', (req: Request, res: Response) => {
  const isStaff = req.headers.authorization ? true : false;
  const sql = isStaff
    ? 'SELECT * FROM notices ORDER BY created_at DESC'
    : 'SELECT * FROM notices WHERE is_published = 1 ORDER BY created_at DESC';
  res.json({ notices: query(sql) });
});

// POST /api/notices  (admin)
router.post('/', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, content, target_audience, is_published } = req.body;
  if (!title || !content) { res.status(400).json({ error: 'title and content required' }); return; }
  const id = 'not-' + Date.now();
  run('INSERT INTO notices (id, title, content, target_audience, is_published) VALUES (?,?,?,?,?)',
    [id, title, content, target_audience || 'all', is_published ? 1 : 0]);
  res.status(201).json({ notice: get('SELECT * FROM notices WHERE id = ?', [id]) });
});

// PATCH /api/notices/:id  (admin)
router.patch('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  const { title, content, target_audience, is_published } = req.body;
  run('UPDATE notices SET title = COALESCE(?,title), content = COALESCE(?,content), target_audience = COALESCE(?,target_audience), is_published = COALESCE(?,is_published) WHERE id = ?',
    [title ?? null, content ?? null, target_audience ?? null, is_published ?? null, req.params.id]);
  res.json({ notice: get('SELECT * FROM notices WHERE id = ?', [req.params.id]) });
});

// DELETE /api/notices/:id  (admin)
router.delete('/:id', authenticate, authorize('admin'), (req: Request, res: Response) => {
  run('DELETE FROM notices WHERE id = ?', [req.params.id]);
  res.json({ message: 'Notice deleted' });
});

export default router;